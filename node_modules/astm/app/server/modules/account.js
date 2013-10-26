var cnMongoDB = require('../mongodb/connection');
var accountDB = cnMongoDB.account;

exports.checkLogin = function(userid,password,callback){
	accountDB.findOne({$and:[{"userid":userid,"password":password}]},function(err,result){
		if(err)
			callback(null,'Can not login');
		else
			callback(null,result);
	});
}