const Epicycle = {};

/**
 * @param {Complex} coeff Coefficient for this epicycle.
 * @param {Number} speed Angular velocity of this epicycle.
 * @returns {Epicycle}
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
Epicycle.update = (cycle, dt) => {
	const rotator = Complex.from_polar(1, cycle.angular_speed*dt);
	cycle.point = Complex.mul(cycle.point, rotator);
	if(cycle.child)
		Epicycle.update(cycle.child, dt);
}

/**
 * Recursively draws the given cycle and its child.
 * @param {CanvasRenderingContext2D} context
 * @param {Epicycle} cycle
 */
Epicycle.draw = (context, cycle) => {
	const x = Complex.real(cycle.point);
	const y = Complex.imag(cycle.point);
	const radius = Complex.amp(cycle.coeff);
	const circle = new Path2D();
	circle.arc(0, 0, radius, 0, 2*Math.PI);
	circle.moveTo(0, 0);
	circle.lineTo(x, y);
	context.stroke(circle);
	// draw point
	if(cycle.child) {
		context.translate(x, y);
		Epicycle.draw(context, cycle.child);
	}
}