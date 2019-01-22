const width = 600;
const height = 600;
let speed = 1;
let path = [];

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
const context = canvas.getContext("2d");
document.getElementById("display").append(canvas);
canvas.style.display = "none";

let paused = false;
let stopped = true;

document.getElementById("file_list").onchange = event => {
	document.getElementById("loading").style.display = "block";
	canvas.style.display = "none";
	const file = event.target.files[0];
	if(!file.type.match("image.*"))
		throw "File must be an image file."
	const reader = new FileReader();
	reader.onload = (f => {
		return evt => {
			const image = new Image();
			image.onload = image_loaded;
			image.src = evt.target.result;
		}
	})(file);
	reader.readAsDataURL(file);
}

function image_loaded() {
	document.getElementById("loading").style.display = "none";
	document.getElementById("popup").style.display = "none";
	document.getElementById("uploader").style.display = "none";
	document.getElementById("app").style.display = "block";
	console.log("image loaded");
	// preprocessing data
	let image = get_image_data(this, width, height);
	console.log("processing...");
	image = to_matrix(image);
	image = grayscale(image);
	image = binarise(image, otsu(image)/255);
	const boundary = outline(image).map(value => Complex.to_cartesian(value));
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, width, height);
	context.fillStyle = "#000000";
	console.log(boundary.length);
	let shortest = shortest_path(boundary);
	reduce(shortest);
	const origin = mean(shortest);
	shortest = offset(shortest, origin);
	console.log(shortest);
	console.log("calculating...");
	// transforming to frequency space
	const obj = Fourier.create(shortest);
	const order = Math.floor(0.7 * obj.samples.length);
	Fourier.set_order(obj, order);
	Fourier.transform(obj);
	Fourier.create_epicycles(obj);
	const avg_ang_speed = 0.01;
	let angle = 0;
	let now = 0;
	console.log("Done.");
	canvas.style.display = "inline-block";
	function animate(time = 0) {
		const resolution = document.getElementById("res").value;
		const dt = 1/25; //(time - now) / 1000;
		now = time;
		if(!paused && !stopped) {
			clear();
			context.translate(Complex.real(origin), Complex.imag(origin));
			context.fillStyle = "#000000";
			draw_axes();
			if(angle > 4*Math.PI) {
				angle = 0;
				path = [];
			}
			if(angle > Math.PI) {
				document.getElementById("uploader").style.display = "block";
			}
			const loop = Math.abs(avg_ang_speed / obj.root_cycle.angular_speed) | 0;
			angle += Math.abs(speed * loop * obj.root_cycle.angular_speed * dt);
			const iterations = loop * resolution * speed;
			const time_step = dt/resolution;
			for(let i = 0; i < iterations; i++) {
				const end = Fourier.step(obj, time_step);
				trace(Complex.real(end), Complex.imag(end));
			}
			path.forEach(point => context.fillRect(point.x, point.y, 2, 2));
			context.globalAlpha = 0.2;
			context.save();
			Fourier.draw(context, obj);
			context.restore();
		}
		if(!stopped)
			requestAnimationFrame(animate);
	}

	function reset() {
		now = 0;
		angle = 0;
		speed = 1;
		document.getElementById("multiplier").innerHTML = speed;
		path = [];
		clear();
		draw_axes();
		context.resetTransform();
		context.globalAlpha = 1.0;
		context.fillStyle = "#000";
		context.strokeStyle = "#000";
		obj.root_cycle = null;
		Fourier.create_epicycles(obj);
	}

	document.getElementById("startstop").onclick = function() {
		stopped = !stopped;
		if(!stopped) {
			this.innerHTML = "Stop";
			document.getElementById("player").style.display = "block";
			animate();
		} else {
			this.innerHTML = "Start";
			document.getElementById("player").style.display = "none";
			reset();
		}
	}
}

function trace(x, y) {
	if(path.length === 0)
		path.push({x: x, y: y});
	else{
		const d = Complex.sub(path[path.length-1], {x: x, y: y})
		if(Complex.amp(d) >= 2)
			path.push({x: x, y: y});
	}
}

function draw_axes() {
	const line = new Path2D();
	line.moveTo(0, -height);
	line.lineTo(0, height);
	line.moveTo(width, 0);
	line.lineTo(-width, 0);
	context.stroke(line);
}

function clear() {
	context.resetTransform();
	context.fillStyle = "#ffffff";
	context.globalAlpha = 1.0;
	context.fillRect(0, 0, width, height);
}