var cnMongoDB = require('../mongodb/connection');
var accountDB = cnMongoDB.account;
var systemDB  = cnMongoDB.systemstatus;

// Check user & password when login
exports.checkLogin = function(userid,password,callback){
	accountDB.findOne({$and:[{"userid":userid,"password":password}]},function(err,result){
		if(err)
			callback(null,'Can not login');
		else
			callback(null,result);
	});
}

// Create token
exports.insertToken = function(userid,token,callback){
	var iDate = new Date();
	systemDB.insert({"token":token,"userid":userid,"lastedit":iDate},function(err,result){
		if(err)
			callback(null,'Can not login');
		else
			callback(null,result);
	});
}

// Logout
exports.logOut = function(token,callback){
	systemDB.remove({"token":token},function(err,result){
		if(err)
			callback(null,'Can not logout');
		else
			callback(null,result);
	});
}

// Logout
exports.checkToken = function(token,callback){
	systemDB.findOne({"token":token},function(err,result){
		if(err)
			callback(null,'Can not logout');
		else
			callback(null,result);
	});
}

// Get user info
exports.getUserInfo = function(userid,callback){
	accountDB.findOne({"userid":userid},function(err,result){
		if(err)
			callback(null,'Can not get user info');
		else
			callback(null,result);
	});
}

// Add user
exports.addUser = function(userid,password,email,callback){
	// account{name,userid,password,email,country,favour_food,favour_location,notes,registerdate}
	var iDate = new Date();
	accountDB.insert({"name":"",
					"userid":userid,
					"password":password,
					"email":email,
					"country":"Viet Nam",
					"favour_food":"",
					"favour_location":"",
					"notes":"",
					registerdate:iDate
					},function(err,result){
		if(err)
			callback(null,'Can not register user');
		else
			callback(null,result);
	});
}