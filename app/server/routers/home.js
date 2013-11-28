var accountModel = require('../modules/account')
var locationModel = require('../modules/location')
var imageModel = require('../modules/image')
var userHistoryModel = require('../modules/userhistory')
var geogModel = require('../modules/geog')
var logModel = require('../modules/logcollect')
var crypto = require('crypto')

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
	//------------------------------------------------------------------
	// ADMIN
	//------------------------------------------------------------------
	app.get('/',function(req,res){
		res.render('block/admin', { title: 'Admin Page' });
	});

	app.get('/admin',function(req,res){
		res.render('block/admin', { title: 'Admin Page' });
	});

	//------------------------------------------------------------------
	// Get list location page = 1
	// Return: render location page
	//------------------------------------------------------------------
	app.get('/listlocation',function(req,res){
		if(req.session.user != null){
			var page = 1;
			var offset = 10;
			locationModel.getListLocation(page, offset, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.render('block/listlocation', { title: 'List Location', path : req.path, resultJson : jsonResult });
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get list location by page
	// Return: list location
	//------------------------------------------------------------------
	app.post('/listlocation',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var page = input.page;
			var offset = 10;
			locationModel.getListLocation(page, offset, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult, 200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Render view login
	// Return: render view login
	//------------------------------------------------------------------
	app.get('/loginad',function(req,res){
		if(req.session.user != null){
			res.redirect('/listlocation');
		} else {
			// path : use for show view is login or home page
			res.render('block/loginad', { title: 'List Location', path: req.path });
		}
	});

	//------------------------------------------------------------------
	// Signin admin
	// Return: json user and set req session
	//------------------------------------------------------------------
	app.post('/signin',function(req,res){
		var input = req.body;
		//var userid = input.txtUserName;
		var userid = 'admin';
		var password = crypto.createHash('md5').update(input.txtPassword).digest("hex");
		accountModel.checkLogin(userid, password, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null);
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				req.session.user = objects;
				var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, objects);
				res.json(jsonResult, 200);
			} else {
				var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, MSG_LOGINFAIL, null);
				res.json(jsonResult, 200);
			}
		});
	});

	//------------------------------------------------------------------
	// Set location to session
	// Return: list location
	//------------------------------------------------------------------
	app.post('/admlocation',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			req.session.locationid = input.locationid;
			res.json(req.session.user, 200);
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get location in admin
	// Return: list location
	//------------------------------------------------------------------
	app.get('/location',function(req,res){
		if(req.session.user != null){
			if(req.session.locationid != null){
				res.render('block/location', { title: 'Admin Page', path: req.path, locationid : req.session.locationid });
			} else {
				res.render('block/location', { title: 'Admin Page', path: req.path, locationid : null });
			}
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Set location to session
	// Return: list location
	//------------------------------------------------------------------
	app.post('/getadmlocation',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var locationid = input.locationid;
			locationModel.getLocation(locationid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
					res.json(jsonResult, 400);
					return;
				} else {
					req.session.locationid = null;
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
					res.json(jsonResult, 200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Get list country and city
	// Return: JSON list country
	//--------------------------------
	app.post('/getlistcc',function(req,res){
		if(req.session.user != null){
			geogModel.getListCountry(function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetListCountry', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					geogModel.getListCity(function (err, retJsonCity) {
						if (err) {
							var jsonResult = createJsonResult('GetListCountry', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
							res.json(jsonResult, 400);
							return;
						} else {
							var jsonResult = createJsonResult('GetListCountry', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
							jsonResult.resultcity = retJsonCity;
							res.json(jsonResult,200);
						}
					});
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Report User By Month
	// Return: Draw view user by month
	//--------------------------------
	app.get('/rptuserbymonth',function(req,res){
		if(req.session.user != null){
			res.render('block/rptuserbymonth', { title: 'Admin Page', path: req.path});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Report User By Month
	// Return: Draw view user by month
	//--------------------------------
	app.post('/rptuserbymonthsearch',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var from = input.from;
			var to = input.to;
			//var from = 201301;
			//var to = 201312;
			logModel.reportUserLoginByMonth(from, to, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Report User Month', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Report User Month', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult, 200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Report User By Month
	// Return: Draw view user by month
	//--------------------------------
	app.get('/rptuserbyyear',function(req,res){
		if(req.session.user != null){
			res.render('block/rptuserbyyear', { title: 'Admin Page', path: req.path});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Report User By Year
	// Return: Draw view user by month
	//--------------------------------
	app.post('/rptuserbyyearsearch',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var from = input.from;
			var to = input.to;
			//var from = 201301;
			//var to = 201312;
			logModel.reportUserLoginByYear(from, to, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Report User Year', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Report User Year', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult, 200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Report User By City
	// Return: Draw view user by month
	//--------------------------------
	app.get('/rptuserbycity',function(req,res){
		if(req.session.user != null){
			res.render('block/rptuserbycity', { title: 'Admin Page', path: req.path});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Report User By City
	// Return: Draw view user by month
	//--------------------------------
	app.post('/rptuserbycitysearch',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var from = input.from;
			var to = input.to;
			//var from = 201301;
			//var to = 201312;
			logModel.reportUserLoginByCity(from, to, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Report User Year', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Report User Year', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Report User By City
	// Return: Draw view user by month
	//--------------------------------
	app.get('/changepass',function(req,res){
		if(req.session.user != null){
			res.render('block/changepass', { title: 'Admin Page', path: req.path});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Report User By City
	// Return: Draw view user by month
	//--------------------------------
	app.get('/signout',function(req,res){
		req.session.user = null;
		res.redirect('/loginad');
	});

	//--------------------------------
	// Change pass
	// Return: Draw view user by month
	//--------------------------------
	app.post('/chgpass',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var pass = input.newpass;
			accountModel.updatePassWord(req.session.user.userid, pass, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Change Pass', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Change Pass', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Get list country
	// Return: Draw view user by month
	//--------------------------------
	app.get('/listcountry',function(req,res){
		if(req.session.user != null){
			geogModel.getListCountry(function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.render('block/listcountry', { title: 'List Country', path : req.path, resultJson : jsonResult });
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Set country
	// Return: country
	//------------------------------------------------------------------
	app.post('/setcountry',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			req.session.country = input.countryid;
			res.json(req.session.country, 200);
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get country in admin
	// Return: country
	//------------------------------------------------------------------
	app.get('/country',function(req,res){
		if(req.session.user != null){
			if(req.session.country != null){
				geogModel.getCountry(req.session.country, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
						req.session.country = null;
						res.render('block/country', { title: 'Admin Page', path: req.path, resultJson : jsonResult });
					}
				});
			} else {
				res.render('block/country', { title: 'Admin Page', path: req.path, resultJson : null });
			}
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Update Country
	// Return: Update country
	//--------------------------------
	app.post('/addcountry',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var country = input.country;
			var countryid = input.countryid;
			var countryname = input.countryname;
			geogModel.updateCountry(country, countryid, countryname, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Update Country', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Update Country', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Delete Country
	// Return: Delete country
	//--------------------------------
	app.post('/delcountry',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var country = input.countryid;
			geogModel.deleteCountry(country, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Delete Country', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Delete Country', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Get list city
	// Return: Draw view user by month
	//--------------------------------
	app.get('/listcity',function(req,res){
		if(req.session.user != null){
			geogModel.getListCity(function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.render('block/listcity', { title: 'List City', path : req.path, resultJson : jsonResult });
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Set city
	// Return: city
	//------------------------------------------------------------------
	app.post('/setcity',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			req.session.city = input.cityid;
			res.json(req.session.city, 200);
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// Get city in admin
	// Return: city
	//------------------------------------------------------------------
	app.get('/city',function(req,res){
		if(req.session.user != null){
			if(req.session.city != null){
				geogModel.getCity(req.session.city, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
						req.session.city = null;
						res.render('block/city', { title: 'Admin Page', path: req.path, resultJson : jsonResult });
					}
				});
			} else {
				res.render('block/city', { title: 'Admin Page', path: req.path, resultJson : null });
			}
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Update City
	// Return: Update city
	//--------------------------------
	app.post('/addcity',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var city = input.city;
			var cityid = input.cityid;
			var cityname = input.cityname;
			var country = input.country;
			geogModel.updateCity(city, cityid, cityname, country, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Update City', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Update City', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Delete City
	// Return: Delete city
	//--------------------------------
	app.post('/delcity',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var city = input.cityid;
			geogModel.deleteCity(city, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Delete City', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Delete City', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//--------------------------------
	// Delete Location
	// Return: Delete Location
	//--------------------------------
	app.post('/dellocation',function(req,res){
		if(req.session.user != null){
			var input = req.body;
			var locationid = input.locationid;
			locationModel.deleteLocation(locationid, function (err, retJson) {
				if (err) {
					var jsonResult = createJsonResult('Delete Location', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null);
					res.json(jsonResult, 400);
					return;
				} else {
					var jsonResult = createJsonResult('Delete Location', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson);
					res.json(jsonResult,200);
				}
			});
		} else {
			res.redirect('/loginad');
		}
	});

	//------------------------------------------------------------------
	// API
	// Add location event
	// Return: When upload image Then Return list Image Name
	//------------------------------------------------------------------
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
				accountModel.insertToken(userid,token, function (err, objectsToken) {
					if (err) {
						var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null);
						res.json(jsonResult, 400);
						return;
					} else {
						logModel.insertLog(userid, function (err, objectsLog) {
							if(err){
								var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null);
								res.json(jsonResult, 400);
								return;
							} else {
								var jsonResult = createJsonResult('Login', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, objectsToken);
								res.json(jsonResult, 200);
							}
						});
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
						logModel.insertLogLocation(objects.userid,
												   locationid,
												   retJson.namelocation,
												   retJson.city,
												   retJson.country,
												   'get', function (err, retLog) {
							var jsonResult = createJsonResult('GetLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
							res.json(jsonResult,200);
						});
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
						locationModel.getLocation(locationid, function (err, retLocation) {
							if (err) {
								var jsonResult = createJsonResult('UpdateLocationLikeComment', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
								res.json(jsonResult, 400);
								return;
							} else {
								logModel.insertLogLocation(objects.userid,
														   locationid,
														   retLocation.namelocation,
														   retLocation.city,
														   retLocation.country,
														   'like', function (err, retLog) {
									var jsonResult = createJsonResult('UpdateLocationLikeComment', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
									res.json(jsonResult,200);
								});
							}
						});
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

	//--------------------------------
	// Get Favourite Image
	// Return: JSON location info
	//--------------------------------
	app.get('/getfavouriteimage',function(req,res){
		var token = req.param('token');
		var page = req.param('page');
		var offset = req.param('offset');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetFavouriteImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.getFavouriteImage(objects.userid, page, offset, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetFavouriteImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetFavouriteImage', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetFavouriteImage', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Check in location
	// Return: JSON image info
	//--------------------------------
	app.post('/checkinlocation',function(req,res){
		var input	  = req.body;
		var token	  = input.token;
		var locationid = input.locationid;

		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('CheckinLocation', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.checkinLocation(
					objects.userid,
					locationid, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('CheckinLocation', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						locationModel.getLocation(locationid, function (err, retLocation) {
							if (err) {
								var jsonResult = createJsonResult('CheckinLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
								res.json(jsonResult, 400);
								return;
							} else {
								logModel.insertLogLocation(objects.userid,
														   locationid,
														   retLocation.namelocation,
														   retLocation.city,
														   retLocation.country,
														   'checkin', function (err, retLog) {
									var jsonResult = createJsonResult('CheckinLocation', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
									res.json(jsonResult,200);
								});
							}
						});
					}
				});
			} else {
				var jsonResult = createJsonResult('CheckinLocation', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get CheckinLocation
	// Return: JSON location info
	//--------------------------------
	app.get('/getcheckinlocation',function(req,res){
		var token = req.param('token');
		var page = req.param('page');
		var offset = req.param('offset');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetCheckinLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				locationModel.getCheckinLocation(objects.userid, page, offset, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetCheckinLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetCheckinLocation', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetCheckinLocation', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Add point
	// Return: JSON image info
	//--------------------------------
	app.post('/addpoint',function(req,res){
		var input		= req.body;
		var token		= input.token;
		var objectid	= input.objectid;
		var objecttype	= input.objecttype;
		var pointtype	= input.pointtype;

		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('AddPoint', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				userHistoryModel.addPoint(
					objects.userid,
					objectid,
					objecttype,
					pointtype, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('AddPoint', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('AddPoint', METHOD_POS, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('AddPoint', METHOD_POS, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get History
	// Return: JSON location info
	//--------------------------------
	app.get('/getpointhistory',function(req,res){
		var token = req.param('token');
		var page = req.param('page');
		var offset = req.param('offset');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetPointHistory', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				userHistoryModel.getPointHistory(objects.userid, page, offset, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetPointHistory', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetPointHistory', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetPointHistory', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get Image Best Like
	// Return: JSON location info
	//--------------------------------
	app.get('/getimagelikest',function(req,res){
		var token = req.param('token');
		var page = req.param('page');
		var offset = req.param('offset');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetImageLikest', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.getImageLikest(page, offset, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetImageLikest', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetImageLikest', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetImageLikest', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get Image Newest
	// Return: JSON location info
	//--------------------------------
	app.get('/getimagenewest',function(req,res){
		var token = req.param('token');
		var page = req.param('page');
		var offset = req.param('offset');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetImageNewest', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.getImageNewest(page, offset, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetImageNewest', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetImageNewest', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetImageNewest', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});

	//--------------------------------
	// Get Image Random
	// Return: JSON location info
	//--------------------------------
	app.get('/getimagerandom',function(req,res){
		var token = req.param('token');
		var page = req.param('page');
		var offset = req.param('offset');
		accountModel.checkToken(token, function (err, objects) {
			if (err) {
				var jsonResult = createJsonResult('GetImageRandom', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
				res.json(jsonResult, 400);
				return;
			} else if(objects != null && objects.userid != undefined ){
				imageModel.getImageRandom(page, offset, function (err, retJson) {
					if (err) {
						var jsonResult = createJsonResult('GetImageRandom', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, err, null)
						res.json(jsonResult, 400);
						return;
					} else {
						var jsonResult = createJsonResult('GetImageRandom', METHOD_GET, STATUS_SUCESS, SYSTEM_SUC, null, retJson)
						res.json(jsonResult,200);
					}
				});
			} else {
				var jsonResult = createJsonResult('GetImageRandom', METHOD_GET, STATUS_FAIL, SYSTEM_ERR, MSG_INVALID_TOKEN, null)
				res.json(jsonResult, 400);
			}
		});
	});
};