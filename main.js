const path = [];
let obj;

function setup() {
	document
	  .getElementById("display")
	  .append(
		  createCanvas(600, 600)
		  .canvas);
	obj = Fourier.create(list);
	Fourier.set_order(obj, 15);
	Fourier.transform(obj);
	Fourier.create_epicycles(obj);
}

function draw() {
	background(255);
	ellipseMode(CENTER);
	translate(width/2, height/2);
	scale(1, -1);
	for(let c = 0; c < N/2; c++) {
		push();
		Epicycle.update(obj.root_cycle);
		pop();
		trace(obj);
	}
	draw_axes();
	draw_ellipse();
	push();
	Epicycle.draw(obj.root_cycle);
	pop();
	draw_path();
}

function draw_path() {
	const limit = 15000;
	if(path.length > limit)	path.splice(limit);
	noFill();
	stroke(0, 255, 0);
	beginShape();
	for(let p of path) {
		vertex(Complex.real(p), Complex.imag(p));
	}
	endShape();
}

function trace(fourier) {
	let x = 0;
	let y = 0;
	let current = fourier.root_cycle;
	while(current) {
		x += Complex.real(current.point);
		y += Complex.imag(current.point);
		current = current.child;
	}
	path.push(Complex.from_cartesian(x, y));
}

function draw_ellipse() {
	noFill();
	stroke(0);
	// beginShape();
	for(let p of list) {
		point(Complex.real(p), Complex.imag(p));
	}
	// endShape(CLOSE);
}

function draw_axes() {
	stroke(0);
	strokeWeight(1);
	line(-width/2, 0, width/2, 0);
	line(0, -height/2, 0, height/2);
}