import React, {Component} from 'react';

class LoaderSpinner extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
                <div className="loader spinner"/>
        );
    }
}

export default LoaderSpinner;
