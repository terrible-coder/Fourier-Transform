const width = 600;
const height = 600;

let path = [];

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
const context = canvas.getContext("2d");
document.getElementById("display").append(canvas);

document.getElementById("file_list").onchange = event => {
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
	console.log("image loaded");
	// preprocessing data
	let image = get_image_data(this, width, height);
	console.log("processing...");
	image = to_matrix(image);
	image = grayscale(image);
	image = binarise(image, average_brightness(image)/255);
	const boundary = outline(image).map(value => Complex.to_cartesian(value));
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, width, height);
	context.fillStyle = "#000000";
	console.log(boundary.length);
	let shortest = shortest_path(boundary);
	reduce(shortest);
	console.log(shortest);
	console.log("calculating...");
	// transforming to frequency space
	const obj = Fourier.create(shortest);
	const order = Math.floor(0.7 * obj.samples.length);
	Fourier.set_order(obj, order);
	Fourier.transform(obj);
	Fourier.create_epicycles(obj);
	const avg_ang_speed = 0.01;
	let now = 0;
	console.log("Done.");
	canvas.style.display = "inline-block";
	(function animate(time = 0) {
		const dt = (time - now) / 1000;
		now = time;
		if(!paused) {
			period += dt;
			context.resetTransform();
			context.fillStyle = "#ffffff";
			context.fillRect(0, 0, width, height);
			context.fillStyle = "#000000";
			const loop = Math.abs(avg_ang_speed / obj.root_cycle.angular_speed) | 0;
			// console.log(loop);
			for(let i = 0; i < loop; i++) {
				const end = Fourier.step(obj, dt/resolution);
				trace(Complex.real(end), Complex.imag(end));
			}
			path.forEach(point => context.fillRect(point.x, point.y, 2, 2));
			context.save();
			Fourier.draw(context, obj);
			context.restore();
		}
		requestAnimationFrame(animate);
	})();
}

function trace(x, y) {
	path.push({x: x, y: y});
}
