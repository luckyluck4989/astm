var curPage = 0;
//-------------------------------
// Initalize function
//-------------------------------
$(document).ready(function() {
	$('#pagingid  li.active').removeClass('active')
	$($('#pagingid  li')[1]).addClass('active')

	$.ajax({
		url: '/listlocation',
		type: 'POST',
		data: {"page" : 1},
		success: function(data){
			$("#locationtbl tbody tr").remove();
			if(data.result[0]){
				drawData(data.result);
			}

			splitPage(data.result2);
		},
		error: function(jqXHR){
			console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
		}
	});

	//-------------------------------
	// Update Recommend Event
	//-------------------------------
	$("#updaterec").click(function(){
		var arrLocationID = [];
		$("#locationtbl tbody tr").each(function(e){
			if($(this).find(".chblocation").attr("checked") == "checked"){
				arrLocationID.push($(this).find("#rowID").text());
			}
		});
		if(arrLocationID.length == 0){
			alert("Please choose at least one location to set become recommend !");
		} else {
		var input = {"listlocationid" : arrLocationID };
			$.ajax({
				url: '/updaterecommend',
				type: 'POST',
				data: input,
				success: function(data){
					if(data){
						window.location.href = '/listlocation';
					}
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}
	});

	//-------------------------------
	// Check Box All Event
	//-------------------------------
	$("#chbAll").click(function(item){
		if($(this).attr("checked") == "checked"){
			$(this).removeAttr("checked");
			$("#locationtbl tbody tr .chblocation").each(function(e){
				$(this).removeAttr("checked");
			});
		} else {
			$(this).attr("checked","checked");
			$("#locationtbl tbody tr .chblocation").each(function(e){
				$(this).attr("checked","checked");
			});
		}
	});
});

//-------------------------------
// Draw data to table
//-------------------------------
function drawData(dataJson){
	var tmpRow = '';
	for(var i = 0; i< dataJson.length; i++){
		// create row html
		if( i%2 != 0 )
			tmpRow = '	<tr >';
		else
			tmpRow = '	<tr class="table-flag-blue">';
		tmpRow += '			<td><input type="checkbox" class="chblocation"></td>'
		tmpRow += '			<td><a href="#" class="locaid">' + dataJson[i].namelocation + '</a></td>'
		tmpRow += '			<td>' + dataJson[i].country + '</td><td>' + dataJson[i].city + '</td>'
		if(dataJson[i].isrecommend == 'true')
			tmpRow += '		<td><span class="label label-success">Recommend</span></td>'
		else
			tmpRow += '		<td></td>'
		tmpRow += '			<td><span class="label label-success">' + dataJson[i].like + '</span></td>'
		tmpRow += '			<td id="rowID" style="display:none;">' + dataJson[i]._id + '</td>';
		tmpRow += '			<td class="visible-md visible-lg">'
		tmpRow += '				<div class="btn-group">'
		tmpRow += '					<a title="" href="#" data-original-title="Edit" class="btn btn-sm show-tooltip locaid">'
		tmpRow += '					<i class="icon-edit"></i></a>'
		tmpRow += '					<a title="" href="#" data-original-title="Delete" class="btn btn-sm btn-danger show-tooltip dellocaid">'
		tmpRow += '					<i class="icon-trash"></i></a>'
		tmpRow += '				</div>'
		tmpRow += '			</td>'
		tmpRow += '		</tr>';

		$("#locationtbl tbody").append(tmpRow);
	}

	//-------------------------------
	// Event click on each item name location
	//-------------------------------
	$(".locaid").click(function(){
		var locationid = $(this).closest('tr').find("#rowID").html();

		// Call ajax to get location
		var input = {"locationid" : locationid};
		$.ajax({
			url: '/admlocation',
			type: 'POST',
			data: input,
			success: function(data){
				if(data){
					window.location.href = '/location';
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});

	//-------------------------------
	// Event click delete on each item name location
	//-------------------------------
	$(".dellocaid").click(function(){
		var locationid = $(this).closest('tr').find("#rowID").html();

		// Call ajax to get location
		var input = {"locationid" : locationid};
		$.ajax({
			url: '/dellocation',
			type: 'POST',
			data: input,
			success: function(data){
				if(data){
					window.location.href = '/listlocation';
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});

	//-------------------------------
	// Check Box Event
	//-------------------------------
	$(".chblocation").click(function(item){
		if($(this).attr("checked") == "checked")
			$(this).removeAttr("checked");
		else
			$(this).attr("checked","checked");
	});
}

//-------------------------------
// Split Page
//-------------------------------
function splitPage(total){
	var idActive = $('#pagingid .active a').attr("id") == undefined ? Number("1") : Number($('#pagingid .active a').attr("id"));
	$("#pagingid li").remove();
	if(total > 0 ){
		// calculate page
		var ipage = Math.floor(total/10);
		var mod = total%10;
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
			url: '/listlocation',
			type: 'POST',
			data: input,
			success: function(data){
				$("#locationtbl tbody tr").remove();
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