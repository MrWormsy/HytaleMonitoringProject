import React, {Component} from 'react';
import axios from 'axios';
import LoaderSpinner from "../LoaderSpinner";
import PlayersChart from "../PlayersChart";
import WeeklyChart from "../WeeklyChart";
import DailyChart from "../DailyChart";
import ServerMap from "./ServerMap";
import ScreenSizeBreakpoint from "../ScreenSizeBreakpoint";
import MediaQuery from "react-responsive";

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

                <ScreenSizeBreakpoint forceWidescreen={false}>
                    <div style={{overflow: 'auto'}} className="notification">

                        <div className="tile is-ancestor">

                            <div className="tile is-parent">
                                <article className="tile is-child box">
                                    <h1 className="title">My Hytale server</h1>
                                </article>
                            </div>

                            <MediaQuery minDeviceWidth={1216}>
                                <div className="tile is-parent">
                                    <article id="weeklyChart" className="tile is-child box">
                                        <WeeklyChart match={{params: {serverid: this.state.server._id}}}/>
                                    </article>
                                </div>
                            </MediaQuery>



                        </div>

                        <div className="tile is-ancestor">
                            <div className="tile is-parent">
                                <article className="tile is-child box">
                                    <PlayersChart match={{params: {serverid: this.state.server._id}}}/>
                                </article>
                            </div>
                            <div className="tile is-parent">
                                <article className="tile is-child box">
                                    <DailyChart match={{params: {serverid: this.state.server._id}}}/>
                                </article>
                            </div>
                        </div>

                        <div className="tile is-ancestor">
                            <article className="tile is-child box">
                                <ServerMap match={{params: {serverid: this.state.server._id}}}/>
                            </article>
                        </div>


                    </div>
                </ScreenSizeBreakpoint>
                )
                :

                <LoaderSpinner/>
        );
    }
}

export default ServerPage;

/*



                        <div style={{float: "left"}}><WeeklyChart width={800} match={{params: {serverid: this.state.server._id}}}/></div>
                        <div style={{float: "left"}}><DailyChart width={600} match={{params: {serverid: this.state.server._id}}}/></div>
                        <div style={{float: "left"}}><PlayersChart width={500} match={{params: {serverid: this.state.server._id}}}/></div>
                        <div style={{clear: "both"}}><ServerMap width={"100%"} match={{params: {serverid: this.state.server._id}}}/></div>


                        <div style={{float: "left"}}>
                        <iframe src={"/viewserver/map/" + this.state.server._id} width="700" height={(700 / (16/9))}
                                frameBorder="0">Browser not compatible.
                        </iframe>
                        </div>


 */

/*

   <div class="tile is-ancestor">
                            <div class="tile is-vertical is-12">
                                <div class="tile">
                                    <div className="tile is-parent is-8">
                                        <article style={{padding: '10px'}} className="tile is-child is-info">
                                            <WeeklyChart width={800} match={{params: {serverid: this.state.server._id}}}/>
                                        </article>
                                    </div>
                                    <div class="tile is-parent is-vertical">
                                        <article style={{padding: '2px'}} class="tile is-child is-primary">
                                            <DailyChart match={{params: {serverid: this.state.server._id}}}/>
                                        </article>
                                        <article style={{padding: '10px'}} class="tile is-child is-warning">
                                            <PlayersChart match={{params: {serverid: this.state.server._id}}}/>
                                        </article>
                                    </div>
                                </div>
                                <div class="tile is-parent">
                                    <article class="tile is-child is-danger">
                                        <ServerMap match={{params: {serverid: this.state.server._id}}}/>
                                    </article>
                                </div>
                            </div>
                        </div>


 */
