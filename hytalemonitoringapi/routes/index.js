const express = require('express');
const router = express.Router();
const controller = require('../controllers');
const fs = require('fs');

router.post('/api/addchunkimage/:chunkId', (req, res) => {

    // Remove the old one (if it exists)
    controller.getChunkImagePath(req.params.chunkId).then((result) => {

        // if the result is not null we delete this file
        if (result !== null) {
            try {
                fs.unlinkSync(result);
            } catch (err) {
                console.error(err)
            }
        }

        controller.upload(req, res, (err) => {

            if (!err) {
                return res.sendStatus(200).end();
            }
        });
    });
});

module.exports = router;
