$(document).ready(function() {
	$('.rank').each(function(i, obj) {
		console.log('detected rank tag ' + obj.innerHTML);

		obj.innerHTML = obj.innerHTML.replace('PRO3', '$ $ $').replace('PRO2', '$ $').replace('PRO', '$').replace('HEART', '❤');
	})
})