var accountModel = require('../modules/account')
var locationModel = require('../modules/location')
var imageModel = require('../modules/image')
var geogModel = require('../modules/geog')

module.exports = function(app,nodeuuid){
	app.get('/home',function(req,res){
		//accountModel.findAllAccount(function(err,result){
		//	res.send(result,200);
		//});
		res.render('block/location', { title: 'Admin Page' });
	});

	app.get('/admin',function(req,res){
		res.render('block/admin', { title: 'Admin Page' });
	});
	
	app.get('/index',function(req,res){
		var param1 = req.query.param1;
		var param2 = req.query.param2;
		console.log('param1:' + param1);
		console.log('param2:' + param2);
	});

	app.post('/upload',function(req,res){
		var param1 = req.param('param1');
		var param2 = req.param('param2');
		console.log('param1:' + param1);
		console.log('param2:' + param2);
	});

	//--------------------------------
	// Add location event
	// Return: When upload image Then Return list Image Name
	//--------------------------------
	app.post('/addloca',function(req,res){
		//--------------------------------
		// Define parameter
		//--------------------------------
		var arr = [];
		var input = req.body;

		//--------------------------------
		// Case: Upload image
		//--------------------------------
		if(input.typeSubmit == 'uploadImage'){
			if (!input.namelocation) {
				res.json("content must be specified when saving a new article", 400);
				return;
			}

			// Upload multi images
			if(req.files.photos[0].path == undefined){
				for(var i=0; i < req.files.photos[0].length; i++){
					// Call function upload images
					locationModel.addImage(input, req.files.photos[0][i], function (err, objects) {
						if (err) {
							res.json(error, 400);
							return;
						} else {
							arr.push(objects);
						}
					});
				}
			// Upload only one images
			} else {
				locationModel.addImage(input, req.files.photos[0], function (err, objects) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						arr.push(objects);
					}
				});
			}
			res.json(arr,200);

		//--------------------------------
		// Case: Entry data
		//--------------------------------
		} else {
			locationModel.addLocation(input, function (err, objects) {
				if (err) {
					res.json(error, 400);
					return;
				}
			});

			res.json("Success",200);
		}
	});

	//--------------------------------
	// Check Login
	// Return: Return token
	//--------------------------------
	app.post('/login',function(req,res){
		var input = req.body;
		var userid = input.txtUserName;
		var password = input.txtPassword;
		accountModel.checkLogin(userid,password, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				var token = nodeuuid.v4();
				accountModel.insertToken(userid,token, function (err, objects) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						res.json(objects,200);
					}
				});
			} else {
				res.json('Invalid login information', 400);
			}
		});
	});

	//--------------------------------
	// Logout
	// Return: Return status
	//--------------------------------
	app.get('/logout',function(req,res){
		var token = req.param('token');
		accountModel.logOut(token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else {
				res.json(objects,200);
			}
		});
	});

	//--------------------------------
	// Register
	// Return: JSON user info
	//--------------------------------
	app.post('/register',function(req,res){
		var input = req.body;
		var userid = input.txtUserName;
		var password = input.txtPassword;
		var email = input.txtEmail;
		accountModel.addUser(userid,password,email, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else {
				res.json(objects,200);
			}
		});
	});

	//--------------------------------
	// Logout
	// Return: JSON user info
	//--------------------------------
	app.get('/getuserinfo',function(req,res){
		var token = req.param('token');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				accountModel.getUserInfo(objects.userid, function (err, objects) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						res.json(objects,200);
					}
				});
			} else {
				res.json('Invalid token', 400);
			}
		});
	});

	//--------------------------------
	// Logout
	// Return: JSON list location
	//--------------------------------
	app.get('/getrecommendlocation',function(req,res){
		var token = req.param('token');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.getRecommendLocation(objects.userid, function (err, retJson) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						res.json(retJson,200);
					}
				});
			} else {
				res.json('Invalid token', 400);
			}
		});
	});

	//--------------------------------
	// Logout
	// Return: JSON list location
	//--------------------------------
	app.get('/getlocationbyaddress',function(req,res){
		var token = req.param('token');
		var country = req.param('country');
		var city = req.param('city');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.getLocationByAddress(objects.userid, country, city, function (err, retJson) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						res.json(retJson,200);
					}
				});
			} else {
				res.json('Invalid token', 400);
			}
		});
	});

	//--------------------------------
	// Get Location
	// Return: JSON location info
	//--------------------------------
	app.get('/getlocation',function(req,res){
		var token = req.param('token');
		var locationid = req.param('locationid');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.getLocation(locationid, function (err, retJson) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						res.json(retJson,200);
					}
				});
			} else {
				res.json('Invalid token', 400);
			}
		});
	});

	//--------------------------------
	// Get list image by userid
	// Return: JSON image info
	//--------------------------------
	app.get('/getprivateimage',function(req,res){
		var token = req.param('token');
		var page = req.param('page');
		var offset = req.param('offset');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.getPrivateImage(objects.userid,page,offset, function (err, retJson) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						res.json(retJson,200);
					}
				});
			} else {
				res.json('Invalid token', 400);
			}
		});
	});

	//--------------------------------
	// Get image by imageid
	// Return: JSON image info
	//--------------------------------
	app.get('/getimage',function(req,res){
		var token = req.param('token');
		var imageid = req.param('imageid');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.getImage(imageid, function (err, retJson) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						res.json(retJson,200);
					}
				});
			} else {
				res.json('Invalid token', 400);
			}
		});
	});

	//--------------------------------
	// Upload image
	// Return: JSON image info
	//--------------------------------
	app.post('/uploadimage',function(req,res){
		var input = req.body;
		var token = input.token;
		var faceid = input.faceid;
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.addImage(objects.userid, faceid, req.files.photos, function (err, objects) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						res.json(objects,200);
					}
				});
			} else {
				res.json('Invalid token', 400);
			}
		});
	});

	//--------------------------------
	// Get list country
	// Return: JSON list country
	//--------------------------------
	app.get('/getlistcountry',function(req,res){
		var token = req.param('token');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				geogModel.getListCountry(function (err, retJson) {
					if (err) {
						res.json(error, 400);
						return;
					} else {
						res.json(retJson,200);
					}
				});
			} else {
				res.json('Invalid token', 400);
			}
		});
	});
};