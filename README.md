keyContentSwitcher
==================

**History**

This library is the reaction on jquery-ui. Then main goal was to create tabs but without redundant mess of JS and CSS of jquery UI.
After creation it was realised that library can be used in over ways.

**Destination**

The destination of the library is to rapid creation subset of controls: vertical/horizontal tabs amd menus, accordions, etc. Common is that such control show (or marked as selected) content from a variety with your custom CSS and without any JS in base cases.

In modern frameworks and React based ecosistem this functionality can be esaly implemented.
So library may be handy only if there is no (or low) interaction with framework.
But it may help you a lot if you use jquery only or even vanila js.
**Note**: version  where dependence from jquery was removed is not tested well.

**Samples**

**_index.html_** contains a description (on russian) and links to all samples.

## Basis
1
There are html elements triggers. They should have two html attributes: __**data-link-of-group="unique_key_of_control" data-key-in-group="key_of_content_in_control"**__

For example: __**data-link-of-group="tabs_vertical" data-key-in-group="1"**__

Wnen one clicking trigger (or by api call) html content element within the same contol and having the same key  got css class **"active"**
<br/>
<br/>
<br/>
2
Html content elements should have two html attributes: **_data-content-of-group="unique_key_of_control" data-key-in-group="key_of_content_in_control"_**

For example: **_data-content-of-group="tabs_vertical" data-key-in-group="1"_**

If there is no html content in group with css class **"active"** one get css class **"active"**. 

## Advanced Usage
```javascript
keyContentSwitcher.tabChanged(unique_key_of_control, function(unique_key_of_control, key-in-control)
```
Add tabChanged event handler. If unique_key_of_control is null handler is set for all controlls
<br/>
<br/>
```javascript
keyContentSwitcher.beforeTabChanged (unique_key_of_control, function(unique_key_of_control, key-in-control)
```
Add beforeTabChanged event handler. If handler returns false changing of active content element would be cancelled. If unique_key_of_control is null handler is set for all controlls
<br/>
<br/>
```javascript
keyContentSwitcher.applySettings({ignoredToActivateGroup:["unique_key_of_control",...]});
```
Suppress activation of controls. This can be useful in case of embedded tabs. If parent tab is not shown and activation of child tab involve ajax request.
_You should activate child tab by api call later_
<br/>
<br/>
```javascript
keyContentSwitcher.activateGroup = function (groupName)
```
Activate dynamically added control or control which activation was suppressed.
<br/>
<br/>
```javascript
keyContentSwitcher.applySettings( {linkOfGroup : "link-of-group", contentOfGroup : "content-of-group", keyInGroup : "key-in-group", activeClass : "active", prefix: "data-"});
```
Change one or several default hmll/css settings



## License

**MIT License**

Copyright (c) [2022] [Kamil Gareev]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
