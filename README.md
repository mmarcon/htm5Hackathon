#City Sounds and Flying Hamsters

Created during the @5apps_ HTML5 hackathon Saturday 5th – Sunday 6th May 2012.

 **PUT ON YOUR HEADPHONES!**

Generate a soundscape of the area you're looking at on the map then fly around it.

##How to run the demo
First of all clone the Git repository:

    git clone git://github.com/mmarcon/htm5Hackathon.git

The demo requires [Node.js](http://nodejs.org) and Express. We implemented a little HTTP server that serves the application and at as a proxy to Deezer as the MP3s hosted in their CDN are not served with the cross-origin flag.

If Express is not already installed:

    npm install express

Then

    cd node
    node proxy.js
    
Now just point your browser to `http://localhost:8000`, plug in your headphones and enjoy.
The hamster can be controlled with arrow keys, space generates a soundscape for the current area.

##Authors

 - Simon Madine - @thingsinjars
 - Max Marcon   - @mmarcon

##Browser tech used

Web Audio API. Detailed information can be found at: [https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html).

##Web services used

 - Nokia Maps API - http://api.maps.nokia.com
 - Freesound API  - http://www.freesound.org/docs/api/
 - LastFM API	   - http://www.last.fm/api
 - Deezer API     - http://developers.deezer.com/api
 - FlickHoldr     - http://flickholdr.com

##Other Resources
 - Slide deck about Soundscape: http://mmarcon.github.com/slides/soundscape