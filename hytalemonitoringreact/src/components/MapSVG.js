import React, {Component} from 'react';

import * as d3 from 'd3';
import * as d3tile from 'd3-tile';

import '../css/map.css';

class MapSVG extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        // Get the width and the height of the map
        const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

        let imageSize = 512;

        const svg = d3.select("#rootMap").append("svg")
            .style('background-color', "#1a1a1a")
            .attr("viewBox", [0, 0, width, height]);

        const tile = d3tile.tile()
            .extent([[0, 0], [width, height]])
            .tileSize(imageSize)
            .clampX(true)
            .clampY(true);

        const tileLower = d3tile.tile()
            .extent([[0, 0], [width, height]])
            .tileSize(imageSize)
            .clampX(true)
            .clampY(true);

        // We want 16 levels of zoom thus
        let levelsOfZoom = 16;

        // The max number of dezoom is 6 (that is equivalent to 64 * 64 chunks and 1024 * 1024 block which is more than enough)
        const maxZoomLevel = 6;

        let initialZoomLevel = 1;
        const zoom = d3.zoom()
            .scaleExtent([imageSize * Math.pow(2, levelsOfZoom - maxZoomLevel + 1), imageSize * (Math.pow(2, levelsOfZoom))])
            .extent([[0, 0], [width, height]])

            .wheelDelta(function (event) {
                return event.deltaY > 0 ? -1 : 1;

                /*
                let deltaValue = -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002);

                return deltaValue * 0.66;
                 */

            })

            .on("zoom", ({transform}) => zoomed(transform));

        let image2 = svg.append("g")
            .attr("pointer-events", "none")
            .selectAll("image");

        let image = svg.append("g")
            .attr("pointer-events", "none")
            .selectAll("image");

        let gMain = svg.append("g")
            .selectAll("rect");

        let texts = svg.append("g")
            .selectAll("text");

        // The URL is the x and the y with a "reversed" z from 1 to 11 where 1 1:1 chunk and 11 is 1:11
        const url = (x, y, z) => `/api/tile/${x}/${y}/${(levelsOfZoom - z) + 1}`;

        const positionFromTile = (x, y, z) => {return `(${x + (-Math.pow(2, levelsOfZoom - ((levelsOfZoom - z) + 1)) - 1)}, ${y + (-Math.pow(2, levelsOfZoom - ((levelsOfZoom - z) + 1)) - 1)})`};

        svg
            .call(zoom)
            .call(zoom.transform, d3.zoomIdentity
                .translate(width >> 1, height >> 1)
                // We want the default zoom to levelsOfZoom - initialZoomLevel + 1
                .scale(imageSize * Math.pow(2, levelsOfZoom - initialZoomLevel + 1)));

        function cloneObject(obj)
        {
            obj = obj && obj instanceof Object ? obj : '';

            // Handle Date (return new Date object with old value)
            if (obj instanceof Date) {
                return new Date(obj);
            }

            // Handle Array (return a full slice of the array)
            if (obj instanceof Array) {
                return obj.slice();
            }

            // Handle Object
            if (obj instanceof Object) {
                var copy = new obj.constructor();
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)){
                        if (obj[attr] instanceof Object){
                            copy[attr] = cloneObject(obj[attr]);
                        } else {
                            copy[attr] = obj[attr];
                        }
                    }
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        }

        function zoomed(transform) {

            const tiles = tile(transform);

            let transform2 = cloneObject(transform);

            transform2.k /= 2;

            const tilesLower = tile(transform2);

            // We need to clean up the gMain element first
            d3.select('#gMain').selectAll('*').remove();

            image = image.data(tiles, d => d).join("image")
                .attr("href", d => url(...d3tile.tileWrap(d)))
                .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
                .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
                .classed('fade-in', true)
                .style('opacity', '1')

                // We add a little bit of width and height to have better edges and then no borders (is it because of the antialiasing ???)
                .attr("width", tiles.scale + 0.5)
                .attr("height", tiles.scale + 0.5);


            /*
            image2 = image2.data(tilesLower, d => d).join("image")
                .attr("href", d => url(...d3tile.tileWrap(d)))
                .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
                .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
                .style('opacity', '1')

                // We add a little bit of width and height to have better edges and then no borders (is it because of the antialiasing ???)
                .attr("width", tiles.scale + 0.5)
                .attr("height", tiles.scale + 0.5);

             */





            texts = texts.data(tiles, d => d).join("text")
                .text(d => positionFromTile(...d3tile.tileWrap(d)))
                .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
                .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale + 20) // +20 is used to have it in the tile

            /*
            gMain = gMain.data(tiles, d => d).join("rect")
                .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
                .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
                .style('opacity', '1')

                // We add a little bit of width and height to have better edges and then no borders (is it because of the antialiasing ???)
                .attr("width", tiles.scale + 0.5)
                .attr("height", tiles.scale + 0.5)

                .attr('fill', "transparent")
                .attr('stroke-width', "0")
                .attr('stroke', "red")
                .on('mouseover', function () {
                    d3.select(this).attr('fill', "rgba(255,0,0,0.3)")
                })
                .on('mouseover', function () {
                    d3.select(this).attr('fill', "rgba(255,0,0,0.3)")
                })
                .on('mouseout', function () {
                    d3.select(this).attr('fill', "transparent")
                });

             */
            ;
        }
    }

    render() {
        return (
            <div id="rootMap"/>
        );
    };
}

export default MapSVG;
