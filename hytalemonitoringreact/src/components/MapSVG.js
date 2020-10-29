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

        let imageSize = 384;

        const svg = d3.select("#rootMap").append("svg")
            .style('background-color', "#1a1a1a")
            .attr("viewBox", [0, 0, width, height]);

        const tile = d3tile.tile()
            .extent([[0, 0], [width, height]])
            .tileSize(imageSize)
            .clampX(true)
            .clampY(true);

        // We want 16 levels of zoom thus
        let levelsOfZoom = 8;
        let initialZoomLevel = 1;
        const zoom = d3.zoom()
            .scaleExtent([imageSize, imageSize * (Math.pow(2, levelsOfZoom))])
            .extent([[0, 0], [width, height]])
            .on("zoom", ({transform}) => zoomed(transform));

        let image = svg.append("g")
            .attr("pointer-events", "none")
            .selectAll("image");

        // The URL is the x and the y with a "reversed" z from 1 to 11 where 1 1:1 chunk and 11 is 1:11
        let url = (x, y, z) => `/api/tile/${x}/${y}/${(levelsOfZoom - z) + 1}`;

        svg
            .call(zoom)
            .call(zoom.transform, d3.zoomIdentity
                .translate(width >> 1, height >> 1)

                // We want the default zoom to levelsOfZoom - initialZoomLevel + 1
                .scale(imageSize * Math.pow(2, levelsOfZoom - initialZoomLevel + 1)));

        function zoomed(transform) {

            const tiles = tile(transform);

            image = image.data(tiles, d => d).join("image")
                .attr("href", d => url(...d3tile.tileWrap(d)))
                .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
                .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
                .style('opacity', '1')
                .classed('fade-in', true)

                // We add a little bit of width and height to have better edges and then no borders (is it because of the antialiasing ???)
                .attr("width", tiles.scale + 0.5)
                .attr("height", tiles.scale + 0.5);
        }
    }

    render() {
        return (
            <div id="rootMap"/>
        );
    };
}

export default MapSVG;
