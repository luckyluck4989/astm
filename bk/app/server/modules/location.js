var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var MongoDb = require("mongodb");
var locationDB = cnMongoDB.location;

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
	// Define item insert to database
	var itemEntry = { 	namelocation: 'Jack1',
						country: 'vn',
						city: 'hochiminh-quan2',
						isrecommend: '',
						description: '',
						imagelist: [],
						imagethumb: '',
						coordinate: []
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
	locationDB.save(itemEntry, {safe: true}, callback);
}

// Get user info
exports.getRecommendLocation = function(userid,callback){
	locationDB.find({"isrecommend":"true"}).toArray(function(err,result){
		if(err)
			callback(null,'Can not get list location');
		else
			callback(null,result);
	});
}