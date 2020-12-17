// Accounts' Schemas
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: UUID } = require('uuid');

const ServerSchema =
    new Schema({
        name: String,
        ip: {
            type: String,
            default: "192.168.1.1"
        },
        token: {
            type: String,
            default: UUID().toString()
        },
        createdAt: {
            type: Number,
            default: Date.now
        }
    }, {collection: 'server'});

// {server: ObjectId("5fbacfa1b9445012ab8b7271"), players: ["A", "B"]}
// db.hourlyplayersdensity.insertOne({server: ObjectId("5fbacfa1b9445012ab8b7271"), players: ["A", "B"]})
const HourlyPlayersDensitySchema =
    new Schema({
        timestamp: {
            type: Number,
            default: Date.now
        },
        server: {
            type: Schema.Types.ObjectId,
            ref: 'server'
        },
        players: {
            type: [String],
            default: []
        },
    }, {collection: 'hourlyplayersdensity'});

const DailyPlayersDensitySchema =
    new Schema({
        timestamp: {
            type: Number,
            default: Date.now
        },
        server: {
            type: Schema.Types.ObjectId,
            ref: 'server'
        },
        players: {
            type: Number,
            default: 0
        },
    }, {collection: 'dailyplayersdensity'});

const PlayerStatsSchema =
    new Schema({
        createdAt: {
            type: Number,
            default: Date.now
        },
        server: {
            type: Schema.Types.ObjectId,
            ref: 'server'
        },
        player: String,

        // The activity corresponds to the time spent on the server
        activity: {
            type: Number,
            default: 0
        }
    }, {collection: 'playerstats'});

const BulkDataSchema =
    new Schema({
        timestamp: {
            type: Number,
            default: Date.now
        },
        server: {
            type: Schema.Types.ObjectId,
            ref: 'server'
        },

        // Now the data, we put a lot and a lot of things here and if it is not given we don't care
        players: {
            type: [Object],
            default: undefined
        },
        factions: {
            type: [Object],
            default: undefined
        },
        stats: {
            type: Object,
            default: undefined
        }

    }, {collection: 'bulkdata'});

module.exports = {
    Server: mongoose.model('server', ServerSchema),
    BulkData: mongoose.model('bulkdata', BulkDataSchema),
    HourlyPlayersDensity: mongoose.model('hourlyplayersdensity', HourlyPlayersDensitySchema),
    DailyPlayersDensity: mongoose.model('dailyplayersdensity', DailyPlayersDensitySchema),
    PlayerStats: mongoose.model('playerstats', PlayerStatsSchema),
};
