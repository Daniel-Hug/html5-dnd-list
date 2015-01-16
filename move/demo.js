/*global DragList */
(function() {
	'use strict';

	var colsDragList2 = new DragList({
		itemEls: document.querySelector('.move1').children,
		handleSelector: ':scope > header',
		ondrop: function(srcEl) {
			// Set number of times the column has been moved.
			var newCount = parseInt(srcEl.getAttribute('data-col-moves')) + 1;
			srcEl.setAttribute('data-col-moves', newCount);
			srcEl.lastChild.data = 'moves: ' + newCount;
			console.log('args: ', arguments);
		},
		action: 'move'
	});

	var groceriesDragList = new DragList({
		itemEls: document.querySelectorAll('.move2 li')
	});
})();