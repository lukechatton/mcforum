searchPlayer = function() {
	
}

$(function() {
	$('#search-player').submit(function() {
		var path = '/u/' + $('#search-player-input').val();
		console.log('path: ' + path);
		window.location.href = path;
	})
})