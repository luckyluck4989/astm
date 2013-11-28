var cnMongoDB = require('../mongodb/connection');
var accountDB = cnMongoDB.account;
var systemDB  = cnMongoDB.systemstatus;
var crypto = require('crypto');

// Check user & password when login
exports.checkLogin = function(userid,password,callback){
	accountDB.findOne({$and:[{"userid":userid,"password":password}]},function(err,result){
		if(err)
			callback(err,'Can not login');
		else
			callback(null,result);
	});
}

// Create token
exports.insertToken = function(userid,token,callback){
	var iDate = new Date();
	systemDB.insert({"token":token,"userid":userid,"lastedit":iDate},function(err,resultSystem){
		if(err){
			callback(err,'Can not login');
		} else {
			accountDB.findOne({"userid":userid},function(err,resultAcc){
				if(err){
					callback(err,'Can not get user info');
				} else {
					resultSystem[0].point = resultAcc.point;
					callback(null,resultSystem);
				}
			});
		}
	});
}

// Logout
exports.logOut = function(token,callback){
	systemDB.remove({"token":token},function(err,result){
		if(err)
			callback(err,'Can not logout');
		else
			callback(null,result);
	});
}

// Logout
exports.checkToken = function(token,callback){
	systemDB.findOne({"token":token},function(err,result){
		if(err)
			callback(err,'Can not check token');
		else
			callback(null,result);
	});
}

// Get user info
exports.getUserInfo = function(userid,callback){
	accountDB.findOne({"userid":userid},function(err,result){
		if(err)
			callback(err,'Can not get user info');
		else
			callback(null,result);
	});
}

// Add user
exports.addUser = function(userid,password,email,callback){
	// account{name,userid,password,email,country,favour_food,favour_location,notes,registerdate}
	var pword = crypto.createHash('md5').update(password).digest("hex");
	var iDate = new Date();
	accountDB.insert({"name":"",
					"userid":userid,
					"password":pword,
					"email":email,
					"country":"Viet Nam",
					"favour_food":"",
					"favour_location":"",
					"point": 0,
					"notes":"",
					registerdate:iDate
					},function(err,result){
		if(err)
			callback(err,'Can not register user');
		else
			callback(null,result);
	});
}

// Update comment and like
exports.updatePassWord = function(userid,
								  ipass, callback){
	var pword = crypto.createHash('md5').update(ipass).digest("hex");
	accountDB.update( { 'userid' : userid }, { $set : { password : pword} }, function(err,result){
		if(err)
			callback(err,'Can not update user');
		else
			callback(null,result);
	});
}