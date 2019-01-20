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
 * Computes the complex Fourier coefficients of the given fourier object. Discretely integrates from -order to +order analogous to the continuous integration from -infinity to +infinity.
 * @param {Fourier} fourier
 */
Fourier.transform = fourier => {
	const w = Complex.from_polar(1, -2*Math.PI/fourier.total_points);
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

/**
 * Creates the corresponding epicycles to ultimately draw out the list of points
 * @param {Fourier} fourier
 */
Fourier.create_epicycles = fourier => {
	// creating epicycles
	const cycles = [];
	for(let k = 0; k < fourier.coeffs.length; k++) {
		const freq = (2 * Math.PI * (k - fourier.order)) / fourier.total_points;
		const epi = Epicycle.create(fourier.coeffs[k], freq);
		cycles.push(epi);
	}
	cycles.sort((a, b) => {
		return Complex.amp(b.coeff) - Complex.amp(a.coeff);
	})
	// appending cyclic motions
	for(let k = 1; k < cycles.length; k++)
		Epicycle.add_child(cycles[k-1], cycles[k]);
	fourier.root_cycle = cycles[0];
	console.log(fourier.root_cycle);
}

/**
 * Moves every epicycle forward in time by dt.
 * @param {Fourier} fourier
 * @param {Number} dt Time step.
 */
Fourier.step = (fourier, dt) => {
	let current = fourier.root_cycle, sum = Complex.from_cartesian(0, 0);
	while(current !== null) {
		sum = Complex.add(sum, Epicycle.update(current, dt));
		current = current.child;
	}
	return sum;
}

/**
 * @param {CanvasRenderingContext2D} context
 * @param {Fourier} fourier
 */
Fourier.draw = (context, fourier) => {
	let current = fourier.root_cycle;
	while(current !== null) {
		Epicycle.draw(context, current);
		current = current.child;
	}
}

Fourier.reset = fourier => {
	let current = fourier.root_cycle;
	while(current !== null) {
		current.point = Complex.copy(current.coeff);
		current = current.child;
	}
}