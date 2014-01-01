// Define marker
var marker;
var map;
var arrImage = [];
var myOptions;
var input;
var autocomplete;
var infowindow;
var oldJson;
//-----------------------------------
// CREATE GOOGLE MAP
//-----------------------------------
function positionSuccess(position) {
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	var acr = position.coords.accuracy;
	map.setCenter(new google.maps.LatLng(lat,lng));
}

function positionError(error) {
	var errors = {
	1: "Authorization fails", // permission denied
	2: "Can\'t detect your location", //position unavailable
	3: "Connection timeout" // timeout
	};
	alert("Error");
}

function initialize() {
	myOptions = {
		zoom: 12,
		center: new google.maps.LatLng(-33, 151),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"), myOptions);

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
	} else {
		$("#map").text("Your browser is out of fashion, there\'s no geolocation!");
	}

	input = /** @type {HTMLInputElement} */(document.getElementById('searchTextField'));
	autocomplete = new google.maps.places.Autocomplete(input);
	autocomplete.bindTo('bounds', map);

	infowindow = new google.maps.InfoWindow();
	if($("#locationid").val() == ''){
		marker = new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng(-33, 151)
		});
	}

	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		infowindow.close();
		marker.setVisible(false);
		//input.className = '';
		var place = autocomplete.getPlace();
		if (!place.geometry) {
			// Inform the user that the place was not found and return.
			input.className = 'notfound';
			return;
		}

		// If the place has a geometry, then present it on a map.
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(17);	// Why 17? Because it looks good.
		}
		marker.setIcon(/** @type {google.maps.Icon} */({
			url: place.icon,
			size: new google.maps.Size(71, 71),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 34),
			scaledSize: new google.maps.Size(35, 35)
		}));
		marker.setPosition(place.geometry.location);
		marker.setVisible(true);

		var address = '';
		if (place.address_components) {
			address = [
			(place.address_components[0] && place.address_components[0].short_name || ''),
			(place.address_components[1] && place.address_components[1].short_name || ''),
			(place.address_components[2] && place.address_components[2].short_name || '')
			].join(' ');
		}

		infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
		infowindow.open(map, marker);
	});
}
$(document).ready(function() {
	initialize();
	// Call ajax to get country and city
	$.ajax({
		url: '/getlistcc',
		type: 'POST',
		data: '',
		success: function(data){
			if(data.result){
				$('#country')[0].options.length = 0;
				// Draw data country
				$.each(data.result, function (i, item) {
					$('#country').append($('<option>', { 
						value: item.country,
						text : item.countryName 
					}));
				});

				$('#city')[0].options.length = 0;
				// Draw data city
				$.each(data.resultcity, function (i, item) {
					$('#city').append($('<option>', { 
						value: item.country + '-' + item.city,
						text : item.cityName 
					}));
				});

				if($("#locationid").val() != ''){
					// Call ajax to get location
					var input = {"locationid" : $("#locationid").val()};
					$.ajax({
						url: '/getadmlocation',
						type: 'POST',
						data: input,
						success: function(data){
							if(data.result){
								// Draw data
								oldJson = data.result;
								$("#namelocation").val(data.result.namelocation);
								$("#country").val(data.result.country);
								$("#city").val(data.result.city);
								$("#description").val(data.result.description);
								$("#searchTextField").val(data.result.address);
								if(data.result.isrecommend == 'true' )
									$("#isrecommend").attr('checked',true);
								else
									$("#isrecommend").attr('checked',false);

								// Draw image
								for(var i =0; i< data.result.imagelist.length; i++){
									var img = '<img width="200px" height="auto" src="'+ data.result.imagelist[i] +'">';
									$('#listImage').append(img);
								}
								if(data.result.imagelist.length > 0)
									arrImage = data.result.imagelist;

								map.setCenter(new google.maps.LatLng(data.result.coordinate[0], data.result.coordinate[1]));
								map.setZoom(17);	// Why 17? Because it looks good.

								marker = new google.maps.Marker({
									map: map,
									position: new google.maps.LatLng(data.result.coordinate[0], data.result.coordinate[1])
								});

							}
						},
						error: function(jqXHR){
							console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
						}
					});
				} else {
					// reset location value
					$("#namelocation").focus();
					$("#namelocation").val('');
					$("#description").val('');
					$("#searchTextField").val('');
					$("#isrecommend").attr('checked',false);
				}
			}
		},
		error: function(jqXHR){
			console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
		}
	});

	// upload image review place
	$("#btnSave").click(function(e){
		if($("#listImage img").length == 0){
			e.preventDefault();
			return false;
		} else {
			$("#typeSubmit").val("entryInfo");
			$('#addLocaForm').ajaxForm({
				beforeSubmit : function(formData, jqForm, options){
					formData.push({name:"imagelist",value:arrImage});
					var arrCoordinate = [];
					if(oldJson == undefined || oldJson.address != $("#searchTextField").val())
					{
						arrCoordinate.push(autocomplete.getPlace().geometry.location.ob);
						arrCoordinate.push(autocomplete.getPlace().geometry.location.pb);
					} else {
						arrCoordinate = oldJson.coordinate;
					}
					formData.push({name:"coordinate",value:arrCoordinate});
				},
				success	: function(responseText, status, xhr, $form){
					window.location.href = '/listlocation';
				},
				error : function(e){
					alert(e.responseText);
				}
			});
		}
	});

	//
	$('#photoimg').change(function() {
		if($('#photoimg').get(0).files.length > 0){
			$("#typeSubmit").val("uploadImage");
			var A = $("#imageloadstatus");
			var B = $("#imageloadbutton");

			$("#addLocaForm").ajaxForm({
				beforeSubmit:function(formData, jqForm, options){
					A.show();
					B.hide();
				}, 
				success:function(response, status, xhr, $form){
					A.hide();
					B.show();
					for(var i =0; i< response.length; i++){
						var img = '<img src="/upload/'+ response[i] +'">';
						response[i] = document.location.origin + '/upload/' + response[i];
						$('#listImage').append(img);
					}
					if(response.length > 0)
						arrImage = response;
				}, 
				error:function(e){
					A.hide();
					B.show();
					alert(e.responseText);
				}
			}).submit();
		}
	});


	// Cancel button click
	$("#btnCancel").click(function(e){
		window.location.href = '/listlocation';
	});
});