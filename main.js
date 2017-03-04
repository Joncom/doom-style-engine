var canvas = document.getElementsByTagName('canvas')[0];
canvas.width = 640;
canvas.height = 480;
var context = canvas.getContext('2d');

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

	// Draw the absolute map
	context.strokeRect(4,4,96,96);

	context.beginPath();
	context.moveTo(vx1, vy1);
	context.lineTo(vx2, vy2);
	context.stroke();

	context.beginPath();
	context.moveTo(px, py);
	context.lineTo(px + Math.cos(angle) * 5, py + Math.sin(angle) * 5);
	context.stroke();

	// Draw the transformed map
	context.strokeRect(105,4,96,96);

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

	context.beginPath();
	context.moveTo(150 - tx1, 50 - tz1);
	context.lineTo(150 - tx2, 50 - tz2);
	context.stroke();

	context.beginPath();
	context.moveTo(150, 50);
	context.lineTo(150, 50 + 5);
	context.stroke();
};

// Start game loop
gameLoop();