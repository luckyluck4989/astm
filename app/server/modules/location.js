var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var locationDB = cnMongoDB.location;
var https = require('https'); //Https module of Node.js
var FormData = require('form-data'); //Pretty multipart form maker.
var ACCESS_TOKEN = "CAAICtp62IZBgBAIZAtT14faF6niwKWrXL9geaZCq4JGUMeXvPbe7AvryLkSVZCfiRoNRbgk6zsUX2oBsmeldZA1FRaQS7S3aFV4Ax3t6TSqlhXA7xY4Wannzo9Ldt5VP2NYctCWuZCbx5r5cvGlZCwz5VxBZAx4X8sP2E0sJ9AaMZBbyIgtsuDiidxcRVrZCbp4E4ZD";

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
	//-----------------------------------------
	// Define item insert to database
	//-----------------------------------------
	var itemEntry = {	namelocation: 'Jack1',
						country: 'vn',
						city: 'hochiminh-quan2',
						isrecommend: '',
						description: '',
						imagelist: [],
						imagethumb: '',
						coordinate: [],
						like: 0,
						comment: 0,
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
	if (itemEntry._id) {
		itemEntry._id = new ObjectID(itemEntry._id);
	}

	//-----------------------------------------
	// Post to facebook
	//-----------------------------------------
	var form = new FormData(); //Create multipart form
	form.append('file', fs.createReadStream('./app/public/upload/'+ itemEntry.imagethumb)); //Put file
	form.append('message', itemEntry.description); //Put message
	 
	//POST request options, notice 'path' has access_token parameter
	var options = {
		method: 'post',
		host: 'graph.facebook.com',
		path: '/me/photos?access_token=' + ACCESS_TOKEN,
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