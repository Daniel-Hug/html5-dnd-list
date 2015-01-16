HTML5 Drag & Drop ordering
==========================


## Usage

Create a new `DragList` instance passing an object of options (see [demo.js](https://github.com/Daniel-Hug/html5-dnd-list/blob/gh-pages/demo.js)).

```js
var tasksDragList = new DragList({
    itemEls: document.querySelectorAll('.groceries li')
});
```


## Options (all optional)

 - **`itemEls` (array):** Pass an array of elements you wish to be draggable
 - **`handleSelector` (string):** Pass a selector. Each draggable element will be checked for a descendant matching the selector provided which will be used as a drag handle.
 - **`action` (string):** 'move' (default) or 'switch'; the type of drag ui to impliment
 - **`onDrop` (function):** a callback to fire after element is dropped
    - First argument passed is the dropped element.
    - If `action` option is set to `'switch'`, the second argument passed is the element that was switched with the dropped element.
    - If `action` is `'move'` the second and third arguments passed are the dragged item's original parent element and original index respectively.


## Add new items

```
tasksDragList.addItem(element)
```


## Style

All items are given a `dl-item` class. When being dragged they also have a `dl-moving` class, and when being dragged over, they have a `dl-over` class.

Harness these to create your own drag styles. Take inspiration from [demo.css](https://github.com/Daniel-Hug/html5-dnd-list/blob/gh-pages/all/demo.css).