
/*	==================================================================================== */
/*	JQUERY READY */

(function() {
		var init = function($)
		{

		/*	==================================================================================== */
		/*	STATUS MESSAGE FOR NO-JS */
		/*	We know that javascript is enabled and that we are not in IE 6-8
			so hide the error message and show outer-wrapper */
		$(".outer-wrapper").css({"display":"block"});
		$(".status-message").css({"display":"none"});

		/* Hides the table and shows the SVG if javascript is enabled */

		// $("h2:contains('####')").parent("section").parent("div").css({"display":"none"});
		// $("h2:contains('####') + table").css({"width":"630px"});
		// $(".outerwrapper p.timeline-standfirst").text(standfirst);
		// $(".outerwrapper span.timeline-heading").text(headline);
		// $(".outerwrapper").css({"display":"block"});

		/*	==================================================================================== */
		/*	GLOBAL VARIABLES FOR D3 */

		/*  Colours for the bars */
		var allBars = ["#1abc9c","#27ae60","#3498db","#5959b7","#EB6B4B"];

		/*	Margin, Width and height */
		var margin = {top: 15, right: 20, bottom: 20, left: 90};
		var width = 630  - margin.left - margin.right;
		var height = 350 - margin.top - margin.bottom;
		/*	Global variable to control the length of D3 transitons */
		var duration = 450;
		/*	Array to hold the data ajaxed form the table */
		var dataset = [];
		var sortArray = [];
		var checkArray = [];

		/*	Global variable to hold the cc or ac choice */
		var field = "TotalPaper";
		var headerString = "Total papers published";
		var axisString = "Papers published";

		/*	Global Array to hold all the data we currently want to display */
		var displayArray = [];

		/*	Arrays used to build the country and continent checkboxes */
		var continentArray = [];
		var uniqueContinentArray = ["All"];

		var totalBarArray = [];
		var addingBars = true;

		/* Load D3 */
		/* All of the D3/svg code is contained within the call back function */
		/* Loading D3 into ie6-8 seems to cause a runtime error */
		// $.getScript("http://d3js.org/d3.v3.min.js", function() {
		// $.getScript("/polopoly_static/js/d3.v3.min.js", function() {
		$.getScript("//www.nature.com/polopoly_static/js/d3.v3.min.js", function() {

			/* Create custom checkboxes */
			function setupLabel() {
				var checkBox = ".checkbox";
				var checkBoxInput = checkBox + " input[type='checkbox']";
				var radioInput = checkBox + " input[type='radio']";
				var checkBoxChecked = "checked";

				
				$(checkBox).each(function(){
					$(this).removeClass(checkBoxChecked);
				});
				$(checkBoxInput + ":checked").each(function(){
					$(this).parent(checkBox).addClass(checkBoxChecked);
				});
				$(radioInput + ":checked").each(function(){
					$(this).parent(checkBox).addClass(checkBoxChecked);
				});
				

			}


			/*	Create SVG element */
			var svg = d3.select(".count-chart")
					.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom);

			/* Add a group for each row of bars */
			var blocks = svg.append("g")
							.attr("transform", "translate(" + margin.left + ",0)");

			var blocksFemale = svg.append("g")
							.attr("transform", "translate(" + margin.left + ",0)");

			/* Add a group for each row of text */
			var groups = svg.append("g")
							.attr("class", "x axis")
							.attr("transform", "translate(" + margin.left + ",0)");

			/* Add the male female key */
			var key = svg.append("g")
							.attr("class","axis")
							.attr("transform", "translate(-57,-5)")
							.attr("opacity", 0);

			key.append("rect")
				.attr("x", width + margin.left -50)
				.attr("y", (height + margin.top + margin.bottom - 10) )
				.attr('width',"10")
				.attr("height", "10")
				.attr("opacity", 0.6)
				.attr("fill", "#34495e")
				.attr("stroke","none");

			key.append("text")
				.attr("x", width + margin.left -35)
				.attr("y", (height + margin.top + margin.bottom) )
				.style("text-anchor", "start")
				.text("Male");

			key.append("rect")
				.attr("x", width + margin.left)
				.attr("y", (height + margin.top + margin.bottom - 10) )
				.attr('width',"10")
				.attr("height", "10")
				.attr("fill", "#34495e")
				.attr("stroke","none");

			key.append("text")
				.attr("x", width + margin.left + 15)
				.attr("y", (height + margin.top + margin.bottom) )
				.style("text-anchor", "start")
				.text("Female");


			/*	Function to sort data.year200X by country name */
			function compareCountry(a,b) {
				if (a.country < b.country)
					return -1;
				if (a.country > b.country)
					return 1;
				return 0;
			}

			/* Add commas to numbers if needed */
			var thousandFormat = d3.format(',');

			/*	==================================================================================== */
			/*	AJAX CALL. LOAD IN JSON AND CALL DRAW */

			/*	We now want to load in the data from our html table */

			$.ajax({
				url: "//www.nature.com/news/gender-output-collaboration-and-citation-data-7.14179",
					dataType: 'text',
					success: function (data) {
						/*	Store each row of the table in a var */
						var tableRows = $(data).find("tbody tr");

						for (var i = 0; i < tableRows.length; i++) {
							var newObject = {};

							newObject.country = tableRows.eq(i).find("td").eq(0).text();
							newObject.countryCode = tableRows.eq(i).find("td").eq(1).text();
							newObject.continent = tableRows.eq(i).find("td").eq(2).text();
							newObject.TotalPaper = parseInt(tableRows.eq(i).find("td").eq(3).text(), 10);
							newObject.SingleF = parseFloat(tableRows.eq(i).find("td").eq(4).text());
							newObject.SingleM = parseFloat(tableRows.eq(i).find("td").eq(5).text());
							newObject.NatFirstF = parseFloat(tableRows.eq(i).find("td").eq(6).text());
							newObject.NatFirstM = parseFloat(tableRows.eq(i).find("td").eq(7).text());
							newObject.NatLastF = parseFloat(tableRows.eq(i).find("td").eq(8).text());
							newObject.NatLastM = parseFloat(tableRows.eq(i).find("td").eq(9).text());
							newObject.IntFirstF = parseFloat(tableRows.eq(i).find("td").eq(10).text());
							newObject.IntFirstM = parseFloat(tableRows.eq(i).find("td").eq(11).text());
							newObject.IntLastF = parseFloat(tableRows.eq(i).find("td").eq(12).text());
							newObject.IntLastM = parseFloat(tableRows.eq(i).find("td").eq(13).text());
							newObject.FMRatio = parseFloat(tableRows.eq(i).find("td").eq(14).text());

							dataset.push(newObject);
						}

						/* store this number to use to create a staggered transition */
						var numberOfBars = dataset.length;

						totalBarArray.push(numberOfBars);

						/*	Create an array containing each continent and the use $.each and $.inArray
							to remove all duplicates. The result will be stored in uniqueContinentArray */
						continentArray = dataset.map(function(d) { return d.continent; });

						$.each(continentArray, function(i, el){
							if($.inArray(el, uniqueContinentArray) === -1) {
								uniqueContinentArray.push(el);
							}
						});

						/* Create checkboxes for each continent inside the continent-select form */
						d3.selectAll(".continent-select")
							.selectAll("label")
							.data(uniqueContinentArray.sort())
							.enter()
							.append("label")
							.attr("class", "checkbox")
							.html(function (d) {
								var continentString = d.replace(/_/g, ' ');
								return "<span class='icon'>	<svg height='20' width='20'><circle cx='10' cy='10' r='10' class='dots " + d +  "'></circle><polygon fill='#ECF0F1' points='8.163,11.837 6.062,9.737 3.963,11.837 6.062,13.938 8.163,16.037 16.037,8.162 13.938,6.062'/></polygon></svg></span><input type='checkbox' value='" + d + "' data-continent='" + d + "' checked>" + continentString;
							});

						/* Create checkboxes for each country inside the country-select form */
						d3.selectAll(".country-select")
							.selectAll("label")
							.data(dataset.sort(compareCountry)) // I'm sorting the dataset at this point - probably don't want to do that
							// .data(dataset) // I'm sorting the dataset at this point - probably don't want to do that
							.enter()
							.append("label")
							.attr("class", "checkbox")
							.html(function (d) {
								var countryString = d.country.replace(/_/g, ' ');
								return "<span class='icon'>	<svg height='20' width='20'><circle cx='10' cy='10' r='10' class='dots'></circle><polygon fill='#ECF0F1' points='8.163,11.837 6.062,9.737 3.963,11.837 6.062,13.938 8.163,16.037 16.037,8.162 13.938,6.062'/></polygon></svg></span><input type='checkbox' value='" + d.country + "' data-continent='" + d.continent + "' checked>" + countryString + " (" + d.countryCode + ")";
							});

						/*	When a field button is clicked update the field variable to represent the selected 
							field and call updateDisplayArray() */
						d3.selectAll(".field-select input").on("change", function(){
							field = this.value;
							updateDisplayArray();
							updateHeader(field);
						});

						/*	Call updateDisplayArray() when one of the country checkboxes is clicked */
						d3.selectAll(".country-select input").on("change", updateDisplayArray);

						/*	Call updateContinent() when one of the continent checkboxes is clicked */
						d3.selectAll(".continent-select input").on("change", updateContinent);

						/*	function called to copy the relevant year's data into the displayArray array
							then add a property called choice that holds the relevant count and field value */
						function updateDisplayArray() {

							/* First remove the existing data from the arrays */
							while (displayArray.length > 0) {
								displayArray.shift();
								}

							while (checkArray.length > 0) {
								checkArray.shift();
								}

							while (sortArray.length > 0) {
								sortArray.shift();
								}

							while (sortArray.length > 0) {
								sortArray.shift();
								}

							for (var i = 0; i < dataset.length; i++) {
									checkArray.push({});
							}

							for (var w = 0; w < checkArray.length; w++) {
								checkArray[w].country = dataset[w].country;
								checkArray[w].countryCode = dataset[w].countryCode;
								checkArray[w].continent = dataset[w].continent;
							}

							switch (field) {
								case "TotalPaper":
									for (var a = 0; a < checkArray.length; a++) {
										checkArray[a].choice = dataset[a].TotalPaper;
										checkArray[a].choiceFemale = 0;
									}
									break;
								case "Single":
									for (var b = 0; b < checkArray.length; b++) {
										checkArray[b].choice = dataset[b].SingleM;
										checkArray[b].choiceFemale = dataset[b].SingleF;
									}
									break;

								case "NatFirst":
									for (var d = 0; d < checkArray.length; d++) {
										checkArray[d].choice = dataset[d].NatFirstM;
										checkArray[d].choiceFemale = dataset[d].NatFirstF;
									}
									break;

								case "NatLast":
									for (var f = 0; f < checkArray.length; f++) {
										checkArray[f].choice = dataset[f].NatLastM;
										checkArray[f].choiceFemale = dataset[f].NatLastF;
									}
								break;

								case "IntFirst":
									for (var h = 0; h < checkArray.length; h++) {
										checkArray[h].choice = dataset[h].IntFirstM;
										checkArray[h].choiceFemale = dataset[h].IntFirstF;
									}
								break;

								case "IntLast":
									for (var k = 0; k < checkArray.length; k++) {
										checkArray[k].choice = dataset[k].IntLastM;
										checkArray[k].choiceFemale = dataset[k].IntLastF;
									}
								break;

								case "FMRatio":
									for (var m = 0; m < checkArray.length; m++) {
										checkArray[m].choice = dataset[m].FMRatio;
										checkArray[m].choiceFemale = 0;
									}
								break;
								default:
									for (var n = 0; n < checkArray.length; n++) {
										checkArray[n].choice = dataset[n].TotalPaper;
										checkArray[n].choiceFemale = 0;
									}
							}

							/*	Find out if each country is checked and if so copy their
								object from checkArray into displayArray */
							for (var p = 0; p < checkArray.length; p++) {
								var countryName = checkArray[p].country;

								if (d3.select(".country-select [value=" + countryName + "]").property("checked")) {
									displayArray.push(checkArray[p]);
								}
							}

							/*	Sort displayArray into the descending order 
								If the contries happen to have the same value for choice then they are sorted into alphabetical order */
							/* displayArray.sort(function(a, b) {
									if (b.choice < a.choice) {
										return -1;
									}
									else if (b.choice > a.choice) {
										return 1;
									} else if (b.choice === a.choice) {
										return a.country < b.country ? -1 : a.country > b.country ? 1 : 0;
									}
								}); */

							updateBars();
							updateHeader();
							setupLabel();
						}

						/*	Function called when a continent button is clicked to turn on and off groups of countries */
						function updateContinent() {
							var thisContinent = $(this).val();

							if ( thisContinent === "All" ) {
								$(".continent-select input").prop("checked", $(this).prop("checked"));
								$(".country-select input").prop("checked", $(this).prop("checked"));
							} else {
								/*	Loop through the countries, if the data attribute for continent matches the
									value of the continent check box then make its propenty "checked" match the 
									continent checkbox calling the function i.e. turn it on or off */
								for (var i = 0; i < $(".country-select input").length; i++) {
									var checkBoxes = $(".country-select input").eq(i);

									if (thisContinent === checkBoxes.data('continent') ) {
										checkBoxes.prop("checked", $(this).prop("checked"));
									}
									
								}
							}

							updateDisplayArray();
						}

						/*	Define Y scale range to go from height to 0
							Do not define the domaine yet */
						var yScale = d3.scale.linear()
							.range([height , 0]);

						/*	Define Y axis */
						var yAxis = d3.svg.axis()
							.scale(yScale)
							.tickSize(3, 3)
							.orient("left");

						/*	Prepare the Y axis but do not call .call(yAxis) yet */
						svg.append("g")
							.attr("class", "y axis")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
						.append("g")
							.attr("class", "axisLabel")
							.append("text")
							.attr("transform", "rotate(-90)")
							.attr("y", (15-margin.left))
							.attr("x", -height)
							.attr("dy", ".9em")
							.style("text-anchor", "start");

						var xScale = d3.scale.ordinal()
							.domain(d3.range(dataset.length))
							.rangeRoundBands([0,(width + margin.right)], 0.4);

						function updateBars () {
							/*	Update the yScale domain the current highest value */
							/*	or a constant value for the ratios */

							switch (field) {
								case "TotalPaper" :
								case "FMRatio" :
									yScale.domain([0, d3.max(displayArray, function(d) { return d.choice;} )]);
									break;
								case "Single" :
								case "NatFirst" :
								case "NatLast" :
								case "IntFirst" :
								case "IntLast" :
									yScale.domain([0, 1.7]);
									break;
								default:
									yScale.domain([0, d3.max(displayArray, function(d) { return d.choice;} )]);
									break;
							}

							/*	Make sure that the bars don't get too fat by keeping the xScale range above 5 */
							if (displayArray.length > 5) {
								xScale.domain(d3.range(displayArray.length));
							} else {
								xScale.domain(d3.range(5));
							}

							/*	Pass the new display array data to bars */
							var bars = blocks.selectAll("rect")
									.data(displayArray, function(d, i) {
										return d.country;
									});

							var barsFemale = blocksFemale.selectAll("rect")
									.data(displayArray, function(d, i) {
										return d.country;
									});


							/*	Find out if bars are being taken away if so  addingBars = false; 
								in order to alter the delay of the exiting bars	*/
							totalBarArray.push(bars[0].length);

							if ( totalBarArray.slice(-2)[1] >= totalBarArray.slice(-2)[0] ) {
								addingBars = true;
							} else {
								addingBars = false;
							}

							totalBarArray.shift();

							/* Enter… */
							bars.enter()
								.append("rect")
								.attr("x", function(d, i){
									return xScale(i);
								})
								.attr("width", function() {
									if (field == "TotalPaper" || field == "FMRatio") {
										return xScale.rangeBand();
									} else {
										return xScale.rangeBand()/2;
									}
								})
								.attr("y", height + margin.top)
								.attr("height", 0 )
								.attr("opacity",0.6)
								.attr("fill", function(d, i){
									switch (d.continent) {
										case "Australasia" :
											return allBars[0];
										case "North_America" :
											return allBars[1];
										case "Asia" :
											return allBars[2];
										case "Europe" :
											return allBars[3];
										case "South_America" :
											return allBars[4];
										default:
											return allBars[0];
									}
								});

							barsFemale.enter()
								.append("rect")
								.attr("x", function(d, i){
									return xScale(i) + (xScale.rangeBand()/2);
								})
								.attr("width", xScale.rangeBand()/2)
								.attr("y", height + margin.top)
								.attr("height", 0 )
								.attr("opacity",1)
								.attr("fill", function(d, i){
									switch (d.continent) {
										case "Australasia" :
											return allBars[0];
										case "North_America" :
											return allBars[1];
										case "Asia" :
											return allBars[2];
										case "Europe" :
											return allBars[3];
										case "South_America" :
											return allBars[4];
										default:
											return allBars[0];
									}
								});

							/*	Update… */
							bars.transition()
								.duration(duration)
								.delay(function() {
									if (!addingBars) {
										return duration;
									} else {
										return 0;
									}
								})
								.attr("x", function(d, i){
									return xScale(i);
								})
								.attr("width", function() {
									if (field == "TotalPaper" || field == "FMRatio") {
										return xScale.rangeBand();
									} else {
										return xScale.rangeBand()/2;
									}
								})
								.attr("y", function(d){
									return margin.top + yScale(d.choice);
								})
								.attr("height", function(d){
									return height - yScale(d.choice);
								});

							barsFemale.transition()
								.duration(duration)
								.delay(function() {
									if (!addingBars) {
										return duration;
									} else {
										return 0;
									}
								})
								.attr("x", function(d, i){
									return xScale(i) + (xScale.rangeBand()/2);
								})
								.attr("width", xScale.rangeBand()/2)
								.attr("y", function(d){
									return margin.top + yScale(d.choiceFemale);
								})
								.attr("height", function(d){
									return height - yScale(d.choiceFemale);
								});

							/*	Exit… */
							bars.exit()
								.transition()
								.duration(duration)
								.attr("x", function(d, i){
									return d3.select(this).attr("x");
								})
								.attr("width", function(d, i){
									return d3.select(this).attr("width");
								})
								.attr("y", height + margin.top)
								.attr("height", 0 )
								.remove();

							barsFemale.exit()
								.transition()
								.duration(duration)
								.attr("x", function(d, i){
									return d3.select(this).attr("x");
								})
								.attr("width", function(d, i){
									return d3.select(this).attr("width");
								})
								.attr("y", height + margin.top)
								.attr("height", 0 )
								.remove();

							/*	Repeat the bars Enter, Update and Exit for the text lables */
							var text = groups.selectAll("text")
									.data(displayArray, function(d, i) {
										return d.country;
									});

							/* Enter… */
							text.enter()
								.append("text")
								.attr("x", function(d, i){
									return xScale(i) + (xScale.rangeBand() / 2);
								})
								.attr("y", function(d){
									return height + margin.top;
								})
								.attr("text-anchor", "middle")
								.text(function(d) { return d.countryCode; });

							/*	Update… */
							text.transition()
								.duration(duration)
								.delay(function() {
									if (!addingBars) {
										return duration;
									} else {
										return 0;
									}
								})
								.attr("x", function(d, i){
									return xScale(i) + (xScale.rangeBand() / 2);
								})
								.attr("y", function(d){

									if (d.choiceFemale >= d.choice ) {
										return margin.top + yScale(d.choiceFemale) - 4;
									} else {
										return margin.top + yScale(d.choice) - 4;
									}
								});

							/*	Exit… */
							text.exit()
								.transition()
								.duration(duration)
								.attr("x", function(d, i){
									return d3.select(this).attr("x");
								})
								.attr("y", height + margin.top)
								.remove();

							/* Call the Y axis to adjust it to the new scale */
							svg.select(".outer-wrapper .y")
								.transition()
								.duration(duration)
								.call(yAxis);

							/*	Extract the info needed to build the tooltip
								and send it to the makeTooltip function */
							bars.on("mouseover", function(d,i) {
									
									var country = d.country;
									var choice = d.choice;
									var choiceFemale = d.choiceFemale;

									var x = d3.select(this).attr("x");
									var y;

									if (d.choiceFemale >= d.choice ) {
										y = d3.select(barsFemale[0][i]).attr("y");
									} else {
										y = d3.select(bars[0][i]).attr("y");
									}


									/*	Hover colour applied with javascript rather than CSS
										so that it can be trigged by the text too */
									d3.select(this)
										.attr("fill","#f1c40f");

									d3.select(barsFemale[0][i])
										.attr("fill","#f1c40f");

									makeTooltip(country,choice,choiceFemale,x,y);
								})
								.on("mouseout", function(d,i) {
									/* Return the bar to it's continent colour */
									d3.select(this).attr("fill", function(d, i){
										switch (d.continent) {
											case "Australasia" :
												return allBars[0];
											case "North_America" :
												return allBars[1];
											case "Asia" :
												return allBars[2];
											case "Europe" :
												return allBars[3];
											case "South_America" :
												return allBars[4];
											default:
												return allBars[0];
										}
									});

									d3.select(barsFemale[0][i]).attr("fill", function(d, i){
										switch (d.continent) {
											case "Australasia" :
												return allBars[0];
											case "North_America" :
												return allBars[1];
											case "Asia" :
												return allBars[2];
											case "Europe" :
												return allBars[3];
											case "South_America" :
												return allBars[4];
											default:
												return allBars[0];
										}
									});

									/* Hide the tooltip */
									hideTooltip();
								});

							barsFemale.on("mouseover", function(d,i) {
									
									var country = d.country;
									var choice = d.choice;
									var choiceFemale = d.choiceFemale;

									var x = d3.select(bars[0][i]).attr("x");
									var y;

									if (d.choiceFemale >= d.choice ) {
										y = d3.select(barsFemale[0][i]).attr("y");
									} else {
										y = d3.select(bars[0][i]).attr("y");
									}


									/*	Hover colour applied with javascript rather than CSS
										so that it can be trigged by the text too */
									d3.select(bars[0][i])
										.attr("fill","#f1c40f");

									d3.select(this)
										.attr("fill","#f1c40f");

									makeTooltip(country,choice,choiceFemale,x,y);
								})
								.on("mouseout", function(d,i) {
									/* Return the bar to it's continent colour */
									d3.select(bars[0][i]).attr("fill", function(d, i){
										switch (d.continent) {
											case "Australasia" :
												return allBars[0];
											case "North_America" :
												return allBars[1];
											case "Asia" :
												return allBars[2];
											case "Europe" :
												return allBars[3];
											case "South_America" :
												return allBars[4];
											default:
												return allBars[0];
										}
									});

									d3.select(this).attr("fill", function(d, i){
										switch (d.continent) {
											case "Australasia" :
												return allBars[0];
											case "North_America" :
												return allBars[1];
											case "Asia" :
												return allBars[2];
											case "Europe" :
												return allBars[3];
											case "South_America" :
												return allBars[4];
											default:
												return allBars[0];
										}
									});

									/* Hide the tooltip */
									hideTooltip();
								});

							/* Add the mouseover behaviour to the text to increase the target area */
							text.on("mouseover", function(d,i) {

									var country = d.country;

									var choice = d.choice;
									var choiceFemale = d.choiceFemale;

									var x = d3.select(bars[0][i]).attr("x");
									var y;

									if (d.choiceFemale >= d.choice ) {
										y = d3.select(barsFemale[0][i]).attr("y");
									} else {
										y = d3.select(bars[0][i]).attr("y");
									}

									d3.select(bars[0][i])
										.attr("fill","#f1c40f");

									d3.select(barsFemale[0][i])
										.attr("fill","#f1c40f");

									makeTooltip(country,choice,choiceFemale,x,y);
								})
								.on("mouseout", function(d,i) {

									d3.select(bars[0][i]).attr("fill", function(d, i){
										switch (d.continent) {
											case "Australasia" :
												return allBars[0];
											case "North_America" :
												return allBars[1];
											case "Asia" :
												return allBars[2];
											case "Europe" :
												return allBars[3];
											case "South_America" :
												return allBars[4];
											default:
												return allBars[0];
										}
									});

									d3.select(barsFemale[0][i]).attr("fill", function(d, i){
										switch (d.continent) {
											case "Australasia" :
												return allBars[0];
											case "North_America" :
												return allBars[1];
											case "Asia" :
												return allBars[2];
											case "Europe" :
												return allBars[3];
											case "South_America" :
												return allBars[4];
											default:
												return allBars[0];
										}
									});

									/* Hide the tooltip */
									hideTooltip();
								});


						}

						function makeTooltip(country,choice,choiceFemale,x,y) {

							/*	Create a var to hold the tooltip text string */
							var tooltipText = "";
							var countryString = country.replace(/_/g, ' ');
							var formattedChoice;


							if (field == "TotalPaper") {
								formattedChoice = thousandFormat(choice);
							} else {
								formattedChoice = choice;
							}

							if (field == "TotalPaper" || field == "FMRatio") {
								tooltipText = countryString + "<br /> "+ formattedChoice;
							} else {
								tooltipText = countryString + "<br />Male: " + choice + "<br />Female: " + choiceFemale;
							}

							/* Update the tooltip text */
							d3.select(".infobox")
								.select(".value")
								.html(tooltipText);

							var tooltipWidth = parseInt(($(".infobox").css("width")), 10);
							var tooltipHeight = parseInt($(".infobox").css("height"), 10);

							/* Get this bar's x/y values, then augment for the tooltip */
							var xPosition = parseInt(x, 10) - (tooltipWidth/2) + 75;
							var yPosition = parseInt(y, 10) - (tooltipHeight) - 43;

							/* Update the tooltip position and value */
							d3.select(".infobox")
								.style("left", xPosition + "px")
								.style("top", yPosition + "px");

							/* Show the tooltip */
							d3.select(".infobox")
								.classed("hidden", false)
								.transition()
								.duration(duration/2)
								.style("opacity", 1);

						}

						function hideTooltip() {
							d3.select(".infobox")
								.transition()
								.duration(duration/2)
								.style("opacity", 0)
								.each("end", function() {
									d3.select(".infobox").classed("hidden", true);
								});
						}

						function updateHeader () {

							switch (field) {
								case "TotalPaper" :
									headerString = "Total papers published";
									axisString = "Papers published";
									key.transition()
										.duration(duration)
										.attr('opacity', 0);
									break;
								case "Single" :
									headerString = "Single author";
									axisString = "Average relative citation (field normalized)";
									key.transition()
										.duration(duration)
										.attr('opacity', 1);
									break;

								case "NatFirst" :
									headerString = "First author (national collaboration)";
									axisString = "Average relative citation (field normalized)";
									key.transition()
										.duration(duration)
										.attr('opacity', 1);
									break;

								case "NatLast" :
									headerString = "Last author (national collaboration)";
									axisString = "Average relative citation (field normalized)";
									key.transition()
										.duration(duration)
										.attr('opacity', 1);
									break;

								case "IntFirst" :
									headerString = "First author (international collaboration)";
									axisString = "Average relative citation (field normalized)";
									key.transition()
										.duration(duration)
										.attr('opacity', 1);
									break;

								case "IntLast" :
									headerString = "Last author (international collaboration)";
									axisString = "Average relative citation (field normalized)";
									key.transition()
										.duration(duration)
										.attr('opacity', 1);
									break;

								case "FMRatio" :
									headerString = "Ratio of female to male authorships";
									axisString = "Ratio of female to male authorships";
									key.transition()
										.duration(duration)
										.attr('opacity', 0);
									break;
								default:
									headerString = "Total papers published";
									axisString = "Papers published";
									key.transition()
										.duration(duration)
										.attr('opacity', 1);
									break;

							}

							d3.select(".outer-wrapper h3").text(headerString);

							d3.selectAll(".y .axisLabel text")
								.text(axisString);
						}

						/* An inital call of updateDisplayArray()  */
						updateDisplayArray();

						/* Build the custom checkboxes */
						setupLabel();

					}
				}); /* End of ajax a call */

		}); /* End of d3js getscript call

		/* End of active code */
		};

	setTimeout(function()
	{
	if (typeof jQuery !== 'undefined')
	{
		init(jQuery);
	} else
	{
		setTimeout(arguments.callee, 60);
	}
	}, 60);

})();