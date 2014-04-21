$(document).ready(function() {
	$('#pagingid  li.active').removeClass('active')
	$($('#pagingid  li')[1]).addClass('active')

	$.ajax({
		url: '/image',
		type: 'POST',
		data: {"page" : 1},
		success: function(data){
			$("#listimage li").remove();
			if(data.result[0]){
				drawData(data.result);
			}

			splitPage(data.result2);
		},
		error: function(jqXHR){
			console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
		}
	});

	// Event click remove image
	$(document).on('click', '.iim-remove', function(e) {
		var value = $(this).parents('.item-img-mana').find('img').attr('data-index');
		var idActive = Number($('#pagingid .active a').attr("id"));
		$.ajax({
			url: '/delimage',
			type: 'POST',
			data: {"page" : idActive, "imageid" : value},
			success: function(data){
				$("#listimage li").remove();
				if(data.result[0]){
					drawData(data.result);
				}

				splitPage(data.result2);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	});
});

//-------------------------------
// Draw data to table
//-------------------------------
function drawData(dataJson){
	var tmpRow = '';
	for(var i = 0; i< dataJson.length; i++){
		// create row html
		tmpRow = '<li class="item-img-mana">'
		tmpRow += '<img data-index="' + dataJson[i].image + '" src="' + dataJson[i].imagesrc[0].source + '">';
		tmpRow += '<div class="iim-remove">x</div>';
		tmpRow += '</li>';

		$("#listimage").append(tmpRow);
	}

	$( ".item-img-mana" ).hover(
		function() {
			$(this).find('.iim-remove').css("display","block");
		}, function() {
			$(this).find('.iim-remove').css("display","none");
		}
	);
}

//-------------------------------
// Split Page
//-------------------------------
function splitPage(total){
	var idActive = $('#pagingid .active a').attr("id") == undefined ? Number("1") : Number($('#pagingid .active a').attr("id"));
	$("#pagingid li").remove();
	if(total > 0 ){
		// calculate page
		var ipage = Math.floor(total/40);
		var mod = total%40;
		if(mod > 0){
			ipage += 1;
		}

		// draw paging number
		if(ipage > 1){
			$("#pagingid").append('<li> <a href="#" id="prev"> ← </a> </li>');
			$("#pagingid").append('<li> <a href="#" id="first"> First </a> </li>');

			if(idActive - 2 > 0){
				$("#pagingid").append('<li> <a href="#" id="' + (idActive - 2) + '"> ' + (idActive - 2) + ' </a> </li>');
				$("#pagingid").append('<li> <a href="#" id="' + (idActive - 1) + '"> ' + (idActive - 1) + ' </a> </li>');
			} else if(idActive - 1 > 0){
				$("#pagingid").append('<li> <a href="#" id="' + (idActive - 1) + '"> ' + (idActive - 1) + ' </a> </li>');
			}

			$("#pagingid").append('<li> <a href="#" class="active" id="' + idActive + '"> ' + idActive + ' </a> </li>');

			if(idActive + 2 <= ipage){
				$("#pagingid").append('<li> <a href="#" id="' + (idActive + 1) + '"> ' + (idActive + 1) + ' </a> </li>');
				$("#pagingid").append('<li> <a href="#" id="' + (idActive + 2) + '"> ' + (idActive + 2) + ' </a> </li>');
			} else if(idActive + 1 <= ipage){
				$("#pagingid").append('<li> <a href="#" id="' + (idActive + 1) + '"> ' + (idActive + 1) + ' </a> </li>');
			}

			$("#pagingid").append('<li> <a href="#" id="' + ipage + '"> Last </a> </li>');
			$("#pagingid").append('<li> <a href="#" id="next"> → </a> </li>');
			$($('#pagingid  li')[idActive + 1]).addClass('active')
		}
	}

	//-------------------------------
	// Event click paging list location
	//-------------------------------
	$("#pagingid li a").click(function(){
		// Calculate page
		var idActive = Number($('#pagingid .active a').attr("id"));
		if(this.id == "prev")
			idActive -= 1;
		else if(this.id == "next")
			idActive += 1;
		else if(this.id == "next")
			idActive = 1;
		else
			idActive = Number(this.id);

		// Set active 
		$('#pagingid  li.active').removeClass('active')
		$($('#pagingid  li')[idActive + 1]).addClass('active')

		// Call ajax to get data by page
		curPage = idActive;
		var input = {"page" : idActive};
		$.ajax({
			url: '/image',
			type: 'POST',
			data: input,
			success: function(data){
				$("#listimage li").remove();
				if(data.result[0]){
					drawData(data.result);
				}

				splitPage(data.result2);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});
}