const width = 600;
const height = 600;

const path = [];

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
	let image = get_image_data(this);

}
