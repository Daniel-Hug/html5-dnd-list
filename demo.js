var cols = document.querySelectorAll('.cols .dl-item');
var dl = new DragList({
	itemEls: cols,
	handleSelector: 'header',
	afterSwitch: function(srcEl) {
		// Set number of times the column has been moved.
		var newCount = parseInt(srcEl.getAttribute('data-col-moves')) + 1;
		srcEl.setAttribute('data-col-moves', newCount);
		srcEl.lastChild.data = 'moves: ' + newCount;
	}
});