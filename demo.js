var colsEl = document.querySelector('.cols');
var colsDragList = new DragList({
	itemEls: colsEl.children,
	handleSelector: 'header',
	callback: function(srcEl) {
		// Set number of times the column has been moved.
		var newCount = parseInt(srcEl.getAttribute('data-col-moves')) + 1;
		srcEl.setAttribute('data-col-moves', newCount);
		srcEl.lastChild.data = 'moves: ' + newCount;
	},
	action: 'switch'
});

var groceriesDragList = new DragList({
	itemEls: document.querySelectorAll('.groceries li')
});