(function(){
	var APP = window.APP = window.APP || {};

	var counter = 0, L,
		showLoadingIndicator,
		hideLoadingIndicator,
		loadingIndicator,
		L = APP.LoadingIndicator = {};

	showLoadingIndicator = function(){
		$('.generate-button').addClass('active');
		loadingIndicator = loadingIndicator || $('<div class="loading-indicator"></div>').appendTo('body');
		loadingIndicator.show();
	};
	hideLoadingIndicator = function(){
		$('.generate-button').removeClass('active');
		loadingIndicator && loadingIndicator.hide();
	};

	L.resourceIsLoading = function(){
		counter++;
		showLoadingIndicator();
	};

	L.resourceLoaded = function(){
		if (counter === 0) {
			//should never get here. oh well...
			return;
		}
		if (--counter === 0) {
			hideLoadingIndicator();
		}
	};

	L.howManyResourcesAreStillLoading = function(){
		return counter;
	};
})();