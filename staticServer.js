var connect = require('connect');

function addHttpHeaders(req, res, next){
  console.log("call");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}

connect()
	.use(addHttpHeaders)
	.use(connect.static(__dirname))
	.listen(8080);