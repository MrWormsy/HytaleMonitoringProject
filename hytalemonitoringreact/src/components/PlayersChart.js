import React, {Component} from 'react';

import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import axios from "axios";
import * as d3 from "d3";
import moment from "moment";

// const chartMargin = {top: 5, right: 30, left: 20, bottom: 5};
const chartMargin = {top: 0, right: 0, left: 0, bottom: 0};


class PlayersChart extends Component {

    constructor(props) {
        super(props);

        let width = props.width; // = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).width;
        let height // = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).height;

        width = width ? +width : undefined;
        height = width ? (width / (16/9)) : undefined;

        this.state = {data: null, windowWidth: width, windowHeight: height};

        // We get the server by its id
        axios.get('/api/server/topplayer/' + this.props.match.params.serverid)
            .then((response) => response.data)
            .then((data) => {

                // If the data gathered is an object and not null we know that this is the data we are looking for
                if (data !== null && typeof data === "object") {

                    // We set the state as the data we have gathered and we process it to have it for each hours
                    this.setState({data: data});
                }

                // FIXME Do something
                // Else we do nothing
            });

    }

    // Tick formater
    yTicksFormater = (data) => {
        return `${Math.floor(data / 60)}h`;
    }

    getFormatedDaysHoursMinutesOfSeconds = (seconds) => {

        let tempArray = [];

        // calculate (and subtract) whole days
        let days = Math.floor(seconds / 86400);
        seconds -= days * 86400;

        // If days are not 0 we add them
        if (days !== 0) {
            tempArray.push(`${days} days`);
        }

        // calculate (and subtract) whole hours
        let hours = Math.floor(seconds / 3600) % 24;
        seconds -= hours * 3600;

        // If hours are not 0 we add them
        if (hours !== 0) {
            tempArray.push(`${hours} hours`);
        }

        // calculate (and subtract) whole minutes
        let minutes = Math.floor(seconds / 60) % 60;
        seconds -= minutes * 60;

        // Push the minutes
        tempArray.push(`${minutes} minutes`);

        return tempArray.join(", ");
    }

    // Used to render the tooltip
    renderTooltip = (props) => {
        const {active, payload} = props;

        if (active && payload && payload.length) {
            const data = payload[0] && payload[0].payload;

            console.log(data)

            return (
                <div style={{
                    backgroundColor: '#fff', border: '1px solid #999', margin: 0, padding: 10,
                }}
                >
                    <p>{data.player}</p>
                    <p>{this.getFormatedDaysHoursMinutesOfSeconds(data.activity * 60)}</p>
                </div>
            );
        }

        return null;
    }


    renderLegend = (props) => {
        const { payload } = props;

        return (
            <ul>
                {
                    payload.map((entry, index) => (
                        <li key={`item-${index}`}>{entry.value}</li>
                    ))
                }
            </ul>
        );
    }

    render() {
        // If data is null we return null
        if (this.state.data === null) {
            return null;
        }

        console.log(this.state.data)

        return (
            <ResponsiveContainer width={this.state.windowWidth} aspect={16 / 9}>
                <BarChart
                    data={this.state.data}
                    margin={chartMargin}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="player" />
                    <YAxis hide={true} tickFormatter={this.yTicksFormater} domain={["auto", "auto"]}/>
                    <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}}
                             content={this.renderTooltip}/>
                    <Legend verticalAlign="top" formatter={() => "Top 5 Player's activity"} />
                    <Bar dataKey="activity" stackId="a" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        );
    }
}

export default PlayersChart;
