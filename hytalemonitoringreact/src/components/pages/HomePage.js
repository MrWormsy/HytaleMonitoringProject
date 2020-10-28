import React, {Component} from 'react';
import MapCanvas from "../MapCanvas";
import ChunkGenerator from "../ChunkGenerator";
import MapSVG from "../MapSVG";

class HomePage extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
            <MapSVG/>
            </>
        );
    }
}

export default HomePage;
