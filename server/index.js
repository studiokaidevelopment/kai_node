/**
 *  AUTHENTICATE WITH GOOGLE
 */ 
var google = require('googleapis');
var private_key = require('./kai_beta_secret.json');
var CALENDAR_ID = "studiokaidevelopment@gmail.com"

var jwtClient = new google.auth.JWT(
	private_key.client_email,
	null,
	private_key.private_key,
	['https://www.googleapis.com/auth/calendar.readonly', 
	 'https://www.googleapis.com/auth/calendar']
);

jwtClient.authorize(function (err, tokens) {
	if (err)
		return console.log('Error authorizing Google Calendar API: ' + String(err));
	else
		return console.log('Successfully authenticated to Google Calendar API');
});

var calendar = google.calendar('v3');

/**
 *  AUTHENTICATE WITH FACEBOOK
 */ 
var FB = require('fb'), fb = new FB.Facebook({version: 'v2.9'});
FB.setAccessToken('*********************');

/**
 *  SET UP EXPRESS AND MIDDLEWARE
 */ 
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');

var server = express();
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(methodOverride('X-HTTP-Method-Override'));

server.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Origin', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Origin', 'Content-Type');
	next();
});

server.models = require('./models/index.js');
var routes = require('./routes.js');
_.each(routes, function(controller, route) {
	server.use(route, controller(server, route));
});

/**
 *  REST API
 */ 
server.use('/events/start/:start/end/:end', function(req, res, next) {
	calendar.events.list({
		auth: jwtClient,
		calendarId: "studiokaidevelopment@gmail.com",
		timeMax: req.params.end,
		timeMin: req.params.start,
	}, function (err, response) {
			if (err)
				return console.log('Error retrieving calendarList: ' + String(err));
			else {
				var calendar = JSON.parse(JSON.stringify(response, null, '\t'));
				var events = calendar.items
				res.write(JSON.stringify(events));
				res.end();
				next();
			}
	});
});

server.use('/events/insert', function(req, res, next) {
	console.log(req.query.event);
	var event = JSON.parse(req.query.event);
	console.log(event.attendees[0]);
	calendar.events.insert({
		auth: jwtClient,
		calendarId: CALENDAR_ID,
		sendNotifications: true,
		resource: event
	}, function (err, response) {
			if (err) {
				console.log('Error inserting event to Google Calendar: ' + String(err));
				res.write(String(err));
				res.end();
				next();
			}
			else {
				console.log(String(response));
				res.write(String(response));
				res.end();
				next();
			}
	});
});

server.use('/fb', function(req, res, next) {
	FB.api('401405703230827_1447912928580094?fields=attachments', function (response) {
		if(!response || response.error) {
			console.log(!response ? 'error occurred' : response.error);
			return;
		}
		console.log(response);
		res.write(String(response));
		res.end();
		next();
	});
});

console.log('Listening on port 8080');
server.listen(8080, '0.0.0.0');