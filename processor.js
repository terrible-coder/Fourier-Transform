function process_image(img) {
	img.resize(width, height);
	// img.filter(GRAY);
	img.filter(BLUR, 2);
	img.filter(THRESHOLD, 0.5);
	return outline(to_binary_matrix(img));
	// return img;
}

function get_neighbours(array, i, j) {
	const neighbours = [];
	for(let i1 = -1; i1 <= 1; i1++) {
		for(let j1 = -1; j1 <= 1; j1++) {
			// console.log(i+i1, j+j1);
			// console.log(array[i+i1][j+j1])
			if(i1 !== 0 && j1 !== 0)
				neighbours.push(array[i+i1][j+j1]);
		}
	}
	return neighbours;
}

function to_binary_matrix(img) {
	img.loadPixels();
	const matrix = [];
	for(let i = 0; i < img.height; i++) {
		const row = [];
		for(let j = 0; j < img.width; j++) {
			const index = 4 * (img.width * i + j);
			if(img.pixels[index] === 0 &&
				img.pixels[index+1] === 0 &&
				img.pixels[index+2] === 0) {
					row.push(0);
			}
			else row.push(1);
		}
		matrix.push(row);
	}
	return matrix;
}

function outline(array) {
	const BLACK = 0;
	const WHITE = 1;
	const boundary = [];
	const rows = array.length;
	const cols = array[0].length;
	for(let i = 1; i < rows - 1; i++) {
		for(let j = 1; j < cols - 1; j++) {
			const value = array[i][j];
			if(value !== BLACK)
				continue;
			const neighbours = get_neighbours(array, i, j);
			if(neighbours.includes(WHITE))
				boundary.push(Complex.from_cartesian(j, i));			
		}
	}
	console.log(boundary);
	return boundary;
}