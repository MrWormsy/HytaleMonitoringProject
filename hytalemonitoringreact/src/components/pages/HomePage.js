import React, {Component} from 'react';
import MapCanvas from "../MapCanvas";
import ChunkGenerator from "../ChunkGenerator";
import MapSVG from "../MapSVG";
import MapLeaflet from "../MapLeaflet";

class HomePage extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        /*
        return (
            <>
            <MapSVG/>
            </>
        );
         */


        return (
            <>
                <MapLeaflet/>
            </>
        );
    }
}

export default HomePage;
