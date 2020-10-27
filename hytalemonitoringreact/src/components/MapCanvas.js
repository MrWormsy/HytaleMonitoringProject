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
const blockSize = 20;

// chunk size in blocks
const chunkSize = 16;

const mapSize = [50, 50];

let colorToData = {};

let zoomIdentity = undefined;

// By default the chunk at the middle is the chunk 0 0
let defaultMidScreenChunk = {x: 0, y: 0};


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

        // Create a new zoomIdentity (and place the chunk at the middle of the screen)
        zoomIdentity = d3.zoomIdentity;
        // zoomIdentity.x = (Math.floor(mapSize[0] / 2) * chunkSize * blockSize);
        zoomIdentity.x = width/2 - (chunkSize * blockSize)/2;
        // zoomIdentity.y = (Math.floor(mapSize[1] / 2) * chunkSize * blockSize);
        zoomIdentity.y = height/2 - (chunkSize * blockSize)/2;
        zoomIdentity.k = 1;

        // Use this data
        this.drawMap(zoomIdentity);

        // Zoom for the canvas
        let canvasD3 = d3.select('#canvas');

        zoomMap = d3.zoom()
            .scaleExtent([0.3, 4])
            .on("zoom", ({transform}) => this.drawMap(transform));

        canvasD3.call(zoomMap)
            .on("dblclick.zoom", this.resetMap);

        d3.select("#svg").call(zoomMap)
            .on("dblclick.zoom", this.resetMap);

        canvasD3.on('mousemove', ({clientX, clientY}) => {
            this.mouseMoveHandler(clientX, clientY)
        });
    }

    // Reset the map
    resetMap() {
        d3.select('#canvas').transition()
            .duration(750)
            .call(zoomMap.transform, zoomIdentity);

        d3.select('#svg').transition()
            .duration(750)
            .call(zoomMap.transform, zoomIdentity);
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

        // We now need to know which chunk is in the middle of the screen (after translating)
        defaultMidScreenChunk.x = Math.floor((zoomIdentity.x - transform.x + (chunkSize * blockSize * transform.k)/2) / (chunkSize * blockSize * transform.k));
        defaultMidScreenChunk.y = Math.floor((zoomIdentity.y - transform.y + (chunkSize * blockSize * transform.k)/2) / (chunkSize * blockSize * transform.k));

        // We need to clean up the gMain element first
        d3.select('#gMain').selectAll('*').remove();

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

        // We get the size of the screen and we want to know how many chunks we can have in the screen
        let nbChunksX = Math.ceil((width / (chunkSize * blockSize * transform.k)));
        let nbChunksY = Math.ceil((height / (chunkSize * blockSize * transform.k)));

        // Now that we have the chunk at the middle and the screen we can select the range of chunks we want to show
        let rangeOfChunksX = [defaultMidScreenChunk.x - Math.ceil(nbChunksX / 2), defaultMidScreenChunk.x + Math.ceil(nbChunksX / 2) + 1];
        let rangeOfChunksY = [defaultMidScreenChunk.y - Math.ceil(nbChunksY / 2), defaultMidScreenChunk.y + Math.ceil(nbChunksY / 2) + 1];

        // Now we can show the chunks we want to show
        let chunksToShow = [];
        for (let i = rangeOfChunksX[0]; i <= rangeOfChunksX[1]; i++) {
            for (let j = rangeOfChunksY[0]; j <= rangeOfChunksY[1]; j++) {
                chunksToShow.push(data[`x:${i}, y:${j}`]);
            }
        }

        // We remove all the undefined (if the world is smaller than the nb of chunks to see)
        chunksToShow = chunksToShow.filter(d => d);

        let i = 0;

        // We loop through the available chunks
        chunksToShow.forEach((chunk) => {

            // We loop through the chunk data which will be the columns
            chunk.data.forEach((chunkDataCol, indexBlockY) => {

                // And then we loop through the rows which will be the blocks
                chunkDataCol.forEach((block, indexBlockX) => {

                    // Get the color unique for the mapping data
                    const color = Map.getColor(i);
                    colorToData[color] = block;

                    // Paint the virtual canvas
                    virtualContext.strokeStyle = 'rgba(0,0,0,0)';
                    virtualContext.fillStyle = color;
                    virtualContext.lineWidth = 0;
                    virtualContext.fillRect(((chunk.x * chunkSize) + indexBlockX) * blockSize, ((chunk.y * chunkSize) + indexBlockY) * blockSize, blockSize, blockSize);

                    // Paint the real canvas
                    context.strokeStyle = 'rgba(0,0,0,0)';
                    context.fillStyle = block;
                    context.lineWidth = 0;
                    context.fillRect(((chunk.x * chunkSize) + indexBlockX) * blockSize, ((chunk.y * chunkSize) + indexBlockY) * blockSize, blockSize, blockSize);

                    i++;
                });
            });

            // We add a box to each chunks
            let rect = d3.select('#gMain').append('rect')
                .attr('x', (chunk.x * chunkSize * blockSize))
                .attr('y', (chunk.y * chunkSize * blockSize))
                .attr('width', chunkSize * blockSize)
                .attr('height', chunkSize * blockSize)
                // The chunk at the middle must be green
                .attr('fill', (chunk.x === defaultMidScreenChunk.x && chunk.y === defaultMidScreenChunk.y) ? "rgba(0,255,0,0.3)" : "transparent")
                .attr('stroke-width', "0")
                .attr('stroke', "red")
                .on('mouseover', function () {
                    d3.select(this).attr('fill', "rgba(255,0,0,0.3)")
                })
                .on('mouseout', function () {
                    d3.select(this).attr('fill', (chunk.x === defaultMidScreenChunk.x && chunk.y === defaultMidScreenChunk.y) ? "rgba(0,255,0,0.3)" : "transparent")
                });

            // Append a title (this will be removed)
            rect.append('title')
                .text(`x: ${chunk.x}, y: ${chunk.y}`)

        });

        d3.select('#gMain')
            .attr("transform", `translate(${transform.x} ${transform.y}) scale(${transform.k} ${transform.k})`);

        context.fill();
        context.restore();

        virtualContext.fill();
        virtualContext.restore();
    };

    render() {
        return (
            <>
                <canvas id="canvas" style={{border: "2px solid gold", width: '100%', height: '100%', position: 'absolute'}}>

                </canvas>
                <svg id="svg" style={{border: "2px solid gold", width: '100%', height: '100%', position: 'absolute'}}>

                    <g id="gMain">

                    </g>

                </svg>
            </>
        );
    };
}

Map.getRandomInteger = (min = 0, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

// Generate a terrain from a size
Map.generateData = (mapSize) => {

    let data = {};

    d3.range(mapSize[0]).map((_, i) => {
        d3.range(mapSize[1]).map((_, j) => {
            data[`x:${i - Math.floor(mapSize[0] / 2)}, y:${j - Math.floor(mapSize[1] / 2)}`] = Map.generateChunk((-Math.floor(mapSize[0] / 2)) + i, (-Math.floor(mapSize[1] / 2)) + j);
        });
    });

    return data;
};

// Create a chunk randomly (chunkSize x chunkSize)
Map.generateChunk = (chunkX, chunkY) => {
    return {
        x: chunkX,
        y: chunkY,
        data: d3.range(chunkSize).map((i) => {
            return d3.range(chunkSize).map((j) => {
                return idColorMapping[Map.getRandomInteger(0, Object.keys(idColorMapping).length)];
            })
        })
    }
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

console.log(data);

export default Map;
