import React, {Component} from 'react';

import {ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,} from 'recharts';
import axios from "axios";
import moment from "moment";

import * as d3 from 'd3';

const qs = require('qs');

const range = [0, 256];

const chartMargin = {top: 10, right: 0, bottom: 0, left: 0};

class WeeklyChart extends Component {

    constructor(props) {
        super(props);

        let width = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).width;
        let height = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).height;

        width = width ? +width : 700;
        height = width ? (width / (16/9)) : 60;

        this.state = {
            serverid: props.serverid,
            data: null,
            minValue: 0,
            maxValue: 0,
            windowWidth: width,
            windowHeigh: height
        };

        // We get the server by its id
        axios.get('/api/server/hourlydensity/' + this.props.match.params.serverid)
            .then((response) => response.data)
            .then((data) => {

                // If the data gathered is an object and not null we know that this is the data we are looking for
                if (data !== null && typeof data === "object") {

                    // Get the max of the data
                    let maximum = Math.max(...data.map(d => d.players));

                    // We set the state as the data we have gathered and we process it to have it for each hours
                    this.setState({data: this.processWeeklyData(data), maxValue: maximum});
                }

                // FIXME Do something
                // Else we do nothing
            });
    }

    // Process the weekly data, that is to say we want to get the number of players for each hours and if there is no enough data we will have not to show a given amount of days
    processWeeklyData = (data) => {

        // Now
        const now = moment()

        // Get the list of day from now to the one before us
        let days = [];
        for (let i = 0; i < 7; i++) {
            days.push(moment().subtract(i, 'day').format("ddd"));
        }

        // We know that we have 7 * 24 values corresponding to the last 7 * 24 hours from now on (minus 1 because in the last hour we did not computed the data)
        let hoursWithDays = [];
        for (let i = 1; i <= 7 * 24; i++) {
            hoursWithDays.push({
                timestamp: +moment().subtract(i, 'hour').format("x"),
                hour: moment().subtract(i, 'hour').format("ha"),
                day: moment().subtract(i, 'hour').format("ddd")
            });
        }

        // The number of hours until 12PM (the -1 is used because we do not count this hour)
        let nbHoursUntil12PM = 24 - (+now.format("H"))

        // Now we want to map each of those hours to the values we received and we know that the timestamps are
        // decreasing, that is to say the first data corresponds of the last whole hour and so on...

        // If there is no enough data we dont care and set 0
        let mappedData = {}

        for (let i = 0; i < hoursWithDays.length; i++) {

            // If the mappedData does not have the day key, we add it
            if (!mappedData.hasOwnProperty(hoursWithDays[i].day)) {
                mappedData[hoursWithDays[i].day] = [];
            }

            // Get the value of this hour (if it exists in the data array).
            // But we dont want the data of the next hours of last week, ie. if this is 8:29 PM we only want the data
            // of today before 8PM, and thus 8PM = 0, 9PM = 0 and so on till midnight
            let value = data.length > i ? data[i].players : 0;

            if (i >= (7 * 24) - nbHoursUntil12PM) {
                value = 0;
            }

            mappedData[hoursWithDays[i].day].push({
                hour: hoursWithDays[i].hour,
                index: 1,
                value: value,
                timestamp: hoursWithDays[i].timestamp
            });
        }

        // Compare two objects infos by the hour
        function compareValues(a, b) {
            if (!a.hasOwnProperty("hour") || !b.hasOwnProperty("hour")) {
                return 0;
            }
            return moment("1970/01/01 " + a["hour"], "YYYY-MM-DD ha") - moment("1970/01/01 " + b["hour"], "YYYY-MM-DD ha")
        }

        // Sort each arrays by the date
        for (let key of Object.keys(mappedData)) {
            // mappedData[key] = mappedData[key].reverse();
            mappedData[key].sort(compareValues);
        }

        return mappedData;
    }

    // Parse the domain of the data
    parseDomain = () => [
        this.state.minValue,
        this.state.maxValue
    ];


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
                    <p>{moment(data.timestamp).format("LLL")}</p>
                    <p>
                        <span>Unique players online: </span>
                        {d3.format(",")(data.value)}
                    </p>
                </div>
            );
        }

        return null;
    }

    render() {

        // If data is null we return null
        if (this.state.data === null) {
            return null;
        }

        const domain = this.parseDomain();

        const chartWidth = this.state.windowWidth;
        const chartHeight = this.state.windowHeigh / 7;

        const xAxisInterval = 1;

        return (
            <ResponsiveContainer width={700} aspect={16 / 9}>

            <div>
                <ScatterChart
                    width={chartWidth}
                    height={chartHeight}
                    margin={chartMargin}
                >
                    <XAxis type="category" dataKey="hour" interval={xAxisInterval} tick={{fontSize: 0}}
                           tickLine={{transform: 'translate(0, -6)'}}/>
                    <YAxis type="number" dataKey="index" name="sunday" height={10} width={80} tick={false}
                           tickLine={false} axisLine={false}
                           label={{value: moment().subtract(6, 'day').format("ddd"), position: 'insideRight'}}/>
                    <ZAxis type="number" dataKey="value" domain={domain} range={range}/>
                    <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}}
                             content={this.renderTooltip}/>
                    <Scatter data={this.state.data[moment().subtract(6, 'day').format("ddd")]} fill="#8884d8"/>
                </ScatterChart>

                <ScatterChart
                    width={chartWidth}
                    height={chartHeight}
                    margin={chartMargin}
                >
                    <XAxis type="category" dataKey="hour" name="hour" interval={xAxisInterval} tick={{fontSize: 0}}
                           tickLine={{transform: 'translate(0, -6)'}}/>
                    <YAxis type="number" dataKey="index" height={10} width={80} tick={false} tickLine={false}
                           axisLine={false}
                           label={{value: moment().subtract(5, 'day').format("ddd"), position: 'insideRight'}}/>
                    <ZAxis type="number" dataKey="value" domain={domain} range={range}/>
                    <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}}
                             content={this.renderTooltip}/>
                    <Scatter data={this.state.data[moment().subtract(5, 'day').format("ddd")]} fill="#8884d8"/>
                </ScatterChart>

                <ScatterChart
                    width={chartWidth}
                    height={chartHeight}
                    margin={chartMargin}
                >
                    <XAxis type="category" dataKey="hour" name="hour" interval={xAxisInterval} tick={{fontSize: 0}}
                           tickLine={{transform: 'translate(0, -6)'}}/>
                    <YAxis type="number" dataKey="index" height={10} width={80} tick={false} tickLine={false}
                           axisLine={false}
                           label={{value: moment().subtract(4, 'day').format("ddd"), position: 'insideRight'}}/>
                    <ZAxis type="number" dataKey="value" domain={domain} range={range}/>
                    <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}}
                             content={this.renderTooltip}/>
                    <Scatter data={this.state.data[moment().subtract(4, 'day').format("ddd")]} fill="#8884d8"/>
                </ScatterChart>

                <ScatterChart
                    width={chartWidth}
                    height={chartHeight}
                    margin={chartMargin}
                >
                    <XAxis type="category" dataKey="hour" name="hour" interval={xAxisInterval} tick={{fontSize: 0}}
                           tickLine={{transform: 'translate(0, -6)'}}/>
                    <YAxis type="number" dataKey="index" height={10} width={80} tick={false} tickLine={false}
                           axisLine={false}
                           label={{value: moment().subtract(3, 'day').format("ddd"), position: 'insideRight'}}/>
                    <ZAxis type="number" dataKey="value" domain={domain} range={range}/>
                    <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}}
                             content={this.renderTooltip}/>
                    <Scatter data={this.state.data[moment().subtract(3, 'day').format("ddd")]} fill="#8884d8"/>
                </ScatterChart>

                <ScatterChart
                    width={chartWidth}
                    height={chartHeight}
                    margin={chartMargin}
                >
                    <XAxis type="category" dataKey="hour" name="hour" interval={xAxisInterval} tick={{fontSize: 0}}
                           tickLine={{transform: 'translate(0, -6)'}}/>
                    <YAxis type="number" dataKey="index" height={10} width={80} tick={false} tickLine={false}
                           axisLine={false}
                           label={{value: moment().subtract(2, 'day').format("ddd"), position: 'insideRight'}}/>
                    <ZAxis type="number" dataKey="value" domain={domain} range={range}/>
                    <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}}
                             content={this.renderTooltip}/>
                    <Scatter data={this.state.data[moment().subtract(2, 'day').format("ddd")]} fill="#8884d8"/>
                </ScatterChart>

                <ScatterChart
                    width={chartWidth}
                    height={chartHeight}
                    margin={chartMargin}
                >
                    <XAxis type="category" dataKey="hour" name="hour" interval={xAxisInterval} tick={{fontSize: 0}}
                           tickLine={{transform: 'translate(0, -6)'}}/>
                    <YAxis type="number" dataKey="index" height={10} width={80} tick={false} tickLine={false}
                           axisLine={false}
                           label={{value: moment().subtract(1, 'day').format("ddd"), position: 'insideRight'}}/>
                    <ZAxis type="number" dataKey="value" domain={domain} range={range}/>
                    <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}}
                             content={this.renderTooltip}/>
                    <Scatter data={this.state.data[moment().subtract(1, 'day').format("ddd")]} fill="#8884d8"/>
                </ScatterChart>

                <ScatterChart
                    width={chartWidth}
                    height={chartHeight}
                    margin={chartMargin}
                >
                    <XAxis type="category" dataKey="hour" name="hour" interval={1}
                           tickLine={{transform: 'translate(0, -6)'}}/>
                    <YAxis type="number" dataKey="index" height={10} width={80} tick={false} tickLine={false}
                           axisLine={false}
                           label={{value: moment().subtract(0, 'day').format("ddd"), position: 'insideRight'}}/>
                    <ZAxis type="number" dataKey="value" domain={domain} range={range}/>
                    <Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}}
                             content={this.renderTooltip}/>
                    <Scatter data={this.state.data[moment().subtract(0, 'day').format("ddd")]} fill="#8884d8"/>
                </ScatterChart>
                </div>
            </ResponsiveContainer>
        );
    }
}

export default WeeklyChart;
