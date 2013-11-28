$(document).ready(function() {
	// Update password
	$("#btnSave").click(function(e){
		if($("#newpass").val() != $("#confirmpass").val()){
			alert('Please type again password confirm');
			$("#confirmpass").focus();
			e.preventDefault();
			return false;
		} else {
			$('#chgpassForm').ajaxForm({
				beforeSubmit : function(formData, jqForm, options){
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
});