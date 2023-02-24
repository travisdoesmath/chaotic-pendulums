function tuplePendulumApp() {
	let test = new TuplePendulum({N: 4, thetas:[1, 2, 3], omegas:[0.1,0.2,0.3]})

	let nPendulums = 5

	let pendulums = d3.range(nPendulums).map(x => new TuplePendulum({N: 2**x, thetas: [0.5 * Math.PI]}))

	let fadeBackground = false;

	let paused = true;

	let svg = d3.select("#tuple>.container>svg");
	let width = +svg.attr("width");
	let	height = +svg.attr("height");
	let g = svg.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
	let color = d3.scaleSequential(d3.interpolateRainbow).domain([0, nPendulums]);

	svg.on('click', e => { 
		let mousePos = d3.mouse(svg.node()); 
		reset(mousePos);
	});

	let button = d3.select("#tuple>.play")
    button.on('click', () => {
        paused = !paused;
        button.text(paused ? "Play" : "Pause")
    })

	let canvas = d3.select("#tuple>.container>canvas");
	let context = canvas.node().getContext('2d');

	let scale = d3.scaleLinear().domain([0,1]).range([0,200])

	let update = function() {
		if (!paused) {
			let oldCoords = pendulums.map(p => p.getCoords());

			pendulums.forEach(p => p.time_step(0.005));
	
			let coords = pendulums.map(p => p.getCoords());
			draw(oldCoords, coords);	
		}
	}

	let trailOpacity = 1;
	let maxThetaDelta = 0;
	let opacityScale = d3.scaleLinear().domain([0, 2*Math.PI]).range([1, 0])

	let draw = function(oldCoords, coords) {

		if (maxThetaDelta < 2*Math.PI) {
			if (fadeBackground) {
				maxThetaDelta = Math.max(maxThetaDelta, Math.abs(d3.max(pendulums, d => d.theta1) - d3.min(pendulums, d => d.theta1)))
				//trailOpacity -= maxThetaDelta / 1500;
				trailOpacity = opacityScale(maxThetaDelta)
				//trailOpacity = opacityScale(Math.abs(pendulums[nPendulums - 1].theta1 - pendulums[0].theta1))
			}
			
			canvas.style('opacity', trailOpacity);
		}

		let pendulum = g.selectAll(".pendulum").data(coords, (d, i) => i)
		
		pendulum.enter()
			.append("g").attr("class","pendulum")
			.attr('stroke', (d, i) => color(i))
			.attr('fill', (d, i) => color(i))

		let shafts = pendulum.selectAll('.shaft').data((d, i) => d)

			shafts.enter().append('line').attr("class", "shaft")
			.merge(shafts)
			.attr("x1", d => scale(d.x1))
			.attr("y1", d => scale(d.y1))	
			.attr("x2", d => scale(d.x2))
			.attr("y2", d => scale(d.y2))	

		let bobs = pendulum.selectAll('.bob').data(d => d)
			
		bobs.enter().append('circle').attr('class', 'bob').attr('r',3)
		.merge(bobs)
			.attr("cx", d => scale(d.x2))
			.attr("cy", d => scale(d.y2))

		for (let i = 0; i < coords.length - 1; i++) {
			// context.beginPath();
			// context.strokeStyle = color(i);
			// context.lineWidth = 2;
			// context.moveTo(scale(oldCoords[i][oldCoords[i].length - 1].x2) + width/2, scale(oldCoords[i][oldCoords[i].length - 1].y2) + height/2);
			// context.lineTo(scale(coords[i][coords[i].length - 1].x2) + width/2, scale(coords[i][coords[i].length - 1].y2) + height/2);
			// context.stroke();

		}
	}

	let reset = function(mousePos) {
		let theta = 0.5*Math.PI + Math.atan2(height/2 - mousePos[1], mousePos[0] - width/2)
		// trailOpacity = 1;
		// maxThetaDelta = 0;
		pendulums = d3.range(nPendulums).map(x => new TuplePendulum({N: 2**x, thetas: [theta]}));
		context.clearRect(0, 0, width, height);
	}

	let run = setInterval(() => { update() }, 2);
	update()

}