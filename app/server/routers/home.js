var accountModel = require('../modules/account')
var locationModel = require('../modules/location')
var imageModel = require('../modules/image')
var geogModel = require('../modules/geog')

//--------------------------------
// Define Variable
//--------------------------------
var SYSTEM_ERR = 'ERROR';
var SYSTEM_SUC = 'SUCESS';
var STATUS_SUCESS = 200;
var STATUS_FAIL = 400;
var METHOD_POS = 'POS';
var METHOD_GET = 'GET';

//--------------------------------
// Define Message
//--------------------------------
var MSG_LOGINFAIL = 'Username or password is not correctly';
var MSG_INVALID_TOKEN = 'Your token is invalid';

//--------------------------------
// SAMPLE RESULT JSON
// param func: function name excute
// mthod: method excute [POST/GET]
// stt: result status of function
// msg: message status
// err: error detail of result excute function
// res: result of function
// Return: json result
//--------------------------------
function createJsonResult(func,mthod,stt,msg,err,res){
	var jsonResult = {	func_cd: func,
						method: mthod,
						status: stt,
						message: msg,
						error: err,
						result: res,
					};
	return jsonResult;
}

module.exports = function(app, nodeuuid){
	app.get('/',function(req,res){
		res.render('block/admin', { title: 'Admin Page' });
	});

	app.get('/home',function(req,res){
		res.render('block/location', { title: 'Admin Page' });
	});

	app.get('/admin',function(req,res){
		res.render('block/admin', { title: 'Admin Page' });
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
							res.json(err, 400);
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
						res.json(err, 400);
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
					res.json(err, 400);
					return;
				} else {
					res.json("Success",200);
				}
			});
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
		accountModel.checkLogin(userid, password, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				var token = nodeuuid.v4();
				accountModel.insertToken(userid,token, function (err, objects) {
					if (err) {
						var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null);
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, objects);
						res.json(jsonResult, 200);
					}
				});
			} else {
				var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, MSG_LOGINFAIL, null);
				res.json(jsonResult, 200);
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
				var jsonResult = createJsonResult('Logout', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
				res.json(jsonResult, 400);
				return;
			} else {
				var jsonResult = createJsonResult('Logout', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, objects);
				res.json(jsonResult,200);
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
				var jsonResult = createJsonResult('Register', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null);
				res.json(jsonResult, 400);
				return;
			} else {
				var jsonResult = createJsonResult('Register', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, objects);
				res.json(jsonResult,200);
			}
		});
	});

	//--------------------------------
	// Get User Info
	// Return: JSON user info
	//--------------------------------
	app.get('/getuserinfo',function(req,res){
		var token = req.param('token');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetUserInfo', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				accountModel.getUserInfo(objects.userid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetUserInfo', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetUserInfo', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetUserInfo', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get recommend location
	// Return: JSON list location
	//--------------------------------
	app.get('/getrecommendlocation',function(req,res){
		var token = req.param('token');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetRecommendLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.getRecommendLocation(objects.userid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetRecommendLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetRecommendLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetRecommendLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get location by address
	// Return: JSON list location
	//--------------------------------
	app.get('/getlocationbyaddress',function(req,res){
		var token = req.param('token');
		var country = req.param('country');
		var city = req.param('city');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetLocationByAddress', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.getLocationByAddress(objects.userid, country, city, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetLocationByAddress', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetLocationByAddress', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetLocationByAddress', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get recommend location
	// Return: JSON list location
	//--------------------------------
	app.get('/getlocationbydistance',function(req,res){
		var token = req.param('token');
		var distance = req.param('distance');
		var lon = req.param('lon');
		var lat = req.param('lat');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetLocationByDistance', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.getLocationByDistance(distance, lon, lat, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetLocationByDistance', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetLocationByDistance', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetLocationByDistance', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
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
				var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.getLocation(locationid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
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
				var jsonResult = createJsonResult('GetPrivateImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.getPrivateImage(objects.userid,page,offset, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetPrivateImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetPrivateImage', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetPrivateImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
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
				var jsonResult = createJsonResult('GetImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.getImage(imageid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetImage', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Upload image
	// Return: JSON image
	//--------------------------------
	app.post('/uploadimage',function(req,res){
		var input = req.body;
		var token = input.token;
		var imageid = input.imageid;
		var title = input.title;
		var desc = input.description;
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('UploadImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.addFaceImage(objects.userid, imageid, desc, title, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('UploadImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('UploadImage', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('UploadImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 200);
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
				var jsonResult = createJsonResult('GetListCountry', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				geogModel.getListCountry(function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetListCountry', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetListCountry', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetListCountry', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get list city
	// Return: JSON list country
	//--------------------------------
	app.get('/getlistcity',function(req,res){
		var token = req.param('token');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetListCity', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				geogModel.getListCity(function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetListCity', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetListCity', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetListCity', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get list image what's hot
	// Return: JSON list image
	//--------------------------------
	app.get('/getwhatshotimage',function(req,res){
		var token = req.param('token');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetWhatsHotImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.getWhatsHotImage(function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetWhatsHotImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetWhatsHotImage', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetWhatsHotImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Add like for image
	// Return: JSON image info
	//--------------------------------
	app.get('/addimagelike',function(req,res){
		var token = req.param('token');
		var imageid = req.param('imageid');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('AddImageLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.addImageLike(imageid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('AddImageLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('AddImageLike', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('AddImageLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Add comment for image
	// Return: JSON image info
	//--------------------------------
	app.get('/addimagecomment',function(req,res){
		var token = req.param('token');
		var imageid = req.param('imageid');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('AddImageComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.addImageComment(imageid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('AddImageComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('AddImageComment', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('AddImageComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Add comment for location
	// Return: JSON location info
	//--------------------------------
	app.get('/addlocationcomment',function(req,res){
		var token = req.param('token');
		var locationid = req.param('locationid');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('AddLocationComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.addLocationComment(locationid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('AddLocationComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('AddLocationComment', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('AddLocationComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Add like for location
	// Return: JSON location info
	//--------------------------------
	app.get('/addlocationlike',function(req,res){
		var token = req.param('token');
		var locationid = req.param('locationid');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('AddLocationLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.addLocationLike(locationid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('AddLocationLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('AddLocationLike', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('AddLocationLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Add user favour image
	// Return: JSON image info
	//--------------------------------
	app.get('/adduserfavaour',function(req,res){
		var token = req.param('token');
		var imageid = req.param('imageid');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('AddUserFavaour', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.addUserFavaour(objects.userid, imageid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('AddUserFavaour', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('AddUserFavaour', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('AddUserFavaour', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Update comment for location
	// Return: JSON location info
	//--------------------------------
	app.get('/updatelocationcomment',function(req,res){
		var token = req.param('token');
		var locationid = req.param('locationid');
		var cmt = req.param('comment');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('UpdateLocationComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.updateLocationComment(locationid, cmt, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('UpdateLocationComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('UpdateLocationComment', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('UpdateLocationComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Update like for location
	// Return: JSON location info
	//--------------------------------
	app.get('/updatelocationlike',function(req,res){
		var token = req.param('token');
		var locationid = req.param('locationid');
		var like = req.param('like');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('UpdateLocationLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.updateLocationLike(locationid, like, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('UpdateLocationLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('UpdateLocationLike', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('UpdateLocationLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Update like for image
	// Return: JSON image info
	//--------------------------------
	app.get('/updateimagelike',function(req,res){
		var token = req.param('token');
		var imageid = req.param('imageid');
		var like = req.param('like');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('UpdateImageLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.updateImageLike(imageid, like, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('UpdateImageLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('UpdateImageLike', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('UpdateImageLike', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Update comment for image
	// Return: JSON image info
	//--------------------------------
	app.get('/updateimagecomment',function(req,res){
		var token = req.param('token');
		var imageid = req.param('imageid');
		var cmt = req.param('comment');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('UpdateImageComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.updateImageComment(imageid, cmt, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('UpdateImageComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('UpdateImageComment', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('AddImageComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Delete image
	// Return: JSON image info
	//--------------------------------
	app.get('/deleteimage',function(req,res){
		var token = req.param('token');
		var imageid = req.param('imageid');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('DeleteImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.deleteImage(imageid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('DeleteImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('DeleteImage', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('DeleteImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Delete location
	// Return: JSON location info
	//--------------------------------
	app.get('/deletelocation',function(req,res){
		var token = req.param('token');
		var locationid = req.param('locationid');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('DeleteLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.deleteLocation(locationid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('DeleteLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('DeleteLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('DeleteLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Update comment and like for location
	// Return: JSON location info
	//--------------------------------
	app.post('/updatelocationlikecomment',function(req,res){
		var input = req.body;
		var token = input.token;
		var locationid = input.locationid;
		var nlike = input.like;
		var ncomment = input.comment;
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('UpdateLocationLikeComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.updateLocationLikeComment(locationid, nlike, ncomment, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('UpdateLocationLikeComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('UpdateLocationLikeComment', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('UpdateLocationLikeComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Update comment and like for image
	// Return: JSON image info
	//--------------------------------
	app.post('/updateimagelikecomment',function(req,res){
		var input = req.body;
		var token = input.token;
		var imageid = input.imageid;
		var nlike = input.like;
		var ncomment = input.comment;
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('UpdateImageLikeComment', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.updateImageLikeComment(imageid, nlike, ncomment, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('UpdateImageLikeComment', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('UpdateImageLikeComment', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('UpdateImageLikeComment', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Update user info
	// Return: JSON image info
	//--------------------------------
	app.post('/updateuserinfo',function(req,res){
		var input	  = req.body;
		var token	  = input.token;
		var iname	  = input.txtUserName;
		var ipass	  = input.txtPassword;
		var iemail	  = input.txtEmail;
		var icountry  = input.txtCountry;
		var ifood	  = input.txtFavoriteFood;
		var ilocation = input.txtFavoriteLocation;
		var inotes	  = input.txtNote;

		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('UpdateUserInfo', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				accountModel.updateUserInfo(
					objects.userid,
					iname,
					ipass,
					iemail,
					icountry,
					ifood,
					ilocation,
					inotes, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('UpdateUserInfo', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('UpdateUserInfo', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('UpdateUserInfo', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});
};