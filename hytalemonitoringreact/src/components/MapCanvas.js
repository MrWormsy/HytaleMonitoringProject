import React, {Component} from 'react';

import * as d3 from 'd3';

// MapSVG the id with a color
const idColorMapping = {
    0: "#eacbea",
    1: "#ea7f3c",
    2: "#5fea8e",
    3: "#4b5aea",
    4: "#9b42ea",
};

// Size of a "block" in px
const blockSize = 10;

const mapSize = [100, 200];

let colorToData = {};

let virtualCanvas = undefined;
let virtualContext = undefined;

let lastTransform = undefined;

let context = undefined;
let width = undefined;
let height = undefined;
let zoomMap = undefined;

class Map extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        // Get the canvas and the context
        let canvas = document.getElementById('canvas');
        this.canvas = canvas;
        let ctx = canvas.getContext('2d');
        this.ctx = ctx;
        context = ctx;

        width = canvas.getBoundingClientRect().width;
        height = canvas.getBoundingClientRect().height;

        // Creating a new canvas element without appending it to the DOM.
        let virtualCanvasDOM = document.createElement('canvas');
        virtualCanvas = d3.select(virtualCanvasDOM);

        // Set display size (css pixels).
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        virtualCanvasDOM.style.width = width + "px";
        virtualCanvasDOM.style.height = height + "px";

        // Set actual size in memory (scaled to account for extra pixel density).
        let scale = window.devicePixelRatio; // <--- Change to 1 on retina screens to see blurry canvas.
        canvas.width = width * scale;
        canvas.height = height * scale;
        virtualCanvasDOM.width = width * scale;
        virtualCanvasDOM.height = height * scale;

        // Normalize coordinate system to use css pixels.
        ctx.scale(scale, scale);
        virtualContext = virtualCanvasDOM.getContext('2d');
        virtualContext.scale(scale, scale);

        // Use this data
        this.drawMap(d3.zoomIdentity);

        // Zoom for the canvas
        let canvasD3 = d3.select('#canvas');

        zoomMap = d3.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", ({transform}) => this.drawMap(transform));

        canvasD3.call(zoomMap)
            .on("dblclick.zoom", this.resetMap);

        canvasD3.on('mousemove', ({clientX, clientY}) => {this.mouseMoveHandler(clientX, clientY)});
    }

    // Reset the map
    resetMap() {
        d3.select('#canvas').transition()
            .duration(750)
            .call(zoomMap.transform, d3.zoomIdentity);
    }

    mouseMoveHandler = (mouseX, mouseY) => {

        const imageData = virtualCanvas
            .node()
            .getContext('2d')
            .getImageData(mouseX, mouseY, 1, 1);

        const color = d3.rgb.apply(null, imageData.data).toString();

        const possibleDatum = colorToData[color];

        if (!possibleDatum) {
            return;
        }

        console.log(possibleDatum);
    };

    drawMap = (transform) => {

        lastTransform = transform;

        context.save();
        context.clearRect(0, 0, width, height);
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);
        context.beginPath();

        // paint to virtual canvas
        virtualContext.save();
        virtualContext.clearRect(0, 0, width, height);
        virtualContext.translate(transform.x, transform.y);
        virtualContext.scale(transform.k, transform.k);
        virtualContext.beginPath();

        // First we loop through the first layer (columns)
        let i = 0;
        data.forEach((col, indexCol) => {

            // Then we loop through the second layer (rows)
            col.forEach((row, indexRow) => {

                const color = Map.getColor(i);
                colorToData[color] = row;

                virtualContext.strokeStyle = 'rgba(0,0,0,0)';
                virtualContext.fillStyle = color;
                virtualContext.lineWidth = 0;
                virtualContext.fillRect(indexRow * blockSize, indexCol * blockSize, blockSize, blockSize);

                context.strokeStyle = 'rgba(0,0,0,0)';
                context.fillStyle = row;
                context.lineWidth = 0;
                context.fillRect(indexRow * blockSize, indexCol * blockSize, blockSize, blockSize);

                i++;
            });
        });

        context.fill();
        context.restore();

        virtualContext.fill();
        virtualContext.restore();
    };

    render() {
        return (
            <canvas id="canvas" style={{border: "2px solid gold", width: '100%', height: '100%'}}>

            </canvas>
        );
    };
}

Map.getRandomInteger = (min = 0, max) => {
    return Math.floor(Math.random() * (max - min) ) + min;
};

// Generate a terrain from a size
Map.generateData = (mapSize) => {
    return d3.range(mapSize[0]).map((i) => {
        return d3.range(mapSize[1]).map((j) => {
            return idColorMapping[Map.getRandomInteger(0, Object.keys(idColorMapping).length)];
        });
    })
};

/*
 * We're doing some bit-shifting here to more clearly illustrate how
 * to derive a color from a number, but you could accomplish the same
 * thing using modulo arithmetic and division! Check out the examples
 * to see an alternative approach
 */
Map.getColor = (index) => {
    return d3.rgb(
        (index & 0b111111110000000000000000) >> 16,
        (index & 0b000000001111111100000000) >> 8,
        (index & 0b000000000000000011111111))
        .toString();
};

// Get random data
const data = Map.generateData(mapSize);

export default Map;
