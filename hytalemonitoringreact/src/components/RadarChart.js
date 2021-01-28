import React, {Component} from 'react';

import {PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Radar, RadarChart, ResponsiveContainer} from 'recharts';

class MyRadarChart extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        const data = [
            {
                "subject": "Math",
                "A": 120,
                "B": 110,
                "fullMark": 150
            },
            {
                "subject": "Chinese",
                "A": 98,
                "B": 130,
                "fullMark": 150
            },
            {
                "subject": "English",
                "A": 86,
                "B": 130,
                "fullMark": 150
            },
            {
                "subject": "Geography",
                "A": 99,
                "B": 100,
                "fullMark": 150
            },
            {
                "subject": "Physics",
                "A": 85,
                "B": 90,
                "fullMark": 150
            },
            {
                "subject": "Histzzzzory",
                "A": 65,
                "B": 85,
                "fullMark": 150
            },
            {
                "subject": "Histazezeazeazory1",
                "A": 65,
                "B": 85,
                "fullMark": 150
            },
            {
                "subject": "Historrry1",
                "A": 65,
                "B": 85,
                "fullMark": 150
            },
            {
                "subject": "Histeazeazory1",
                "A": 65,
                "B": 85,
                "fullMark": 150
            },
            {
                "subject": "Histoezry1",
                "A": 65,
                "B": 85,
                "fullMark": 150
            },
            {
                "subject": "Historey1",
                "A": 65,
                "B": 85,
                "fullMark": 150
            },
            {
                "subject": "History1a",
                "A": 65,
                "B": 85,
                "fullMark": 150
            }
        ]

        return (
            <ResponsiveContainer aspect={1}>
                <RadarChart data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={["auto", "auto"]} />
                    <Radar name="Lily" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Legend />

                </RadarChart>

            </ResponsiveContainer>
        );
    }
}

export default MyRadarChart;
