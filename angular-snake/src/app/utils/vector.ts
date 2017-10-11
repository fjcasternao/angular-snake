export class Vector {
    x: number;
    y: number;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    clone(): Vector {
        return new Vector(this.x, this.y);
    };
    negate(): Vector {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    neg(): Vector {
        return this.clone().negate();
    };
    addeq(v): Vector {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
    subeq(v): Vector {
        return this.addeq(v.neg());
    };
    add(v): Vector {
        return this.clone().addeq(v);
    };
    sub(v): Vector {
        return this.clone().subeq(v);
    };
    multeq(c): Vector {
        this.x *= c;
        this.y *= c;
        return this;
    };
    diveq(c): Vector {
        this.x /= c;
        this.y /= c;
        return this;
    };
    mult(c): Vector {
        return this.clone().multeq(c);
    };
    div(c): Vector {
        return this.clone().diveq(c);
    };

    dot(v): number {
        return this.x * v.x + this.y * v.y;
    };
    length(): number {
        return Math.sqrt(this.dot(this));
    };
    normal(): Vector {
        return this.clone().diveq(this.length());
    };
    module(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    minAxis(): string {
        return Math.min(Math.abs(this.x), Math.abs(this.y)) === Math.abs(this.x) ? 'x' : 'y';
    }

    maxAxis(): string {
        return Math.max(Math.abs(this.x), Math.abs(this.y)) === Math.abs(this.x) ? 'x' : 'y';
    }
}

export class Point {
    x: number;
    y: number;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    clone(): Point {
        return new Point(this.x, this.y);
    };

    isEqual(a: Point): boolean {
        return this.x === a.x && this.y === a.y;
    }
}
