


let delayInterval;//timer
const safeRequiredOres = [5, 10, 15, 25, 50, 85, 135, 225, 375, 600, 900]; //required ores for safe 5-15
const safeRequiredXtra = [1, 2, 3, 4, 6, 10, 22, 37, 54, 81, 128]; //required spares for safe 5-15
																																		//+0 -> +12 is 85 total
																																		//final +3 is 263 total
const safeRequiredZeny = [100000, 220000, 470000, 910000, 1630000, 2740000, 
													5250000, 9000000, 17000000, 28500000, 56000000]; //required zeny for safe 5-15

let bonksCount = 0, zenyCount = 0, oresCount = 0, xtraCount = 0, breakCount = 0;
//xGraph can probably be implemented better or removed entirely
let xGraph = [0], yGraph = [0], dataColors = [0], dataPointTooltips = [[]];


function initializeValues(){

	//https://www.w3schools.com/js/js_htmldom_eventlistener.asp
	document.getElementById("refineSpeedSlider").addEventListener("input", refineSpeed);

 	//listener for start button
	document.getElementById("startButton").addEventListener("click", clickStart);
	//listener for pause button
	document.getElementById("pauseButton").addEventListener("click", clickPause);
	//listener for reset button
	document.getElementById("resetButton").addEventListener("click", clickReset);
	// count + "<br>";
	createGraph();
	
}

//test function for clicking start button
function clickStart() {
  //Start check
	console.log(this.value);

	//disable stop button and delay slider; delay slider MUST be disabled while running
	//since the interval cannot be changed mid-cycle.  Pausing is required first to 
	//change the speed
	this.disabled = true;
	document.getElementById("refineSpeedSlider").disabled = true;
	document.getElementById("safeRefineLimit").disabled = true;
	document.getElementById("resetButton").disabled = true;

	//enable pause button
	document.getElementById("pauseButton").disabled = false;

	if(getCurrentRefine() < 15){

		//this sets a delayed repeating function call to the "refine" function
		//with a delay value of the user defined number in milliseconds
		delayInterval = setInterval(refine, document.getElementById("stopwatch").value * 1000);

		//"PAIN dayo" - Henya
		refine();
  	
	}

}//end clicked()

function clickPause() {
  //Pause check
	console.log(this.value);
	//disable pause button
	this.disabled = true;

	//enable start button, reset button, delay slider, and safe refine limit selector
	document.getElementById("startButton").disabled = false;
	document.getElementById("resetButton").disabled = false;
	document.getElementById("refineSpeedSlider").disabled = false;
	document.getElementById("safeRefineLimit").disabled = false;

	//pause the repeater
	clearInterval(delayInterval);
	delayInterval = null;
}

function clickReset() {

	//reset all values
	document.getElementById("refineNumber").innerHTML = "+0";
	document.getElementById("startButton").disabled = false;
	document.getElementById("refineSpeedSlider").disabled = false;
	document.getElementById("safeRefineLimit").disabled = false;

	bonksCount = 0;
	zenyCount = 0;
	oresCount = 0;
	xtraCount = 0;
	breakCount = 0;
	document.getElementById("bonksBox").value = "";
	document.getElementById("oresBox").value = "";
	document.getElementById("zenyBox").value = "";
	document.getElementById("xtraBox").value = "";
	document.getElementById("breaksBox").value = "";

	//reset data & destroy graph
	xGraph = [0];
	yGraph = [0];
	dataColors = [0];
	dataPointTooltips = [[]];

	//Check if there is a graph before resetting, then
	//pass the id of the canvas html element if there is
	//if(Chart.getChart(refineChart) !== undefined){
		Chart.getChart(refineChart).destroy();
	//}
	createGraph();
	refineSpeed();
}

// function colorTest(){
// 	return "rgba(0,255,0,1.0)";
// }

function refine(){

	var currentRefine = getCurrentRefine();
	//check if we need to stop
	if(currentRefine > 14){

		console.log("+15! you can stop now.");
		//✨
		//"BREAK THE CYCLE" - The Patriarch, aka Subject 91
		clearInterval(delayInterval);
		delayInterval = null;
		document.getElementById("pauseButton").disabled = true;
		dataPointTooltips[bonksCount][dataPointTooltips[bonksCount].length - 1] += "✨";
		
		

		document.getElementById("resetButton").disabled = false;
		//END NOW
		return undefined;
	}

	//while(refineLevel < 15){

		//+1 to +4 is guaranteed
		if(currentRefine < 4){
			//add one
			updateRefine(1);

			plusUpdate();
		}

		//selective safe refine check
		else if(currentRefine > 3 && currentRefine < document.getElementById("safeRefineLimit").value){
			//add one
			updateRefine(1);

			plusSafeUpdate();
		}
		else{
			//try for +5 & +6 (not safe)
			if(currentRefine == 4 || currentRefine == 5){

				//50% refine chance
				if(rngCheck(50)){
					//success
					updateRefine(1);

					plusUpdate();
				}
				else{
					//fail
					updateRefine(-1);

					minusUpdate();

					//50% break chance
					breakGear(50);
					
				}
			}
			//try for +7 and beyond (not safe)
			else if(currentRefine > 5){

				//40% refine chance
				if(rngCheck(40)){
					updateRefine(1);

					plusUpdate();
				}
				else{
					//fail
					updateRefine(-1);

					minusUpdate();

					if(currentRefine < 10){
						//50% break chance under +10
						breakGear(50);
					}
					else{
						//100% break chance for +10 and above
						breakGear(100);
					}
				}
			}
		
		}//end DANGER zone
	// }//end NON-SAFE refines
	
	updateStatTotals();

	Chart.getChart(refineChart).update();
}//end refine()

//retrieve the current refine level
function getCurrentRefine(){
	return parseInt(document.getElementById("refineNumber").innerHTML);
}

//used for refine success/fail and break check
function rngCheck(num){

	//get a random number between 0-99 (inclusive) and
	//return true if less than the num parameter
	return (Math.floor(Math.random() * 100) < num);
}

function breakGear(chance){

	if(rngCheck(chance)){
		breakCount++;
		xtraCount++;
		//💥💔🩹

		dataPointTooltips[bonksCount][4] = "💥💔";
		dataPointTooltips[bonksCount][5] = "1" + " ⚙️🡲🩹";//maybe use ⚙️ for spare gears?
	}
	else
		console.log("No break.");
}

function refineSpeed(){
	//update displayed delay value
	document.getElementById("stopwatch").value = ((101 - document.getElementById("refineSpeedSlider").value)/100).toFixed(2);

	//update graph animation speed/delay
	if(document.getElementById("stopwatch").value > 0.09)
		//show animation when the delay is long enough
		Chart.getChart(refineChart).options.animation.duration = document.getElementById("stopwatch").value * 1000;
	else
		//don't show the animation when the delay is too short (performance issues)
		Chart.getChart(refineChart).options.animation.duration = 0;

	Chart.getChart(refineChart).update();
}

function updateRefine(num) {
	document.getElementById("refineNumber").innerHTML = "+" + (getCurrentRefine() + num);
}

//consider merging plusUpdate & plusSafeUpdate if-else flow chart (if possible)
function plusUpdate(){

	updateGraphStats();
	var refineLevel = getCurrentRefine();
	//⬈🡵🡽🢅
	//increment zeny & ores cost for successful non-safe refines
	if(refineLevel < 11){
		zenyCount += refineLevel * 10000;
		oresCount++;

		// add zeny & ores cost to text log
		dataPointTooltips[bonksCount][1] = (refineLevel * 10000).toLocaleString() + " z";
		dataPointTooltips[bonksCount][2] = "1 💎";
	}
	else{
		//non-safe refines beyond 10 are always 100,000z
		zenyCount += 100000;
		//enriched ores are counted as 5 normal ores
		oresCount += 5;

		// add zeny & ores & spares cost to text log
		dataPointTooltips[bonksCount][1] = "100,000" + " z";
		dataPointTooltips[bonksCount][2] = "5 💎";
	}

	dataPointTooltips[bonksCount][3] = "+" + (refineLevel - 1) + " 🡵 +" + refineLevel;
	colorTheDataPoint("rgba(0,255,0,1.0)");//make it green
}

function plusSafeUpdate(){

	//⬈
	updateGraphStats();
	var refineLevel = getCurrentRefine();
	
	dataPointTooltips[bonksCount][1] = "☔☔☔☔☔";

	if(refineLevel < 5){
		zenyCount += refineLevel * 10000;
		oresCount++;

		// add zeny & ores cost to text log
		dataPointTooltips[bonksCount][2] = (refineLevel * 10000).toLocaleString() + " z";
		dataPointTooltips[bonksCount][3] = "1 💎";
		dataPointTooltips[bonksCount][4] = "0 ⚙️";
	}
	else{
		zenyCount += safeRequiredZeny[refineLevel - 5];
		oresCount += safeRequiredOres[refineLevel - 5];
		xtraCount += safeRequiredXtra[refineLevel - 5];

		// add zeny & ores & spares cost to text log
		//🔒☔
		dataPointTooltips[bonksCount][2] = (safeRequiredZeny[refineLevel - 5]).toLocaleString() + " z";
		dataPointTooltips[bonksCount][3] = safeRequiredOres[refineLevel - 5] + " 💎";
		dataPointTooltips[bonksCount][4] = safeRequiredXtra[refineLevel - 5] + " ⚙️";
	}
	dataPointTooltips[bonksCount][5] = "+" + (refineLevel - 1) + " 🡵 +" + refineLevel;
	colorTheDataPoint("rgba(0,255,0,1.0)");//make it green
}

function minusUpdate(){

	//🡶
	updateGraphStats();
	var refineLevel = getCurrentRefine();

	//increment zeny & ores cost for failed refines
	if((refineLevel + 2) <= 10){
		zenyCount += (refineLevel + 2) * 10000;
		oresCount++;

		// add zeny & ores cost to text log
		dataPointTooltips[bonksCount][1] = ((refineLevel + 2) * 10000).toLocaleString() + " z";
		dataPointTooltips[bonksCount][2] = "1 💎";
	}
	else{
		//non-safe refines beyond 9 are always 100,000z
		zenyCount += 100000;
		//enriched ores are counted as 5 normal ores
		oresCount += 5;

		// add zeny & ores & spares cost to text log
		dataPointTooltips[bonksCount][1] = "100,000 z";
		dataPointTooltips[bonksCount][2] = "5 💎";
	}

	dataPointTooltips[bonksCount][3] = "+" + (refineLevel + 1) + " 🡶 +" + refineLevel;
	colorTheDataPoint("rgba(255,0,0,1.0)");//make it red
}

function colorTheDataPoint(color){
	dataColors[bonksCount] = color;
}

function updateGraphStats(){
	bonksCount++;
	xGraph[bonksCount] = bonksCount;
	yGraph[bonksCount] = getCurrentRefine();

	//initialize data collection COLUMN
	dataPointTooltips[bonksCount] = [];
	//initialize data collection ROW
	dataPointTooltips[bonksCount][0] = "🌧🌧🌧🌧🌧";//⚡⚠⛈
}

function updateStatTotals(){
	document.getElementById("bonksBox").value = bonksCount.toLocaleString() + " 🔨";
	document.getElementById("oresBox").value = oresCount.toLocaleString() + " 💎";
	document.getElementById("zenyBox").value = zenyCount.toLocaleString() + " z";
	document.getElementById("xtraBox").value = xtraCount.toLocaleString() +  " ⚙️🩹";
	document.getElementById("breaksBox").value = breakCount.toLocaleString() + " 💥💔";
}

function createGraph(){
	//GENERATE GRAPH
		new Chart("refineChart", {
	  type: "line",
	  data: {
	    labels: xGraph,

	    datasets: [{
	      fill: false,
	      lineTension: 0.1,
	      //point & line colors (R,G,B,Opacity)
	      //note: using a function call here is allowed with no errors (HUUUHH???)
	      // backgroundColor: colorTest(),
	      //note: using an array here is allowed, and will repeat the pattern if too short
	      // backgroundColor: ['red', 'green', 'blue'],
	      backgroundColor: dataColors,
	      borderColor: "rgba(0,0,0,1.0)",
	      borderWidth: 1,
	      data: yGraph,
	      //data point sizes
	      pointRadius: 6,
	      pointHoverRadius: 12,
	      //Graph title line
	      label: "Refine Level"
	    }]
	  },
	  options: {
	  	//chart animation duration in milliseconds
	  	animation: {
	  		//default value to start based on 0.10 second delay between refines
        duration: 100,
        //animation type
        easing: 'easeInOutExpo',
    },
	    responsive: true,
	    maintainAspectRatio: false,

	    	//THIS SECTION CHANGES WHAT IS DISPLAYED WHEN HOVERING OVER A CHART ELEMENT,
	    	//I HAVE NO IDEA HOW IT WORKS, REFER TO RESEARCH NOTES:
	    	//
		    //https://www.chartjs.org/docs/latest/configuration/tooltip.html#label-callback
	    	//
				//account.live.com/?mkt=EN-US&lc=1033&id=38936
	    	//
		    plugins: {

		    	//remove graph title & color box
		    	legend: {
		    		display: false,
		    	},

		    	//ZOOM PLUGIN FUNCTIONALITY STARTS HERE
		    	//https://www.chartjs.org/chartjs-plugin-zoom/latest/guide/options.html#limits
		    	zoom: {
		        zoom: {
		          wheel: {
		            enabled: true,
		          },
		          pinch: {
		            enabled: true
		          },
		          mode: 'x',
		        },
		        //CLICK TO DRAG HERE
		        pan: {
		        	enabled: true,
		        	mode: 'x',
		        },
		        scales: {
		        	x: {
		        		minRange: 1,
		        		min: 0,
		        		max: bonksCount
		        	},
		        	y: {
		        		minRange: 1,
		        		min: 0,
		        		max: 17
		        	},
		        },
		      },
		      //CUSTOM DATA TOOLTIPS START HERE
		      tooltip: {
		        callbacks: {
		          label: function(context) {

		          	//USE parseInt TO CHANGE THE STRING FORM OF THE X VALUE TO AN INT
		          	//AND GET THE RIGHT DATA FOR THAT REFINE ATTEMPT!!!
		            let label = dataPointTooltips[parseInt(context.label)];
		            return label;
		          },
		          title: function(context) {
		          	//context[0].label refers to the default value (x value) of the graph at any given point;
		          	//title is the first line on the point label when hovering;
		            let title = " 🔨Bonk # " + context[0].label + "🔨";
		            return title;
		          }
		        },
		        //tooltip font sizes
		        titleFont: {
		        	size: 14
		        },
		        bodyFont: {
		        	size: 14
		        }
		      }
	    	}
	  	}
		});
}