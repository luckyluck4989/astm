$(document).ready(function(){
	$("#btnLogin").click(function(e){
		$('#loginForm').ajaxForm({
			beforeSubmit : function(formData, jqForm, options){
			},
			success	: function(responseText, status, xhr, $form){
				if(responseText.status == 200){
					$('#invalidUserName').css('display','none');
					$('#invalidUserName').css('display','none');
					window.location.href = '/listlocation';
				} else {
					$('#invalidUserName').css('display','');
					$('#invalidPassword').css('display','');
					$('#invalidUserName').focus();
				}
			},
			error : function(e){
				alert(e.responseText);
			}
		});
	});
});