switchTab = function(destination) {
	$('#warzone').attr('hidden', 'hidden');
	$('#punishments').attr('hidden', 'hidden');

	switch(destination) {
		case 'punishments':
			$('#punishments').removeAttr('hidden');
			$('#punishments').addClass('animated fadeIn');
		break;

		case 'warzone':
			$('#warzone').removeAttr('hidden');
			$('#warzone').addClass('animated fadeIn');
		break;
	}
}

switchLeaderboardSection = function(section) {
	$('#kills_data').attr('hidden', 'hidden');
	$('#kills_tab').removeClass('selected');

	$('#deaths_data').attr('hidden', 'hidden');
	$('#deaths_tab').removeClass('selected');

	$('#matches_data').attr('hidden', 'hidden');
	$('#matches_tab').removeClass('selected');

	$('#levels_data').attr('hidden', 'hidden');
	$('#levels_tab').removeClass('selected');

	$('#coins_data').attr('hidden', 'hidden');
	$('#coins_tab').removeClass('selected');

	$('#tickets_data').attr('hidden', 'hidden');
	$('#tickets_tab').removeClass('selected');

	switch(section) {
		case 'kills':
			$('#kills_data').removeAttr('hidden')
			$('#kills_tab').addClass('selected');
		break;

		case 'deaths':
			$('#deaths_data').removeAttr('hidden');
			$('#deaths_tab').addClass('selected');
		break;

		case 'matches':
			$('#matches_data').removeAttr('hidden');
			$('#matches_tab').addClass('selected');
		break;

		case 'levels':
			$('#levels_data').removeAttr('hidden');
			$('#levels_tab').addClass('selected');
		break;

		case 'coins':
			$('#coins_data').removeAttr('hidden');
			$('#coins_tab').addClass('selected');
		break;

		case 'tickets':
			$('#tickets_data').removeAttr('hidden');
			$('#tickets_tab').addClass('selected');
		break;
	}
}

$(document).ready(function() {
	/* open up with warzone */
	switchTab('warzone');
	switchLeaderboardSection('kills');

	/* =================== */

	/* navbar buttons */

	$('#warzone_nav').click(function() {
		switchTab('warzone');
	});

	$('#punishments_nav').click(function() {
		switchTab('punishments');
	});


	/* leaderboard table buttons */
	$('#kills_tab').click(function() {
		switchLeaderboardSection('kills');
	});

	$('#deaths_tab').click(function() {
		switchLeaderboardSection('deaths');
	});

	$('#matches_tab').click(function() {
		switchLeaderboardSection('matches');
	});

	$('#levels_tab').click(function() {
		switchLeaderboardSection('levels');
	});

	$('#coins_tab').click(function() {
		switchLeaderboardSection('coins');
	});

	$('#tickets_tab').click(function() {
		switchLeaderboardSection('tickets');
	});

});