var canvas = document.getElementsByTagName('canvas')[0];
canvas.width = 320;
canvas.height = 100;
canvas.style.width = "" + (canvas.width * 2) + "px";
canvas.style.imageRendering = "pixelated";
var context = canvas.getContext('2d');

var screen1Canvas = document.createElement("canvas");
screen1Canvas.width = 96;
screen1Canvas.height = 96;
screen1Context = screen1Canvas.getContext("2d");

var screen2Canvas = document.createElement("canvas");
screen2Canvas.width = 96;
screen2Canvas.height = 96;
screen2Context = screen2Canvas.getContext("2d");

var screen3Canvas = document.createElement("canvas");
screen3Canvas.width = 96;
screen3Canvas.height = 96;
screen3Context = screen3Canvas.getContext("2d");

// The end segments for the line segment representing the "wall"
var vx1 = 70;
var vy1 = 20;
var vx2 = 70;
var vy2 = 70;

// The coordinates of the player
var px = 50;
var py = 50;
var angle = 0;

// Capture keyboard input
var INPUT = { LEFT: false, UP: false, RIGHT: false, DOWN: false };
window.addEventListener('keydown', function(ev) {
	if(ev.keyCode === 37) { INPUT.LEFT = true; }
	else if(ev.keyCode === 38) { INPUT.UP = true; }
	else if(ev.keyCode === 39) { INPUT.RIGHT = true; }
	else if(ev.keyCode === 40) { INPUT.DOWN = true; }
});
window.addEventListener('keyup', function(ev) {
	if(ev.keyCode === 37) { INPUT.LEFT = false; }
	else if(ev.keyCode === 38) { INPUT.UP = false; }
	else if(ev.keyCode === 39) { INPUT.RIGHT = false; }
	else if(ev.keyCode === 40) { INPUT.DOWN = false; }
});

// Define game loop
var gameLoop = function() {
	requestAnimationFrame(gameLoop);

	// Move player
	if(INPUT.LEFT && !INPUT.RIGHT) {
		angle -= 0.1;
	} else if(INPUT.RIGHT && !INPUT.LEFT) {
		angle += 0.1;
	}
	if(INPUT.UP && !INPUT.DOWN) {
		px += Math.cos(angle);
		py += Math.sin(angle);
	} else if(INPUT.DOWN && !INPUT.UP) {
		px -= Math.cos(angle);
		py -= Math.sin(angle);
	}

	// Erase everything on the canvas
	context.clearRect(0, 0, canvas.width, canvas.height);
	screen1Context.clearRect(0, 0, screen1Canvas.width, screen1Canvas.height);
	screen2Context.clearRect(0, 0, screen2Canvas.width, screen2Canvas.height);
	screen3Context.clearRect(0, 0, screen3Canvas.width, screen3Canvas.height);


	// Draw the absolute map
	screen1Context.beginPath();
	screen1Context.moveTo(vx1, vy1);
	screen1Context.lineTo(vx2, vy2);
	screen1Context.stroke();

	screen1Context.beginPath();
	screen1Context.moveTo(px, py);
	screen1Context.lineTo(px + Math.cos(angle) * 5, py + Math.sin(angle) * 5);
	screen1Context.stroke();

	context.drawImage(screen1Canvas, 4, 4);
	context.strokeRect(4, 4, screen1Canvas.width, screen1Canvas.height);


	// Draw the transformed map

	// Transform the vertexes relative to the player
	var tx1 = vx1 - px;
	var ty1 = vy1 - py;
	var tx2 = vx2 - px;
	var ty2 = vy2 - py;
	// Rotate them around the player's view
	var tz1 = tx1 * Math.cos(angle) + ty1 * Math.sin(angle);
	var tz2 = tx2 * Math.cos(angle) + ty2 * Math.sin(angle);
	tx1 = tx1 * Math.sin(angle) - ty1 * Math.cos(angle);
	tx2 = tx2 * Math.sin(angle) - ty2 * Math.cos(angle);

	screen2Context.beginPath();
	screen2Context.moveTo(50 - tx1, 50 - tz1);
	screen2Context.lineTo(50 - tx2, 50 - tz2);
	screen2Context.stroke();

	screen2Context.beginPath();
	screen2Context.moveTo(50, 50);
	screen2Context.lineTo(50, 50 + 5);
	screen2Context.stroke();

	context.drawImage(screen2Canvas, 105, 4);
	context.strokeRect(105, 4, screen2Canvas.width, screen2Canvas.height);


	// Draw the perspective-transformed map
	if(tz1 > 0 || tz2 > 0) {
		// If the line crosses the player's viewplane, clip it.
		var i1 = intersect(tx1,tz1, tx2,tz2, -0.0001,0.0001, -20,5);
		var i2 = intersect(tx1,tz1, tx2,tz2,  0.0001,0.0001,  20,5);
		if(tz1 <= 0) {
			if(i1.y > 0) {
				tx1 = i1.x;
				tz1 = i1.y;
			} else {
				tx1 = i2.x;
				tz1 = i2.y;
			}
		}
		if(tz2 <= 0) {
			if(i1.y > 0) {
				tx2 = i1.x;
				tz2 = i1.y;
			} else {
				tx2 = i2.x;
				tz2 = i2.y;
			}
		}

		var x1 = -tx1 * 16 / tz1;
		var y1a = -50 / tz1;
		var y1b = 50 / tz1;
		var x2 = -tx2 * 16 / tz2;
		var y2a = -50 / tz2;
		var y2b = 50 / tz2;

		// Top
		screen3Context.beginPath();
		screen3Context.moveTo(50 + x1, 50 + y1a);
		screen3Context.lineTo(50 + x2, 50 + y2a);
		screen3Context.stroke();
		// Bottom
		screen3Context.beginPath();
		screen3Context.moveTo(50 + x1, 50 + y1b);
		screen3Context.lineTo(50 + x2, 50 + y2b);
		screen3Context.stroke();
		// Left
		screen3Context.beginPath();
		screen3Context.moveTo(50 + x1, 50 + y1a);
		screen3Context.lineTo(50 + x1, 50 + y1b);
		screen3Context.stroke();
		// Right
		screen3Context.beginPath();
		screen3Context.moveTo(50 + x2, 50 + y2a);
		screen3Context.lineTo(50 + x2, 50 + y2b);
		screen3Context.stroke();

	}
	context.drawImage(screen3Canvas, 205, 4);
	context.strokeRect(205, 4, screen3Canvas.width, screen3Canvas.height);
};

// Start game loop
gameLoop();

function cross(x1, y1, x2, y2) {
	return x1 * y2 - y1 * x2;
}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
	var x = cross(x1, y1, x2, y2);
	var y = cross(x3, y3, x4, y4);
	var det = cross(x1 - x2, y1 - y2, x3 - x4, y3 - y4);
	x = cross(x, x1 - x2, y, x3 - x4) / det;
	y = cross(x, y1 - y2, y, y3 - y4) / det;
	return { x: x, y: y };
}