window.DragList = (function() {
	'use strict';
	
	// state classes
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


		// create dropAreaEl if it doesn't already exist
		if (!this.dropAreaEl) {
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
				return;
			}

			e.dataTransfer.effectAllowed = 'move';
			thisDragList.curSrcEl = this;

			// replace element being dragged with dropAreaEl (must be async)
			setTimeout(function() {
				itemEl.parentNode.replaceChild(thisDragList.dropAreaEl, itemEl);
			}, 0);
		});

		var dragDepth = 0;
		on(itemEl, 'dragenter', function() {
			// make sure item being dragged is in this draglist
			if (!thisDragList.curSrcEl) return;

			// make sure drag started from outside
			if (dragDepth++) return;

			var dropAreaEl = thisDragList.dropAreaEl;
			var parent = this.parentNode;

			// move dropAreaEl
			var targetI = [].indexOf.call(parent.children, this);
			var visibleItemEls = arrayExcept(parent.children, dropAreaEl);
			parent.insertBefore(dropAreaEl, visibleItemEls[targetI]);
		});

		on(itemEl, 'dragleave', function() {
			// make sure item being dragged is in this draglist
			if (!thisDragList.curSrcEl) return;
			
			// make sure it was dragged all the way out
			if (--dragDepth) return;
		});

		on(itemEl, 'dragend', function() {
			// replace dropAreaEl with srcEl
			var dropAreaEl = thisDragList.dropAreaEl;
			dropAreaEl.parentNode.replaceChild(this, dropAreaEl);

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