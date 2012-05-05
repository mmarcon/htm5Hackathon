var Audio = (function() {
    var self = {},
		bufferList,
		defaults = {
			kInitialReverbLevel: 0.6,
			lowFilterFrequencyValue: 22050.0,
			lowFilterQValue: 5.0,
			sourcePlaybackRateValue: 1.0,
			looping: true
		};
	

    self.setReverbImpulseResponse = function(url, convolver) {
        // Load impulse response asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            convolver.buffer = self.context.createBuffer(request.response, false);
        }
        request.send();
    };

    self.setAudioSource = function(audio, url) {
        var buffer = bufferList[url];
		
        // See if we have cached buffer
        if (buffer) {
            audio.source.buffer = buffer;
        } else {
            // Load asynchronously
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";

            request.onload = function() {
                var buffer = self.context.createBuffer(request.response, true);

                audio.source.buffer = buffer;
                self.bufferList[url] = buffer; // cache it
            }

            request.send();
        }
    };
	
	self.createSource = function(options){
	    var source, dryGainNode, wetGainNode, panner, lowFilter, convolver;

	    source = audioContext.createBufferSource();
	    dryGainNode = audioContext.createGainNode();
	    wetGainNode = audioContext.createGainNode();
	    panner = audioContext.createPanner();

	    lowFilter = audioContext.createBiquadFilter();
	    lowFilter.frequency.value = options.lowFilterFrequencyValue || defaults.lowFilterFrequencyValue;
	    lowFilter.Q.value = options.lowFilterQValue || defaults.lowFilterQValue;

	    convolver = audioContext.createConvolver();

	    // Connect audio processing graph
	    source.connect(lowFilter);
	    lowFilter.connect(panner);

	    // Connect dry mix
	    panner.connect(dryGainNode);
	    dryGainNode.connect(audioContext.destination);

	    // Connect wet mix
	    panner.connect(convolver);
	    convolver.connect(wetGainNode);
	    wetGainNode.connect(audioContext.destination);
	    wetGainNode.gain.value = options.kInitialReverbLevel || defaults.kInitialReverbLevel;

	    setReverbImpulseResponse('s3_r4_bd.wav', convolver);

	    source.playbackRate.value = 1.0;

	    panner.setPosition(0, 0, 0);
	    source.looping = true;

	    return {
	        panner: panner,
	        source: source
	    };
	};
	
	self.setListenerOrientation = function(listener) {
	    var x = Math.cos(listener.orientation) * 4,
	        y = Math.sin(listener.orientation) * 4;
	    //self.context.listener.setOrientation(x, 0, y, 0, 1, 0);
		self.context.listener.setOrientation(x, y, 0, 0, 0, 1);
		self.context.listener.setPosition(listener.lat, listener.lng, 0);
	};

	var init = function(){
	    if (typeof AudioContext == "function") {
	        self.context = new AudioContext();
	    } else if (typeof webkitAudioContext == "function") {
	        self.context = new webkitAudioContext();
	    } else {
	        throw new Error('AudioContext not supported. :(');
	    }

	    self.bufferList = {};
		/*
	    for (var i = 0; i < Math.min(10, fs.sounds.length); i++) {
	        fsAudio[i] = createSource();
	        setAudioSource(fsAudio[i], fs.sounds[i]['preview-hq-mp3']);
	        fsAudio[i].panner.setPosition(fs.sounds[i]['geotag'].lat, fs.sounds[i]['geotag'].lon, 0)
	        fsAudio[i].source.noteOn(audioContext.currentTime + 0.020);
	    }
		*/
	};
	
	init();
	
	return {
		setReverbImpulseResponse: self.setReverbImpulseResponse,
		setAudioSource: self.setAudioSource,
		createSource: self.createSource,
		setListenerOrientation: self.setListenerOrientation
	}

}
})();

