const express = require('express');
const router = express.Router();
const controller = require('../controllers');
const fs = require('fs');

const PNG = require('pngjs').PNG;

// Default chunk image size which is the size of the ressource in px * 16
const blockPerChunks = 16;

const ressourceImageSize = 16;

const chunkImageSize = ressourceImageSize * blockPerChunks;

let imageSize = 512;

let images = {};

fs.createReadStream('./public/ressources/0.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["0"] = resize(this, ressourceImageSize, ressourceImageSize);
    });

fs.createReadStream('./public/ressources/1.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["1"] = resize(this, ressourceImageSize, ressourceImageSize);
    });

fs.createReadStream('./public/ressources/2.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["2"] = resize(this, ressourceImageSize, ressourceImageSize);
    });

fs.createReadStream('./public/ressources/3.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["3"] = resize(this, ressourceImageSize, ressourceImageSize);
    });

fs.createReadStream('./public/ressources/4.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["4"] = resize(this, ressourceImageSize, ressourceImageSize);
    });

fs.createReadStream('./public/ressources/5.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["5"] = resize(this, ressourceImageSize, ressourceImageSize);
    });

// The max number of dezoom is 6 (that is equivalent to 64 * 64 chunks and 1024 * 1024 block which is more than enough)
const maxZoomLevel = 6;

// For a given z we will be
// z: 1 --> 2^0 * 2^0 chunk, 2 --> 2^1 * 2^1 chunk ... 6 --> 2^5 * 2^5 chunks

const levelsOfZoom = 16;
// If we have a level of zoom of 16 this means we can have 2^16 chunks in x and the same in y that is to say 2^16 * 16 (nb of blocks in a chunk) = 1 048 576 blocks which is enough
// but we will only be able to have

// FIXME NOT SO SURE NOW IT IS MAYBE A MISTAKE
// The levels of zoom is 16 that means that when z=1 we can have 2^16 = 65536 that is to say the span of x is [-2^15 -1, 2^15] like signed integers
// That is to say for a given z the x range is [-2^levelsOfZoom-1, 2^levelsOfZoom-1] and x should be shifted to -2^levelsOfZoom-1 to be centered to 0 (same thing with y)

router.get('/api/tile/:x/:y/:z', ((req, res) => {

    let fs = require('fs');

    let chunks = {}

    chunks["0_0"] = JSON.parse(fs.readFileSync('./public/ressources/0_0.json'));
    chunks["0_1"] = JSON.parse(fs.readFileSync('./public/ressources/0_1.json'));
    chunks["1_0"] = JSON.parse(fs.readFileSync('./public/ressources/1_0.json'));
    chunks["1_1"] = JSON.parse(fs.readFileSync('./public/ressources/1_1.json'));
    chunks["-1_0"] = JSON.parse(fs.readFileSync('./public/ressources/-1_0.json'));

    let PNG = require('pngjs').PNG;

    let x = +req.params.x;
    let y = +req.params.y;
    let z = +req.params.z;

    // We shift x and y to the middle

    x += (-Math.pow(2, levelsOfZoom - z));
    y += (-Math.pow(2, levelsOfZoom - z));

    // If x=0 and y=0
    // k = 1 => [[0, 0]]
    // k = 2 => [[0, 0], [1, 0], [0, 1], [1, 1]]

    // If k = 1 the chunks will be 1*1 => [x_y]
    // If k = 2 the chunks will be 2*2 => [x_y, x+1_y, x_y+1, x+1_y+1]
    // If k = 3 the chunks will be 4*4
    // Thus the chunks will be (2^k-1) * (2^k-1)

    let twoPowZMinusOne = (Math.pow(2, z - 1));


    // We create a destination image with the scale
    let dst = new PNG({width: chunkImageSize * (twoPowZMinusOne), height: chunkImageSize * (twoPowZMinusOne)});

    let chunk, key;
    for (let nbChunkX = 0; nbChunkX < twoPowZMinusOne; nbChunkX++) {
        for (let nbChunkY = 0; nbChunkY < twoPowZMinusOne; nbChunkY++) {
            // chunk = [...Array(16 * 16).keys()].map(() => getRandomInteger(0, 4));

            key = `${x * twoPowZMinusOne + nbChunkX}_${y * twoPowZMinusOne + nbChunkY}`;

            chunk = chunks[key];
            // console.log(key)

            if (!chunk) {
                chunk = [...Array(16 * 16).keys()].map(() => getRandomInteger(1, 5));
            }

            chunk.forEach((d, i) => {

                // Draw the images into the chunk image
                images[d].bitblt(dst, 0, 0, ressourceImageSize, ressourceImageSize, (nbChunkX * chunkImageSize) + (i % 16) * ressourceImageSize, (nbChunkY * chunkImageSize) + (Math.floor(i/16)) * ressourceImageSize);
            })

        }
    }

    resize(dst, imageSize, imageSize).pack().pipe(res);

    /*
    fs.createReadStream('./public/ressources/5.png')
        .pipe(new PNG())
        .on('parsed', function() {

            this.bitblt(dst, 0, 0, 64, 64, 0, 0);
            this.bitblt(dst, 0, 0, 64, 64, 0, 64);
            this.bitblt(dst, 0, 0, 64, 64, 64, 0);
            this.bitblt(dst, 0, 0, 64, 64, 64, 64);

            dst.pack().pipe(res);
        });
     */

}));


function resize(srcPng, width, height) {
    var rez = new PNG({
        width:width,
        height:height
    });
    for(var i = 0; i < width; i++) {
        var tx = i / width,
            ssx = Math.floor(tx * srcPng.width);
        for(var j = 0; j < height; j++) {
            var ty = j / height,
                ssy = Math.floor(ty * srcPng.height);
            var indexO = (ssx + srcPng.width * ssy) * 4,
                indexC = (i + width * j) * 4,
                rgbaO = [
                    srcPng.data[indexO  ],
                    srcPng.data[indexO+1],
                    srcPng.data[indexO+2],
                    srcPng.data[indexO+3]
                ]
            rez.data[indexC  ] = rgbaO[0];
            rez.data[indexC+1] = rgbaO[1];
            rez.data[indexC+2] = rgbaO[2];
            rez.data[indexC+3] = rgbaO[3];
        }
    }
    return rez;
}


/*

router.get('/api/tile/:x/:y/:k', ((req, res) => {
    controller.getImageFromChunks(req.params.x, req.params.y, req.params.k).then((result) => {

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-disposition': 'attachment;filename=' + filename,
            'Content-Length': data.length
        });
        res.end(Buffer.from(data, 'binary'));

    }).catch((error => {
        res.json(error);
    }))
}));


 */
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

const getRandomInteger = (min = 0, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = router;
