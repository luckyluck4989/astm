//-------------------------------
// Initalize function
//-------------------------------
$(document).ready(function() {
	$('#pagingid  li.active').removeClass('active')
	$($('#pagingid  li')[1]).addClass('active')

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
		else
			idActive = Number(this.id);

		// Set active 
		$('#pagingid  li.active').removeClass('active')
		$($('#pagingid  li')[idActive]).addClass('active')

		// Call ajax to get data by page
		var input = {"page" : idActive};
		$.ajax({
			url: '/listlocation',
			type: 'POST',
			data: input,
			success: function(data){
				if(data.result[0]){
					drawData(data.result);
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});
});

//-------------------------------
// Draw data to table
//-------------------------------
function drawData(dataJson){
	$("#locationtbl tbody tr").remove();
	var tmpRow = '';
	for(var i = 0; i< dataJson.length; i++){
		// create row html
		if( i%2 != 0 )
			tmpRow = '	<tr >';
		else
			tmpRow = '	<tr class="table-flag-blue">';
		tmpRow += '			<td><input type="checkbox"></td>'
		tmpRow += '			<td><a href="#">' + dataJson[i].namelocation + '</a></td>'
		tmpRow += '			<td>' + dataJson[i].country + '</td><td>' + dataJson[i].city + '</td>'
		if(dataJson[i].isrecommend == 'true')
			tmpRow += '		<td><span class="label label-success">Recommend</span></td>'
		else
			tmpRow += '		<td></td>'
		tmpRow += '			<td><span class="label label-success">' + dataJson[i].like + '</span></td>'
		tmpRow += '			<td style="display:none;">' + dataJson[i]._id + '</td>';
		tmpRow += '			<td class="visible-md visible-lg">'
		tmpRow += '				<div class="btn-group">'
		tmpRow += '					<a title="" href="#" data-original-title="Edit" class="btn btn-sm show-tooltip">'
		tmpRow += '					<i class="icon-edit"></i></a>'
		tmpRow += '					<a title="" href="#" data-original-title="Delete" class="btn btn-sm btn-danger show-tooltip">'
		tmpRow += '					<i class="icon-trash"></i></a>'
		tmpRow += '				</div>'
		tmpRow += '			</td>'
		tmpRow += '		</tr>';

		$("#locationtbl tbody").append(tmpRow);
	}
}