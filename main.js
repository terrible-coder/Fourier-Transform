function setup() {
	document
	  .getElementById("display")
	  .append(
		  createCanvas(600, 600)
		  .canvas);
}

function draw() {
	background(255);
	translate(width/2, height/2);
	scale(1, -1);
	draw_axes();
}

function draw_axes() {
	strokeWeight(1);
	line(-width/2, 0, width/2, 0);
	line(0, -height/2, 0, height/2);
}