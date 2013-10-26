var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var moment 		= require('moment');
var ObjectID	= require('mongodb').ObjectID;

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'astmdb';

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
	if (e) {
		//console.log(e);
	}	else{
		console.log('connected to database :: ' + dbName);
	}
});

module.exports = {
		account:db.collection('account'),
		location:db.collection('location'),
		crypto:crypto,
		ObjectID:ObjectID,
		moment:moment 
}