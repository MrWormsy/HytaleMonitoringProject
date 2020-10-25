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
const blockSize = 5;

class MapSVG extends Component {

    constructor(props) {
        super(props);
    }

    // Generate a terrain from a size
    generateData = (size) => {
        return d3.range(size).map((i) => {
            return d3.range(size).map((j) => {
               return this.getRandomInteger(0, Object.keys(idColorMapping).length);
            });
        })
    };

    componentDidMount() {

        // Get the SVG object
        this.svg = d3.select("#svg");

        this.gMap = this.svg.append('g')
            .attr('id', "gMap");

        // Get random data
        let data = this.generateData(5);

        // Use this data

        // First we loop through the first layer (columns)
        data.forEach((col, indexCol) => {

            // Then we loop through the second layer (rows)
            col.forEach((row, indexRow) => {

                this.gMap.append('rect')
                    .attr('width', blockSize)
                    .attr('height', blockSize)

            });
        });

    }

    render() {
        return (
            <svg id="svg" style={{border: "2px solid gold", width: '100%', height: '100%'}}>

            </svg>
        );
    };

    getRandomInteger(min = 0, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }
}

export default MapSVG;
