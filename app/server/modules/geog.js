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

// Get country
exports.getCountry = function(countryid, callback){
	countryDB.findOne({ country : countryid }, function(err,result){
		if(err)
			callback(err,'Can not get list country');
		else
			callback(null,result);
	});
}

// Update/Insert country
exports.updateCountry = function(country, countryid, countryname, callback){
	if(countryid != ''){
		countryDB.update( { 'country' : country }, { $set : { countryName : countryname} }, function(err,result){
			if(err)
				callback(err,'Can not update user');
			else
				callback(null,result);
		});
	} else {
		countryDB.findOne({ country : country }, function(err,result){
			if(err){
				callback(err,'Can not get country');
			} else {
				if(result == null){
					countryDB.insert({
										"country": country,
										"countryName": countryname
									},function(err,result){
						if(err)
							callback(err,'Can insert country');
						else
							callback(null,result);
					});
				} else {
					callback(null,null);
				}
			}
		});
	}
}

// Delete
exports.deleteCountry = function(country, callback){
	countryDB.remove( { 'country' : country }, function(err,result){
		if(err)
			callback(err,'Can not delete user');
		else
			callback(null,result);
	});
}

// Get city
exports.getCity = function(cityid, callback){
	cityDB.findOne({ city : cityid }, function(err,result){
		if(err)
			callback(err,'Can not get list country');
		else
			callback(null,result);
	});
}

// Update/Insert city
exports.updateCity = function(city, cityid, cityname, country, callback){
	if(cityid != ''){
		cityDB.update( { 'city' : city }, { $set : { cityName : cityname, country : country } }, function(err,result){
			if(err)
				callback(err,'Can not update user');
			else
				callback(null,result);
		});
	} else {
		cityDB.findOne({ city : city }, function(err,result){
			if(err){
				callback(err,'Can not get country');
			} else {
				if(result == null){
					cityDB.insert({
										"city": city,
										"cityName": cityname,
										"country": country
									},function(err,result){
						if(err)
							callback(err,'Can insert country');
						else
							callback(null,result);
					});
				} else {
					callback(null,null);
				}
			}
		});
	}
}

// Delete city
exports.deleteCity = function(city, callback){
	cityDB.remove( { 'city' : city }, function(err,result){
		if(err)
			callback(err,'Can not delete user');
		else
			callback(null,result);
	});
}