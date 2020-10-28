import React, {Component} from 'react';

import * as d3 from 'd3';
import * as d3tile from 'd3-tile';

class MapSVG extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        // Get the width and the height of the map
        const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

        const svg = d3.select("#rootMap").append("svg")
            .attr("viewBox", [0, 0, width, height]);

        const tile = d3tile.tile()
            .extent([[0, 0], [width, height]])
            .tileSize(512)
            .clampX(true)
            .clampY(true);

        const zoom = d3.zoom()

            // Now i get from z = 0 to z = 10
            .scaleExtent([512, 512000])
            .extent([[0, 0], [width, height]])
            .on("zoom", ({transform}) => zoomed(transform));

        let image = svg.append("g")
            .attr("pointer-events", "none")
            .selectAll("image");

        let url = (x, y, z) => `/api/tile/${x}/${y}/${z}`;

        svg
            .call(zoom)
            .call(zoom.transform, d3.zoomIdentity
                .translate(width >> 1, height >> 1)
                .scale(65536));

        function zoomed(transform) {
            const tiles = tile(transform);

            image = image.data(tiles, d => d).join("image")
                .attr("xlink:href", d => url(...d3tile.tileWrap(d)))
                .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
                .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
                .attr("width", tiles.scale)
                .attr("height", tiles.scale);
        }
    }

    render() {
        return (
            <div id="rootMap"/>
        );
    };
}

export default MapSVG;
