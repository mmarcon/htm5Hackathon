var Audio = (function() {
    var self = {},
        bufferList, defaults = {
            initialAudioLevel: 1,
            initialReverbLevel: 0.6,
            lowFilterFrequencyValue: 22050.0,
            lowFilterQValue: 5.0,
            sourcePlaybackRateValue: 1.0,
            loop: true
        };


    self.setReverbImpulseResponse = function(url, convolver) {
        // Load impulse response asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            convolver.buffer = self.context.createBuffer(request.response, false);
            APP.LoadingIndicator.resourceLoaded();
        }
        APP.LoadingIndicator.resourceIsLoading();
        request.send();
    };

    self.setAudioSource = function(audio, url) {
        var buffer = self.bufferList[url];

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
                APP.LoadingIndicator.resourceLoaded();
            }
            APP.LoadingIndicator.resourceIsLoading();
            request.send();
        }
    };

    self.createSource = function(options) {
        var source, dryGainNode, wetGainNode, panner, lowFilter, convolver, options = options || {};

        source = options.mediaElement ? self.context.createMediaElementSource(options.mediaElement) : self.context.createBufferSource();
        dryGainNode = self.context.createGainNode();
        wetGainNode = self.context.createGainNode();

        panner = self.context.createPanner();

        lowFilter = self.context.createBiquadFilter();
        lowFilter.frequency.value = options.lowFilterFrequencyValue || defaults.lowFilterFrequencyValue;
        lowFilter.Q.value = options.lowFilterQValue || defaults.lowFilterQValue;

        convolver = self.context.createConvolver();

        // Connect audio processing graph
        source.connect(lowFilter);
        lowFilter.connect(panner);

        // Connect dry mix
        panner.connect(dryGainNode);
        dryGainNode.connect(self.context.destination);
        dryGainNode.gain.value = options.initialAudioLevel || defaults.initialAudioLevel;

        // Connect wet mix
        panner.connect(convolver);
        convolver.connect(wetGainNode);
        wetGainNode.connect(self.context.destination);
        wetGainNode.gain.value = options.initialReverbLevel || defaults.initialReverbLevel;

        self.setReverbImpulseResponse('impulseResponses/s3_r4_bd.wav', convolver);

        if (!options.mediaElement) {
            source.playbackRate.value = 1.0;
        }

        panner.setPosition(0, 0, 0);

        source.loop = options.loop || defaults.loop;

        return {
            panner: panner,
            source: source
        };
    };

    self.setListenerPosition = function(listener) {
        var localOrientation = ((2 * Math.PI - listener.orientation) + Math.PI / 2) % (2 * Math.PI),
            x = Math.cos(localOrientation) * 4,
            y = Math.sin(localOrientation) * 4;
        self.context.listener.setOrientation(x, y, 0, 0, 0, 1);
        self.context.listener.setPosition(listener.lng * 100, listener.lat * 100, 0);
    };

    self.getCurrentTime = function() {
        return self.context.currentTime;
    };

    var init = function() {
            if (typeof AudioContext == "function") {
                self.context = new AudioContext();
            } else if (typeof webkitAudioContext == "function") {
                self.context = new webkitAudioContext();
            } else {
                throw new Error('AudioContext not supported. :(');
            }

            self.bufferList = {};
        };

    init();

    return {
        setReverbImpulseResponse: self.setReverbImpulseResponse,
        setAudioSource: self.setAudioSource,
        createSource: self.createSource,
        createMediaLinkedSource: self.createMediaLinkedSource,
        getCurrentTime: self.getCurrentTime,
        setListenerPosition: self.setListenerPosition
    }

})();
