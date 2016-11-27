import config from '../config';
import assert from 'assert';
import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient,
  url = config.mongoUrl;

export default function mongoClean(callback){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.dropDatabase(function(){
      db.close();
      console.log("Database deleted.");
      if(typeof callback !== 'undefined'){
        callback();
      };
    });
  });
};

mongoClean();
