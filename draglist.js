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
		this.callback = options.callback || null;

		// make each element draggable, add them to this.itemEls, and set up events
		this.itemEls = [];
		[].forEach.call(options.itemEls, this.addItem, this);
	};

	DragList.prototype.addItem = function(itemEl) {
		this.itemEls.push(itemEl);
		itemEl.draggable = true;


		// itemEl handlers

		var clickedEl = null;
		on(itemEl, 'mousedown', function onItemElMouseDown(e) {
			clickedEl = e.target;
		});

		this.curSrcEl = null;
		var thisDragList = this;
		on(itemEl, 'dragstart', function onItemElDragStart(e) {
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
		});

		on(itemEl, 'dragover', function onItemElDragOver(e) {
			/*jshint validthis:true*/
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
			this.classList.add(thisDragList.overClass);
		});

		// this also fires when a child node is dragged over
		on(itemEl, 'dragleave', function onItemElDragLeave(e) {
			/*jshint validthis:true*/
			this.classList.remove(thisDragList.overClass);
		});

		on(itemEl, 'drop', function onItemElDrop(e) {
			/*jshint validthis:true*/
			// this/e.target is current target element.

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
			/*jshint validthis:true*/
			// this/e.target is the source node.
			this.classList.remove(thisDragList.movingClass);
			[].forEach.call(thisDragList.itemEls, function(itemEl) {
				itemEl.classList.remove(thisDragList.overClass);
			});
		});
	};

	return DragList;
})();