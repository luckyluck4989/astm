var cnMongoDB = require('../mongodb/connection');
var countryDB = cnMongoDB.country;
var cityDB  = cnMongoDB.city;

// Get list country
exports.getListCountry = function(callback){
	countryDB.find({}).sort([['country','asc']]).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list country');
		else
			callback(null,result);
	});
}

// Get list city
exports.getListCity = function(callback){
	cityDB.find({}).sort([['city','asc']]).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list city');
		else
			callback(null,result);
	});
}
