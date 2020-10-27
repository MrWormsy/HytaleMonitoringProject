import React, {Component} from 'react';
import MapCanvas from "../MapCanvas";
import ChunkGenerator from "../ChunkGenerator";

class HomePage extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
            <MapCanvas/>
            </>
        );
    }
}

export default HomePage;
