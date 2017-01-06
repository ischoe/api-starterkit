import express from 'express';
import assert from 'assert';
import mongodb from 'mongodb';
import config from '../config';
import bodyParser from 'body-parser';
import uuid from 'uuid/v1';
import cors from 'cors';

const port = config.port,
	app = express(),
	MongoClient = mongodb.MongoClient,
	mongoUrl = config.mongoUrl;

const getUsers = function(db, callback) {
	 var collection = db.collection('users');
	 collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
  });
};

const getUsersByKey = function(db, sendKey, callback) {
	 var collection = db.collection('users');
	 collection.find({key:sendKey}).toArray(function(err, docs) {
			 assert.equal(err, null);
			 if(docs) {
		     callback(docs);
			 } else {
				 callback(null);
			 }
   });
};

const getUsersByToken = function(db, token, callback) {
	 var collection = db.collection('users');
	 collection.find({token:token}).toArray(function(err, docs) {
			 assert.equal(err, null);
			 if(docs) {
		     callback(docs);
			 } else {
				 callback(null);
			 }
   });
};

const getUserByTokenAndId = function(db, token, id, callback) {
	 var collection = db.collection('users');
	 collection.find({token:token, _id: id}).toArray(function(err, docs) {
			 assert.equal(err, null);
			 if(docs) {
		     callback(docs);
			 } else {
				 callback(null);
			 }
   });
};

const updateUsersByKey = function(db, sendKey, sessionId, callback) {
	 var collection = db.collection('users');
		collection.update(
			{key:sendKey},
			{$set:{ token: sessionId} },
			{ multi: true },
		function(err, writeResult) {
			 assert.equal(err, null);
			 if(writeResult) {
				 callback(writeResult);
			 } else {
				 callback(null);
			 }
   });
};

const updateUsersByProperty = function(db, id, prop, val, callback) {
	 var collection = db.collection('users'),
	 	set = { [prop] : val};
		collection.update(
			{_id:id},
			{$set: set },
			{ multi: false },
		function(err, writeResult) {
			 assert.equal(err, null);
			 if(writeResult) {
				 callback(writeResult);
			 } else {
				 callback(null);
			 }
   });
};

app.set('port', port);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(securityCheck);

function securityCheck( req, res, next){
	if(req.get('origin') === config.allowedUrl) {
		next();
	} else {
		res.status(404).send('Not found');
	}
}

function isLoggedIn(req, res, next) {
	if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
		const token = req.headers.authorization.split(' ')[1];
		MongoClient.connect(mongoUrl, function(err, db) {
			assert.equal(null, err);
			getUsersByToken(db, token, function(data) {
				if(data.length > 0) {
					console.log('USER IS LOGGED-IN');
					next();
				} else {
					res.status(404).send('Bad login');
				}
				db.close();
			});
		});
	} else {
		res.status(404).send('Bad login');
	}
}

function isAdmin(req, res, next) {
	if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
		const token = req.headers.authorization.split(' ')[1];
		MongoClient.connect(mongoUrl, function(err, db) {
			assert.equal(null, err);
			getUsersByToken(db, token, function(data) {
				if(data.length > 0 && data[0].role === 'admin') {
					console.log('USER IS ADMIN');
					next();
				} else {
					res.status(404).send('Bad login');
				}
				db.close();
			});
		});
	} else {
		res.status(404).send('Bad login');
	}
}

app.get('/', function(req, res) {
		res.send('it´s working');
});

app.get('/users', isAdmin, function(req, res){
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

app.post('/loginUser', securityCheck, function (req, res) {
	const sessionId = uuid();
	if(res.statusCode === 200) {
		if(req.body.data.key.length > 0) {
			MongoClient.connect(mongoUrl, function(err, db) {
				assert.equal(null, err);
				updateUsersByKey(db, req.body.data.key, sessionId, function(data) {
					if(data && data.result.nModified > 0) {
						getUsersByKey(db, req.body.data.key, function(data) {
							res.json(Object.assign({}, {user:data}, {status:true}));
							res.end();
							db.close();
						});
					} else {
						res.json({
							status : false
						});
						res.end();
						db.close();
					}
				});
			});
		} else {
			res.json(Object.assign({}, {status:false}));
			res.end();
		}
	} else {
		res.status(404).end();
	}
});

app.post('/isValidKey', function (req, res) {
	MongoClient.connect(mongoUrl, function(err, db) {
		assert.equal(null, err);
		getUsersByToken(db, req.body.data.token, function(data) {
			if(data.length > 0) {
				res.json(Object.assign({}, {user:data}, {status:true}));
			} else {
				res.json({
					status : false
				});
			}
			res.end();
			db.close();
		});
	});
});


app.post('/updateUserData', function (req, res) {
	const token = req.body.data.token,
			id = parseInt(req.body.data.id);
	MongoClient.connect(mongoUrl, function(err, db) {
		assert.equal(null, err);
		getUserByTokenAndId(db, token, id, function(data) {
			if(data.length > 0) {
				updateUsersByProperty(db, id, req.body.data.prop, req.body.data.val, function(data) {
					if(data && data.result.nModified > 0) {
						getUsersByToken(db, token, function(data) {
							res.json(Object.assign({}, {user:data}, {status:true}));
							res.end();
							db.close();
						});
					} else if(data && data.result.nModified === 0){
						getUsersByToken(db, token, function(data) {
							res.json(Object.assign({}, {user:data}, {status:true}));
							res.end();
							db.close();
						});
					} else {
						res.json({
							status : false
						});
						res.end();
						db.close();
					}
				});

			} else {
				res.json({
					status : false
				});
				res.end();
				db.close();
			}
		});
	});
});


app.listen(port, function() {
	console.log("API running on port:" + app.get('port'));
});
