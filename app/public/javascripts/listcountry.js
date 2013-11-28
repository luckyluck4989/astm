//-------------------------------
// Initalize function
//-------------------------------
$(document).ready(function() {
	//-------------------------------
	// Event click on each item name country
	//-------------------------------
	$(".countryid").click(function(){
		var country = $(this).closest('tr').find("#countryid").text();

		// Call ajax to get location
		var input = {"countryid" : country};
		$.ajax({
			url: '/setcountry',
			type: 'POST',
			data: input,
			success: function(data){
				if(data){
					window.location.href = '/country';
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
	$(".delcountry").click(function(){
		var country = $(this).closest('tr').find("#countryid").text();

		// Call ajax to get location
		var input = {"countryid" : country};
		$.ajax({
			url: '/delcountry',
			type: 'POST',
			data: input,
			success: function(data){
				if(data){
					window.location.href = '/listcountry';
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});
});