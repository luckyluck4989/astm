var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var locationDB = cnMongoDB.location;
var https = require('https'); //Https module of Node.js
var FormData = require('form-data'); //Pretty multipart form maker.
var oauth = require('oauth');
var ACCESS_TOKEN = "CAACEdEose0cBAAdAQuH6ReIxA4dHGWgcer9m1cWUrDjrjtZBmtZArA5vSo2jjCYkZA2m3zd8g4D3i2S7ZCjPd495gwlwTZAsOeXcpxSRVRtIvGupT3KvPl4WuBZCzovLKe2KxjYIeFp0890hdgnVnoRtyZBhkciqIspWYtibb47ePUVqmKDgUmWkA9KCaWKucwZD";

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
	itemEntry.coordinate = input.coordinate.split(",");
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
		path: '/me/photos?access_token='+ACCESS_TOKEN,
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
			callback(null,'Can not get list location');
		else
			callback(null,result);
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
			callback(null,'Can not get list location');
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
			callback(null,'Can not get list location');
		else
			callback(null,result);
	});
}

exports.picturesOpFacebookOAuthIdGET = function(req, res) {
	//logger.info("GET /pictures/op/facebookOAuth/" + req.params.pictureId);

	var client_id	 = "234435456715656";
	var client_secret = "d2d0e0d101cb07f0b70ed2175cc066c0";

	oa = new oauth.OAuth2(client_id, client_secret, "https://graph.facebook.com");
	/*
	res.redirect(oa.getAuthorizeUrl(
		{
			scope		  : "publish_stream", // Gets permission for posting to the users timeline
			response_type : "code",
			redirect_uri  : "http://localhost:3000/pictures/op/facebookUpload/" + req.params.pictureId
		}
	));
	*/
	oa.getOAuthAccessToken(
	'',
	{'grant_type':'client_credentials'},
	function (e, access_token, refresh_token, results){
		console.log('bearer: ',access_token);
	});
};