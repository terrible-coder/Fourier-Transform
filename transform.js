const list = [];
const a = 15*15;
const b = 10*10;

const N = 200;
let t = 0;
for(let k = 0; k < N; k++) {
	list.push(Complex.from_cartesian(a*Math.cos(t)+10*Math.random(), b*Math.sin(t)+10*Math.random()));
	t += 2*Math.PI/N;
}
console.log(list);

const Fourier = {};

/**
 * Creates a fourier object which handles the entire Fourier transform process.
 * @param {Complex[]} list
 * @returns {Fourier}
 */
Fourier.create = list => {
	return {
		samples: list.slice(),
		total_points: list.length,
		order: undefined,
		coeffs: undefined,
		root_cycle: null
	}
}

/**
 * @param {Fourier} fourier
 * @param {Number} order
 */
Fourier.set_order = (fourier, order) => {fourier.order = order};

/**
 * @param {Fourier} fourier
 */
Fourier.transform = fourier => {
	const w = Complex.from_polar(1, -2*Math.PI/fourier.total_points);
	console.log(w);
	// calculating coefficients
	fourier.coeffs = [];
	for(let k = -fourier.order; k <= fourier.order; k++) {
		let sum = Complex.from_cartesian(0, 0);
		for(let n = 0; n < fourier.total_points; n++) {
			const elt = Complex.pow(w, n*k);
			const term = Complex.mul(elt, fourier.samples[n]);
			sum = Complex.add(sum, term);
		}
		sum = Complex.div(sum, fourier.total_points);
		fourier.coeffs.push(Complex.to_cartesian(sum));
	}
}

Fourier.create_epicycles = fourier => {
	// creating epicycles
	const cycles = [];
	for(let k = 0; k < fourier.coeffs.length; k++) {
		const freq = (2 * Math.PI * (k - fourier.order)) / fourier.total_points;
		const epi = Epicycle.create(fourier.coeffs[k], freq);
		cycles.push(epi);
	}
	// appending cyclic motions
	for(let k = 1; k < cycles.length; k++) {
		Epicycle.add_child(cycles[k-1], cycles[k]);
	}
	fourier.root_cycle = cycles[0];
	console.log(fourier.root_cycle);
}