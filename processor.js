/**
 * Returns an object representation of RGBA value of any color.
 * @param {Number} r Red value of color.
 * @param {Number} g Green value of color.
 * @param {Number} b Blue value of color.
 * @param {Number} a Alpha value of color.
 */
const color = (r, g, b, a) => {
	return {
		red: r,
		green: g,
		blue: b,
		alpha: a || 255
	}
}

function image_type(image) {
	let max = -1;
	for(let i = 0; i < image.length; i++) {
		for(let j = 0; j < image[i].length; j++) {
			const col = image[i][j];
			if(typeof col === "object") return "rgba";
			max = Math.max(col, max);
			if(max > 1) return "gray";
		}
	}
	return "binary";
}

/**
 * 
 * @param {HTMLImageElement} image_elt The HTML Image element whose data is to be extracted.
 * @param {Number} w Width of the desired image data.
 * @param {Number} h Height of the desired image data.
 */
function get_image_data(image_elt, w, h) {
	const cnv = document.createElement("canvas");
	[cnv.width, cnv.height] = [w, h];
	const ctx = cnv.getContext("2d");
	ctx.drawImage(image_elt, 0, 0, w, h);
	return ctx.getImageData(0, 0, w, h);
}

/**
 * Converts the default one dimensional array representation of an image's data into a two dimensional array representation for ease of use.
 * @param {ImageData} image_data The default representation of the image data object.
 * @returns {color[][]} A two dimensional array representation of the image data with each element carrying the red, green and blue values of each pixel colour.
 */
function to_matrix(image_data) {
	const matrix = new Array(image_data.height).fill().map(_=> new Array(image_data.width));
	for(let i = 0; i < image_data.height; i++)
		for(let j = 0; j < image_data.width; j++) {
			const index = 4 * (i * image_data.width + j);
			matrix[i][j] = color(
				image_data.data[index+0],
				image_data.data[index+1],
				image_data.data[index+2],
				image_data.data[index+3]
				);
		}
	return matrix;
}

/**
 * @param {any[][]} image A two dimensional matrix representation of an image.
 * @returns {ImageData}
 */
function to_array(image) {
	const imageData = new ImageData(image[0].length, image.length);
	const type = image_type(image);
	let k = 0;
	for(let i = 0; i < image.length; i++)
		for(let j = 0; j < image[i].length; j++)
			if(type === "rgba") {
				imageData.data[k++] = image[i][j].red;
				imageData.data[k++] = image[i][j].green;
				imageData.data[k++] = image[i][j].blue;
				imageData.data[k++] = image[i][j].alpha;
			}
			else if(type === "gray") {
				imageData.data[k++] = image[i][j];
				imageData.data[k++] = image[i][j];
				imageData.data[k++] = image[i][j];
				imageData.data[k++] = 255;
			}
			else if(type === "binary") {
				const value = !!(image[i][j])? 255: 0;
				imageData.data[k++] = value;
				imageData.data[k++] = value;
				imageData.data[k++] = value;
				imageData.data[k++] = 255;
			}
	return imageData;
}


/**
 * Takes the RGB value and returns its corresponding grayscale value. The numbers must lie between 0 and 255.
 * @param {Number} red Red value.
 * @param {Number} green Blue value.
 * @param {Number} blue Blue value.
 */
function gray(red, green, blue) {
	if(arguments.length == 1)
		({red, green, blue} = arguments[0]);
	return Math.round(0.30*red + 0.59*green + 0.11*blue);
}

/**
 * Turns the image into a gray scale image.
 * @param {color[][]} image 
 */
function grayscale(image) {
	const newImg = new Array(image.length).fill().map((_, i) => new Array(image[i].length));
	for(let i = 0; i < image.length; i++)
		for(let j = 0; j < image[i].length; j++)
			newImg[i][j] = gray(image[i][j]);
	return newImg;
}

/**
 * Turns the image into a binary image (a pixel is either black or white).
 * @param {color[][]} image 
 * @param {number} threshold
 */
function binarise(image, threshold = 0.5) {
	const grayed = image_type(image) === "gray";
	const newImg = new Array(image.length).fill().map((_, i) => new Array(image[i].length));
	for(let i = 0; i < image.length; i++)
		for(let j = 0; j < image[i].length; j++) {
			const value = grayed? image[i][j]: gray(image[i][j]);
			newImg[i][j] = value > threshold*256? 1: 0;
		}
	return newImg;
}

/**
 * Checks through every pixels and guesses whether a pixel is part of a boundary or not.
 * @param {any[][]} image The matrix representation of an image.
 * @returns {Complex[]} The list of points which form an outline represented as complex numbers.
 */
function outline(image) {
	const list = [];
	if(image_type(image) !== "binary")
		image = binarise(image);
	for(let i = 1; i < image.length-1; i++) {
		for(let j = 1; j < image[i].length-1; j++) {
			if(image[i][j] == 0)
				continue;
			for(let i1 = -1; i1 <= 1; i1++) {
				for(let j1 = -1; j1 <= 1; j1++) {
					if(image[i+i1] && image[i+i1][j+j1] === 0) {
						list.push(Complex.from_cartesian(j, i));
						i1 = j1 = 10;
					}
				}
			}
		}
	}
	return list;
}

function average_brightness(image) {
	let sum = 0;
	for(let i = 0; i < image.length; i++)
		for(let j = 0; j < image[i].length; j++)
			sum += image[i][j];
	return sum / (image.length*image[0].length);
}