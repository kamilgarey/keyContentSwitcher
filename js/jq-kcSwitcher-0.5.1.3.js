/*
 * Content switcher based on keys
 *
 *  Author - Kamil Gareyev
 */
jQuery.keyContentSwitcher = new (function () {

    var self = this;

    // default values of attributes and class name without prefix
    this.linkOfGroup = "link-of-group";
    this.contentOfGroup = "content-of-group";
    this.keyInGroup = "key-in-group";
    this.activeClass = "active";

    /**
     * Prefix, used to easy resolve name conflicts with third part libraries then using attributes
     * @type {String}
     */
    this.prefix = "data-";

    /**
     * Constants of item types
     * @type {Object}
     */
    this.ItemType = {
        content:1, // 01
        link:2, // 10
        both:3   // 11
    };

    // events handlers collections
    var groupEventsHandlers = [];
    var totalEventsHandlers = [];

    // list of groups that are not activated on Page Load
    this.ignoredToActivateGroups = [];

    // flag, true means that applySettings was already called
    this._set = false;

    /**
     * Apply settings. Call this method if you redefine prefix, attribute names, class name for an active element or
     * to set a list of groups that should not be activated
     *
     * @param {Object} [options]
     */
    this.applySettings = function (options) {
        options = options || {};
        jQuery.extend(true, self, options);

        // add prefix to attributes' names
        var makePrefix = function (attr) {
            return self.prefix + attr;
        };
        self.contentOfGroup = makePrefix(self.contentOfGroup);
        self.linkOfGroup = makePrefix(self.linkOfGroup);
        self.keyInGroup = makePrefix(self.keyInGroup);
        self._set = true;

        // not useful any more
        delete self.prefix;
        delete self.applySettings;
    };

    /**
     * Initialization of the library
     */
    this.init = function () {
        if (!self._set) {
            self.applySettings();
        }
        function handler(e) {
            fireLinkClick(jQuery(e.currentTarget));
            return false;
        }

        // set switching than clicking on link elements
        var selector = self.getItemsSelector(self.ItemType.link);
        var version = jQuery.fn.jquery;
        if (version >= "1.7") {
            jQuery(document.body).on("click", selector, handler);
        } else if (version >= "1.4.2") {
            jQuery(document.body).delegate(selector, "click", handler);
        } else {
            jQuery(selector).live("click", handler);
        }

        // set active elements there active elements are not set or set bogus
        activateGroups(self.getItemsSelector(self.ItemType.content), self.ignoredToActivateGroups);

        // not useful any more
        delete self._set;
        delete self.init;
        delete self.ignoredToActivateGroups;
    };

    /**
     * Add a handler for an events
     * @param {String} event
     * @param {String} groupName
     * @param {Function} handler
     */
    function addHandler(event, groupName, handler) {
        if (groupName == null) {
            totalEventsHandlers[event] = handler;
            return;
        }
        if (!groupEventsHandlers[groupName]) {
            groupEventsHandlers[groupName] = [];
        }
        groupEventsHandlers[groupName][event] = handler;
    }

    /**
     * Add a handler of TabChanged event
     * @param {String|null} groupName name of a group or null for all groups
     * @param {Function} handler
     */
    this.tabChanged = function (groupName, handler) {
        addHandler("onTabChanged", groupName, handler);
    };

    /**
     * Add a handler of BeforeTabChanged event
     * @param {String|null} groupName name of a group or null for all groups
     * @param {Function} handler
     */
    this.beforeTabChanged = function (groupName, handler) {
        addHandler("beforeTabChanged", groupName, handler);
    };

    /**
     * Throw an error if a name of a group is not supplied
     * @param {String|null|undefined} groupName
     */
    function checkGroupName(groupName) {
        if (groupName == null) {
            throw new Error("Не указан ключ группы");
        }
    }

    /**
     * Return an active key for group
     * @param {String} groupName name of a group
     * @return {String|undefined}
     */
    this.getActiveKey = function (groupName) {
        checkGroupName(groupName);
        // selector for active content of a group is used
        return jQuery("." + self.activeClass + self.getItemsSelector(self.ItemType.content, groupName)).attr(self.keyInGroup);
    };

    /**
     * Returns content elements by group name and a key
     * @param groupName name of a group or null for all groups
     * @param contentKey key with which content elements should be selected or null for content elements with all keys
     * @return {*|jQuery|HTMLElement}
     */
    this.getContents = function (groupName, contentKey) {
        return jQuery(self.getItemsSelector(self.ItemType.content, groupName, contentKey))
    };

    /**
     * Returns link elements by group name and a key
     * @param groupName name of a group or null for all groups
     * @param contentKey key with which link elements should be selected or null for link elements with all keys
     * @return {*|jQuery|HTMLElement}
     */
    this.getLinks = function (groupName, contentKey) {
        return jQuery(self.getItemsSelector(self.ItemType.link, groupName, contentKey));
    };

    /**
     * Returns group name for an element
     * @param {object} element Html element
     * @return {undefined|String}
     */
    this.getGroupForElement = function (element) {
        return jQuery(element).attr(
            jQuery(element).attr(self.linkOfGroup) === undefined
                ? self.contentOfGroup
                : self.linkOfGroup);
    };

    /**
     * Main function for getting all jquery selector for different operations of the library
     *
     * @param {Integer} kind - element of enumeration ItemType
     * @param {String|undefined|null} [groupName = undefined] group key
     * @param {String|undefined|null} [contentKey = undefined] content key in group
     * @return {String} css selector to get items
     */
    this.getItemsSelector = function (kind, groupName, contentKey) {
        /**
         *
         * @param {Integer} checkedKind
         * @return {String}
         */
        function getSubSelect(checkedKind) {
            return (kind & checkedKind)
                ? "[" +
                (checkedKind == self.ItemType.content // content or link
                    ? self.contentOfGroup
                    : self.linkOfGroup)
                + (groupName == null ? "" : "=" + groupName) + "][" // for a group or for all
                + self.keyInGroup +
                (contentKey == null ? "" : "=" + contentKey) + "]" // for a key or for all
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
     * Returns the key in group for element
     * @param {Object} element
     * @return {String|undefined}
     */
    this.getItemKey = function (element) {
        return jQuery(element).attr(self.keyInGroup);
    };

    /**
     * Deactivate active key of group. If the name of group is not supplied all groups become deactivated
     * @param {String|undefined} groupName name of a group
     */
    this.unActivateAll = function (groupName) {
        jQuery(self.getItemsSelector(self.ItemType.both, groupName)).removeClass(self.activeClass);
    };

    /**
     * Call event handlers
     * @param {String} groupName name of a group or null for all groups
     * @param {String} key key in group
     * @param {String} eventName event's name
     */
    function fireEvent(groupName, key, eventName) {
        var result = true;
        // first common handler
        if (totalEventsHandlers[eventName] && typeof totalEventsHandlers[eventName] === "function") {
            result = totalEventsHandlers[eventName](groupName, key);
        }
        if (result !== false && groupEventsHandlers[groupName] && typeof groupEventsHandlers[groupName][eventName] === "function") {
            result = groupEventsHandlers[groupName][eventName](groupName, key);
        }
        return result !== false;
    }

    /**
     * Set an active key for a group
     * @param {String} groupName
     * @param {String} contentKey
     * @return {Boolean}
     */
    this.setActiveKey = function (groupName, contentKey) {
        var canChange = fireEvent(groupName, contentKey, "beforeTabChanged");
        if (canChange) {
            self.unActivateAll(groupName);
            jQuery(self.getItemsSelector(self.ItemType.both, groupName, contentKey)).addClass(self.activeClass);
            fireEvent(groupName, contentKey, "onTabChanged");
        }
        return false;
    };

    /**
     * Click event's handler
     * @param {Object} initializer Html element(link of switcher) fired group changing
     * @return {Boolean}
     */
    function fireLinkClick(initializer) {
        var groupName = self.getGroupForElement(initializer);
        var contentKey = self.getItemKey(initializer);
        return self.setActiveKey(groupName, contentKey);
    }

    /**
     * Activate dynamically added or set in list of not activated group
     * @param {String} groupName
     */
    this.activateGroup = function (groupName) {
        activateGroups(self.getItemsSelector(self.ItemType.content, groupName));
    };

    /**
     * Activate groups by selector.
     * Is called after page loaded for switchers activation
     * @param {String} jqSelector
     * @param {Array|undefined} [ignoredGroupKeys] list of groups that should not be activated
     */
    function activateGroups(jqSelector, ignoredGroupKeys) {
        ignoredGroupKeys = ignoredGroupKeys || [];
        self.groups = {}; // reference for using in foreach callback
        jQuery(jqSelector).each(function () { // обходим все элементы содержания
            var key = self.getGroupForElement(this);
            // add to group
            var groups = self.groups;
            if (groups[key] == null) {
                groups[key] = { hasActive:false, htmlElements:[] };
            }
            groups[key].hasActive += jQuery(this).hasClass(self.activeClass);
            groups[key].htmlElements.push(this);
        });
        // select elements
        var groups = self.groups;
        for (var groupName in groups) {
            var group = groups[groupName];
            if (!(jQuery.inArray(groupName, ignoredGroupKeys) > -1 || !group.htmlElements || group.htmlElements.length <= 0 || group.hasActive)) {
                fireLinkClick(group.htmlElements[0]);
            }
        }
        // free memory
        delete self.groups;
    }

    // подключаем библиотеку после загрузки страницы
    jQuery(self.init);
})();
