const cycle = Epicycle.create({r: 100, t: 0}, 1);

function setup() {
	document
	  .getElementById("display")
	  .append(
		  createCanvas(600, 600)
		  .canvas);
	const cycle2 = Epicycle.create({r: 50, t: Math.PI/3}, -5);
	Epicycle.add_child(cycle, cycle2);
}

function draw() {
	background(255);
	translate(width/2, height/2);
	scale(1, -1);
	ellipseMode(CENTER);
	draw_axes();
	Epicycle.update(cycle);
	Epicycle.draw(cycle);
}

function draw_axes() {
	strokeWeight(1);
	line(-width/2, 0, width/2, 0);
	line(0, -height/2, 0, height/2);
}