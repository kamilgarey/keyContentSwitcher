/*
 *  Переключатель содержимого на основе ключа
 *
 *  Автор - Гареев Камиль
 */
keyContentSwitcher = new (function () {

    var self = this;

    // константы
    this.linkOfGroup = "link-of-group";
    this.contentOfGroup = "content-of-group";
    this.keyInGroup = "key-in-group";
    this.activeClass = "active";

    /**
    * Используется для возможности разрешать ситуации при использовании атрибутов с аналогичными именами другими библиотеками
    * @type {String}
    */
    this.prefix = "data-";

    /**
    * Константы типа содержимого
    * @type {Object}
    */
    this.ItemType = {
        content: 1, // 01
        link: 2, // 10
        both: 3   // 11
    };
    // события
    var groupEventsHandlers = [];
    var totalEventsHandlers = [];

    // список не активируемых груп
    this.ignoredToActivateGroups = [];

    this._set = false;

    /**
    * Устанавливает параметры. Используется при необходимости переопределить стандартные параметры и/или для исключения групп из списка
    * активации.
    *
    * @param {Object} [options]
    */
    this.applySettings = function (options) {
        options = options || {};
        jQuery.extend(true, self, options);

        // добавим префикс к именам атрибутов.
        var makePrefix = function (attr) {
            return self.prefix + attr;
        };
        self.contentOfGroup = makePrefix(self.contentOfGroup);
        self.linkOfGroup = makePrefix(self.linkOfGroup);
        self.keyInGroup = makePrefix(self.keyInGroup);
        self._set = true;

        // больше не нужны
        delete self.prefix;
        delete self.applySettings;
    };

    /**
    * Инициализация библиотеки
    */
    this.init = function () {
        if (!self._set) {
            self.applySettings();
        }
        function handler(e) {
            fireLinkClick(jQuery(e.currentTarget));
            return false;
        }
        // стандартная логика смены активного содержимого группы по клике на элементе "ссылке"
        var selector = self.getItemsSelector(self.ItemType.link);
        var version = jQuery.fn.jquery;
        if (version >= "1.7") {
            jQuery(document.body).on("click", selector, handler);
        } else
         if (version >= "1.4.2") {
            jQuery(document.body).delegate(selector, "click", handler);
        } else {
            jQuery(selector).live("click", handler);
        }

        // выставляем активными элементами там где элементов нет.
        activateGroups(self.getItemsSelector(self.ItemType.content), self.ignoredToActivateGroups);

        // больше не нужны
        delete self._set;
        delete self.init;
        delete self.ignoredToActivateGroups;
    };

    /**
    * Внутренняя функция. Добавлет обработчика
    * @param {String} event
    * @param {String} groupKey
    * @param {Function} handler
    */
    function addHandler(event, groupKey, handler) {
        if (groupKey == null) {
            groupEventsHandlers[event] = null;
            return;
        }
        if (!groupEventsHandlers[groupKey]) {
            groupEventsHandlers[groupKey] = [];
        }
        groupEventsHandlers[groupKey][event] = handler;
    }

    /**
    * Добавляет обработчик события смены активного содержимого
    * @param {String|null} groupKey имя группы, если вызывается для всех групп
    * @param {Function} handler
    */
    this.tabChanged = function (groupKey, handler) {
        addHandler("onTabChanged", groupKey, handler);
    };

    /**
    * Добавляет обработчик события BeforeTabChange возникает перед сменой активного содержимого
    * @param {String|null} groupKey имя группы, если вызывается для всех групп
    * @param {Function} handler
    */
    this.beforeTabChanged = function (groupKey, handler) {
        addHandler("beforeTabChanged", groupKey, handler);
    };

    /**
    * Генерирует ошибку если не задано имя группы
    * @param {String|null|undefined} groupKey
    */
    function checkGroupKey(groupKey) {
        if (groupKey == null) {
            throw new Error("Не указан ключ группы");
        }
    }

    /**
    * Возвращает активный ключ для группы
    * @param {String} groupKey название группы
    * @return {String|undefined}
    */
    this.getActiveKey = function (groupKey) {
        checkGroupKey(groupKey);
        // используем селектор - активное содержимое для группы.
        return jQuery("." + self.activeClass + self.getItemsSelector(self.ItemType.content, groupKey)).attr(self.keyInGroup);
    };

    /**
    * Возращает элементы содержимого по ключу и группе
    * @param groupKey название группы, если не указано будет произведён поиск во всех группах
    * @param contentKey ключ в группе, если не указан вернуться все содержимые (для указанной группы, если указана)
    * @return {*|jQuery|HTMLElement}
    */
    this.getContents = function (groupKey, contentKey) {
        return jQuery(self.getItemsSelector(self.ItemType.content, groupKey, contentKey))
    };

    /**
    * Возращает элементы сслылки по ключу и группе
    * @param {String|undefined|null} groupKey название группы, если не указано будет произведён поиск во всех группах
    * @param {String|undefined|null} contentKey ключ в группе, если не указан вернуться все ссылки (для указанной группы, если указана)
    * @return {*|jQuery|HTMLElement}
    */
    this.getLinks = function (groupKey, contentKey) {
        return jQuery(self.getItemsSelector(self.ItemType.link, groupKey, contentKey));
    };

    /**
    * Возвращает имя группы для элемента
    * @param {object} element Html элемент
    * @return {undefined|String}
    */
    this.getGroupForElement = function (element) {
        return jQuery(element).attr(
            jQuery(element).attr(self.linkOfGroup) === undefined
                ? self.contentOfGroup
                : self.linkOfGroup);
    };

    /**
    * Основная функция для получения селекторов для различных операций библиотеки.
    * Не предназначена для непосредственного использования без хорошего знания библиотеки
    *
    * @param {Integer} kind - элемент перичесления из ItemType
    * @param {String|undefined|null} [groupKey = undefined] имя группы
    * @param {String|undefined|null} [contentKey = undefined] имя ключа в группе
    * @return {String} css selector to get items
    */
    this.getItemsSelector = function (kind, groupKey, contentKey) {
        /**
        *
        * @param {Integer} checkedKind
        * @return {String}
        */
        function getSubSelect(checkedKind) {
            return (kind & checkedKind)
                ? "[" +
                (checkedKind == self.ItemType.content // либо контент либо ссылка
                    ? self.contentOfGroup
                    : self.linkOfGroup)
                + (groupKey == null ? "" : "=" + groupKey) + "][" // для конкретной или все группы
                + self.keyInGroup +
                (contentKey == null ? "" : "=" + contentKey) + "]" // для контректного содержимого или все
                : "";
        }

        var selector = getSubSelect(self.ItemType.link);
        if (kind == self.ItemType.both) {
            selector += ",";
        }
        selector += getSubSelect(self.ItemType.content);
        return selector;
    };

    /**
    * Возвращает имя ключа в группе указанного элемента
    * @param {Object} element
    * @return {String|undefined}
    */
    this.getItemKey = function (element) {
        return jQuery(element).attr(self.keyInGroup);
    };

    /**
    * Деактивирует активный ключ группы. Если не указан ключ будут деактивированны все группы
    * @param {String|undefined} groupKey
    */
    this.unActivateAll = function (groupKey) {
        jQuery(self.getItemsSelector(self.ItemType.both, groupKey)).removeClass(self.activeClass);
    };

    /**
    * Вызов обработчиков события.
    * @param {String} group группа (название группы)
    * @param {String} key ключ в группе
    * @param {String} eventName наименование события
    */
    function fireEvent(group, key, eventName) {
        var result = true;
        // сначала вызывается общий обработчик
        if (totalEventsHandlers[eventName] && typeof totalEventsHandlers[eventName] === "function") {
            result = totalEventsHandlers[eventName](group, key);
        }
        if (result !== false && groupEventsHandlers[group] && typeof groupEventsHandlers[group][eventName] === "function") {
            result = groupEventsHandlers[group][eventName](group, key);
        }
        return result !== false;
    }

    /**
    * Выбор активного ключа
    * @param {String} groupKey группа (название группы)
    * @param {String} contentKey активируемый ключ в группе
    * @return {Boolean}
    */
    this.setActiveKey = function (groupKey, contentKey) {
        var canChange = fireEvent(groupKey, contentKey, "beforeTabChanged");
        if (canChange) {
            self.unActivateAll(groupKey);
            jQuery(self.getItemsSelector(self.ItemType.both, groupKey, contentKey)).addClass(self.activeClass);
            fireEvent(groupKey, contentKey, "onTabChanged");
        }
        return false;
    };

    /**
    * Обработчик клика по ссылке
    * @param {Object} initializer Html элемент вызвавший активизацию события
    * @return {Boolean}
    */
    function fireLinkClick(initializer) {
        var groupKey = self.getGroupForElement(initializer);
        var contentKey = self.getItemKey(initializer);
        return self.setActiveKey(groupKey, contentKey);
    }

    /**
    * Активизирует динамически добавленную или указанную в списке неактивируемых группы.
    * @param {String} groupKey
    */
    this.activateGroup = function (groupKey) {
        activateGroups(self.getItemsSelector(self.ItemType.content, groupKey));
    };

    /**
    * Вызывается по загрузке страницы для активации переключателей(выбора активного элемента если он не задан)
    * @param {String} jqSelector
    * @param {Array|undefined} [ignoredGroupKeys]
    */
    function activateGroups(jqSelector, ignoredGroupKeys) {
        ignoredGroupKeys = ignoredGroupKeys || [];
        self.groups = {}; // ссылка для использования в сallback функции перебора
        jQuery(jqSelector).each(function () { // обходим все элементы содержания
            var key = self.getGroupForElement(this);
            // добавляем в группу
            var groups = self.groups;
            if (groups[key] == null) {
                groups[key] = { hasActive: false, htmlElements: [] };
            }
            groups[key].hasActive += jQuery(this).hasClass(self.activeClass);
            groups[key].htmlElements.push(this);
        });
        // выделяем элементы
        var groups = self.groups;
        for (var groupKey in groups) {
            var group = groups[groupKey];
            if (!(jQuery.inArray(groupKey, ignoredGroupKeys) > -1 || !group.htmlElements || group.htmlElements.length <= 0 || group.hasActive)) {
                fireLinkClick(group.htmlElements[0]);
            }
        }
        // освобождаем память.
        delete self.groups;
    }

    // подключаем библиотеку после загрузки страницы
    jQuery(function () {
        keyContentSwitcher.init();
    });
})();
