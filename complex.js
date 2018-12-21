const Complex = {};

/**
 * Creates a representation of a complex number in the Argand (complex) plane based on its magnitude and angle made with the positive direction of the real axis.
 * @param {Number} r Magnituge of the complex number.
 * @param {Number} theta Angle made by the line joining the number to the origin with the positive real axis.
 * @returns {Complex} A new complex number.
 */
Complex.from_polar = (r, theta) => {
	return {r: r, t: theta};
}

/**
 * Creates a representation of a complex number in the Argand (complex) plane based on its real and imaginary components.
 * @param {Number} x The real part of the complex number.
 * @param {Number} y The imaginary part of the complex number.
 * @returns {Complex} A new complex number.
 */
Complex.from_cartesian = (x, y) => {
	return {x: x, y: y};
}

const i = Complex.from_cartesian(0, 1);

/**
 * Creates an exact copy of the given complex number.
 * @param {Complex} z
 * @returns {Complex} Copy of the parameter z.
 */
Complex.copy = z => Complex.in_polar(z)? Complex.from_polar(z.r, z.t) : Complex.in_cartesian(z)? Complex.from_cartesian(z.x, z.y): null;

/**
 * Converts the complex number to its polar representation.
 * @param {Complex} z
 * @returns {Complex} Polar representation of the given complex number.
 */
Complex.to_polar = z => {
	if(typeof z == typeof 1)
		return Complex.from_polar(z, 0);
	if(Complex.in_cartesian(z))
		return {
			r: Math.sqrt(z.x*z.x + z.y*z.y),
			t: Math.atan2(z.y, z.x)
		};
	return Complex.copy(z);
}

/**
 * Converts the complex number to its cartesian representation.
 * @param {Complex} z
 * @returns {Complex} Cartesian representation of the given complex number.
 */
Complex.to_cartesian = z => {
	if(typeof z == typeof 1)
		return Complex.from_cartesian(z, 0);
	if(Complex.in_polar(z))
		return {
			x: z.r * Math.cos(z.t),
			y: z.r * Math.sin(z.t)
		}
	return Complex.copy(z);
}

/**
 * Checks whether the complex number is in the polar form.
 * @param {Complex} z The expression to check for.
 */
Complex.in_polar = z => z.r !== undefined && z.t !== undefined;

/**
 * Checks whether the complex number is in the cartesian form.
 * @param {Complex} z The expression to check for.
 */
Complex.in_cartesian = z => z.x !== undefined && z.y !== undefined;

/**
 * @param {Complex} z
 * @returns {Number} The real component of the complex number.
 */
Complex.real = z => Complex.in_cartesian(z)? z.x : Complex.to_cartesian(z).x;

/**
 * @param {Complex} z
 * @returns {Number} The imaginary component of the complex number.
 */
Complex.imag = z => Complex.in_cartesian(z)? z.y : Complex.to_cartesian(z).y;

/**
 * @param {Complex} z
 * @returns The complex conjugate of the number z.
 */
Complex.conj = z => Complex.from_cartesian(Complex.real(z), -Complex.imag(z));

/**
 * @param {Complex} z
 * @returns {Number} The magnitude of the complex number.
 */
Complex.amp = z => Complex.in_polar(z)? z.r : Complex.to_polar(z).r;

/**
 * @param {Complex} z
 * @returns {Number} The angle made by the complex number with the positive direction of the real axis.
 */
Complex.arg = z => Complex.in_polar(z)? z.t : Complex.to_polar(z).t;

/**
 * Checks whether the numbers are equal or not.
 * @param {Complex} a
 * @param {Complex} b
 */
Complex.equals = (a, b) => Complex.real(a) == Complex.real(b) && Complex.imag(a) == Complex.imag(b);

/**
 * Adds two complex numbers together.
 * @param {Complex} a
 * @param {Complex} b
 */
Complex.add = (a, b) => {
	const x = Complex.real(a) + Complex.real(b);
	const y = Complex.imag(a) + Complex.imag(b);
	return Complex.from_cartesian(x, y);
}

/**
 * Multiplies two complex numbers with each other.
 * @param {Complex} a
 * @param {Complex} b
 */
Complex.mul = (a, b) => {
	const A = Complex.to_polar(a);
	const B = Complex.to_polar(b);
	return Complex.from_polar(A.r * B.r, A.t + B.t);
}

/**
 * Subtracts the second number from the first.
 * @param {Complex} a
 * @param {Complex} b
 */
Complex.sub = (a, b) => Complex.add(a, Complex.mul(b, -1));

/**
 * Divides the first number by the second.
 * @param {Complex} a
 * @param {Complex} b
 */
Complex.div = (a, b) => Complex.mul(Complex.mul(a, Complex.conj(b)), 1/Math.pow(Complex.amp(b), 2));

/**
 * Returns e (the base of natural logarithms) raised to a power.
 * @param {Complex} z A numeric expression representing the power of e.
 */
Complex.exp = z => {
	const n = Complex.to_cartesian(z);
	return Complex.from_polar(Math.exp(n.x), n.y);
}

/**
 * Returns the natural logarithm (base e) of a number.
 * @param x — A numeric expression.
 */
Complex.log = z => {
	const n = Complex.to_polar(z);
	return Complex.from_cartesian(Math.log(n.r), n.t);
}

/**
 * The base value of the expression.
 * @param {Complex} a The base value of the expression.
 * @param {Complex} b The exponent value of the expression.
 * @returns The value of a base expression taken to a specified power.
 */
Complex.pow = (a, b) => Complex.exp(Complex.mul(b, Complex.log(a)));

/**
 * Evaluates and returns the principle value of sine of a complex number.
 * @param {Complex} z A numeric expression that contains a complex number.
 */
Complex.sin = z => {
	const a = Complex.mul(i, z);
	const b = Complex.mul(a, -1);
	const c = Complex.sub(Complex.exp(a), Complex.exp(b));
	return Complex.div(c, Complex.mul(i, 2));
}

/**
 * Evaluates and returns the principle value of cosine of a complex number.
 * @param {Complex} z A numeric expression that contains a complex number.
 */
Complex.cos = z => {
	const a = Complex.mul(i, z);
	const b = Complex.mul(a, -1);
	const c = Complex.add(Complex.exp(a), Complex.exp(b));
	return Complex.mul(c, 0.5);
}

/**
 * Evaluates and returns the principle value of tangent of a complex number.
 * @param {Complex} z A numeric expression that contains a complex number.
 */
Complex.tan = z => Complex.div(Complex.sin(z), Complex.cos(z));