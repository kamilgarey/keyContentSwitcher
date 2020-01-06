/*! jQuery v1.7.1 | jquery.org/license */
/*
 * Content switcher based on keys
 *
 *  Author - Kamil Gareyev
 */
keyContentSwitcher = new (function () {

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
        for (var name in options) {
            self[name] = options[name];
        }

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
        // set base settings if not defined special
        if (!self._set) {
            self.applySettings();
        }

        // set switching than clicking on link elements
        // use "bubbling"
        document.body.addEventListener("click", function (e) {
            var elem = e.target;
            if (elem.getAttribute(self.linkOfGroup)) {
                return fireLinkClick(elem);
            }
        }, false);

        // set active elements there active elements are not set or set bogus
        activateGroups(getElements(self.ItemType.content), self.ignoredToActivateGroups);

        // not useful any more
        delete self._set;
        delete self.init;
        delete self.ignoredToActivateGroups;
    };

    /**
     * Add handler for events
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
     * Return an active key for group
     * @param {String} groupName name of a group
     * @return {String|undefined}
     */
    this.getActiveKey = function (groupName) {
        var activeContentGroup = getElements(self.ItemType.content, groupName);
        return activeContentGroup.length > 0
            ? getItemKey(activeContentGroup[0])
            : null;
    };

    /**
     * Returns content elements by group name and a key
     * @param groupName name of a group or null for all groups
     * @param contentKey key with which content elements should be selected or null for content elements with all keys
     * @return {array}
     */
    this.getContents = function (groupName, contentKey) {
        return getElements(self.ItemType.content, groupName, contentKey);
    };

    /**
     * Returns link elements by group name and a key
     * @param groupName name of a group or null for all groups
     * @param contentKey key with which link elements should be selected or null for link elements with all keys
     * @return {array}
     */
    this.getLinks = function (groupName, contentKey) {
        return getElements(self.ItemType.link, groupName, contentKey);
    };

    /**
     * Returns group name for an element
     * @param {object} element Html element
     * @return {undefined|String}
     */
    this.getGroupForElement = function (element) {
        return element.getAttribute(self.linkOfGroup) ||
            element.getAttribute(self.contentOfGroup);
    };

    /**
     * Get elements that satisfy the condition
     *
     * @param {Integer} kind - element of enumeration ItemType
     * @param {String|undefined|null} [groupName = undefined] group name
     * @param {String|undefined|null} [contentKey = undefined] content key in group

     */
    function getElements(kind, groupName, contentKey) {
        var result = [];
        var elements = document.getElementsByTagName("*");
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var nameOfGroup =
                (kind & self.ItemType.link == self.ItemType.link ?
                    element.getAttribute(self.linkOfGroup) : undefined)
                    ||
                    (kind & self.ItemType.content == self.ItemType.content ?
                        element.getAttribute(self.contentOfGroup) : undefined);
            var keyInGroup = element.getAttribute(self.keyInGroup);
            if (
            // if link of group or any link if group is not set
                nameOfGroup && (nameOfGroup == groupName || groupName == null) &&
                    keyInGroup && (keyInGroup == contentKey || contentKey == null)) {
                result.push(element);
            }
        }
        return result;
    }

    /**
     * Returns the key in group for element
     * @param {Object} element
     * @return {String|undefined}
     */
    function getItemKey(element) {
        return element.getAttribute(self.keyInGroup);
    }

    /**
     * Deactivate active key of group. If the name of group is not supplied all groups become deactivated
     * @param {String|undefined} groupName name of a group
     */
    this.unActivateAll = function (groupName) {
        var elements = getElements(self.ItemType.both, groupName);
        for (var i = 0; i < elements.length; i++) {
            removeActiveClass(elements[i]);
        }
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
            var activeElements = getElements(self.ItemType.both, groupName, contentKey);
            for(var i = 0; i < activeElements.length; i++){
                addActiveClass(activeElements[i]);
            }
            fireEvent(groupName, contentKey, "onTabChanged");
        }
        return false;
    };

    /**
     * Click event's handler
     * @param {Object} element Html element(link of switcher) fired group changing
     * @return {Boolean}
     */
    function fireLinkClick(element) {
        var groupName = self.getGroupForElement(element);
        var contentKey = getItemKey(element);
        return self.setActiveKey(groupName, contentKey);
    }

    /**
     * Activate dynamically added or set in list of not activated group
     * @param {String} groupName
     */
    this.activateGroup = function (groupName) {
        activateGroups(getElements(self.ItemType.content, groupName));
    };

    /**
     * Activate groups from elements list
     * Is called after page loaded for switchers activation
     *
     * @param {Array} elements
     * @param {Array|undefined} [ignoredGroupKeys] list of groups that should not be activated
     */
    function activateGroups(elements, ignoredGroupKeys) {
        ignoredGroupKeys = ignoredGroupKeys || [];
        var groups = [];
        // for all elements
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var key = self.getGroupForElement(element);
            // add to group
            if (groups[key] == null) {
                groups[key] = { hasActive:false, htmlElements:[] };
            }
            groups[key].hasActive += hasActiveClass(element);
            groups[key].htmlElements.push(element);
        }
        // select elements
        for (var groupName in groups) {
            var group = groups[groupName];
            if (!(jQuery.inArray(groupName, ignoredGroupKeys) > -1 || !group.htmlElements || group.htmlElements.length <= 0 || group.hasActive)) {
                fireLinkClick(group.htmlElements[0]);
            }
        }
    }

/*** REGION - IMPORTED FROM JQUERY ***/

    /**
     * Returns true if element has active class at it's class attribute
     *
     * @param element Html element
     */
    function hasActiveClass(element) {
        var className = " " + self.activeClass + " ";
        if ((" " + element.className + " ").replace(rclass, " ").indexOf(className) >= 0) {
            return true;
        }
    }

    /**
     * Hidden characters
     * @type {RegExp}
     */
    var rclass = /[\t\r\n\f]/g;

    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

    function trim(text) {
        return text == null ?
            "" :
            ( text + "" ).replace(rtrim, "");
    }

    /**
     * remove an active css class if an element has such class
     *
     * @param elem
     */
    function removeActiveClass(elem) {
        var cur = elem.nodeType === 1 && ( elem.className ?
            ( " " + elem.className + " " ).replace(rclass, " ") :
            ""
            );

        if (cur) {
            // Remove *all* instances
            while (cur.indexOf(" " + self.activeClass + " ") >= 0) {
                cur = cur.replace(" " + self.activeClass + " ", " ");
            }

            // only assign if different to avoid unneeded rendering.
            var finalValue = trim(cur);
            if (elem.className !== finalValue) {
                elem.className = finalValue;
            }
        }
    }

    /**
     * Add active css class to an element
     * @param elem
     */
    function addActiveClass(elem) {
        var cur = elem.nodeType === 1 && ( elem.className ?
            ( " " + elem.className + " " ).replace(rclass, " ") :
            " "
            );

        if (cur) {
            if (cur.indexOf(" " + self.activeClass + " ") < 0) {
                cur += self.activeClass + " ";
            }
        }

        // only assign if different to avoid unneeded rendering.
        var finalValue = trim(cur);
        if (elem.className !== finalValue) {
            elem.className = finalValue;
        }
    }
/*** END REGION - IMPORTED FROM JQUERY ***/

// подключаем библиотеку после загрузки страницы
    if(window.addEventListener){
        window.addEventListener('load',self.init,false); //W3C
    }
    else{
        window.attachEvent('onload',self.init); //IE
    }
})
    ();
