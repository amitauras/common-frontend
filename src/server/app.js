/*jshint node:true*/
'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var debug = require('debug')('dashboard: ' + process.pid);
var errorHandler = require('./utils/errorHandler')();
var four0four = require('./utils/404')();
var favicon = require('serve-favicon');
var onFinished = require('on-finished');
var httpPort = process.env.HTTP_PORT || 7203;
var httpsPort = process.env.HTTPS_PORT || 3443;
var routes;

var environment = process.env.NODE_ENV;

debug('Starting application');

debug('Configuring middlewares');
/* middleware configuration
*********************************************************************** **/
app.use(favicon(__dirname + '/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('compression')());
app.use(require('morgan')('dev'));
app.use(require('cors')());
app.use(require('response-time')());
app.use(errorHandler.init);

app.use(function (req, res, next) {
    onFinished(req, function (error) {
        debug('[%s] finished request', req.connection.remoteAddress);
    });
    next();
});

routes = require('./routes/index')(app);

debug('About to crank up node');
debug('PORT= ' + httpPort);
debug('NODE_ENV = ' + environment);

app.get('/ping', function (req, res, next) {
    debug(req.body);
    res.send('pong');
});

switch (environment) {
    case 'build':
        debug('** BUILD **');
        app.use(express.static('./build/'));
        // Any invalid calls for templateUrls are under app/* and should return 404
        app.use('/app/*', function (req, res, next) {
            four0four.send404(req, res);
        });
        // Any deep link calls should return index.html
        app.use('/*', express.static('./build/index.html'));
        break;
    default:
        debug('** DEV **');
        app.use(express.static('./src/client/'));
        app.use(express.static('./'));
        app.use(express.static('./.tmp'));
        // All the assets are served at this point.
        // Any invalid calls for templateUrls are under app/* and should return 404
        app.use('/app/*', function (req, res, next) {
            four0four.send404(req, res);
        });
        // Any deep link calls should return index.html
        app.use('/*', express.static('./src/client/index.html'));
        break;
}

/* Server creation
*********************************************************************** **/
debug('Creating HTTP Server on port: %s', httpPort);
require('http').createServer(app).listen(httpPort, function () {
    debug('Express server listening on port: ' + httpPort);
    debug('env = ' + app.get('env') +
        '\n__dirname = ' + __dirname +
        '\nprocess.cwd = ' + process.cwd());
});
