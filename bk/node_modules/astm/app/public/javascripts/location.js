$(document).ready(function() {
	var map;
	var arrImage = [];
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

	var myOptions = {
		zoom: 12,
		center: new google.maps.LatLng(-33, 151),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"),
		myOptions);
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
	} else {
		$("#map").text("Your browser is out of fashion, there\'s no geolocation!");
	}

	var input = /** @type {HTMLInputElement} */(document.getElementById('searchTextField'));
	var autocomplete = new google.maps.places.Autocomplete(input);
	//var type = [];

	//autocomplete.setTypes(types);
	autocomplete.bindTo('bounds', map);

	var infowindow = new google.maps.InfoWindow();
	var marker = new google.maps.Marker({
	map: map
	});

	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		infowindow.close();
		marker.setVisible(false);
		input.className = '';
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
					arrCoordinate.push(autocomplete.getPlace().geometry.location.mb);
					arrCoordinate.push(autocomplete.getPlace().geometry.location.lb);
					formData.push({name:"coordinate",value:arrCoordinate});
				},
				success	: function(responseText, status, xhr, $form){
					alert(responseText);
					//if(status=='success'){
					//	review.showImageUpload(responseText);
					//}
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
						//var html = '<div>'+img+'</div>';
						$('#listImage').append(img);
					}
					if(response.length > 0)arrImage = response
				}, 
				error:function(e){
					A.hide();
					B.show();
					alert(e.responseText);
				}
			}).submit();
		}
	});

});
//window.onload= loadMap;