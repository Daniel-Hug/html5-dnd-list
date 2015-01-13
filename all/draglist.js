window.DragList = (function() {
	'use strict';
	
	// state classes
	var MOVING_CLASS = 'dl-moving';
	var OVER_CLASS = 'dl-over';



	// helpers

	function arrayRemove(array, item) {
		var i = array.indexOf(item);
		if (i > -1) array.splice(i, 1);
	}

	function arrayExcept(collection, item) {
		var copy = [].slice.call(collection);
		arrayRemove(copy, item);
		return copy;
	}

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
		this.action = options.action || 'move';
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


		// create dropAreaEl if it doesn't already exist
		if (this.action === 'move' && !this.dropAreaEl) {
			this.dropAreaEl = document.createElement(itemEl.tagName);
			this.dropAreaEl.className = 'dl-drop-area';


			// dropAreaEl handlers

			on(this.dropAreaEl, 'dragover', function(e) {
				e.preventDefault(); // required for drop
			});

			on(this.dropAreaEl, 'drop', function(e) {
				e.stopPropagation(); // stops the browser from redirecting.

				// ondrop callback
				if (thisDragList.ondrop)
					thisDragList.ondrop.call(thisDragList, thisDragList.curSrcEl);
			});
		}


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
			if (thisDragList.action === 'switch')
				this.classList.add(MOVING_CLASS);
			else {
				// replace element being dragged with dropAreaEl (must be async)
				setTimeout(function() {
					itemEl.parentNode.replaceChild(thisDragList.dropAreaEl, itemEl);
				}, 0);
			}
		});

		on(itemEl, 'dragover', this.action === 'switch' ? function(e) {
			// make sure item we're dragging is from this list
			if (!thisDragList.curSrcEl) return;

			// allow drop
			e.preventDefault();

			e.dataTransfer.dropEffect = 'move';
			this.classList.add(OVER_CLASS);
		} : function() {
			// make sure item we're dragging is from this list
			if (!thisDragList.curSrcEl) return;

			var dropAreaEl = thisDragList.dropAreaEl;
			var parent = this.parentNode;

			// move dropAreaEl
			var targetI = [].indexOf.call(parent.children, this);
			var visibleItemEls = arrayExcept(parent.children, dropAreaEl);
			parent.insertBefore(dropAreaEl, visibleItemEls[targetI]);
		});

		if (this.action === 'switch') {
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
		}

		on(itemEl, 'dragend', function() {
			if (thisDragList.action === 'switch') {
				this.classList.remove(MOVING_CLASS);
			} else {
				// replace dropAreaEl with srcEl
				var dropAreaEl = thisDragList.dropAreaEl;
				dropAreaEl.parentNode.replaceChild(this, dropAreaEl);
			}

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