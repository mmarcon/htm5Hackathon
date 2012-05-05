(function(){
	var APP = window.APP = window.APP || {};

	APP.API = {};
	APP.API.Config = {
		freeSoundBaseURL: 'http://www.freesound.org/api/sounds/geotag/?min_lat={BB_MIN_LAT}&min_lon={BB_MIN_LNG}&max_lat={BB_MAX_LAT}&max_lon={BB_MAX_LNG}&sounds_per_page=5&api_key=1142723002b040a0b1f378dc8787bb70'
	};

	var F;

	APP.API.Freesound = function(){};

	F = APP.API.Freesound.prototype;

	F.retrieveSoundsFor = function(bb, callback) {
		var url = APP.API.Config.freeSoundBaseURL, successFn, errorFn;
		url = url.replace('{BB_MIN_LAT}', bb.minLat || '');
		url = url.replace('{BB_MIN_LNG}', bb.minLng || '');
		url = url.replace('{BB_MAX_LAT}', bb.maxLat || '');
		url = url.replace('{BB_MAX_LNG}', bb.maxLng || '');

		errorFn = function(){console.log('Error occurred.', arguments);};

		successFn = function(response){
			if (!response || !response.sounds) {
				errorFn('Invalid response');
				return;
			}
			var sounds = response.sounds;
			sounds.forEach(function(val, index, array){
				if (typeof callback === 'function') {
					callback(val);
				}
			});
		};

		$.ajax({
			url: url,
			success: successFn,
			error: errorFn
		});
	};

})();