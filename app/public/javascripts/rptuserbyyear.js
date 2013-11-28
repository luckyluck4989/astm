$(document).ready(function() {
	// Set init value
	var dat = new Date();
	$("#from").val(dat.getFullYear());
	$("#to").val(dat.getFullYear());
	$("#from").focus();
	$("#btnExport").css('display','none');

	//-----------------------------------
	// Focus out from input
	//-----------------------------------
	$("#from").blur(function(){
		if(checkDate($("#from").val()) == false){
			$("#from").focus();
		} else if (Number($("#from").val()) > Number($("#to").val())){
			alert('[From] value must lesser [To] value');
			$("#from").focus();
		}
	});

	//-----------------------------------
	// Event when key down in from input
	//-----------------------------------
	$("#from").keydown(function(e){
		if(e.keyCode == 13){
			if(checkDate($("#from").val()) == false){
				$("#from").focus();
			} else if (Number($("#from").val()) > Number($("#to").val())){
				alert('[From] value must lesser [To] value');
				$("#from").focus();
			} else
				$("#to").focus();
		}
	});

	//-----------------------------------
	// Focus out to input
	//-----------------------------------
	$("#to").blur(function(){
		if(checkDate($("#to").val()) == false){
			$("#to").focus();
		} else if (Number($("#from").val()) > Number($("#to").val())){
			alert('[To] value must greater [From] value');
			$("#to").focus();
		}
	});

	//-----------------------------------
	// Event when key down in from input
	//-----------------------------------
	$("#to").keydown(function(e){
		if(e.keyCode == 13){
			if(checkDate($("#to").val()) == false){
				$("#to").focus();
			} else if (Number($("#from").val()) > Number($("#to").val())){
				alert('[To] value must greater [From] value');
				$("#to").focus();
			} else
				$("#btnSearch").click();
		}
	});

	//-----------------------------------
	// Check Valid Input Date Time
	//-----------------------------------
	function checkDate(input){
		var value = input;
		if(value.length != 4){
			alert('Value Not Valid');
			return false;
		} else if(isNaN(Number(value.substr(0,4))) == true || Number(value.substr(0,4)) <= 2000){
			alert('Value Not Valid');
			return false;
		} else
			return true;
	}

	//-----------------------------------
	// Draw Chart
	//-----------------------------------
	function drawVisualization(result) {
		// Create array from json
		var arrData 	= [];
		var arrHeader 	= ['x', 'Number Used'];
		var from 		= Number($("#from").val());
		var to 			= Number($("#to").val());

		// Add Header
		arrData.push(arrHeader);

		// Add Detail
		var arrItem;
		for(var i=from; i<=to; i++){
			var ia = 0;
			for(ia=0; ia < result.length; ia++){
				if(from == result[ia]._id){
					arrItem = [result[ia]._id.toString(), result[ia].count];
					break;
				}
			}

			if(ia == result.length && from != result[ia - 1]._id)
				arrItem = [from.toString(), 0];
			from++;
			arrData.push(arrItem);
		}

		// Create and populate the data table.
		var data = google.visualization.arrayToDataTable(arrData);

		// Create and draw the visualization.
		new google.visualization.ColumnChart(document.getElementById('visualization')).
		draw(data, 
			{curveType: "function",
				width: 1028, height: 500,
				vAxis: {maxValue: 10}
			}
		);
	}

	//google.setOnLoadCallback(drawVisualization);

	//-----------------------------------
	// Event Click Button Search
	//-----------------------------------
	$("#btnSearch").click(function(){
		var input = {"from" : $("#from").val(), "to" : $("#to").val()};
		$.ajax({
			url: '/rptuserbyyearsearch',
			type: 'POST',
			data: input,
			success: function(data){
				if(data.result[0]){
					drawVisualization(data.result);
					$("#btnExport").css('display','inline-block');
				} else {
					$('#visualization svg').remove();
					$("#btnExport").css('display','none');
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});

	function getImgData(chartContainer) {
		var chartArea = chartContainer.getElementsByTagName('svg')[0].parentNode;
		var svg = chartArea.innerHTML;
		var doc = chartContainer.ownerDocument;
		var canvas = doc.createElement('canvas');
		canvas.setAttribute('width', chartArea.offsetWidth);
		canvas.setAttribute('height', chartArea.offsetHeight);

		canvas.setAttribute(
			'style',
			'position: absolute; ' +
			'top: ' + (-chartArea.offsetHeight * 2) + 'px;' +
			'left: ' + (-chartArea.offsetWidth * 2) + 'px;');
		doc.body.appendChild(canvas);
		canvg(canvas, svg);
		var imgData = canvas.toDataURL('image/JPEG');
		canvas.parentNode.removeChild(canvas);
		return imgData;
	}
	//-----------------------------------
	// Event Click Button Export
	//-----------------------------------
	$("#btnExport").click(function(){
		exportData();
	});

	function exportData(){
		var imgData = getImgData(document.getElementById('visualization'));

		// Replacing the mime-type will force the browser to trigger a download
		// rather than displaying the image in the browser window.
		//window.location = imgData.replace('image/png', 'image/octet-stream');
		var doc = new jsPDF('landscape');
		doc.setFontSize(22);
		doc.text(20, 20, 'Report Used By Year [' + $("#from").val() + ' - '+ $("#to").val() + ']');
		doc.addImage(imgData, 'JPEG', 15, 40, 280, 150);

		// Output as Data URI
		//doc.output('datauri');
		doc.save('YearlyReport[' + $("#from").val() + ' - '+ $("#to").val() + '].pdf');
	}
});