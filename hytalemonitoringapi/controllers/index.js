const mongoose = require('mongoose');
const Models = require('../models');

// Get the data of a server by its ID
const getServerData = async (serverId) => {

    let response = undefined;

    await Models.Server.findOne({_id: serverId}).then((result) => {
        response = result;
    })


    return response;
}

// Get a server by its token
const getServerByToken = async (token) => {

    let response = undefined;

    await Models.Server.findOne({token: token}).then((result) => {

        // Set the response as the result (if it is null that means this server does not exist)
        response = result;
    }).catch(error => {

        // If we get an error the response will be null
        response = null;
    })

    // Return the response
    return response;
}

// Get the last 7 * 24 = 168 records from the hourly player density to have a vision of the density in the last week

// FIXME We can do that or just send the data with less value and the frontend will deal with it
// If there is no enough data (only 5 records for example) we can return 0s
const getLastWeeklyPlayerDensityOfServer = async (serverId) => {

    // The limit
    let limit = 7 * 24;

    // The response
    let response = [];

    await Models.HourlyPlayersDensity.find({server: serverId}).sort({$natural:-1}).limit(limit).then((result) => {

        // We first want to loop through the response and only keep the number of players and the timestamp
        result.reduce((acc, data) => {

            // Give the data needed
            let currentData = {};
            currentData["timestamp"] = data.timestamp;
            currentData["players"] = data.players.length;

            // Push the data to the acc
            acc.push(currentData);

            return acc;
        }, response);

        // Set the response as the result (if it is null that means this server does not exist)
        // response = result;
    }).catch(error => {

        // If we get an error the response will be null
        response = null;
    })

    // Return the response
    return response;
}

// Get the density of the last 25 days (if there is no data we send 0)
const getDailyDensity = async (serverId) => {

    // The limit (the last 25 days)
    let limit = 7 * 24;

    // The response
    let response = [];

    await Models.HourlyPlayersDensity.find({server: serverId}).sort({$natural:-1}).limit(limit).then((result) => {

        // We first want to loop through the response and only keep the number of players and the timestamp
        result.reduce((acc, data) => {

            // Give the data needed
            let currentData = {};
            currentData["timestamp"] = data.timestamp;
            currentData["players"] = data.players;

            // Push the data to the acc
            acc.push(currentData);

            return acc;
        }, response);

        // Set the response as the result (if it is null that means this server does not exist)
        // response = result;
    }).catch(error => {

        // If we get an error the response will be null
        response = null;
    })

    // Return the response
    return response;
}

const saveBulkData = async (server, data) => {

    // Create a model with all the data
    const theData = {...data};

    // For the players we only want to keep the names and not the coordinates
    theData.players = data.players.map(d => d.name);

    const bulkData = new Models.BulkData({server: server._id, ...theData});

    let response = undefined;

    // Try to save the response
    await bulkData.save().then((result) => {
        response = result;

        // If the data has been saved we want to emit a players event in the server's corresponding namespace ONLY if there is a player field
        if (result.players) {

            let playersObjectToSocketIO = {};

            // Loop throught the array of players
            data.players.forEach(player => {
                playersObjectToSocketIO[player.name] = player;
            })

            // Emit the event
            require('../app').myHytaleServer.emit('playersEvent', playersObjectToSocketIO);
        }


    }).catch(error => {
        response = error;
    })

    return response;
}

// Add a server
const addServer = async (serverData) => {
    const server = new Models.Server({name: serverData.name, ip: serverData.ip});

    let response = undefined;

    await server.save().then((result) => {
        response = result;
    })

    return response;
}

// Exports all the functions
module.exports = {getServerData, addServer, getServerByToken, saveBulkData, getLastWeeklyPlayerDensityOfServer};
