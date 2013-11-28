$(document).ready(function() {
	if($("#country").attr('readonly') == 'readonly')
		$("#countryname").focus();
	else
		$("#country").focus();

	// Update password
	$("#btnSave").click(function(e){
		if($("#country").val() == ''){
			alert('Please input country !');
			$("#country").focus();
			e.preventDefault();
			return false;
		} else if($("#countryname").val() == ''){
			alert('Please input country name !');
			$("#countryname").focus();
			e.preventDefault();
			return false;
		} else {
			$('#addCountryForm').ajaxForm({
				beforeSubmit : function(formData, jqForm, options){
				},
				success	: function(responseText, status, xhr, $form){
					if(responseText.result ==  null){
						alert("Country code already exists, please choose another code !");
						$("#country").focus();
					} else {
						window.location.href = '/listcountry';
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
		window.location.href = '/listcountry';
	});
});