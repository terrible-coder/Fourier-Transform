let face;

function preload() {
	face = loadImage("image\\alex-chivers.jpg");
}

function setup() {
	document
	  .getElementById("display")
	  .append(
		  createCanvas(600, 600)
		  .canvas);
	face = process_image(face);
}

function draw() {
	background(255);
	// translate(width/2, height/2);
	// scale(1, -1);
	ellipseMode(CENTER);
	imageMode(CENTER);
	// image(face, 0, 0);
	// draw_axes();
	// draw_ellipse();
	// push();
	// Epicycle.update(root);
	// Epicycle.draw(root);
	// pop();
	// trace();
	// noFill();
	// beginShape();
	for(let p of face) {
		point(Complex.real(p), Complex.imag(p));
	}
	// endShape();
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