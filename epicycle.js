const Epicycle = {};

/**
 * @param {Complex} coeff Coefficient for this epicycle.
 * @param {Number} speed Angular velocity of this epicycle.
 */
Epicycle.create = (coeff, speed) => {
	return {
		coeff: Complex.copy(coeff),
		point: Complex.copy(coeff),
		angular_speed: speed,
		child: null
	}
}

/**
 * @param {Epicycle} cycle The parent cycle to append another cyclic motion to.
 * @param {Epicycle} child The child cycle to add.
 */
Epicycle.add_child = (cycle, child) => {
	if(!cycle)	throw "Cannot append child to null epicycle.";
	if(cycle.child)	throw "Attempt to reassign child.";
	cycle.child = child;
}

/**
 * Recursively updates the given cycle and its child.
 * @param {Epicycle} cycle
 */
Epicycle.update = cycle => {
	const dt = 1 / (frameRate() | 60);
	const rotator = Complex.exp(Complex.mul(i, cycle.angular_speed*dt));
	cycle.point = Complex.mul(cycle.point, rotator);
	if(cycle.child)
		Epicycle.update(cycle.child);
}

/**
 * Recursively draws the given cycle and its child.
 * @param {Epicycle} cycle
 */
Epicycle.draw = cycle => {
	const x = Complex.real(cycle.point);
	const y = Complex.imag(cycle.point);
	const radius = Complex.amp(cycle.coeff);
	noFill();
	ellipse(0, 0, radius * 2);
	fill(0);
	ellipse(x, y, 4);
	line(0, 0, x, y);
	if(cycle.child) {
		translate(x, y);
		Epicycle.draw(cycle.child);
	}
}