var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID;
var logCollectDB = cnMongoDB.logcollect;
var cityDB  = cnMongoDB.city;

// Log when user login
exports.insertLog = function(userid, callback){
	var iDate = new Date();
	logCollectDB.insert({ userid	 : userid,
						  type		 : "1",
						  typename	 : "login",
						  locationid : "",
						  city		 : "",
						  country	 : "",
						  date		 : iDate.getDate(),
						  month		 : iDate.getMonth() + 1,
						  year		 : iDate.getFullYear(),
						  yearmonth	 : iDate.getFullYear() * 100 + iDate.getMonth() + 1,
						  datetime	 : iDate
					}
		,function(err,resultSystem){
		if(err){
			callback(err,'Can not add log history');
		} else {
			callback(null,resultSystem);
		}
	});
}

// Log when user checkin or comment or like
exports.insertLogLocation = function(userid, locationid, locationname, city, country, typename, callback){
	var iDate = new Date();
	logCollectDB.insert({ userid		: userid,
						  type			: "2",
						  typename		: typename,
						  locationid	: locationid,
						  location_name	: locationname,
						  city			: city,
						  country		: country,
						  date			: iDate.getDate(),
						  month			: iDate.getMonth() + 1,
						  year			: iDate.getFullYear(),
						  yearmonth		: iDate.getFullYear() * 100 + iDate.getMonth() + 1,
						  datetime		: iDate
					}
		,function(err,resultSystem){
		if(err){
			callback(err,'Can not add log history');
		} else {
			callback(null,resultSystem);
		}
	});
}

// Report count user login system by month
exports.reportUserLoginByMonth = function(fromdate, todate, callback){
	var iDate = new Date();
	logCollectDB.aggregate( [
		{ $match: { $and: [ { type: "1" }, { yearmonth: { $gte : Number(fromdate) } }, { yearmonth: { $lte : Number(todate) } } ] } },
		{ $group: { _id: "$yearmonth",
					count: { $sum: 1 } } },
		{ $sort: { _id: 1 } }
	], function(err,resultSystem){
		if(err){
			callback(err,'Can not add log history');
		} else {
			callback(null,resultSystem);
		}
	});
}

// Report count user login system by year
exports.reportUserLoginByYear = function(fromyear, toyear, callback){
	var iDate = new Date();
	logCollectDB.aggregate( [
		{ $match: { $and: [ { type: "1" }, { year: { $gte : Number(fromyear) } }, { year: { $lte : Number(toyear) } } ] } },
		{ $group: { _id: "$year",
					count: { $sum: 1 } } },
		{ $sort: { _id: 1 } }
	], function(err,resultSystem){
		if(err){
			callback(err,'Can not add log history');
		} else {
			callback(null,resultSystem);
		}
	});
}

// Report count user by location
exports.reportUserLoginByCity = function(fromdate, todate, callback){
	var iDate = new Date();
	logCollectDB.aggregate( [
		{ $match: { $and: [ { type: "2" }, { yearmonth: { $gte : Number(fromdate) } }, { yearmonth: { $lte : Number(todate) } } ] } },
		{ $group: { _id: "$city",
					count: { $sum: 1 } } },
		{ $sort: { _id: 1 } }
	], function(err,resultSystem){
		if(err){
			callback(err,'Can not add log history');
		} else {
			var arrID = [];
			for(var i = 0; i < resultSystem.length; i++){
				arrID.push(resultSystem[i]._id.substr(resultSystem[i]._id.indexOf('-') + 1,resultSystem[i]._id.length));
			}
			cityDB.find({ 'city': { $in: arrID }}).sort([['_id','asc']]).toArray(function(err,resultCity){
				if(err){
					callback(err,'Can not get list location');
				} else {
					for(var i = 0; i < resultSystem.length; i++){
						if( resultCity[i] != undefined )
							resultSystem[i].city_name = resultCity[i].cityName;
					}
					callback(null,resultSystem);
				}
			});
		}
	});
}