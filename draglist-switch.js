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
		options = options || {};

		// attach option data to this
		this.handleSelector = options.handleSelector || '.dl-handle';
		this.ondrop = options.ondrop || null;
		this.dropAreaEl = null;

		// make each element draggable, add them to this.itemEls, and set up events
		this.itemEls = [];
		[].forEach.call(options.itemEls || [], this.addItem, this);
	};

	DragList.prototype.addItem = function(itemEl) {
		this.itemEls.push(itemEl);
		itemEl.draggable = true;
		itemEl.classList.add('dl-item');
		var handle = itemEl.querySelector(this.handleSelector);

		// cache this DragList instance for use in handlers
		var thisDragList = this;


		// itemEl handlers

		var clickedEl = null;
		on(itemEl, 'mousedown', function(e) {
			clickedEl = e.target;
		});

		this.curSrcEl = null;
		on(itemEl, 'dragstart', function(e) {
			// if handle exists don't do anything if it wasn't last clicked
			if (handle && handle !== clickedEl && !handle.contains(clickedEl)) {
				e.preventDefault();
				return;
			}

			e.dataTransfer.effectAllowed = 'move';
			thisDragList.curSrcEl = this;
			this.classList.add(MOVING_CLASS);
		});

		on(itemEl, 'dragover', function(e) {
			// make sure item we're dragging is from this list
			if (!thisDragList.curSrcEl) return;

			// allow drop
			e.preventDefault();

			e.dataTransfer.dropEffect = 'move';
			this.classList.add(OVER_CLASS);
		});

		// this also fires when a child node is dragged over
		on(itemEl, 'dragleave', function() {
			this.classList.remove(OVER_CLASS);
		});

		on(itemEl, 'drop', function(e) {
			e.stopPropagation(); // stops the browser from redirecting.

			// Don't do anything if we're dropping on the same item we're dragging.
			if (thisDragList.curSrcEl === this) return;

			swapNodes(thisDragList.curSrcEl, this);

			// ondrop callback
			if (thisDragList.ondrop)
				thisDragList.ondrop.call(thisDragList, thisDragList.curSrcEl, this);
		});

		on(itemEl, 'dragend', function() {
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