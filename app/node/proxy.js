var http = require('http')
	url = require('url');

http.createServer(function(request, response) {
	var params = url.parse(request.url, true).query;
	var requestURL = url.parse(params.url);	
	
  var proxy = http.createClient(80, requestURL.host	)
  var proxy_request = proxy.request(request.method, requestURL.href, request.headers);
  proxy_request.on('response', function (proxy_response) {
        proxy_response.pipe(response);
        response.writeHead(proxy_response.statusCode, proxy_response.headers);
  });

  request.pipe(proxy_request);
}).listen(8080);