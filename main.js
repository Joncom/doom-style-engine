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
	(ev.keyCode === 37) && (INPUT.LEFT = true);
	(ev.keyCode === 38) && (INPUT.UP = true);
	(ev.keyCode === 39) && (INPUT.RIGHT = true);
	(ev.keyCode === 40) && (INPUT.DOWN = true);
});
window.addEventListener('keyup', function(ev) {
	(ev.keyCode === 37) && (INPUT.LEFT = false);
	(ev.keyCode === 38) && (INPUT.UP = false);
	(ev.keyCode === 39) && (INPUT.RIGHT = false);
	(ev.keyCode === 40) && (INPUT.DOWN = false);
});

// Define game loop
var gameLoop = function() {
	requestAnimationFrame(gameLoop);

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

	if(INPUT.UP && !INPUT.DOWN) {
		px += Math.cos(angle);
		py += Math.sin(angle);
	} else if(INPUT.DOWN && !INPUT.UP) {
		px -= Math.cos(angle);
		py -= Math.sin(angle);
	}
	if(INPUT.LEFT && !INPUT.RIGHT) {
		angle -= 0.1;
	} else if(INPUT.RIGHT && !INPUT.LEFT) {
		angle += 0.1;
	}
};

// Start game loop
gameLoop();