var grid = []; 
var t; 
var n; 
var gen = 0; 
var temp = 2; 
var white = 1; 
var black = -1; 
var nIters = 10000;

var temperatures = [];
var magnetizations = [];

var  temporary_mags = [];

var slider = document.getElementById("slider");
var output = document.getElementById("temp");
output.innerHTML = slider.value; // Display the default slider value
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
	output.innerHTML = this.value;
	if ( t==0 ){
		temp = this.value;
	} // Display the default slider value
}

function clearBoard() {
	temp = parseFloat(slider.value);
	clearTimeout(t);
	temporary_mags = [];
	t = 0;
	iter = 0;
	document.getElementById("generation").innerHTML = "Iteration: " + iter;
	document.getElementById("magnetisation").innerHTML = "Magnetization: 0";
	grid = [];
	var board = document.getElementById("board");
	var tiles = '';
	for (i = 0; i < n; i++) {
		grid.push([]);
		for (j = 0; j < n; j++) {
		tiles = tiles + `<div id="t_${i}_${j}" class="tile" style="background-color:white"></div>`;
		grid[i].push(Math.random() >= 0.5 ? 1 : -1);
		}
	}
	board.innerHTML = tiles;
	random();
}

function initialize() {
	clearTimeout(t);
	temperatures = [];
	magnetizations = [];
	temporary_mags = [];
	t = 0;
	n = parseInt(document.getElementById("number").value);
	document.documentElement.style.setProperty('--x', n);
	clearBoard();
	plot();
}

function random() {
	clearTimeout(t);
	t = 0;
	iter = 0;
	document.getElementById("generation").innerHTML = "Iteration: " + iter;
	grid = [];
	for (i = 0; i < n; i++) {
		grid.push([]);
		for (j = 0; j < n; j++) {
		grid[i].push(Math.random() >= 0.5 ? 1 : -1);
		}
	}
	updateBoard();
}

function calculateLocalEnergy(i, j) {
    let localE = 0;
    const spin = grid[i][j];
    // Only calculate energy for the affected spin and its neighbors
    const neighbors = [
        [(i-1+n)%n, j],
        [(i+1)%n, j],
        [i, (j-1+n)%n],
        [i, (j+1)%n]
    ];
    
    for (let [ni, nj] of neighbors) {
        localE += spin * grid[ni][nj];
    }
    return -localE; // Negative coupling constant
}

function updateOnce() {
    for(let temp_iter = 0; temp_iter < n*n; temp_iter++) {
        const pos_i = Math.floor(Math.random() * n);
        const pos_j = Math.floor(Math.random() * n);
        
        // Calculate energy change for this spin flip
        const initialLocalE = calculateLocalEnergy(pos_i, pos_j);
        grid[pos_i][pos_j] *= -1;  // Flip the spin
        const finalLocalE = calculateLocalEnergy(pos_i, pos_j);
        const deltaE = finalLocalE - initialLocalE;
        
        // Metropolis acceptance criterion
        if (deltaE > 0 && Math.random() >= Math.exp(-deltaE / temp)) {
            grid[pos_i][pos_j] *= -1;  // Reject the flip
        }
    }
    updateBoard();
}

function magnetisation(){
	mag = 0;
	for (i = 0; i < n; i++) {
		for (j = 0; j < n; j++) {
		mag += grid[i][j];
		}
	}
	mag = mag / (n * n);
	return mag;
}

function add(accumulator, a) {
	return accumulator + a;
}

function avMag(){
	if (iter < 2000){
		return temporary_mags[temporary_mags.length -1];
	}
	return temporary_mags.slice(-1000).reduce(add, 0) / temporary_mags.slice(-1000).length;
}

function updateBoard() {
	for (i = 0; i < n; i++) {
		for (j = 0; j < n; j++) {
		if (grid[i][j] == 1) {
			document.getElementById(`t_${i}_${j}`).style.backgroundColor = "black";
		} else {
			document.getElementById(`t_${i}_${j}`).style.backgroundColor = "white";
		}
		}
	}
}

truncateDecimals = function (number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

function start(time) {
	if (time == nIters){
		t = 0;
		return;
	}
	updateOnce(0);
	iter++;
	temporary_mags.push(magnetisation());
	document.getElementById("generation").innerHTML = "Iteration: " + iter;
	document.getElementById("magnetisation").innerHTML = "Magnetization: " + truncateDecimals(avMag(),2);
	t = setTimeout(start, 10, time + 1);
}

function stop() {
	clearTimeout(t);
	t = 0;
	document.getElementById("generation").innerHTML = "Iteration: " + iter;
	document.getElementById("magnetisation").innerHTML = "Magnetization: " + truncateDecimals(avMag(),2);
}

function addToPlot(){
	if (temperatures.includes(temp) == false) {
		temperatures.push(temp);
		magnetizations.push(Math.abs(avMag()));
	}
	else {
		index = temperatures.indexOf(temp);
		magnetizations[index] = Math.abs(avMag());
	}
	plot();
}

function plot(){
	data = {
		x: temperatures,
		y: magnetizations,
		type: 'scatter',
		mode: 'markers',
		marker: {
			color: 'rgb(0, 0, 0)',
			size: 10
		}		
	};
	var layout = {
		title: 'Magnetization vs Temperature',
		xaxis: {
				title: '$T$',
			},
			yaxis: {
				title: '$|m|$',
			}
		};
	document.getElementById("graph").innerHTML = "";
	Plotly.newPlot('graph', [data], layout);
}




plot();
initialize();