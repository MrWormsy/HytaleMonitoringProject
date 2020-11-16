import React, {Component} from 'react';

import * as L from 'leaflet';
import '../css/map.css';

let map;

// Options
const options =
    {
        // Max zoom
        maxZoom: 17,

        // Min zoom
        minZoom: 12,

        // Map id
        id: 'HytaleMonitoringMap',

        // Tile size in px
        tileSize: 512,

        // Offset
        zoomOffset: 1,

        // If the zoom sent to the server is reversed
        zoomReverse: true
    };

class MapLeaflet extends Component {

    constructor(props) {
        super(props);

        this.state = {map: undefined};
    }

    initMap = () => {

        // We create the map
        map = L.map('mapid').setView([0, 0], 17);

        // We add the tileLayer which is connected to our API (Where we will be only able to have 6 levels of zoom from -1 to -6)
        L.tileLayer('/api/tile/{x}/{y}/{z}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: options.maxZoom,
            minZoom: options.minZoom,
            id: 'HytaleMonitoringMap',
            tileSize: options.tileSize,
            zoomOffset: options.zoomOffset,
            zoomReverse: options.zoomReverse
        }).addTo(map);

        // We change the text of the right side of the screen
        document.getElementsByClassName('leaflet-control-attribution')[0].innerHTML = '<span>Made with <span style="color: red">❤</span> by <a href="localhost" title="Website to monitor your Hytale server">HytaleMonitoringProject</a> with <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a></span>';

        // Get the current zoom value as it is sent to the server
        const getZoom = () => {

            // Get the zoom level of the map
            let zoomLevel = map.getZoom();

            // We check if the zoom calculation is reversed
            if (options.zoomReverse) {
                zoomLevel = options.maxZoom - zoomLevel;
            }

            // We return the zoom with the offset
            return zoomLevel + 1;
        };

        // This is used to get the coordinate
        map.addEventListener('mousemove', function(event) {

            let lat = event.latlng.lat;
            let lng = event.latlng.lng;

            console.log(getZoom())

            let x = lat * Math.pow(2, map.getZoom() - 1);
            let y = lng * Math.pow(2, map.getZoom() - 1);

            // console.log(x, y)
        });
    }

    // Highlight a given chunk
    highlightChunk = (chunk) => {

        var circle = L.rectangle([[0, 0], [0, 16], [16, 0], [16, 16]], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500,
            width: 100,
            height: 100
        }).addTo(map);

    };

    // When the component has been mounted we can proceed with the map
    componentDidMount() {
        this.initMap();

        this.highlightChunk({x: 0, y: 0});
    }

    render() {

        return (
            <div style={{height: '100%'}} id="mapid">

            </div>
        );
    }
}

export default MapLeaflet;
