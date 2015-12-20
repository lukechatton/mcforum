$(document).ready(function() {
	$('.post-content').each(function(i, obj) {
		console.log('converted ' + obj.innerHTML);

		obj.innerHTML = marked(obj.innerHTML);
	})

	// document.getElementById('post-content').innerHTML = marked();
})