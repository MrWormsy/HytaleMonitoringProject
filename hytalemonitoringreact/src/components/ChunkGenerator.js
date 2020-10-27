import React, {Component} from 'react';
import Map from "./MapCanvas";

import * as d3 from 'd3';
const axios = require("axios");

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

class ChunkGenerator extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // ChunkGenerator.createPNGFromChunk(ChunkGenerator.generateChunk(0, 0));

        let promises = [];

        let last = Date.now();

        d3.range(mapSize[0]).map((_, i) => {
            d3.range(mapSize[1]).map((_, j) => {
                promises.push(ChunkGenerator.createPNGFromChunk(ChunkGenerator.generateChunk(i - Math.floor(mapSize[0] / 2), j - Math.floor(mapSize[1] / 2))));
            });
        });

        Promise.all(promises).then(() => {
            console.log(`All the images has been uploaded in ${Date.now() - last}ms`)
        })
    }

    render() {
        return false;
    }
}

ChunkGenerator.getRandomInteger = (min = 0, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

// Create a chunk randomly (chunkSize x chunkSize)
ChunkGenerator.generateChunk = (chunkX, chunkY) => {
    return {
        x: chunkX,
        y: chunkY,
        data: d3.range(chunkSize).map((i) => {
            return d3.range(chunkSize).map((j) => {
                return idColorMapping[ChunkGenerator.getRandomInteger(0, Object.keys(idColorMapping).length)];
            })
        })
    }
};

// Create a PNG image from a chunk
ChunkGenerator.createPNGFromChunk = (chunk) => {
    return new Promise(((resolve, reject) => {
        // Creating a new canvas element without appending it to the DOM.
        let virtualCanvasDOM = document.createElement('canvas');

        virtualCanvasDOM.style.width = (blockSize * chunkSize) + "px";
        virtualCanvasDOM.style.height = (blockSize * chunkSize) + "px";
        virtualCanvasDOM.width = (blockSize * chunkSize);
        virtualCanvasDOM.height = (blockSize * chunkSize);

        let context = virtualCanvasDOM.getContext('2d');

        context.beginPath();

        // We loop through the chunk data which will be the columns
        chunk.data.forEach((chunkDataCol, indexBlockY) => {

            // And then we loop through the rows which will be the blocks
            chunkDataCol.forEach((block, indexBlockX) => {

                context.strokeStyle = 'rgba(0,0,0,0)';
                context.fillStyle = block;
                context.lineWidth = 0;
                context.fillRect(indexBlockX * blockSize,indexBlockY * blockSize, blockSize, blockSize);

            });
        });

        context.fill();

        // Get the blobs binary of the image
        let blobBin = atob(virtualCanvasDOM.toDataURL("image/png").split(',')[1]);
        let array = [];
        for(let i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }

        // Create a form data and then append the file as the image
        const formData = new FormData();
        formData.append('image', new Blob([new Uint8Array(array)], {type: 'image/png'}));
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };

        // Send the image to the server
        axios.post(`/api/addchunkimage/${chunk.x}_${chunk.y}`, formData, config)
            .then((response) => {
                resolve();
            }).catch((error) => {
                reject();
        });
    }));
};

export default ChunkGenerator;
