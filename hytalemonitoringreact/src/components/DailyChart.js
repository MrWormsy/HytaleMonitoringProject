import React, {Component} from 'react';

import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';

import axios from "axios";
import moment from "moment";

import * as d3 from 'd3';

const qs = require('qs');

const range = [0, 256];

const chartMargin = {top: 5, right: 30, left: 20, bottom: 5};

class DailyChart extends Component {

    constructor(props) {
        super(props);

        let width = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).width;
        let height = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).height;

        width = width ? +width : 800;
        height = width ? ((+width) / 13.3333333333) : 60;


        // height = height ? +height : 60;

        this.state = {
            serverid: props.serverid,
            data: null,
            minValue: 0,
            maxValue: 0,
            windowWidth: width,
            windowHeigh: height
        };

        // We get the server by its id
        axios.get('/api/server/dailydensity/' + this.props.match.params.serverid)
            .then((response) => response.data)
            .then((data) => {

                // If the data gathered is an object and not null we know that this is the data we are looking for
                if (data !== null && typeof data === "object") {

                    // Get the max of the data
                    let maximum = Math.max(...data.map(d => d.players));

                    // We set the state as the data we have gathered and we process it to have it for each hours
                    this.setState({data: this.processData(data), maxValue: maximum});
                }

                // FIXME Do something
                // Else we do nothing
            });
    }

    // Process the data, that is to say add a date string of the day like 04/12 in a local format
    processData = (data) => {

        // The returned array
        let processedData = [];

        // Reduce the data to add the date formatted (which will be the (index + 1) days from today)
        data.reduce((acc, value, index) => {

            // Push the new data with the old one
            acc.push({
                timestamp: value.timestamp,
                "Player density": value.players + (Math.round((Math.random() * 1000) / 2)),
                date: moment(value.timestamp).subtract(index + 1, "day").format("L")
            });

            // Return the acc
            return acc;
        }, processedData);

        // Compare two objects infos by the timestamp
        function compareValues(a, b) {
            if (!a.hasOwnProperty("timestamp") || !b.hasOwnProperty("timestamp")) {
                return 0;
            }
            return a["timestamp"] - b["timestamp"];
        }

        // Sort the array in timestamp ascending
        processedData.sort(compareValues)

        return processedData;
    }


    // Used to render the tooltip
    renderTooltip = (props) => {
        const {active, payload} = props;

        if (active && payload && payload.length) {
            const data = payload[0] && payload[0].payload;

            return (
                <div style={{
                    backgroundColor: '#fff', border: '1px solid #999', margin: 0, padding: 10,
                }}
                >
                    <p>{moment(data.date).format("LL")}</p>
                    <p>
                        <span>Unique players online: </span>
                        {d3.format(",")(data["Player density"])}
                    </p>
                </div>
            );
        }

        return null;
    }

    // Tick formater
    yTicksFormater = (data) => {
        return d3.format(".2s")(data);
    }

    render() {

        // If data is null we return null
        if (this.state.data === null) {
            return null;
        }

        return (
            <ResponsiveContainer width={700} aspect={16 / 9}>
                <LineChart
                    data={this.state.data}
                    margin={chartMargin}
                >
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis axisLine={true} dataKey="date"/>
                    <YAxis tickFormatter={this.yTicksFormater} domain={["dataMin", "dataMax"]}
                           padding={{top: 10, bottom: 10}}/>
                    <Legend verticalAlign="top" height={36}/>
                    <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}}
                             content={this.renderTooltip}/>
                    <Line type="monotone" dataKey="Player density" stroke="#8884d8" activeDot={{r: 8}}/>
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

export default DailyChart;
