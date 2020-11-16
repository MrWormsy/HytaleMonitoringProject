const express = require('express');
const router = express.Router();
const controller = require('../controllers');
const fs = require('fs');

const PNG = require('pngjs').PNG;

// Default chunk image size which is the size of the ressource in px * 16
const blockPerChunks = 16;

const ressourceImageSize = 32;

const chunkImageSize = ressourceImageSize * blockPerChunks;

let imageSize = 512;

let sectionImages = {};

/*
["0_0","0_-2","0_-1","1_-1","1_0","1_-2","-1_0","-1_-1","-1_-2"].forEach((d) => {
    fs.createReadStream('./public/ressources/regionImages/region_' + d + ".png")
        .pipe(new PNG())
        .on('parsed', function() {
            sectionImages[d] = this
            console.log("DONE")
        });
})

 */

let images = {};

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

let testImage;
fs.createReadStream('./public/ressources/test.png')
    .pipe(new PNG())
    .on('parsed', function() {
        testImage = this;
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



// Maximum value of zoom
const maxLevelOfZoom = 16;

router.get('/api/tile/:x/:y/:z', ((req, res) => {
    // res.sendFile('chunkImage/chunk_0_0.png');

    let x = +req.params.x;
    let y = +req.params.y;
    let z = +req.params.z;

    // We shift x and y to the middle
    x += (-Math.pow(2, maxLevelOfZoom - z));
    y += (-Math.pow(2, maxLevelOfZoom - z));

    res.sendFile(`chunk_${x}_${y}.png`, { root: __dirname + '/../public/chunkImages/' });
}))


router.get('/api2/tile/:x/:y/:z', ((req, res) => {

    let x = +req.params.x;
    let y = +req.params.y;
    let z = +req.params.z;

    // We shift x and y to the middle
    x += (-Math.pow(2, maxLevelOfZoom - z));
    y += (-Math.pow(2, maxLevelOfZoom - z));

    // The is used not to calculate this value each time
    let twoPowZMinusOne = Math.pow(2, z - 1);

    x *= twoPowZMinusOne
    y *= twoPowZMinusOne

    let dst = new PNG({width: (ressourceImageSize * blockPerChunks) * twoPowZMinusOne, height: (ressourceImageSize * blockPerChunks) * twoPowZMinusOne});

    let sectionCoord = getSectionXAndY(x, y)

            let left = (sectionCoord[2]) * (ressourceImageSize * blockPerChunks)
            let top = (sectionCoord[3]) * (ressourceImageSize * blockPerChunks)
            let width = (ressourceImageSize * blockPerChunks) * twoPowZMinusOne
            let height = (ressourceImageSize * blockPerChunks) * twoPowZMinusOne

            // We check if the section exists
            if (sectionImages.hasOwnProperty(`${sectionCoord[0]}_${sectionCoord[1]}`)) {

                sectionImages[`${sectionCoord[0]}_${sectionCoord[1]}`].bitblt(dst , left, top, width, height, 0, 0)

                // Now we want to past temp to dst
                //resize(temp, imageSize / twoPowZMinusOne, imageSize / twoPowZMinusOne).bitblt(dst, 0, 0, 0, 0, xShifting * (imageSize / twoPowZMinusOne), yShifting * (imageSize / twoPowZMinusOne))
    }

    dst.pack().pipe(res);

}));

function getSectionXAndY(x, y) {
    // We first need to get the section where the chunk is and then the x and y relative positions of the chunk (the Top left)
    let sectionX = x >> 5
    let sectionY = y >> 5

    relativeX = 0
    if (x >= 0) {
        relativeX = x % 32
    } else {
        relativeX = (x + 32) % 32
    }

    relativeY = 0
    if (y >= 0) {
        relativeY = y % 32
    } else {
        relativeY = (y + 32) % 32
    }

    return [sectionX, sectionY, relativeX, relativeY]
}

router.get('/api/tiletest/:x/:y/:z', ((req, res) => {
    resize(testImage, 512, 512).pack().pipe(res);
}));

router.get('/api/tileold/:x/:y/:z', ((req, res) => {

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
    x += (-Math.pow(2, maxLevelOfZoom - z));
    y += (-Math.pow(2, maxLevelOfZoom - z));

    // The is used not to calculate this value each time
    let twoPowZMinusOne = Math.pow(2, z - 1);

    // We create a destination image with the scale
    let dst = new PNG({width: chunkImageSize * twoPowZMinusOne, height: chunkImageSize * twoPowZMinusOne});

    let chunk, key;
    for (let nbChunkX = 0; nbChunkX < twoPowZMinusOne; nbChunkX++) {
        for (let nbChunkY = 0; nbChunkY < twoPowZMinusOne; nbChunkY++) {

            key = `${x * twoPowZMinusOne + nbChunkX}_${y * twoPowZMinusOne + nbChunkY}`;

            chunk = chunks[key];
            // console.log(key)

            if (!chunk) {
                chunk = [...Array(16 * 16).keys()].map(() => getRandomInteger(1, 6));
            }

            chunk.forEach((d, i) => {

                // Draw the images into the chunk image
                images[d].bitblt(dst, 0, 0, ressourceImageSize, ressourceImageSize, (nbChunkX * chunkImageSize) + (i % 16) * ressourceImageSize, (nbChunkY * chunkImageSize) + (Math.floor(i/16)) * ressourceImageSize);
            })

        }
    }

    resize(dst, imageSize, imageSize).pack().pipe(res);
}));


function resize(srcPng, width, height) {
    let rez = new PNG({
        width: width,
        height: height
    });
    for(let i = 0; i < width; i++) {
        let tx = i / width,
            ssx = Math.floor(tx * srcPng.width);
        for(let j = 0; j < height; j++) {
            let ty = j / height,
                ssy = Math.floor(ty * srcPng.height);
            let indexO = (ssx + srcPng.width * ssy) * 4,
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
