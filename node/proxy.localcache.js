var http = require('http'),
    url = require('url'),
    path = require('path'),
    express = require('express'),
    app = express.createServer(),
    fs = require('fs');


app.get('/proxy', function (request, response) {
    var params = url.parse(request.url, true).query;
    var requestURL = url.parse(params.url);

    var proxy = http.createClient(80, requestURL.host);
    var proxy_request = proxy.request(request.method, requestURL.href, request.headers);
    proxy_request.on('response', function (proxy_response) {
        var fileName = Date.now() + '__audio.mp3';
        var fStream = fs.createWriteStream(path.normalize(__dirname + '/../media/' + fileName));
        proxy_response.pipe(fStream);
        fStream.on('close', function () {
            console.log(fileName + ' written.');
            response.writeHead(302, {
                //Make sure media exists if you attempt to use this proxying strategy
                'Location': '/media/' + fileName
            });
            response.end();
        });
    });
    request.pipe(proxy_request);
});

app.use(express.static(path.normalize(__dirname + '/../app')));

app.listen(8000);