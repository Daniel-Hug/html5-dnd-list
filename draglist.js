window.DragList = (function() {
	'use strict';
	
	// state classes
	var MOVING_CLASS = 'dl-moving';
	var OVER_CLASS = 'dl-over';

	// helpers

	function swapNodes(a, b) {
		var aParent = a.parentNode;
		var aSibling = a.nextSibling === b ? a : a.nextSibling;
		b.parentNode.insertBefore(a, b);
		aParent.insertBefore(b, aSibling);
	}

	function on(target, type, callback) {
		target.addEventListener(type, callback, false);
	}



	// exported global constructor

	var DragList = function(options) {
		// attach option data to this
		this.handleSelector = options.handleSelector || 'dl-handle';
		this.callback = options.callback || null;

		// make each element draggable, add them to this.itemEls, and set up events
		this.itemEls = [];
		[].forEach.call(options.itemEls, this.addItem, this);
	};

	DragList.prototype.addItem = function(itemEl) {
		this.itemEls.push(itemEl);
		itemEl.draggable = true;
 
		// cache this DragList instance for use in handlers
		var thisDragList = this;


		// itemEl handlers

		var clickedEl = null;
		on(itemEl, 'mousedown', function onItemElMouseDown(e) {
			clickedEl = e.target;
		});

		this.curSrcEl = null;
		on(itemEl, 'dragstart', function onItemElDragStart(e) {
			// if handle exists don't do anything if it wasn't last clicked
			var handle = this.querySelector(thisDragList.handleSelector);
			if (handle && handle !== clickedEl && !handle.contains(clickedEl)) {
				e.preventDefault();
				return;
			}

			e.dataTransfer.effectAllowed = 'move';
			thisDragList.curSrcEl = this;
			this.classList.add(MOVING_CLASS);
		});

		on(itemEl, 'dragover', function onItemElDragOver(e) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
			this.classList.add(OVER_CLASS);
		});

		// this also fires when a child node is dragged over
		on(itemEl, 'dragleave', function onItemElDragLeave(e) {
			this.classList.remove(OVER_CLASS);
		});

		on(itemEl, 'drop', function onItemElDrop(e) {
			if (e.stopPropagation) {
				e.stopPropagation(); // stops the browser from redirecting.
			}

			// Don't do anything if we're dropping on the same item we're dragging.
			if (thisDragList.curSrcEl !== this) {
				swapNodes(thisDragList.curSrcEl, this);

				// callback
				if (thisDragList.callback)
					thisDragList.callback(thisDragList.curSrcEl, this);
			}
		});

		on(itemEl, 'dragend', function onItemElDragEnd() {
			this.classList.remove(MOVING_CLASS);

			// remove hover styles from every item
			[].forEach.call(thisDragList.itemEls, function(itemEl) {
				itemEl.classList.remove(OVER_CLASS);
			});

			// reset curSrcEl (no element is being dragged anymore)
			thisDragList.curSrcEl = null;
		});
	};

	return DragList;
})();