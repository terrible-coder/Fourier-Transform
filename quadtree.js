class Rectangle {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}

	contains(point) {
		return (point.x > this.x && point.x <= (this.x + this.width)) &&
				(point.y > this.y && point.y <= (this.y + this.height));
	}
}

class TreeNode {
	constructor(level, rectangle) {
		this.level = level;
		this.data = [];
		this.boundary = rectangle;
		this.hasChildren = false;
	}

	encloses(point) {
		return this.boundary.contains(point);
	}

	join() {
		if(!this.hasChildren)
			return this.data.sort((p1, p2) => Math.sign(this.boundary.y) * (p1.x - p2.x)).slice();
		const ne = this.northeast.join();
		const nw = this.northwest.join();
		const sw = this.southwest.join();
		const se = this.southeast.join();
		if(this.boundary.x > 0)
			return sw.concat(se).concat(ne).concat(nw);
		return ne.concat(nw).concat(sw).concat(se);
	}

	subdivide() {
		this.hasChildren = true;
		const w = this.boundary.width / 2;
		const h = this.boundary.height / 2;
		const ne = new Rectangle(this.boundary.x+w, this.boundary.y+0, w, h);
		const nw = new Rectangle(this.boundary.x+0, this.boundary.y+0, w, h);
		const sw = new Rectangle(this.boundary.x+0, this.boundary.y+h, w, h);
		const se = new Rectangle(this.boundary.x+w, this.boundary.y+h, w, h);
		this.northeast = new TreeNode(this.level+1, ne);
		this.northwest = new TreeNode(this.level+1, nw);
		this.southwest = new TreeNode(this.level+1, sw);
		this.southeast = new TreeNode(this.level+1, se);
		this.data.forEach(point => {
			if(ne.contains(point))
				this.northeast.data.push(point);
			else if(nw.contains(point))
				this.northwest.data.push(point);
			else if(sw.contains(point))
				this.southwest.data.push(point);
			else if(se.contains(point))
				this.southeast.data.push(point);
		});
		this.data = null;
	}

	draw(context) {
		if(this.hasChildren) {
			this.northeast.draw(context);
			this.northwest.draw(context);
			this.southwest.draw(context);
			this.southeast.draw(context);
		} else {
			context.strokeStyle = "#777777";
			context.strokeRect(this.boundary.x, this.boundary.y,
							this.boundary.width, this.boundary.height);
			context.fillStyle = "#ff10a0";
			this.data.forEach(point => {
				context.fillRect(point.x, point.y, 1, 1);
			});
		}
	}
}

class QuadTree {
	constructor(limit, boundary) {
		this.length = 0;
		this.limit = limit;
		this.root = new TreeNode(0, boundary);
	}

	add(point) {
		if(!this.root.encloses(point))
			throw "Point outside given range."
		this.length++;
		let current = this.root;
		while(true) {
			if(current.data && current.data.length < this.limit) {
				current.data.push(point);
				break;
			}
			else {
				if(!current.hasChildren)
					current.subdivide();
				if(current.northeast.encloses(point))
					current = current.northeast;
				else if(current.northwest.encloses(point))
					current = current.northwest;
				else if(current.southwest.encloses(point))
					current = current.southwest;
				else if(current.southeast.encloses(point))
					current = current.southeast;
			}
		}
	}

	lines() {
		const shortest = this.root.join();
		const paths = [];
		let path = new Path2D();
		path.moveTo(shortest[0].x, shortest[0].y);
		for(let i = 1; i < shortest.length; i++) {
			const current = shortest[i];
			const prev = shortest[i-1];
			// path.moveTo(prev.x, prev.y);
			if(distance(current, prev) > 10) {
				// path.moveTo(current.x, current.y);
				path.closePath();
				paths.push(path);
				path = new Path2D();
				path.moveTo(shortest[i+1].x, shortest[i+1].y);
			}
			else {
				path.lineTo(current.x, current.y);
			}
		}
		path.closePath();
		paths.push(path);
		return paths;
	}

	show(canvas) {
		const context = canvas.getContext("2d");
		this.root.draw(context);
	}
}