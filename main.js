const width = 600;
const height = 600;
let speed = 1;
let path = [];
let first = true;

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
	const image_file = this;
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
	// console.log(boundary.length);
	let array_shortest = shortest_path(boundary);
	array_shortest.forEach(short => reduce(short));
	reduce(array_shortest);
	array_shortest.sort((listA, listB) => listB.length - listA.length);
	console.log(array_shortest);
	console.log("calculating...");
	// transforming to frequency space
	const fouriers = array_shortest.map(short => {
		const origin = mean(short);
		const list = offset(short, origin);
		const obj = Fourier.create(list);
		const order = Math.floor(0.7 * obj.samples.length);
		Fourier.set_order(obj, order);
		Fourier.transform(obj);
		Fourier.create_epicycles(obj);
		return {
			origin: origin,
			fourier: obj
		}
	});
	console.log(fouriers);
	const avg_ang_speed = 0.01;
	const resolution = document.getElementById("res").value;
	let due = 1;
	let done = false;
	let i = 0, count = 0;
	let angle = 0;
	let now = 0;
	console.log("Done.");
	canvas.style.display = "inline-block";
	function animate(time = 0) {
		const dt = 1/4; //(time - now) / 1000;
		now = time;
		if(!paused && !stopped) {
			clear();
			if(angle > 2*Math.PI) {
				angle = 0;
				if(i === fouriers.length - 1) {
					done = true;
					count++;
					i = 0;
				} else {
					i++;
				}
			}
			if(count >= 2) {
				path = [];
				count = 0;
				done = false;
			}
			if(done) {
				document.getElementById("uploader").style.display = "block";
			}
			const obj = fouriers[i].fourier;
			const origin = fouriers[i].origin;
			context.fillStyle = "#000000";
			context.globalAlpha = 0.2;
			context.drawImage(image_file, 0, 0, width, height);
			context.globalAlpha = 0.7;
			path.forEach(point => context.fillRect(point.x, point.y, 2, 2));
			context.translate(Complex.real(origin), Complex.imag(origin));
			draw_axes();
			let loop = Math.abs((due * avg_ang_speed) / obj.root_cycle.angular_speed) | 0;
			due = (loop === 0)? due+1: 1;
			angle += Math.abs(speed * loop * obj.root_cycle.angular_speed * dt);
			const iterations = loop * resolution * speed;
			const time_step = dt/resolution;
			for(let i = 0; i < iterations; i++) {
				const end = Fourier.step(obj, time_step);
				const abs = Complex.add(end, origin);
				if(!done)
					trace(Complex.real(abs), Complex.imag(abs));
			}
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
		fouriers.forEach(obj => {
			obj.fourier.root_cycle = null;
			Fourier.create_epicycles(obj.fourier);
		});
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
		if(Complex.amp(d) >= 1)
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

function begin() {
	const img = new Image();
	img.onload = image_loaded;
	img.src = "us.jpg";
}