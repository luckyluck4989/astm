var cnMongoDB = require('../mongodb/connection');
var countryDB = cnMongoDB.country;
var cityDB  = cnMongoDB.city;

// Get list country
exports.getListCountry = function(userid,password,callback){
	countryDB.find({}).sort([['country','asc']]).toArray(function(err,result){
		if(err)
			callback(null,'Can not get list country');
		else
			callback(null,result);
	});
}
