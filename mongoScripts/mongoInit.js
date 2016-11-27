import config from '../config';
import assert from 'assert';
import mongodb from 'mongodb';
import mongoClean from './mongoClean';

const MongoClient = mongodb.MongoClient,
  url = config.mongoUrl;

const insertUsers = function(db, callback) {
   db.collection('users').insertMany([
 			{"id" : 1, "firstName" : "Bob", "lastName" : "Smith", "email" : "bob@gmx.com"},
 			{"id" : 2, "firstName" : "Ben", "lastName" : "Smooth", "email" : "ben@gmx.com"},
 			{"id" : 3, "firstName" : "Benjamin", "lastName" : "Smatch", "email" : "benjamin@gmx.com"}
 		], function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the users collection.");
    callback();
  });
};

mongoClean(function(){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
  	insertUsers(db, function() {
        db.close();
    });
  });
});
