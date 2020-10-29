const express = require('express');
const router = express.Router();
const controller = require('../controllers');
const fs = require('fs');

const PNG = require('pngjs').PNG;

let imageSize = 384;

let images = {};

fs.createReadStream('./public/ressources/0.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["0"] = this;
    });

fs.createReadStream('./public/ressources/1.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["1"] = this;
    });

fs.createReadStream('./public/ressources/2.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["2"] = this;
    });

fs.createReadStream('./public/ressources/3.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["3"] = this;
    });

fs.createReadStream('./public/ressources/4.png')
    .pipe(new PNG())
    .on('parsed', function() {
        images["4"] = this;
    });

// z: 1 --> 1 * 1 chunk, 2 --> 2 * 2 chunk ... 11 --> 11 * 11 chunks

const levelOfZoom = 8;
// The levels of zoom is 16 that means that when z=1 we can have 2^16 = 65536 that is to say the span of x is [-2^15 -1, 2^15] like signed integers
// That is to say for a given z the x range is [-2^levelOfZoom-1 -1, 2^levelOfZoom-1] and x should be shifted to -2^levelOfZoom-1 -1 to be centered to 0

router.get('/api/tile/:x/:y/:z', ((req, res) => {

    let fs = require('fs');
    let PNG = require('pngjs').PNG;

    let x = +req.params.x;
    let y = +req.params.y;
    let z = +req.params.z;

    // We shift x and y to the middle
    x += (-Math.pow(2, levelOfZoom - z) - 1);
    y += (-Math.pow(2, levelOfZoom - z) - 1);

    // We create a destination image 512px by 512px
    let dst = new PNG({width: 1024 * z, height: 1024 * z});

    let chunk;
    for (let nbChunkX = 0; nbChunkX < z; nbChunkX++) {
        for (let nbChunkY = 0; nbChunkY < z; nbChunkY++) {
            chunk = [...Array(16 * 16).keys()].map(() => getRandomInteger(0, 4));

            chunk.forEach((d, i) => {

                // Draw the images into the chunk image
                images[d].bitblt(dst, 0, 0, 64, 64, (nbChunkX * 1024) + (i % 16) * 64, (nbChunkY * 1024) + (Math.floor(i/16)) * 64);
            })

        }
    }

    resize(dst, imageSize, imageSize).pack().pipe(res);

    /*
    fs.createReadStream('./public/ressources/0.png')
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
