/*	News Section Colours */
var colourPurple =	["#DABDD8","#95177E","#B570A7","#651E59","#461E47"];
var colourYellow =	["#FED162","#F8B436","#F29500","#D37510","#AF6A17"];
var colourRed =		["#EE8361","#EB6B4B","#E85338","#E53524","#A8131D"];
var colourBlue =	["#84D0F0","#3BAADC","#006DB2","#2C3387","#152760"];
var colourGreen =	["#E1DC00","#96BE17","#45A72C","#00892F","#00642D"];

/*	Typography */
var colourText =	["#363636","#707070","#006699","#5C7996","#222222","#EEEEEE","#F5821F","#C4C4C4"];

/*	Border Colours */
var colourBorder =	["#999999","#E7E7E7","#C7C8CC","#B7B7B7","#D4D4D4","#CCCCCC","#006699","#C4C4C4"];
  
/*	Background Colours */
var colourBackground =	["#006699","#2C2C2C","#E1E4E9","#ECECEC","#5E5E5E","#F9F9F9","#F0F1F3"];

/*	Colours for the bars */
var allBars = ["#1abc9c","#27ae60","#3498db","#5959b7","#34495e"];

/*	==================================================================================== */
/*	JQUERY READY */

(function() {
		var init = function($)
		{

		/*	==================================================================================== */
		/*	Remove nav column and add class single-column to constrain-content column
			so that it will be 956px wide. Bassed on Andrew code.
			CHECK BEFORE USE!!!!! */
		var content = $('#constrain-content');
		var nav = $('#nav');

		setTimeout(function () {
			if (content && nav) {
				content.addClass('single-column');
				nav.remove();
			} else {
				setTimeout(arguments.callee, 100);
			}
		}, 100);

		/*	==================================================================================== */
		/*	STATUS MESSAGE FOR NO-JS */
		/*	We know that javascript is enabled and that we are not in IE 6-8
			so hide the error message and show outer-wrapper */
		$(".outer-wrapper").css({"display":"block"});
		$(".status-message").css({"display":"none"});

		/*	==================================================================================== */
		/*	GLOBAL VARIABLES FOR D3 */

		/*	Margin, Width and height */
		var margin = {top: 30, right: 20, bottom: 15, left: 75};
		var width = 630  - margin.left - margin.right;
		var height = 350 - margin.top - margin.bottom;
		/*	Global variable to control the length of D3 transitons */
		var duration = 450;
		/*	Array to hold the data ajaxed form the table */
		var dataset = [];
		var sortArray = [];
		var yearArray = [];
		var checkArray = [];

		/*	Global variable to hold the cc or ac choice */
		var field = "TotalPaper";
		var headerString = "Total papers published";

		/*	Global Array to hold all the data we currently want to display */
		var displayArray = [];

		/*	Arrays used to build the country and continent checkboxes */
		var continentArray = [];
		var uniqueContinentArray = ["All"];

		var totalBarArray = [];

		/*	Create SVG element */
		var svg = d3.select(".count-chart")
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);

		/* Add a group for each row of bars */
		var blocks = svg.append("g")
						.attr("transform", "translate(" + margin.left + ",0)");

		/* Add a group for each row of text */
		var groups = svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(" + margin.left + ",0)");

		/*	Function to sort data.year200X by country name */
		function compareCountry(a,b) {
			if (a.country < b.country)
				return -1;
			if (a.country > b.country)
				return 1;
			return 0;
		}

		/*	==================================================================================== */
		/*	AJAX CALL. LOAD IN JSON AND CALL DRAW */

		/*	We now want to load in the data from our html table */

		$.ajax({
			url: "data/citation-data.html",
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
							// return "<span class='icon'>	<svg height='20' width='20'><circle cx='10' cy='10' r='10' class='dots " + d +  "'></circle><polygon fill='#ECF0F1' points='8.163,11.837 6.062,9.737 3.963,11.837 6.062,13.938 8.163,16.037 16.037,8.162 13.938,6.062'/></svg></span><input type='checkbox' value='" + d + "' data-continent='" + d + "' checked>" + continentString;
							return "<span class='icon'></span><input type='checkbox' value='" + d + "' data-continent='" + d + "' checked>" + continentString;
						});

					/* Create checkboxes for each country inside the country-select form */
					d3.selectAll(".country-select")
						.selectAll("label")
						//.data(dataset.sort(compareCountry)) // I'm sorting the dataset at this point - probably don't want to do that
						.data(dataset) // I'm sorting the dataset at this point - probably don't want to do that
						.enter()
						.append("label")
						.attr("class", "checkbox")
						.html(function (d) {
							var countryString = d.country.replace(/_/g, ' ');
							// return "<span class='icon'>	<svg height='20' width='20'><circle cx='10' cy='10' r='10' class='dots'></circle><polygon fill='#ECF0F1' points='8.163,11.837 6.062,9.737 3.963,11.837 6.062,13.938 8.163,16.037 16.037,8.162 13.938,6.062'/></svg></span><input type='checkbox' value='" + d.country + "' data-continent='" + d.continent + "' checked>" + countryString + " (" + d.countryCode + ")";
							return "<span class='icon'></span><input type='checkbox' value='" + d.country + "' data-continent='" + d.continent + "' checked>" + countryString + " (" + d.countryCode + ")";
						});

					/*	When a field button is clicked update the field variable to represent the selected 
						field and call updateDisplayArray() */
					d3.selectAll(".select-field input").on("change", function(){
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

						while (yearArray.length > 0) {
							yearArray.shift();
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
								}
								break;
							case "SingleF":
								for (var b = 0; b < checkArray.length; b++) {
									checkArray[b].choice = dataset[b].SingleF;
								}
								break;
							case "SingleM":
								for (var c = 0; c < checkArray.length; c++) {
									checkArray[c].choice = dataset[c].SingleM;
								}
								break;
							case "NatFirstF":
								for (var d = 0; d < checkArray.length; d++) {
									checkArray[d].choice = dataset[d].NatFirstF;
								}
								break;
							case "NatFirstM":
								for (var e = 0; e < checkArray.length; e++) {
									checkArray[e].choice = dataset[e].NatFirstM;
								}
							break;
							case "NatLastF":
								for (var f = 0; f < checkArray.length; f++) {
									checkArray[f].choice = dataset[f].NatLastF;
								}
							break;
							case "NatLastM":
								for (var g = 0; g < checkArray.length; g++) {
									checkArray[g].choice = dataset[g].NatLastM;
								}
							break;
							case "IntFirstF":
								for (var h = 0; h < checkArray.length; h++) {
									checkArray[h].choice = dataset[h].IntFirstF;
								}
							break;
							case "IntFirstM":
								for (var j = 0; j < checkArray.length; j++) {
									checkArray[j].choice = dataset[j].IntFirstM;
								}
							break;
							case "IntLastF":
								for (var k = 0; k < checkArray.length; k++) {
									checkArray[k].choice = dataset[k].IntLastF;
								}
							break;
							case "IntLastM":
								for (var l = 0; l < checkArray.length; l++) {
									checkArray[l].choice = dataset[l].IntLastM;
								}
							break;
							case "FMRatio":
								for (var m = 0; m < checkArray.length; m++) {
									checkArray[m].choice = dataset[m].FMRatio;
								}
							break;
							default:
								for (var n = 0; n < checkArray.length; n++) {
									checkArray[n].choice = dataset[n].cc;
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
						displayArray.sort(function(a, b) {
								if (b.choice < a.choice) {
									return -1;
								}
								else if (b.choice > a.choice) {
									return 1;
								} else if (b.choice === a.choice) {
									return a.country < b.country ? -1 : a.country > b.country ? 1 : 0;
								}
							});

						updateBars();
						// updateHeader();
						// setupLabel();
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

					/*	Set up bars - one for each country in the chosen year */
					svg.selectAll("rect")
								.data(dataset, function(d, i) {
									return d.country;
								})
								.enter()
								.append("rect")
								.attr("width", 0)
								.attr("x", 0)
								.attr("height", 0)
								.attr("y", 0);

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
						.attr("y", -margin.left)
						.attr("x", -height/2)
						.attr("dy", ".9em")
						.style("text-anchor", "middle");

					var xScale = d3.scale.ordinal()
						.domain(d3.range(dataset.length))
						.rangeRoundBands([0,(width + margin.right)], 0.1);

					function updateBars () {
						/*	Update the yScale domain the current highest value */
						yScale.domain([0, d3.max(displayArray, function(d) { return d.choice;} )]);

						/*	Pass the new display array data to bars */
						/*	Do I need this? */
						var bars = blocks.selectAll("rect")
								.data(displayArray, function(d, i) {
									return d.country;
								});

						/* Enter… */
						bars.enter()
							.append("rect")
							.attr("x", function(d, i){
								return xScale(i);
							})
							.attr("width", xScale.rangeBand())
							.attr("y", height + margin.top)
							.attr("height", 0 )
							.attr("opacity",0.8)
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
							/*.delay(function() {
								if (!addingBars) {
									return duration; 
								} else {
									return 0;
								}
							})*/
							.attr("x", function(d, i){
								return xScale(i);
							})
							.attr("width", xScale.rangeBand())
							.attr("y", function(d){
								return margin.top + yScale(d.choice);
							})
							.attr("height", function(d){
								return height - yScale(d.choice);
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
							/*.delay(function() {
								if (!addingBars) {
									return duration; 
								} else {
									return 0;
								}
							})*/
							.attr("x", function(d, i){
								return xScale(i) + (xScale.rangeBand() / 2);
							})
							.attr("y", function(d){
								return margin.top + yScale(d.choice) - 2;
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
						bars.on("mouseover", function(d) {
								
								var country = d.country;
								var choice = d.choice;
								var x = d3.select(this).attr("x");
								var y = d3.select(this).attr("y");

								/*	Hover colour applied with javascript rather than CSS
									so that it can be trigged by the text too */
								d3.select(this)
									.attr("fill","#f1c40f");

								makeTooltip(country,choice,x,y);
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
										case "SAmerica" :
											return allBars[4];
										default:
											return allBars[0];
									}
								});

								/* Hide the tooltip */
								hideTooltip();
							});

						/* Add the mouseover behaviour to the text to increase the target area */
						text.on("mouseover", function(d, i) {

								var country = d.country;
								var choice = d.choice;
								var x = d3.select(bars[0][i]).attr("x");
								var y = d3.select(bars[0][i]).attr("y");

								d3.select(bars[0][i])
									.attr("fill","#f1c40f");

								makeTooltip(country,choice,x,y);
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
										case "SAmerica" :
											return allBars[4];
										default:
											return allBars[0];
									}
								});

								/* Hide the tooltip */
								hideTooltip();
							});


					}

					function makeTooltip(country,choice,x,y) {

						/*	Create a var to hold the tooltip text string */
						var tooltipText = "";
						var countryString = country.replace(/_/g, ' ');

						/* Update the tooltip text */
						d3.select(".tooltip")
							.select(".value")
							.html(countryString + "<br /> " + choice);

						/* Get this bar's x/y values, then augment for the tooltip */
						var xPosition = parseInt(x) - (parseInt($(".tooltip").css("width"))/2, 10);
						var yPosition = parseInt(y) - (parseInt($(".tooltip").css("height"), 10)) - 43;

						/* Update the tooltip position and value */
						d3.select(".tooltip")
							.style("left", xPosition + "px")
							.style("top", yPosition + "px");

						/* Show the tooltip */
						d3.select(".tooltip")
							.classed("hidden", false)
							.transition()
							.duration(duration/2)
							.style("opacity", 1);

					}

					function hideTooltip() {
						d3.select(".tooltip")
							.transition()
							.duration(duration/2)
							.style("opacity", 0)
							.each("end", function() {
								d3.select(".tooltip").classed("hidden", true);
							});
					}

					function updateHeader (field) {

						switch (field) {
							case "TotalPaper" :
								headerString = "Total papers published";
								break;
							case "SingleF" :
								headerString = "Single female";
								break;
							case "SingleM" :
								headerString = "Single male";
								break;
							case "NatFirstF" :
								headerString = "National first female";
								break;
							case "NatFirstM" :
								headerString = "National first male";
								break;
							case "NatLastF" :
								headerString = "National last female";
								break;
							case "NatLastM" :
								headerString = "National last male";
								break;
							case "IntFirstF" :
								headerString = "International first female";
								break;
							case "IntFirstM" :
								headerString = "International first male";
								break;
							case "IntLastF" :
								headerString = "International last female";
								break;
							case "IntLastM" :
								headerString = "International last male";
								break;
							case "FMRatio" :
								headerString = "Female to male ratio";
								break;
						}

						d3.select(".outer-wrapper h1").text(headerString);
					}

					/* An inital call of updateDisplayArray()  */
					updateDisplayArray();
				}
			}); /* End of ajax a call */


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