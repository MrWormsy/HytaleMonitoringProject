import React, {Component} from 'react';
import axios from 'axios';
import LoaderSpinner from "../LoaderSpinner";
import PlayersChart from "../PlayersChart";

class ServerPage extends Component {

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
            this.state.server ? (

                    <>

                        <iframe src={"/viewserver/weeklychart/" + this.state.server._id + "?width=800&height=420"}
                                width="800" height="420" frameBorder="0">Browser not compatible.
                        </iframe>

                        <iframe src={"/viewserver/map/" + this.state.server._id} width="300" height="300"
                                frameBorder="0">Browser not compatible.
                        </iframe>

                        <PlayersChart/>

                    </>
                )
                :

                <LoaderSpinner/>
        );
    }
}

export default ServerPage;
