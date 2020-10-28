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
const blockSize = 32;

// chunk size in blocks
const chunkSize = 16;

const mapSize = [50, 50];

let colorToData = {};

let zoomIdentity = undefined;

// Chunk that could not be loaded
let notLoadedChunks = [];

// Chunk not to render with minimum x, maximum x, minimum y, maximum y
const MIN_X_INDEX = 0;
const MAX_X_INDEX = 1;
const MIN_Y_INDEX = 2;
const MAX_Y_INDEX = 3;
let chunkToBan = [null, null, null, null];

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
        zoomIdentity.x = width / 2 - (chunkSize * blockSize) / 2;
        // zoomIdentity.y = (Math.floor(mapSize[1] / 2) * chunkSize * blockSize);
        zoomIdentity.y = height / 2 - (chunkSize * blockSize) / 2;
        zoomIdentity.k = 0.9;

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

        // We now need to know which chunk is in the middle of the screen (after translating)
        defaultMidScreenChunk.x = Math.floor((zoomIdentity.x - transform.x + (chunkSize * blockSize * transform.k) / 2) / (chunkSize * blockSize * transform.k));
        defaultMidScreenChunk.y = Math.floor((zoomIdentity.y - transform.y + (chunkSize * blockSize * transform.k) / 2) / (chunkSize * blockSize * transform.k));

        // We need to clean up the gMain element first
        d3.select('#gMain').selectAll('*').remove();

        context.save();
        context.clearRect(0, 0, width, height);
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);
        context.beginPath();

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
                chunksToShow.push({x: i, y: j});
            }
        }

        // We loop through the available chunks
        chunksToShow.forEach((chunk) => {

            // Here we want to know if we can skip this chunk as it might not exists
            if (chunkToBan[MIN_X_INDEX] !== null && chunk.x <= chunkToBan[MIN_X_INDEX]) {
                return;
            }

            if (chunkToBan[MAX_X_INDEX] !== null && chunk.x >= chunkToBan[MAX_X_INDEX]) {
                return;
            }

            if (chunkToBan[MIN_Y_INDEX] !== null && chunk.y <= chunkToBan[MIN_Y_INDEX]) {
                return;
            }

            if (chunkToBan[MAX_Y_INDEX] !== null && chunk.y >= chunkToBan[MAX_Y_INDEX]) {
                return;
            }

            // Check if the img already exists and create one if it is
            let node = d3.select(`#img_${chunk.x}_${chunk.y}`).node();

            // If it has not been loaded we load it and draw it
            if (node === null) {
                node = d3.select('#imageDiv')
                    .append('img')
                    .attr('id', `img_${chunk.x}_${chunk.y}`)
                    .attr('width', `${chunkSize * blockSize}`)
                    .attr('height', `${chunkSize * blockSize}`)
                    // .attr('src', `uploads/${chunk.x}_${chunk.y}.png`)
                    .attr('src', `/api/tile/${chunk.x}/${chunk.y}/1`)
                    .node();

                // If we got an error that means we cannot go any further and we will prevent the usage from going into that direction
                node.onerror = () => {
                    // We get the coordinates of the chuck that hasn't be loaded and find if it can be excluded
                    this.findChunksToExclude({x: chunk.x, y: chunk.y});
                }

                node.onload = function () {
                    context.drawImage(node, chunk.x * chunkSize * blockSize, chunk.y * chunkSize * blockSize, chunkSize * blockSize, chunkSize * blockSize);
                }
            }

            // As it already exists we draw it
            else {

                // Here I still want to know if the image exists (if we are at the edge we dont have an image and thus we cannot go any further)
                if (node.complete && node.naturalHeight !== 0) {
                    context.drawImage(node, chunk.x * chunkSize * blockSize, chunk.y * chunkSize * blockSize, chunkSize * blockSize, chunkSize * blockSize);
                }
            }

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
    };

    // This function is used to find the chunks to exclude that is to say the ones that do not exists
    findChunksToExclude = (chunkNotLoaded) => {

        // We have a chunk not loaded but for the moment we don't know in which direction this chunk is not loaded
        notLoadedChunks.push(chunkNotLoaded);

        let lastX = null;
        let lastY = null;

        for (let currentChunk of notLoadedChunks) {

            // If the last x is equal to the the x of the currentChunk that mean all the chunk with a x greater (or less) than currentChunk.x must not be downloaded
            if (lastX !== null && lastX === currentChunk.x) {

                // Know we want to check if it is positive x or negative x
                if (currentChunk.x >= 0) {
                    chunkToBan[MAX_X_INDEX] = currentChunk.x;
                } else {
                    chunkToBan[MIN_X_INDEX] = currentChunk.x;
                }

                // We return (and purge the notLoadedChunks list ?)
                notLoadedChunks = [];
                return;
            }

            // If the last y is equal to the the y of the currentChunk that mean all the chunk with a y greater (or less) than currentChunk.y must not be downloaded
            if (lastY !== null && lastY === currentChunk.y) {

                // Know we want to check if it is positive x or negative x
                if (currentChunk.y >= 0) {
                    chunkToBan[MAX_Y_INDEX] = currentChunk.y;
                } else {
                    chunkToBan[MIN_Y_INDEX] = currentChunk.y;
                }

                // We return (and purge the notLoadedChunks list ?)
                notLoadedChunks = [];
                return;
            }

            lastX = currentChunk.x;
            lastY = currentChunk.y;
        }
    };

    render() {
        return (
            <>
                <canvas id="canvas"
                        style={{border: "2px solid gold", width: '100%', height: '100%', position: 'absolute'}}>

                </canvas>
                <div id="imageDiv" style={{display: 'none'}}>
                </div>
                <svg id="svg" style={{border: "2px solid gold", width: '100%', height: '100%', position: 'absolute'}}>

                    <g id="gMain">

                    </g>

                </svg>
            </>
        );
    };
}

export default Map;
