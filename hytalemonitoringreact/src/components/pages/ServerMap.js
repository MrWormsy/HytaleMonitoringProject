import React, {Component} from 'react';
import MapLeaflet from "../MapLeaflet";
import axios from 'axios';
import LoaderSpinner from "../LoaderSpinner";

class ServerMap extends Component {

    constructor(props) {
        super(props);

        this.state = {server: null};

        // We get the server by its id
        axios.get('/api/server/' + this.props.match.params.serverid)
            .then((response) => response.data)
            .then((data) => {

                // If the data gathered is an object and not null we know that this is the server
                if (data !== null && typeof data === "object") {
                    this.setState({server: data});
                }

                // Else we redirect to the servers page because the server do not exists
                else {
                    this.props.history.push('/');
                    window.location.reload(false);
                }
            });
    }

    render() {
        return (

            this.state.server ?

                <MapLeaflet/>

                :

                <LoaderSpinner/>
        );
    }
}

export default ServerMap;
