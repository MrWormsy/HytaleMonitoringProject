import React, {Component} from 'react';

import * as L from 'leaflet';

class MapLeaflet extends Component {

    constructor(props) {
        super(props);

        this.state = {map: null};
    }

    initMap = () => {

        // We create the map
        let map = L.map('mapid').setView([0, 0], 17);

        // We add the tileLayer which is connected to our API
        L.tileLayer('/api/tile/{x}/{y}/{z}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 17,
            minZoom: 12,
            id: 'HytaleMonitoringMap',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(map);

        // We change the text of the right side of the screen
        document.getElementsByClassName('leaflet-control-attribution')[0].innerHTML = '<span>Made with <span style="color: red">❤</span> by <a href="localhost" title="Website to monitor your Hytale server">HytaleMonitoringProject</a> with <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a></span>';

        // We update the state
        this.setState({map: map})
    }

    // When the component has been mounted we can proceed with the map
    componentDidMount() {
        this.initMap();
    }

    render() {

        return (
            <div style={{height: '100%'}} id="mapid">

            </div>
        );
    }
}

export default MapLeaflet;
