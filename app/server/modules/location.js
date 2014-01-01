var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var locationDB = cnMongoDB.location;
var accountDB = cnMongoDB.account;
var https = require('https'); //Https module of Node.js
var FormData = require('form-data'); //Pretty multipart form maker.
var ACCESS_TOKEN = "CAAICtp62IZBgBAPdJ6Ohck0FhYsmiZCrOs2yZCN0Ai7JH1wNqnZC0tVfCOetqXCY60j3EfGadAK3cljdBgYQrI88qJYjuPz9J8z3tJYR9oOVzWoXfY6SL9akjwXZBwE6xhqA9csNQZCZA42BM7CLdQlD556Y6G5LIdbrLzvXRXhspE3PtVZB3LnZC";

//--------------------------------
// Function Add Image
// Param input: List input from screen
// Param image: image need to be upload
// Param callback: funtion callback
//--------------------------------
exports.addImage = function(input, image, callback){
	//--------------------------------
	// Define parameter
	//--------------------------------
	var tmp_path;		// Path of image in client
	var imgName;		// Image name after rename
	var target_path;	// Path of image in server
	var is,os;			// Input & output stream

	// Get the temporary location of the file
	tmp_path = image.path;

	// Set where the file should actually exists - in this case it is in the "images" directory
	imgName = new ObjectID() + image.name.substr(image.name.indexOf('.'),image.name.length);
	target_path =  './app/public/upload/' + imgName;

	// Move the file from the temporary location to the intended location
	is = fs.createReadStream(tmp_path);
	os = fs.createWriteStream(target_path);
	is.pipe(os);
	is.on('end',function() {
		fs.unlinkSync(tmp_path,function(err){
		});
	});

	// Return data image name to router
	callback(null,imgName);
}

//--------------------------------
// Function Add Location
// Param input: List input from screen
// Param callback: funtion callback
//--------------------------------
exports.addLocation = function(input, callback){
	if(input.locationid == ''){
		//-----------------------------------------
		// Define item insert to database
		//-----------------------------------------
		var itemEntry = {	namelocation: 'Jack1',
							country: 'vn',
							city: 'hochiminh-quan2',
							isrecommend: '',
							description: '',
							imagelist: [],
							checkin: [],
							imagethumb: '',
							coordinate: [],
							like: 0,
							comment: 0,
							address : '',
							fbid: ''
						};
		itemEntry.namelocation = input.namelocation;
		itemEntry.country = input.country;
		itemEntry.city = input.city;
		itemEntry.description = input.description;
		itemEntry.imagelist = input.imagelist.split(",");
		itemEntry.imagethumb = itemEntry.imagelist[0];
		var cordi = input.coordinate.split(",");
		itemEntry.coordinate = [Number(cordi[0]),Number(cordi[1])];
		itemEntry.isrecommend = input.isrecommend;
		itemEntry.address = input.address;
		if (itemEntry._id) {
			itemEntry._id = new ObjectID(itemEntry._id);
		}

		//-----------------------------------------
		// Post to facebook
		//-----------------------------------------
		var form = new FormData(); //Create multipart form
		var imageName = itemEntry.imagethumb.substr(itemEntry.imagethumb.indexOf('/upload/') + 8,itemEntry.imagethumb.length);
		form.append('file', fs.createReadStream('./app/public/upload/'+ imageName)); //Put file
		form.append('message', itemEntry.description); //Put message
		 
		//POST request options, notice 'path' has access_token parameter
		var options = {
			method: 'post',
			host: 'graph.facebook.com',
			path: '/534081833342710/photos?access_token=' + ACCESS_TOKEN,
			headers: form.getHeaders(),
		}

		//Do POST request, callback for response
		var request = https.request(options, function (response){
			//console.log('STATUS: ' + response.statusCode);
			//console.log('HEADERS: ' + JSON.stringify(response.headers));
			response.setEncoding('utf8');

			response.on('data', function(chunk) {
				itemEntry.fbid = (JSON.parse(chunk)).id;
				console.log(itemEntry.fbid);
			});

			response.on('end', function() {
				locationDB.save(itemEntry, {safe: true}, callback);
			});

		});
		 
		//Binds form to request
		form.pipe(request);

		//If anything goes wrong (request-wise not FB)
		request.on('error', function (error) {
			callback(error,null);
		});
	} else {
		var cordi = input.coordinate.split(",");
		locationDB.update( { _id : new ObjectID(input.locationid) }, 
							{ $set : { namelocation : input.namelocation,
									   country 		: input.country,
									   city			: input.city,
									   address		: input.address,
									   description	: input.description,
									   imagelist	: input.imagelist.split(","),
									   coordinate	: [Number(cordi[0]),Number(cordi[1])],
									   isrecommend	: input.isrecommend
							} }, function(err,result){
			if(err)
				callback(err,'Can not update user');
			else
				callback(null,result);
		});
	}
}

//--------------------------------
// Get list recommend location
// Param userid: current user
// Param callback: funtion callback
//--------------------------------
exports.getRecommendLocation = function(userid,callback){
	locationDB.find({"isrecommend":"true"}).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get list location by distance
// Param distance: distance to location
// Param callback: funtion callback
//--------------------------------
exports.getLocationByDistance = function(idistance, lon, lat, callback){
	var distance 	= parseFloat(idistance/1000);
	var limit  		= 99;
	var skip		= 0;
	locationDB.find({coordinate: {$within: {$center:[[parseFloat(lon),parseFloat(lat)],distance]}}})
					.limit(limit)
					.skip(skip)
					.toArray(function(err, results) {
						if(results){
							callback(null, results);
						} else {
							callback(err,null);
						}
					});
}

//--------------------------------
// Get list location with country, city
// Param userid: current user
// Param country: country of location
// Param city: city of location
// Param callback: funtion callback
//--------------------------------
exports.getLocationByAddress = function(userid, country, city, callback){
	locationDB.find({"country":country,"city":city}).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get location info
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.getLocation = function(locationid, callback){
	locationDB.findOne({_id:new ObjectID(locationid)}, function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Add number comment for location
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.addLocationComment = function(locationid, callback){
	locationDB.update({_id:new ObjectID(locationid)}, {$inc:{'comment':1}}, function(err,result){
		if(err)
			callback(err,'Can not add comment');
		else
			callback(null,result);
	});
}

//--------------------------------
// Add number like for location
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.addLocationLike = function(locationid, callback){
	locationDB.update({_id:new ObjectID(locationid)}, {$inc:{'like':1}}, function(err,result){
		if(err)
			callback(err,'Can not add like');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update number comment for location
// Param locationid: id of location
// Param cmt: number comment
// Param callback: funtion callback
//--------------------------------
exports.updateLocationComment = function(locationid, cmt, callback){
	locationDB.update({ _id : new ObjectID(locationid) }, { $set : { comment : Number(cmt) } }, function(err,result){
		if(err)
			callback(err,'Can not update comment');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update number like for location
// Param nlike: number like
// Param callback: funtion callback
//--------------------------------
exports.updateLocationLike = function(locationid, nlike, callback){
	locationDB.update({ _id : new ObjectID(locationid) }, { $set : { like : Number(nlike) } }, function(err,result){
		if(err)
			callback(err,'Can not update like');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete location
// Param nlike: number like
// Param callback: funtion callback
//--------------------------------
exports.deleteLocation = function(locationid, callback){
	locationDB.remove({ _id : new ObjectID(locationid) }, function(err,result){
		if(err)
			callback(err,'Can not delete location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Update number like and comment for location
// Param nlike: number like
// Param ncomment: number comment
// Param callback: funtion callback
//--------------------------------
exports.updateLocationLikeComment = function(locationid, nlike, ncomment, callback){
	locationDB.update({ _id : locationid }, 
					  { $set : { like : Number(nlike), comment : Number(ncomment) } }, function(err,result){
		if(err)
			callback(err,'Can not update');
		else
			callback(null,result);
	});
}


//--------------------------------
// Add user checkin
// Param userid: user checkin
// Param callback: funtion callback
//--------------------------------
exports.checkinLocation = function(userid, locationid, callback){
	locationDB.update( { _id : new ObjectID(locationid) },{ $push: { checkin : userid } }, function(err,resultUpdate){
		if(err){
			callback(err,'Can not add user checkin');
		} else {
			locationDB.findOne({_id:new ObjectID(locationid)}, function(err,resultFind){
				if(err) {
					callback(err,'Can not get location');
				} else {
					accountDB.update( { 'userid' : userid }, { $set : { lastcheckinid : resultFind._id,
																		lastcheckinname : resultFind.namelocation } }, function(err,result){
						if(err)
							callback(err,'Can not update user');
						else
							callback(null,result);
					});
				}
			});
		}
	});
}

//--------------------------------
// Get checkin location
// Param userid: user checkin
// Param callback: funtion callback
//--------------------------------
exports.getCheckinLocation = function(userid,page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	locationDB.find( { checkin: userid } ).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

//--------------------------------
// Get list  location
// Param userid: current user
// Param callback: funtion callback
//--------------------------------
exports.getListLocation = function(page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	locationDB.find({}).sort([['_id','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list location');
		else
			callback(null,result);
	});
}

//--------------------------------
// Delete  location
// Param locationid: id of location
// Param callback: funtion callback
//--------------------------------
exports.deleteLocation = function(locationid, callback){
	locationDB.remove( { _id : new ObjectID(locationid) }, function(err,result){
		if(err)
			callback(err,'Can not delete user');
		else
			callback(null,result);
	});
}