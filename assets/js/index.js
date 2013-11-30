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

/*	==================================================================================== */
/*	jQuery ready */

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
				console.log('We got content and nav!');
				content.addClass('single-column');
				nav.remove();
			} else {
				setTimeout(arguments.callee, 100);
				console.log('We have not got content and nav!');
			}
		}, 100)

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