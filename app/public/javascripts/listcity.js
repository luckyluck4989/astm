//-------------------------------
// Initalize function
//-------------------------------
$(document).ready(function() {
	//-------------------------------
	// Event click on each item name city
	//-------------------------------
	$(".cityid").click(function(){
		var city = $(this).closest('tr').find("#cityid").text();

		// Call ajax to get location
		var input = {"cityid" : city};
		$.ajax({
			url: '/setcity',
			type: 'POST',
			data: input,
			success: function(data){
				if(data){
					window.location.href = '/city';
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});

	//-------------------------------
	// Event click on each delete icon item
	//-------------------------------
	$(".delcity").click(function(){
		var city = $(this).closest('tr').find("#cityid").text();

		// Call ajax to get location
		var input = {"cityid" : city};
		$.ajax({
			url: '/delcity',
			type: 'POST',
			data: input,
			success: function(data){
				if(data){
					window.location.href = '/listcity';
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});
});