import express from 'express';
import assert from 'assert';
import mongodb from 'mongodb';
import config from '../config';

const port = config.port,
	app = express(),
	MongoClient = mongodb.MongoClient,
	mongoUrl = config.mongoUrl;

const getUsers = function(db, callback) {
	 var collection = db.collection('users');
	 collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
};

app.set('port', port);

app.get('/', function(req, res) {
		res.send('it´s working');
});

app.get('/users', function(req, res){
	MongoClient.connect(mongoUrl, function(err, db) {
		assert.equal(null, err);
		getUsers(db, function(data) {
			res.json(data);
			db.close();
		});
	});
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
