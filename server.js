
/**
* MODULE DEPENDENCIES
* -------------------------------------------------------------------------------------------------
* include any modules you will use through out the file
**/

var express = require('express')
  , http = require('http')
  , nconf = require('nconf')
  , path = require('path')
  , nodeuuid = require('node-uuid')
  , everyauth = require('everyauth')
  , Recaptcha = require('recaptcha').Recaptcha;


/**
* CONFIGURATION
* -------------------------------------------------------------------------------------------------
* load configuration settings from ENV, then settings.json.  Contains keys for OAuth logins. See 
* settings.example.json.  
**/
nconf.env().file({ file: 'settings.json' });

var app = express();
app.configure(function () {
    app.set('port', process.env.PORT || 3009);
    app.set('views', __dirname + '/app/server/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('azure zomg'));
    app.use(express.session({ secret: 'super-duper-secret-secret' }));
    app.use(everyauth.middleware(app));
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/app/public' }));
    app.use(express.static(path.join(__dirname, 'app/public')));
	/*
	app.use(function(err, req, res, next){
		// JSON ERROR. CODE 500
		var jsonResult = {	func_cd: req.method.toUpperCase().replace("/",""),
							method: req.url.toUpperCase().replace("/",""),
							status: 500,
							message: 'Internal Error',
							error: err.stack,
							result: null,
						};
		res.send(200,jsonResult);
	});
	*/

});

app.configure('development', function () {
    app.use(express.errorHandler());
});

var server = http.createServer(app);

/**
* ROUTING
* -------------------------------------------------------------------------------------------------
* include a route file for each major area of functionality in the site
**/
require('./app/server/routers/home')(app,nodeuuid);

/**
* RUN
* -------------------------------------------------------------------------------------------------
* this starts up the server on the given port
**/

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
