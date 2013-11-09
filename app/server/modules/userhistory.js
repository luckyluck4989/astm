var cnMongoDB 		= require('../mongodb/connection'),
					  ObjectID = cnMongoDB.ObjectID;
var userHistoryDB	= cnMongoDB.userhistory;
var accountDB		= cnMongoDB.account;
var locationDB		= cnMongoDB.location;
var paramSettingDB 	= cnMongoDB.paramsetting;
var imageDB 		= cnMongoDB.image;

//--------------------------------
// Add Point
// Param objectid
// Param objecttype : 0-location, 1-image
// Param pointtype:
// - 0: like
// - 1: comment
// - 2: add user favorite
// - 3: checkin
// Param callback: funtion callback
//--------------------------------
exports.addPoint = function(iuserid, iobjectid, iobjecttype, ipointtype, callback){
	// Get param setting
	paramSettingDB.findOne({},function(err, resultParam){
		if(err){
			callback(err,'Can not get setting');
		} else {
			// Get user information
			accountDB.findOne({ "userid" : iuserid }, function(err, resultAccount){
				if(err){
					callback(err,null);
				} else {
					//-------------------------------------
					// PARAM DEFINE
					// pointimage_like: 1,
					// pointimage_comment: 2,
					// pointimage_addfavour: 3,
					// pointimage_checkin: 4,
					// pointloca_like: 5,
					// pointloca_comment: 6,
					// pointloca_addfavour: 7,
					// pointloca_checkin: 8
					//-------------------------------------
					var ipoint = 0;
					switch(Number(ipointtype)){
						case 0: ipoint = Number(iobjecttype) == 0 ? resultParam.pointloca_like : resultParam.pointimage_like;
							break;
						case 1: ipoint = Number(iobjecttype) == 0 ? resultParam.pointloca_comment : resultParam.pointimage_comment;
							break;
						case 2: ipoint = Number(iobjecttype) == 0 ? resultParam.pointloca_addfavour : resultParam.pointimage_addfavour;
							break;
						case 3: ipoint = Number(iobjecttype) == 0 ? resultParam.pointloca_checkin : resultParam.pointimage_checkin;
							break;
						default:
							break;
					}

					// Caculate point
					ipoint = ipoint + resultAccount.point;

					// Update point for user
					accountDB.update( { 'userid' : iuserid }, { $set : { point : ipoint } }, function(err,resultAccountUpdate){
						if(err){
							callback(err,null);
						} else {
							if(Number(iobjecttype) == 0){
								locationDB.findOne({_id:new ObjectID(iobjectid)}, function(err,resultLocation){
									if(err){
										callback(err,null);
									} else {
										var iDate = new Date();
										userHistoryDB.insert({
															"userid": iuserid,
															"objecttype": iobjecttype,
															"pointtype": ipointtype,
															"object": resultLocation,
															"addatetime": iDate
														},function(err,result){
											if(err)
												callback(err,'Can not upload image');
											else
												callback(null,result);
										});
									}
								});
							} else {
								imageDB.findOne({"image":iobjectid}, function(err,resultImage){
									if(err){
										callback(err,null);
									} else {
										var iDate = new Date();
										userHistoryDB.insert({
															"userid": iuserid,
															"objecttype": iobjecttype,
															"pointtype": ipointtype,
															"object": resultImage,
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
						}
					});
				}
			});
		}
	});
}

//--------------------------------
// Get history
// Param userid: user checkin
// Param callback: funtion callback
//--------------------------------
exports.getPointHistory = function(userid,page,offset,callback){
	var iSkip = (page - 1)* offset;
	var iOffset = page * offset;
	userHistoryDB.find( { userid : userid } ).skip(iSkip).limit(iOffset).toArray(function(err,result){
		if(err)
			callback(err,'Can not get list image');
		else
			callback(null,result);
	});
}