(function(){
	var APP = window.APP = window.APP || {};

	APP.API = {};
	APP.API.Config = {
		freeSoundBaseURL: 'http://www.freesound.org/api/sounds/geotag/?min_lat={BB_MIN_LAT}&min_lon={BB_MIN_LNG}&max_lat={BB_MAX_LAT}&max_lon={BB_MAX_LNG}&sounds_per_page=10&api_key=1142723002b040a0b1f378dc8787bb70&fields=tags,preview-hq-mp3,original_filename,duration,geotag',
		lastFMBaseURL: 'http://ws.audioscrobbler.com/2.0/?method=geo.getevents&lat={LATITUDE}&long={LONGITUDE}&api_key=6c9b80ce8e73b74ac58e22c0657d942c&format=json',
		deezerBaseURL: 'http://api.deezer.com/2.0/search?q={ARTIST_NAME}&output=jsonp',
		proxyURL: 'http://localhost:8000/proxy',
		flickHoldrBaseUrl: 'http://flickholdr.com/100/100/'
	};

	var F, L, D;

	/************************************************************************/
	APP.API.Freesound = function(){};

	F = APP.API.Freesound.prototype;

	F.retrieveSoundsFor = function(bb, success, error) {
		var url = APP.API.Config.freeSoundBaseURL, successFn, errorFn;
		url = url.replace('{BB_MIN_LAT}', bb.minLat || '');
		url = url.replace('{BB_MIN_LNG}', bb.minLng || '');
		url = url.replace('{BB_MAX_LAT}', bb.maxLat || '');
		url = url.replace('{BB_MAX_LNG}', bb.maxLng || '');

		errorFn = function(){
			console.log('[Freesound] Error occurred.', arguments);
			if (typeof error === 'function') {
				error.apply(null, arguments);
			}
			APP.LoadingIndicator.resourceLoaded();
		};

		successFn = function(response){
			if (!response || !response.sounds) {
				errorFn('Invalid response');
				return;
			}
			var sounds = response.sounds;
			sounds.forEach(function(val, index, array){
				if (typeof success === 'function') {
					val.proxied = APP.API.Config.proxyURL + '?url=' + val['preview-hq-mp3'];
					if (val.tags.length > 4) {
						val.tags.length = 4;
					}
					val.flickholdr = APP.API.Config.flickHoldrBaseUrl + val.tags.join(', ');

					success(val);
				}
			});
			APP.LoadingIndicator.resourceLoaded();
		};

		APP.LoadingIndicator.resourceIsLoading();
		$.ajax({
			url: url,
			success: successFn,
			error: errorFn
		});
	};

	/************************************************************************/

	APP.API.LastFM = function(){};

	L = APP.API.LastFM.prototype;

	L.retrieveEventsFor = function(pos, success, error) {
		var url = APP.API.Config.lastFMBaseURL, errorFn, successFn, deezer = new APP.API.Deezer();
		url = url.replace('{LATITUDE}', pos.lat || '');
		url = url.replace('{LONGITUDE}', pos.lng || '');

		errorFn = function(){
			console.log('[Last FM] Error occurred.', arguments);
			if (typeof error === 'function') {
				error.apply(null, arguments);
			}
			APP.LoadingIndicator.resourceLoaded();
		};

		successFn = function(response){
			if (!response || !response.events) {
				errorFn('Invalid or empty response');
				console.log(response);
				return;
			}
			if (!response.events.event || !response.events.event.length === 0) {
				errorFn('No events were found for the given location');
				return;	
			}
			response.events.event.forEach(function(e, index, array){
				var meta = {
					title: e.title || '',
					artist: e.artists.headliner || false,
					venue: {
						name: e.venue.name || '',
						location: {
							lat: e.venue.location['geo:point']['geo:lat'] || '',
							lng: e.venue.location['geo:point']['geo:long'] || '',
							city: e.venue.location.city || '',
							country: e.venue.location.country || '',
							street: e.venue.location.street
						}
					},
					date: e.startDate || '',
					tags: (e.tags && e.tags.tag) || ''
				};
				if (meta.artist) {
					deezer.retrieveSoundsFor(meta, success)
				}
			});
			APP.LoadingIndicator.resourceLoaded();
		};

		APP.LoadingIndicator.resourceIsLoading();
		$.ajax({
			url: url,
			success: successFn,
			error: errorFn
		});
	};

	/************************************************************************/

	APP.API.Deezer = function(){};

	D = APP.API.Deezer.prototype;

	D.retrieveSoundsFor = function(meta, success, error) {
		var url = APP.API.Config.deezerBaseURL, errorFn, successFn;
		url = url.replace('{ARTIST_NAME}', meta.artist || '');

		errorFn = function(){
			console.log('[Deezer] Error occurred.', arguments);
			if (typeof error === 'function') {
				error.apply(null, arguments);
			}
			APP.LoadingIndicator.resourceLoaded();
		};

		successFn = function(response) {
			if (!response || !response.data || response.data.length === 0) {
				errorFn('Invalid or empty response');
				return;
			}
			var data = {
				title: response.data[0].title || '',
				preview: APP.API.Config.proxyURL + '?url=' + response.data[0].preview || '',
				artist: response.data[0].artist.name || '',
				album: {
					title: response.data[0].album.title,
					cover: response.data[0].album.cover
				},
				meta: meta
			};
			if (typeof success === 'function') {
				success(data);
			}
			APP.LoadingIndicator.resourceLoaded();
		};

		APP.LoadingIndicator.resourceIsLoading();
		$.ajax({
			url: url,
			dataType: 'jsonp',
			success: successFn,
			error: errorFn
		});
	};

	/************************************************************************/


})();