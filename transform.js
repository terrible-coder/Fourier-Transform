const list = [];
const a = 15*15;
const b = 10*10;

const N = 30;
let t = 0;
for(let k = 0; k < N; k++) {
	list.push(Complex.from_cartesian(a*Math.cos(t)+50*Math.random(), b*Math.sin(t)+50*Math.random()));
	t += 2*Math.PI/N;
}
console.log(list);

// transforming
const w = Complex.from_polar(1, -2*Math.PI/N);
console.log(w);
// calculating coefficients
const coeffs = [];
for(let k = 0; k < N; k++) {
	let sum = Complex.from_cartesian(0, 0)
	for(let n = 0; n < N; n++) {
		const elt = Complex.pow(w, n*k);
		sum = Complex.add(sum, Complex.mul(elt, list[n]));
	}
	coeffs.push(Complex.to_cartesian(Complex.div(sum, N)));
}
// creating epicycles
const cycles = [];
for(let k = 0; k < coeffs.length; k++) {
	const epi = Epicycle.create(coeffs[k], (2*Math.PI*k)/N);
	cycles.push(epi);
}
// appending cyclic motions
const root = cycles[0];
for(let k = 1; k < cycles.length; k++) {
	Epicycle.add_child(cycles[k-1], cycles[k]);
}
console.log(cycles);
