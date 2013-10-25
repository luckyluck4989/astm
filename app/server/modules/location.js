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

	/*
	if(input.typeSubmit = '1'){
		if(image[0].path == undefined){
			for(var i=0; i < image[0].length; i++){
				// get the temporary location of the file
				tmp_path = image[0][i].path;

				// set where the file should actually exists - in this case it is in the "images" directory
				imgName = new ObjectID() + image[0][i].name.substr(image[0][i].name.indexOf('.'),image[0][i].name.length);
				target_path =  './app/public/upload/' + imgName;

				// move the file from the temporary location to the intended location
				is = fs.createReadStream(tmp_path);
				os = fs.createWriteStream(target_path);
				is.pipe(os);
				is.on('end',function() {
					fs.unlinkSync(tmp_path,function(err){
					});
				});
			}
		} else {
			// get the temporary location of the file
			tmp_path = image[0].path;

			// set where the file should actually exists - in this case it is in the "images" directory
			imgName = new ObjectID() + image[0].name.substr(image[0].name.indexOf('.'),image[0].name.length);
			target_path =  './app/public/upload/' + imgName;

			// move the file from the temporary location to the intended location
			is = fs.createReadStream(tmp_path);
			os = fs.createWriteStream(target_path);
			is.pipe(os);
			is.on('end',function() {
				fs.unlinkSync(tmp_path,function(err){
				});
			});
		}
	} else {
		if (input._id) {
			input._id = new ObjectID(input._id);
		}

		// get the temporary location of the file
		tmp_path = image[0].path;

		// set where the file should actually exists - in this case it is in the "images" directory
		imgName = new ObjectID() + image[0].name.substr(image[0].name.indexOf('.'),image[0].name.length);
		target_path =  './app/public/upload/' + imgName;

		// move the file from the temporary location to the intended location
		is = fs.createReadStream(tmp_path);
		os = fs.createWriteStream(target_path);
		is.pipe(os);
		console.log("yyy");
		is.on('end',function() {
			fs.unlinkSync(tmp_path);
		});

		input.image = imgName;
		locationDB.save(input, {safe: true}, callback);
	}
	*/
}

//--------------------------------
// Function Add Location
// Param input: List input from screen
// Param callback: funtion callback
//--------------------------------
exports.addLocation = function(input, callback){
	// Define item insert to database
	var itemEntry = { 	namelocation: 'Jack1',
						city: 'hanoi',
						district: 'hochiminh-quan2',
						isrecommend: '',
						description: '',
						imagelist: [],
						imagethumb: '',
						coordinate: []
					};
	itemEntry.namelocation = input.namelocation;
	itemEntry.city = input.city;
	itemEntry.district = input.district;
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