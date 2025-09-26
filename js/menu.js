(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var menuContainer = document.getElementById('menu-content');
    var tabsContainer = document.getElementById('menu-tabs');

    if (!menuContainer) {
      return;
    }

    var mobileQuery = window.matchMedia('(max-width: 767px)');
    var activeCategory = null;
    var categorySections = [];

    function applyCategoryVisibility() {
      var isMobile = mobileQuery.matches;

      categorySections.forEach(function (entry) {
        if (isMobile && activeCategory && entry.name !== activeCategory) {
          entry.element.classList.add('menu-category--hidden-mobile');
        } else {
          entry.element.classList.remove('menu-category--hidden-mobile');
        }
      });

      if (tabsContainer) {
        Array.prototype.forEach.call(tabsContainer.children, function (button) {
          var isActive = button.dataset.category === activeCategory;
          button.classList.toggle('is-active', isActive);
        });

        if (categorySections.length > 1) {
          tabsContainer.style.display = '';
        } else {
          tabsContainer.style.display = 'none';
        }
      }
    }

    function handleBreakpointChange() {
      applyCategoryVisibility();
    }

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', handleBreakpointChange);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(handleBreakpointChange);
    }

    fetch('data/menu.json')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load menu data');
        }
        return response.json();
      })
      .then(function (items) {
        if (!Array.isArray(items) || items.length === 0) {
          menuContainer.textContent = 'Menu is being updated. Please check back soon.';
          if (tabsContainer) {
            tabsContainer.style.display = 'none';
          }
          return;
        }

        var categories = new Map();
        items.forEach(function (item) {
          var category = item.category || 'Autres';
          if (!categories.has(category)) {
            categories.set(category, []);
          }
          categories.get(category).push(item);
        });

        var categoryEntries = Array.from(categories.entries());
        var previousActive = activeCategory;

        categorySections = [];
        menuContainer.innerHTML = '';

        if (tabsContainer) {
          tabsContainer.innerHTML = '';
          categoryEntries.forEach(function (entry) {
            var categoryName = entry[0];
            var tabButton = document.createElement('button');
            tabButton.type = 'button';
            tabButton.className = 'menu-tabs__button';
            tabButton.dataset.category = categoryName;
            tabButton.textContent = categoryName;
            tabButton.addEventListener('click', function () {
              activeCategory = categoryName;
              applyCategoryVisibility();
            });
            tabsContainer.appendChild(tabButton);
          });
        }

        categoryEntries.forEach(function (entry) {
          var categoryName = entry[0];
          var categoryItems = entry[1];

          var section = document.createElement('section');
          section.className = 'menu-category';
          section.dataset.category = categoryName;

          var heading = document.createElement('h2');
          heading.className = 'menu-category__title';
          heading.textContent = categoryName;
          section.appendChild(heading);

          var list = document.createElement('div');
          list.className = 'menu-category__items';

          categoryItems.forEach(function (item) {
            var card = document.createElement('article');
            card.className = 'menu-item';

            if (item.image) {
              var thumb = document.createElement('img');
              thumb.src = item.image;
              thumb.alt = item.name || 'Menu item';
              thumb.className = 'menu-item__image';
              card.appendChild(thumb);
              card.classList.add('has-image');
            }

            var body = document.createElement('div');
            body.className = 'menu-item__body';

            var titleRow = document.createElement('div');
            titleRow.className = 'menu-item__header';

            var title = document.createElement('h3');
            title.className = 'menu-item__name';
            title.textContent = item.name || 'Untitled';
            titleRow.appendChild(title);

            var hasNumericPrice = typeof item.price === 'number' && !Number.isNaN(item.price);
            var hasPriceLabel = typeof item.price === 'string' && item.price.trim().length > 0;

            if (hasNumericPrice || hasPriceLabel) {
              var lead = document.createElement('span');
              lead.className = 'menu-item__lead';
              titleRow.appendChild(lead);

              var price = document.createElement('span');
              price.className = 'menu-item__price';
              price.textContent = hasNumericPrice
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)
                : item.price.trim();
              titleRow.appendChild(price);
            }

            body.appendChild(titleRow);

            if (typeof item.description === 'string' && item.description.trim().length > 0) {
              var description = document.createElement('p');
              description.className = 'menu-item__description';
              description.textContent = item.description.trim();
              body.appendChild(description);
            }

            card.appendChild(body);
            list.appendChild(card);
          });

          section.appendChild(list);
          menuContainer.appendChild(section);
          categorySections.push({ name: categoryName, element: section });
        });

        if (previousActive && categorySections.some(function (entry) { return entry.name === previousActive; })) {
          activeCategory = previousActive;
        } else {
          activeCategory = categorySections.length ? categorySections[0].name : null;
        }

        applyCategoryVisibility();
      })
      .catch(function () {
        menuContainer.textContent = 'Unable to load the menu right now. Please try again later.';
        if (tabsContainer) {
          tabsContainer.style.display = 'none';
        }
      });
  });
})();
