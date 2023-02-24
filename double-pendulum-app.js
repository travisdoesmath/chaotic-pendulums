function doublePendulumApp() {

	let nPendulums = 60;

	let pendulums = d3.range(nPendulums).map(x => new DoublePendulum({m2: 1 + 0.01*x/nPendulums, theta1:0.75*Math.PI}))

	let fadeBackground = true;

	let paused = false;

	let button = d3.select("#double>.play")
    button.on('click', () => {
        paused = !paused;
        button.text(paused ? "Play" : "Pause")
    })

	let svg = d3.select("#double>.container>svg")
	let width = +svg.attr("width")
	let height = +svg.attr("height")
	let g = svg.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
	let color = d3.scaleSequential(d3.interpolateRainbow).domain([0, nPendulums]);

	svg.on('click', e => { 

		if (!paused) {
			let mousePos = d3.mouse(svg.node()); 
			reset(mousePos);	
		}
	});

	let canvas = d3.select("#double>.container>canvas");
	let context = canvas.node().getContext('2d');

	let scale = d3.scaleLinear().domain([0,1]).range([0,100])

	let path = d3.line()
		.x(function(d) { return scale(d.l1*Math.sin(d.theta1)+d.l2*Math.sin(d.theta2)); })
		.y(function(d) { return scale(d.l1*Math.cos(d.theta1)+d.l2*Math.cos(d.theta2)); })

	let update = function() {
		if (!paused) {
			let oldCoords = pendulums.map(p => p.getCoords());

			pendulums.forEach(p => p.evolve());

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

		for (let i = coords.length - 1; i >= 0; i--) {
			context.beginPath();
			context.strokeStyle = color(i);
			context.lineWidth = 2;
			context.moveTo(scale(oldCoords[i].x2) + width/2, scale(oldCoords[i].y2) + height/2);
			context.lineTo(scale(coords[i].x2) + width/2, scale(coords[i].y2) + height/2);
			context.stroke();
		}

		let pendulum = g.selectAll(".pendulum").data(coords, function(d, i) { return i; })

		let pendulumEnter = pendulum.enter()
			.append("g").attr("class","pendulum")

		pendulumEnter.append("line").attr("class", "firstShaft shaft")
		pendulumEnter.append("line").attr("class", "secondShaft shaft")
		pendulumEnter.append("circle").attr("class", "firstBob bob").attr("r",3)
		pendulumEnter.append("circle").attr("class", "secondBob bob").attr("r",7)

		let shaft1 = pendulum.select(".firstShaft")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", d => scale(d.x1))
			.attr("y2", d => scale(d.y1))
			.attr('stroke', (d, i) => color(i))

		let shaft2 = pendulum.select(".secondShaft")
			.attr("x1", d => scale(d.x1))
			.attr("y1", d => scale(d.y1))
			.attr("x2", d => scale(d.x2))
			.attr("y2", d => scale(d.y2))
			.attr('stroke', (d, i) => color(i))

		let bob1 = pendulum.select(".firstBob")
			.attr("cx", d => scale(d.x1))
			.attr("cy", d => scale(d.y1))
			.attr('fill', (d, i) => color(i))
			.attr('opacity', 1)
		let bob2 = pendulum.select(".secondBob")
			.attr("cx", d => scale(d.x2))
			.attr("cy", d => scale(d.y2))
			.attr('fill', (d, i) => color(i))
			.attr('stroke', (d, i) => d3.color(color(i)).darker())
			.attr('stroke-width', 2)

	}

	let reset = function(mousePos) {
		let theta1 = 0.5*Math.PI + Math.atan2(height/2 - mousePos[1], mousePos[0] - width/2)
		trailOpacity = 1;
		maxThetaDelta = 0;
		pendulums = d3.range(nPendulums).map(x => new DoublePendulum({m2: 1 + 0.01*x/nPendulums, theta1:theta1}));
		context.clearRect(0, 0, width, height);
	}

	let run = setInterval(() => { update() }, 2);
}