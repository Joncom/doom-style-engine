var canvas = document.getElementsByTagName('canvas')[0];
canvas.width = 320;
canvas.height = 104;
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
var walls = [
	{ x1: 70, y1: 20, x2: 70, y2: 70 }
];

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
	walls.forEach((wall) => {
		screen1Context.beginPath();
		screen1Context.moveTo(wall.x1, wall.y1);
		screen1Context.lineTo(wall.x2, wall.y2);
		screen1Context.stroke();
	});

	screen1Context.beginPath();
	screen1Context.moveTo(px, py);
	screen1Context.lineTo(px + Math.cos(angle) * 5, py + Math.sin(angle) * 5);
	screen1Context.stroke();

	context.drawImage(screen1Canvas, 4, 4);

	context.strokeStyle = "#1f00bb";
	context.strokeRect(4, 4, screen1Canvas.width, screen1Canvas.height);


	// Draw the transformed map

	walls.forEach((wall) => {
		// Transform the vertexes relative to the player
		var dx1 = wall.x1 - px;
		var dy1 = wall.y1 - py;
		var dx2 = wall.x2 - px;
		var dy2 = wall.y2 - py;
		// Rotate them around the player's view
		wall.ty1 = dx1 * Math.cos(angle) + dy1 * Math.sin(angle);
		wall.ty2 = dx2 * Math.cos(angle) + dy2 * Math.sin(angle);
		wall.tx1 = dx1 * Math.sin(angle) - dy1 * Math.cos(angle);
		wall.tx2 = dx2 * Math.sin(angle) - dy2 * Math.cos(angle);

		screen2Context.beginPath();
		screen2Context.moveTo(50 - wall.tx1, 50 - wall.ty1);
		screen2Context.lineTo(50 - wall.tx2, 50 - wall.ty2);
		screen2Context.stroke();
	});

	screen2Context.beginPath();
	screen2Context.moveTo(50, 50);
	screen2Context.lineTo(50, 50 - 5);
	screen2Context.stroke();

	context.drawImage(screen2Canvas, 105, 4);

	context.strokeStyle = "#00bb00";
	context.strokeRect(105, 4, screen2Canvas.width, screen2Canvas.height);


	// Draw the perspective-transformed map
	walls.forEach((wall) => {
		if(wall.ty1 > 0 || wall.ty2 > 0) {
			// If the line crosses the player's viewplane, clip it.
			var i1 = intersect(wall.tx1,wall.ty1, wall.tx2,wall.ty2, -0.0001,0.0001, -20,5);
			var i2 = intersect(wall.tx1,wall.ty1, wall.tx2,wall.ty2,  0.0001,0.0001,  20,5);
			if(wall.ty1 <= 0) {
				if(i1.y > 0) {
					wall.tx1 = i1.x;
					wall.ty1 = i1.y;
				} else {
					wall.tx1 = i2.x;
					wall.ty1 = i2.y;
				}
			}
			if(wall.ty2 <= 0) {
				if(i1.y > 0) {
					wall.tx2 = i1.x;
					wall.ty2 = i1.y;
				} else {
					wall.tx2 = i2.x;
					wall.ty2 = i2.y;
				}
			}

			var x1 = -wall.tx1 * 16 / wall.ty1;
			var y1a = -50 / wall.ty1;
			var y1b = 50 / wall.ty1;
			var x2 = -wall.tx2 * 16 / wall.ty2;
			var y2a = -50 / wall.ty2;
			var y2b = 50 / wall.ty2;

			for(var x = x1; x < x2; x++) {
				var ya = y1a + (x - x1) * (y2a - y1a) / (x2 - x1);
				var yb = y1b + (x - x1) * (y2b - y1b) / (x2 - x1);

				// Fill ceiling
				screen3Context.strokeStyle = "#636363";
				screen3Context.beginPath();
				screen3Context.moveTo(50 + x, 0);
				screen3Context.lineTo(50 + x, 50 + -ya);
				screen3Context.stroke();

				// Fill floor
				screen3Context.strokeStyle = "#1f00bb";
				screen3Context.beginPath();
				screen3Context.moveTo(50 + x, 50 + yb);
				screen3Context.lineTo(50 + x, 50 + 140);
				screen3Context.stroke();

				// Fill wall
				screen3Context.strokeStyle = "#fbff34";
				screen3Context.beginPath();
				screen3Context.moveTo(50 + x, 50 + ya);
				screen3Context.lineTo(50 + x, 50 + yb);
				screen3Context.stroke();
			}

			// Wall stroke
			screen3Context.strokeStyle = "#bb6000";
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
	});

	context.drawImage(screen3Canvas, 205, 4);

	context.strokeStyle = "#00b1af";
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