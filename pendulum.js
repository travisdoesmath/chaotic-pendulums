class DoublePendulum {
    
    constructor(opts) {
        // default values
        this.l1=1; 
        this.l2=1;
        this.m1=1;
        this.m2=1; 
        this.G=9.8
        this.theta1=0.49*Math.PI; 
        this.theta2=1.0*Math.PI;
        this.p1=0;
        this.p2=0;
        ['l1','l2','m1','m2','G','theta1','theta2','p1','p2'].map(k => opts[k] ? this[k] = opts[k] : null)
    }

    theta1dot(theta1, theta2, p1, p2) {
        return (p1*this.l2 - p2*this.l1*Math.cos(theta1 - theta2))/(this.l1**2*this.l2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2));
    }

    theta2dot(theta1, theta2, p1, p2) {
        return (p2*(this.m1+this.m2)*this.l1 - p1*this.m2*this.l2*Math.cos(theta1 - theta2))/(this.m2*this.l1*this.l2**2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2));
    }

    p1dot(theta1, theta2, p1, p2) {
        var A1 = (p1*p2*Math.sin(theta1 - theta2))/(this.l1*this.l2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2)),
            A2 = (p1**2*this.m2*this.l2**2 - 2*p1*p2*this.m2*this.l1*this.l2*Math.cos(theta1 - theta2) + p2**2*(this.m1 + this.m2)*this.l1**2)*Math.sin(2*(theta1 - theta2))/(2*this.l1**2*this.l2**2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2)**2);
        return -(this.m1 + this.m2)*this.G*this.l1*Math.sin(theta1) - A1 + A2;
    }

    p2dot(theta1, theta2, p1, p2) {
        var A1 = (p1*p2*Math.sin(theta1 - theta2))/(this.l1*this.l2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2)),
            A2 = (p1**2*this.m2*this.l2**2 - 2*p1*p2*this.m2*this.l1*this.l2*Math.cos(theta1 - theta2) + p2**2*(this.m1 + this.m2)*this.l1**2)*Math.sin(2*(theta1 - theta2))/(2*this.l1**2*this.l2**2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2)**2);
        return -this.m2*this.G*this.l2*Math.sin(theta2) + A1 - A2;

    }

    f(Z) {
        return [this.theta1dot(Z[0], Z[1], Z[2], Z[3]), this.theta2dot(Z[0], Z[1], Z[2], Z[3]), this.p1dot(Z[0], Z[1], Z[2], Z[3]), this.p2dot(Z[0], Z[1], Z[2], Z[3])];
    }

    RK4(tau) {
        var Y1 = this.f([this.theta1, this.theta2, this.p1, this.p2]).map(d => d*tau);
        var Y2 = this.f([this.theta1 + 0.5*Y1[0], this.theta2 + 0.5*Y1[1], this.p1 + 0.5*Y1[2], this.p2 + 0.5*Y1[3]]).map(d => d*tau);
        var Y3 = this.f([this.theta1 + 0.5*Y2[0], this.theta2 + 0.5*Y2[1], this.p1 + 0.5*Y2[2], this.p2 + 0.5*Y2[3]]).map(d => d*tau);
        var Y4 = this.f([this.theta1 + Y3[0], this.theta2 + Y3[1], this.p1 + Y3[2], this.p2 + Y3[3]]).map(d => d*tau);

        return [
            this.theta1 + Y1[0]/6 + Y2[0]/3 + Y3[0]/3 + Y4[0]/6,
            this.theta2 + Y1[1]/6 + Y2[1]/3 + Y3[1]/3 + Y4[1]/6,
            this.p1 + Y1[2]/6 + Y2[2]/3 + Y3[2]/3 + Y4[2]/6,
            this.p2 + Y1[3]/6 + Y2[3]/3 + Y3[3]/3 + Y4[3]/6,
        ]
    }

    evolve(t=0.005) {
        var nextState = this.RK4(t);
        this.theta1 = nextState[0];
        this.theta2 = nextState[1];
        this.p1 = nextState[2];
        this.p2 = nextState[3];
        return this.getCoords();
    }

    getCoords() {
        return {
            'x1':this.l1*Math.sin(this.theta1),
    		'y1':this.l1*Math.cos(this.theta1),
	    	'x2':this.l1*Math.sin(this.theta1) + this.l2*Math.sin(this.theta2),
		    'y2':this.l1*Math.cos(this.theta1) + this.l2*Math.cos(this.theta2)
        }
    }
}

class TriplePendulum {
    
    constructor(opts) {
        this.G=-9.8
        this.theta1=0.75*Math.PI; 
        this.theta2=0.75*Math.PI;
        this.theta3=0.75*Math.PI;
        this.theta1dot=0; 
        this.theta2dot=0;
        this.theta3dot=0;
        ['G','theta1','theta2','theta3','theta1dot','theta2dot','theta3dot'].map(k => opts[k] ? this[k] = opts[k] : null)
    }

    state() {

    }

    A(theta1 = this.theta1, theta2 = this.theta2, theta3 = this.theta3) {
        return [
            [1, 2/3 * Math.cos(theta1 - theta2), 1/3 * Math.cos(theta1 - theta3)],
            [Math.cos(theta2 - theta1), 1, 1/2 * Math.cos(theta2 - theta3)],
            [Math.cos(theta3 - theta1), Math.cos(theta3 - theta2), 1]
        ];
    }

    Ainv(theta1 = this.theta1, theta2 = this.theta2, theta3 = this.theta3) {
        return math.inv(this.A(theta1, theta2, theta3))
    }

    B(theta1 = this.theta1, theta2 = this.theta2, theta3 = this.theta3, theta1dot = this.theta1dot, theta2dot = this.theta2dot, theta3dot = this.theta3dot) {
        var G = this.G;
        return [
            2/3 * Math.sin(theta2 - theta1) * theta2dot ** 2 + 1/3 * Math.sin(theta3 - theta1) * theta3dot ** 2 + G * Math.sin(theta1),
            Math.sin(theta1 - theta2) * theta1dot ** 2 + 0.5 * Math.sin(theta3 - theta2) * theta3dot ** 2 + G * Math.sin(theta2),
            Math.sin(theta1 - theta3) * theta1dot ** 2 + Math.sin(theta2 - theta3) * theta2dot ** 2 + G * Math.sin(theta3)
        ]
    }

    lagrange_rhs([theta1 = this.theta1, theta2 = this.theta2, theta3 = this.theta3, theta1dot = this.theta1dot, theta2dot = this.theta2dot, theta3dot = this.theta3dot]) {
        var AinvB = math.multiply(this.Ainv(theta1, theta2, theta3), this.B(theta1, theta2, theta3, theta1dot, theta2dot, theta3dot))
        return [theta1dot, theta2dot, theta3dot, AinvB[0], AinvB[1], AinvB[2]]
    }

    time_step(dt) { 
        var y = [this.theta1, this.theta2, this.theta3, this.theta1dot, this.theta2dot, this.theta3dot]
        
        var k1 = this.lagrange_rhs(y)
        var k2 = this.lagrange_rhs([
            y[0] + 0.5 * dt * k1[0], 
            y[1] + 0.5 * dt * k1[1], 
            y[2] + 0.5 * dt * k1[2], 
            y[3] + 0.5 * dt * k1[3],
            y[4] + 0.5 * dt * k1[4],
            y[5] + 0.5 * dt * k1[5]
        ])
        var k3 = this.lagrange_rhs([
            y[0] + 0.5 * dt * k2[0], 
            y[1] + 0.5 * dt * k2[1], 
            y[2] + 0.5 * dt * k2[2], 
            y[3] + 0.5 * dt * k2[3],
            y[4] + 0.5 * dt * k2[4],
            y[5] + 0.5 * dt * k2[5]
            
        ])
        var k4 = this.lagrange_rhs([
            y[0] + dt * k3[0], 
            y[1] + dt * k3[1], 
            y[2] + dt * k3[2], 
            y[3] + dt * k3[3],
            y[4] + dt * k3[4],
            y[5] + dt * k3[5]
        ])
        var R = [
            1/6 * dt * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]),
            1/6 * dt * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]),
            1/6 * dt * (k1[2] + 2*k2[2] + 2*k3[2] + k4[2]),
            1/6 * dt * (k1[3] + 2*k2[3] + 2*k3[3] + k4[3]),
            1/6 * dt * (k1[4] + 2*k2[4] + 2*k3[4] + k4[4]),
            1/6 * dt * (k1[5] + 2*k2[5] + 2*k3[5] + k4[5]),
        ]

        this.theta1 += R[0]
        this.theta2 += R[1]
        this.theta3 += R[2]
        this.theta1dot += R[3] 
        this.theta2dot += R[4] 
        this.theta3dot += R[5] 

    }

    getCoords() {
        return {
            'x1':Math.sin(this.theta1),
    		'y1':Math.cos(this.theta1),
	    	'x2':Math.sin(this.theta1) + Math.sin(this.theta2),
		    'y2':Math.cos(this.theta1) + Math.cos(this.theta2),
	    	'x3':Math.sin(this.theta1) + Math.sin(this.theta2) + Math.sin(this.theta3),
		    'y3':Math.cos(this.theta1) + Math.cos(this.theta2) + Math.cos(this.theta3)
        }
    }
}

class TuplePendulum {
    
    constructor(opts) {
        this.N = 3;
        this.G = -9.8;
        this.thetas=[0.75*Math.PI]; 
        this.omegas=[0]; 
        if (opts) ['N','G','thetas','omegas'].map(k => opts[k] ? this[k] = opts[k] : null)
        if (this.thetas.length != this.N) {
            this.thetas = new Array(this.N).fill(0).map((x, i) => this.thetas[i % this.thetas.length])
        }
        if (this.omegas.length != this.N) {
            this.omegas = new Array(this.N).fill(0).map((x, i) => this.omegas[i % this.omegas.length])
        }

    }

    A(thetas = this.thetas) {
        var M = [];
        for (let i = 1; i <= this.N; i++) {
            let row = []
            for (let j = 1; j <= this.N; j++) {
                row.push((this.N - Math.max(i, j) + 1)/(this.N - i + 1) * Math.cos(thetas[i-1] - thetas[j-1]))
            }
            M.push(row)
        }
        return M;
    }

    Ainv(thetas) {
        return math.inv(this.A(thetas))
    }

    b(thetas = this.thetas, omegas = this.omegas) {
        let v = []
        for (let i = 1; i <= this.N; i++) {
            let b_i = 0
            for (let j = 1; j <= this.N; j++) {
                let coef = (this.N - Math.max(i, j) + 1)/(this.N - i + 1)
                let theta_i = thetas[i-1]
                let theta_j = thetas[j-1]
                let omega_j = omegas[j - 1]
                let delta = coef * Math.sin(theta_j - theta_i) * omega_j ** 2
                b_i += delta
            }
            b_i += this.G * Math.sin(thetas[i-1])
            v.push(b_i)
        }
        return v;
    }

    lagrange_rhs([thetas, omegas]) {
        var AinvB = math.multiply(this.Ainv(thetas), this.b(thetas, omegas))
        return [omegas, AinvB]
    }

    time_step(dt) { 
       
        var k1 = this.lagrange_rhs([this.thetas, this.omegas])
        var k2 = this.lagrange_rhs([math.add(this.thetas, k1[0].map(x => 0.5 * dt * x)),    math.add(this.omegas, k1[1].map(x => 0.5 * dt * x))])
        var k3 = this.lagrange_rhs([math.add(this.thetas, k2[0].map(x => 0.5 * dt * x)),    math.add(this.omegas, k2[1].map(x => 0.5 * dt * x))])
        var k4 = this.lagrange_rhs([math.add(this.thetas, k3[0].map(x => 1.0 * dt * x)),    math.add(this.omegas, k3[1].map(x => 1.0 * dt * x))])


        let theta_deltas = math.add(k1[0], k2[0].map(x => 2 * x), k3[0].map(x => 2 * x), k4[0]).map(x => x * dt/6)           
        let omega_deltas = math.add(k1[1], k2[1].map(x => 2 * x), k3[1].map(x => 2 * x), k4[1]).map(x => x * dt/6)

        this.thetas = math.add(this.thetas, theta_deltas)
        this.omegas = math.add(this.omegas, omega_deltas)
    }

    getCoords() {
        let x1 = 0, y1 = 0, coords = [];
        for (let i = 1; i <= this.thetas.length; i++) {
            let x2 = 0
            let y2 = 0
            for (let j = 0; j < i; j++) {
                x2 += Math.sin(this.thetas[j]) / this.N
                y2 += Math.cos(this.thetas[j]) / this.N
            }
            coords.push({x1: x1, y1: y1, x2: x2, y2: y2})
            x1 = x2
            y1 = y2
        }
        return coords;
    }
}