import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import HomePage from "../pages/HomePage";

import socketIOClient from "socket.io-client";
import ServerMap from "../pages/ServerMap";
import ServerPage from "../pages/ServerPage";
import WeeklyChart from "../WeeklyChart";
import DailyChart from "../DailyChart";
import PlayersChart from "../PlayersChart";
import Navbar from "../Navbar";
import MyRadarChart from "../RadarChart";

let socket;

class Routes extends Component {

    constructor() {
        super();

        const uri = 'http://localhost:3000/myHytaleServer';
        const options = {
            withCredentials: true,
            extraHeaders: {"Access-Control-Allow-Credentials": "true"},
            'transports': ['websocket']
        };

        socket = socketIOClient(uri, options);
    }

    render() {
        return (
        <div>
            <Navbar/><Switch>
                <Route exact path="/" component={HomePage}/>
                <Route path="/home" component={HomePage}/>
                <Route path="/viewserver/map/:serverid" component={ServerMap}/>
                <Route path="/viewserver/weeklychart/:serverid" component={WeeklyChart}/>
                <Route path="/viewserver/dailychart/:serverid" component={DailyChart}/>
                <Route path="/viewserver/playerchart/:serverid" component={PlayersChart}/>
                <Route path="/viewserver/radarchart/:serverid" component={MyRadarChart}/>
                <Route path="/server/:serverid" component={ServerPage}/>
            </Switch>
        </div>
        )
    }
}

export {Routes, socket};
