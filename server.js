const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	toml = require('toml'),
	fs = require('fs'),
	settings = toml.parse(fs.readFileSync('./settings.toml')),
	Database = require('./structures/Database'),
	db = new Database(settings.pg);

app.use(bodyParser.text({ type: '*/*' }));

// Load in the routes for express
let apiv1 = new (require('./api/v1/Router.js'))(settings, db);
app.use(apiv1.path, apiv1.router);

// Start the express server
app.listen(settings.port, error => {
	if (error)
		return console.log(error)
	console.log('Server online');
});

process.on('unhandledRejection', err => console.log(err));
