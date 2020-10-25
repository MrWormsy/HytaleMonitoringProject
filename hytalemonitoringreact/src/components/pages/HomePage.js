import React, {Component} from 'react';
import MapCanvas from "../MapCanvas";

class HomePage extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MapCanvas/>
        );
    }
}

export default HomePage;
