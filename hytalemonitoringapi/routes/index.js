const express = require('express');
const router = express.Router();
const controller = require('../controllers');
const fs = require('fs');
const Models = require("../models");

router.get('/', ((req, res) => {
    res.json("OK")
}));
router.post('/', ((req, res) => {
    res.json("OK")
}));

// Get a server by its id
// TODO CHANGE THE ID !!
router.get('/api/server/:serverid', ((req, res) => {

    // Search a server by its ID req.params.serverid
    controller.getServerData("5fbacfa1b9445012ab8b7271").then((result) => {
        res.json(result);
    }).catch((error) => {
        res.json(error);
    })

}));

// Get the last 7 days player density (1 data equals 1 hour)
// TODO CHANGE THE ID !!
router.get('/api/server/hourlydensity/:serverid', ((req, res) => {

    // Search a server by its ID req.params.serverid
    controller.getHourlyPlayerDensity("5fbacfa1b9445012ab8b7271").then((result) => {
        res.json(result);
    }).catch((error) => {
        res.json(error);
    })

}));

// Get the last 25 days player density (1 data equals 1 day)
// TODO CHANGE THE ID !!
router.get('/api/server/dailydensity/:serverid', ((req, res) => {

    // Search a server by its ID req.params.serverid
    controller.getDailyDensity("5fbacfa1b9445012ab8b7271").then((result) => {
        res.json(result);
    }).catch((error) => {
        res.json(error);
    })

}));

// Get the top 5 players in term of time spent
// TODO CHANGE THE ID !!
router.get('/api/server/topplayer/:serverid', ((req, res) => {

    // Search a server by its ID req.params.serverid
    controller.getPlayerLeaderboard("5fbacfa1b9445012ab8b7271").then((result) => {
        res.json(result);
    }).catch((error) => {
        res.json(error);
    })

}));

router.post('/api/sendData', ((req, res) => {

    // We first need to get the secret Token of the server to be sure this server is real
    let token = req.body.token;

    // We try to find the server by its token, but if we get a null value as a result this means the server does not exists thus we will return an error
    controller.getServerByToken(token).then((server) => {

        // If the result if null we throw an error
        if (server === null) {
            throw "This server does not exists";
        }

        // Else we try to save the data
        let data = req.body;

        return controller.saveBulkData(server, data);
    }).then((result) => {

        // Res the result of the save
        res.json(result);

    }).catch((error) => {

        console.log(error)

        // Return the error
        res.json(error);
    })
}));

router.get('/api/addServer', ((req, res) => {

    // Add a server by a name and an ip
    controller.addServer({name: "myhytaleserver"}).then((result) => {
        res.json(result);
    }).catch((error => {
        res.json(error);
    }))

}));

router.get('/dummy/addhourlydata', (async (req, res) => {

    const dummyData = new Models.HourlyPlayersDensity({server: "5fbacfa1b9445012ab8b7271", players: ["A", "B", "C", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]});

    let response = undefined;

    // Try to save the response
    await dummyData.save().then((result) => {
        response = result;

    }).catch(error => {
        response = error;
    })

    res.json(response);

}));

module.exports = router;
