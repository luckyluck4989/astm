var cnMongoDB = require('../mongodb/connection'),
				ObjectID = cnMongoDB.ObjectID,
				fs = require("fs");
var imageDB = cnMongoDB.image;
var fql = require('fql');

// Get list image by userid
exports.getPrivateImage = function(userid,page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	imageDB.find({"userid":userid}).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

// Get image by imageid
exports.getImage = function(imageid,callback){
	imageDB.findOne({"image":imageid}, function(err,result){
		if(err)
			callback(err,'Can not get image');
		else
			callback(null,result);
	});
}

//--------------------------------
// Function Add Image
// Param input: List input from screen
// Param image: image need to be upload
// Param callback: funtion callback
//--------------------------------
exports.addImage = function(userid, faceid, image, callback){
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

	var iDate = new Date();
	imageDB.insert({
						"userid": userid,
						"image": imgName,
						"like": 0,
						"comment": 0,
						"faceid": faceid,
						"userfavour": [],
						"addatetime": iDate
					},function(err,result){
		if(err)
			callback(err,'Can not upload image');
		else
			callback(null,result);
	});
}

//--------------------------------
// Function Add Image Face
// Param input: List input from screen
// Param image: image need to be upload
// Param callback: funtion callback
//--------------------------------
exports.addFaceImage = function(userid, imageid, desc, title, callback){
	var query = "SELECT images, comment_info, like_info FROM photo WHERE object_id = '" + imageid + "'";
	fql({
		token: '565933323461608|TDMw4-yqsV1fqfdBntJD1hnRIaw'
	}).query(query, function(err, data) {
		if (err) {
			callback(err,null)
		} else {
			var imgLike = data[0].like_info.like_count != undefined ? data[0].like_info.like_count : 0;
			var imgCmt = data[0].comment_info.comment_count != undefined ? data[0].comment_info.comment_count : 0;
			var iDate = new Date();
			imageDB.insert({
								"userid": userid,
								"username": '',
								"image": imageid,
								"like": imgLike,
								"comment": imgCmt,
								"title": title,
								"description": desc,
								"imagesrc": data[0].images,
								"userfavour": [],
								"addatetime": iDate
							},function(err,result){
				if(err)
					callback(err,'Can not upload image');
				else
					callback(null,result);
			});
		}
	});
}

// Get list image whats hot
exports.getWhatsHotImage = function(callback){
	var iOffset = 30;
	imageDB.find({}).sort([['like','desc']]).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

// Add like image
exports.addImageLike = function(imageid, callback){
	imageDB.update({'image':imageid}, {$inc:{'like':1}}, function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

// Add comment
exports.addImageComment = function(imageid, callback){
	imageDB.update({'image':imageid}, {$inc:{'comment':1}}, function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

// Add like image
exports.updateImageLike = function(imageid, nlike, callback){
	imageDB.update( {'image' : imageid }, { $set : { 'like' : Number(nlike) } }, function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

// Add comment
exports.updateImageComment = function(imageid, cmt, callback){
	imageDB.update( { 'image' : imageid }, { $set : { 'comment' : Number(cmt) } }, function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

// Add user favour
exports.addUserFavaour = function(userid, imageid, callback){
	imageDB.update( { image : imageid },{ $push: { userfavour : userid } }, function(err,result){
		if(err)
			callback(err,'Can not add user');
		else
			callback(null,result);
	});
}

// Delete image
exports.deleteImage = function(imageid, callback){
	imageDB.remove( { image : imageid }, function(err,result){
		if(err)
			callback(err,'Can not delete image');
		else
			callback(null,result);
	});
}

// Update comment and like
exports.updateImageLikeComment = function(imageid, nlike, ncomment, callback){
	imageDB.update( { 'image' : imageid }, { $set : { like : Number(nlike), comment : Number(ncomment) } }, function(err,result){
		if(err)
			callback(err,'Can not update image');
		else
			callback(null,result);
	});
}

// Get list favourite image by userid
exports.getFavouriteImage = function(userid,page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	imageDB.find( { userfavour: userid } ).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

// Get list image likest
exports.getImageLikest = function(page, offset, callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	imageDB.find({}).sort([['like','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

// Get list image newest
exports.getImageNewest = function(page, offset, callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	imageDB.find({}).sort([['addatetime','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}

// Get list image newest
exports.getImageRandom = function(page, offset, callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	imageDB.find({}).sort([['image','desc']]).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}