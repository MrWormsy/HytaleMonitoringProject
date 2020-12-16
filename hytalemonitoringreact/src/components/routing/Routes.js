import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import HomePage from "../pages/HomePage";

import socketIOClient from "socket.io-client";
import ServerMap from "../pages/ServerMap";
import ServerPage from "../pages/ServerPage";
import WeeklyChart from "../WeeklyChart";
import DailyChart from "../DailyChart";

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

            <Switch>
                <Route exact path="/" component={HomePage}/>
                <Route path="/home" component={HomePage}/>
                <Route path="/viewserver/map/:serverid" component={ServerMap}/>
                <Route path="/viewserver/weeklychart/:serverid" component={WeeklyChart}/>
                <Route path="/viewserver/dailychart/:serverid" component={DailyChart}/>
                <Route path="/server/:serverid" component={ServerPage}/>
            </Switch>

        )
    }
}

export {Routes, socket};
