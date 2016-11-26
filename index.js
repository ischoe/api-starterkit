const express = require('express');

const port = 3000,
	app = express();

app.set('port', port);

app.get('/', function(req, res) {
		res.send('it´s working');
});

app.get('/demo', function(req, res) {
    // demo call
		res.json([
			{"id" : 1, "firstName" : "Bob", "lastName" : "Smith", "email" : "bob@gmx.com"},
			{"id" : 2, "firstName" : "Ben", "lastName" : "Smooth", "email" : "ben@gmx.com"},
			{"id" : 3, "firstName" : "Benjamin", "lastName" : "Smatch", "email" : "benjamin@gmx.com"}
		]);
});

app.listen(port, function() {
	console.log("API running on port:" + app.get('port'));
});
