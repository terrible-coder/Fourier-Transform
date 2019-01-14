const cycle = Epicycle.create({r: 0, t: 0}, 0);
const path = [];

function setup() {
	document
	  .getElementById("display")
	  .append(
		  createCanvas(600, 600)
		  .canvas);
	// const cycle2 = Epicycle.create({r: 82, t: 0}, (2/3)*PI);
	// const cycle3 = Epicycle.create({r: 18, t: 0}, (4/3)*PI);
	// Epicycle.add_child(cycle2, cycle3);
	// Epicycle.add_child(cycle, cycle2);
	// create();
}

function draw() {
	background(255);
	translate(width/2, height/2);
	scale(1, -1);
	// scale(0.5, 0.5);
	ellipseMode(CENTER);
	draw_axes();
	draw_ellipse();
	push();
	Epicycle.update(root);
	Epicycle.draw(root);
	pop();
	trace();
	noFill();
	beginShape();
	for(let p of path) {
		vertex(Complex.real(p), Complex.imag(p));
	}
	endShape();
	// Epicycle.update(cycle);
	// Epicycle.draw(cycle);
}

function trace() {
	let x = 0;
	let y = 0;
	let current = root;
	while(current) {
		x += Complex.real(current.point);
		y += Complex.imag(current.point);
		current = current.child;
	}
	path.push(Complex.from_cartesian(x, y));
}

function draw_ellipse() {
	noFill();
	beginShape();
	for(let p of list) {
		vertex(Complex.real(p), Complex.imag(p));
	}
	endShape(CLOSE);
}

function draw_axes() {
	strokeWeight(1);
	line(-width/2, 0, width/2, 0);
	line(0, -height/2, 0, height/2);
}