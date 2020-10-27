const mongoose = require('mongoose');
const Models = require('../models');
const multer = require("multer");
const path = require("path");
const fs = require('fs');


// Know if the user has already a profile pic
function getChunkImagePath(chunkId) {
    return new Promise((resolveImage => {

        // We want to only search for png at the moment
        let promises = [];

        ['png'].forEach((ext) => {

            let promise = new Promise(((resolve) => {

                fs.access('public/uploads/' + chunkId + '.' + ext, fs.F_OK, (err) => {
                    if (err) {

                        // File does not exist
                        resolve(null);
                        return;
                    }

                    // File exists
                    resolve('public/uploads/' + chunkId + '.' + ext)
                });

            }));

            promises.push(promise);
        });

        Promise.all(promises).then((result) => {

            let imageLink = null;

            // We loop throught the results, if we get only null this means there is no images
            result.forEach((image) => {
                if (image !== null) {
                    imageLink = image;
                }
            })

            resolveImage(imageLink);
        })
    }))
}

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function (req, file, cb) {
        cb(null, req.params.chunkId + "." +  file.mimetype.split('/')[1]);
    }
});

const upload = multer({
    storage: storage,
    limits: function () {
        return 1000000;
    },
}).single("image");

module.exports.upload = upload;
module.exports.getChunkImagePath = getChunkImagePath;
