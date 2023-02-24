function triplePendulumApp() {

    let nPendulums = 20;

    let pendulums = d3.range(nPendulums).map(x => new TriplePendulum({theta1: 0.75 * Math.PI + 0.00001*x/nPendulums}))

    let fadeBackground = true;

    let paused = true;

    let svg = d3.select("#triple>.container>svg");
    let width = +svg.attr("width");
    let height = +svg.attr("height");
    let g = svg.append("g").attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
    let color = d3.scaleSequential(d3.interpolateRainbow).domain([0, nPendulums]);

    svg.on('click', e => { 
        let mousePos = d3.mouse(svg.node()); 
        reset(mousePos);
    });

    let button = d3.select("#triple>.play")
    button.on('click', () => {
        paused = !paused;
        button.text(paused ? "Play" : "Pause")
    })

    let canvas = d3.select("#triple>.container>canvas");
    let context = canvas.node().getContext('2d');

    let scale = d3.scaleLinear().domain([0,1.5]).range([0,100])

    let path = d3.line()
        .x(function(d) { return scale(d.l1*Math.sin(d.theta1)+d.l2*Math.sin(d.theta2)); })
        .y(function(d) { return scale(d.l1*Math.cos(d.theta1)+d.l2*Math.cos(d.theta2)); })

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

        for (let i = coords.length - 1; i >= 0; i--) {
            context.beginPath();
            context.strokeStyle = color(i);
            context.lineWidth = 2;
            context.moveTo(scale(oldCoords[i].x3) + width/2, scale(oldCoords[i].y3) + height/2);
            context.lineTo(scale(coords[i].x3) + width/2, scale(coords[i].y3) + height/2);
            context.stroke();
        }

        let pendulum = g.selectAll(".pendulum").data(coords, function(d, i) { return i; })

        let pendulumEnter = pendulum.enter()
            .append("g").attr("class","pendulum")

        pendulumEnter.append("line").attr("class", "firstShaft shaft")
        pendulumEnter.append("line").attr("class", "secondShaft shaft")
        pendulumEnter.append("line").attr("class", "thirdShaft shaft")
        pendulumEnter.append("circle").attr("class", "firstBob bob").attr("r",3)
        pendulumEnter.append("circle").attr("class", "secondBob bob").attr("r",3)
        pendulumEnter.append("circle").attr("class", "thirdBob bob").attr("r",7)

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

        let shaft3 = pendulum.select(".thirdShaft")
            .attr("x1", d => scale(d.x2))
            .attr("y1", d => scale(d.y2))
            .attr("x2", d => scale(d.x3))
            .attr("y2", d => scale(d.y3))
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
            .attr('opacity', 1)

        let bob3 = pendulum.select(".thirdBob")
            .attr("cx", d => scale(d.x3))
            .attr("cy", d => scale(d.y3))
            .attr('fill', (d, i) => color(i))
            .attr('stroke', (d, i) => d3.color(color(i)).darker())
            .attr('stroke-width', 2)

    }

    let reset = function(mousePos) {
        let theta = 0.5*Math.PI + Math.atan2(height/2 - mousePos[1], mousePos[0] - width/2)
        trailOpacity = 1;
        maxThetaDelta = 0;
        pendulums = d3.range(nPendulums).map(x => new TriplePendulum({theta1: theta + 0.00001*x/nPendulums, theta2:theta, theta3:theta}));
        context.clearRect(0, 0, width, height);
    }

    let run = setInterval(() => { update() }, 2);
}