window.DragList = (function() {
	'use strict';

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
		this.movingClass = options.movingClass || 'dl-moving';
		this.overClass = options.overClass || 'dl-over';
		this.handleSelector = options.handleSelector || 'dl-handle';
		this.afterSwitch = options.afterSwitch || null;

		// make each element draggable, add to this.itemEls, and set up events
		this.itemEls = [];
		[].forEach.call(options.itemEls, this.addItem, this);
	};

	DragList.prototype.addItem = function(itemEl) {
		this.itemEls.push(itemEl);
		itemEl.draggable = true;
		on(itemEl, 'mousedown', handleMouseDown);
		on(itemEl, 'dragstart', handleDragStart);
		on(itemEl, 'dragenter', handleDragEnter);
		on(itemEl, 'dragover', handleDragOver);
		on(itemEl, 'dragleave', handleDragLeave);
		on(itemEl, 'drop', handleDrop);
		on(itemEl, 'dragend', handleDragEnd);


		// handlers

		var clickedEl = null;
		function handleMouseDown(e) {
			clickedEl = e.target;
		}

		this.curSrcEl = null;
		var thisDragList = this;
		function handleDragStart(e) {
			/*jshint validthis:true*/

			// if handle exists don't do anything if it wasn't last clicked
			var handle = this.querySelector(thisDragList.handleSelector);
			if (handle && !handle.contains(clickedEl)) {
				e.preventDefault();
				return;
			}

			e.dataTransfer.effectAllowed = 'move';

			// this/e.target is the source node.
			thisDragList.curSrcEl = this;

			this.classList.add(thisDragList.movingClass);
		}

		function handleDragOver(e) {
			/*jshint validthis:true*/
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
			this.classList.add(thisDragList.overClass);
		}

		// this also fires when a child node is dragged over
		function handleDragEnter() {
		}

		// this aksi fires when a child node is dragged over
		function handleDragLeave(e) {
			/*jshint validthis:true*/
			this.classList.remove(thisDragList.overClass);
		}

		function handleDrop(e) {
			/*jshint validthis:true*/
			// this/e.target is current target element.

			if (e.stopPropagation) {
				e.stopPropagation(); // stops the browser from redirecting.
			}

			// Don't do anything if we're dropping on the same item we're dragging.
			if (thisDragList.curSrcEl !== this) {
				swapNodes(thisDragList.curSrcEl, this);

				// callback
				if (thisDragList.afterSwitch) thisDragList.afterSwitch(thisDragList.curSrcEl, this);
			}
		}

		function handleDragEnd() {
			/*jshint validthis:true*/
			// this/e.target is the source node.
			this.classList.remove(thisDragList.movingClass);
			[].forEach.call(thisDragList.itemEls, function(itemEl) {
				itemEl.classList.remove(thisDragList.overClass);
			});
		}
	};

	return DragList;
})();