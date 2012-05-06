var http = require('http'),
    url = require('url'),
    path = require('path'),
    express = require('express'),
    app = express.createServer();


app.get('/proxy', function (request, response) {
    var params = url.parse(request.url, true).query;
    var requestURL = url.parse(params.url);

    var proxy = http.createClient(80, requestURL.host)
    var proxy_request = proxy.request(request.method, requestURL.href, request.headers);
    proxy_request.on('response', function (proxy_response) {
        proxy_response.pipe(response);
        var h = proxy_response.headers;
        response.writeHead(proxy_response.statusCode, h);
    });
    request.pipe(proxy_request);
});

console.log(path.normalize(__dirname + '../app'));
app.use(express.static(path.normalize(__dirname + '/../app/')));

app.listen(8000);