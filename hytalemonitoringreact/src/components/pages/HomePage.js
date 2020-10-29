import React, {Component} from 'react';
import MapLeaflet from "../MapLeaflet";

class HomePage extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <MapLeaflet/>
            </>
        );
    }
}

export default HomePage;
