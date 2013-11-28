$(document).ready(function() {
	$("#country").focus();

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

				// Set data
				if($("#countrytmp").val() != ''){
					$('#country').val($("#countrytmp").val());
				}
			}
		}
	});

	// Update password
	$("#btnSave").click(function(e){
		if($("#city").val() == ''){
			alert('Please input city !');
			$("#city").focus();
			e.preventDefault();
			return false;
		} else if($("#cityname").val() == ''){
			alert('Please input city name !');
			$("#cityname").focus();
			e.preventDefault();
			return false;
		} else {
			$('#addCityForm').ajaxForm({
				beforeSubmit : function(formData, jqForm, options){
				},
				success	: function(responseText, status, xhr, $form){
					if(responseText.result ==  null){
						alert("City code already exists, please choose another code !");
						$("#city").focus();
					} else {
						window.location.href = '/listcity';
					}
				},
				error : function(e){
					alert(e.responseText);
				}
			});
		}
	});

	// Cancel button click
	$("#btnCancel").click(function(e){
		window.location.href = '/listcity';
	});
});