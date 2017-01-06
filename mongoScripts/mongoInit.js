import config from '../config';
import assert from 'assert';
import mongodb from 'mongodb';
import mongoClean from './mongoClean';

const MongoClient = mongodb.MongoClient,
  url = config.mongoUrl;

const insertUsers = function(db, callback) {
   db.collection('users').insertMany([
 			{"_id" : 1, "firstName" : "Holger", "email" : "", "key": "12345", "token": "", "role": "user"},
 			{"_id" : 2, "firstName" : "Julia", "email" : "", "key": "12345", "token": "", "role": "user"},
 			{"_id" : 3, "firstName" : "Michael", "email" : "", "key": "34567", "token": "", "role": "user"},
      {"_id" : 4, "firstName" : "Werner", "email" : "", "key": "123", "token": "", "role": "user"},
 			{"_id" : 5, "firstName" : "Elisabeth", "email" : "", "key": "123", "token": "", "role": "user"},
      {"_id" : 6, "firstName" : "Admin", "email" : "", "key": "supersecret1337", "token": "", "role": "admin"}
 		], function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the users collection.");
    callback();
  });
};

function createAdmin(db) {
  //db.removeUser(config.mongoAdmin);
  //db.addUser(config.mongoAdmin, config.mongoPassword);
  //console.log('created Admin');
}

mongoClean(function(){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
  	insertUsers(db, function() {
        console.log('inserted Users');
        createAdmin(db);
        db.close();
    });
  });
});
