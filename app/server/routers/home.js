var accountModel = require('../modules/account')
var locationModel = require('../modules/location')

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
		var token = nodeuuid.v4();
		console.log('userid:' + userid);
		console.log('password:' + password);
		accountModel.checkLogin(userid,password,token, function (err, objects) {
			if (err) {
				res.json(error, 400);
				return;
			}
		});
	});
};