import io
from PIL import Image
from flask import (
    Flask,
    send_file
)

Image.MAX_IMAGE_PIXELS = 268435460
import random
import threading
import anvil
import os

# VARIABLES

IMAGE_SIZE = 512

RESSOURCE_IMAGE_SIZE = 32
CHUNK_SIZE = 16

# Maximum value of zoom
MAX_LEVEL_OF_ZOOM = 16

regions = {}
for r in ["-1.-1", "-1.-2", "-1.0", "0.-1", "0.-2", "0.0", "1.-1", "1.-2", "1.0"]:
    regions[r] = anvil.Region.from_file('./regions/r.' + r + '.mca')

# region = anvil.Region.from_file('r.0.0.mca')

bufferDict = {}

# Create the application instance
app = Flask(__name__, template_folder="templates")

def getSectionXAndY(x, y):
    # We first need to get the section where the chunk is and then the x and y relative positions of the chunk (the Top left)
    sectionX = x >> 5
    sectionY = y >> 5

    relativeX = 0
    if (x >= 0):
        relativeX = x % 32
    else:
        relativeX = (x + 32) % 32

    relativeY = 0
    if (y >= 0):
        relativeY = y % 32
    else:
        relativeY = (y + 32) % 32

    return [sectionX, sectionY, relativeX, relativeY]


@app.route('/api/tile/<int:x>/<int:y>/<int:z>')
def getTile(x, y, z):

    global bufferDict

    # We shift x and y to the middle
    x -= 2 ** (MAX_LEVEL_OF_ZOOM - z)
    y -= 2 ** (MAX_LEVEL_OF_ZOOM - z)

    # The is used not to calculate this value each time
    twoPowZMinusOne = 2 ** (z - 1)

    x *= twoPowZMinusOne
    y *= twoPowZMinusOne

    # print("x:%s - y:%s" % (x, y))

    # Create a new Image with a given size
    image = Image.new(mode="RGBA", size=(IMAGE_SIZE * twoPowZMinusOne, IMAGE_SIZE * twoPowZMinusOne))

    # Get the coordinates of the upper right chunk
    sectionCoord = getSectionXAndY(x, y)

    # Now we want to gather an image which has a length of twoPowZMinusOne chunks from the top left chunk
    left = (sectionCoord[2]) * (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE)
    top = (sectionCoord[3]) * (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE)
    width = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE) * twoPowZMinusOne
    height = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE) * twoPowZMinusOne

    box = (left, top, left + width, top + height)

    try:
        # image.paste(bufferDict["%s_%s" % (sectionCoord[0], sectionCoord[1])].crop(box).resize((int(IMAGE_SIZE), int(IMAGE_SIZE))), (0, 0))

        # Create the buffer array and write the image within it
        imageByteArray = io.BytesIO()
        bufferDict["%s_%s" % (sectionCoord[0], sectionCoord[1])].crop(box).resize((int(IMAGE_SIZE), int(IMAGE_SIZE))).save(imageByteArray, format='PNG')

        # Send the image
        return send_file(
            io.BytesIO(imageByteArray.getvalue()),
            mimetype='image/png',
            as_attachment=True,
            attachment_filename="%s_%s_%s.png" % (x, y, z))
    except:
        imageByteArray = io.BytesIO()
        Image.new(mode="RGBA", size=(IMAGE_SIZE * twoPowZMinusOne, IMAGE_SIZE * twoPowZMinusOne)).save(imageByteArray, format='PNG')

        # Send the image
        return send_file(
            io.BytesIO(imageByteArray.getvalue()),
            mimetype='image/png',
            as_attachment=True,
            attachment_filename="%s_%s_%s.png" % (x, y, z))


"""
@app.route('/api/tilev1/<int:x>/<int:y>/<int:z>')
def getTileV1(x, y, z):

    global bufferDict

    # We shift x and y to the middle
    x -= 2 ** (MAX_LEVEL_OF_ZOOM - z)
    y -= 2 ** (MAX_LEVEL_OF_ZOOM - z)

    # The is used not to calculate this value each time
    twoPowZMinusOne = 2 ** (z - 1)

    x *= twoPowZMinusOne
    y *= twoPowZMinusOne

    # print("x:%s - y:%s" % (x, y))

    # Create a new Image with a given size
    image = Image.new(mode="RGBA", size=(IMAGE_SIZE, IMAGE_SIZE))

    for xShifting in range(twoPowZMinusOne):
        for yShifting in range(twoPowZMinusOne):

            try:
                sectionCoord = getSectionXAndY(x + xShifting, y + yShifting)

                left = (sectionCoord[2]) * (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE)
                top = (sectionCoord[3]) * (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE)
                width = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE)
                height = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE)

                box = (left, top, left + width, top + height)


                # currentImage = Image.open("./regionImages/region_%s_%s.png" % (sectionCoord[0], sectionCoord[1])).crop(box).resize((int(IMAGE_SIZE / twoPowZMinusOne), int(IMAGE_SIZE / twoPowZMinusOne)))
                currentImage = bufferDict["%s_%s" % (sectionCoord[0], sectionCoord[1])].crop(box).resize((int(IMAGE_SIZE / twoPowZMinusOne), int(IMAGE_SIZE / twoPowZMinusOne)))

                image.paste(currentImage, (xShifting * int(IMAGE_SIZE / twoPowZMinusOne), yShifting * int(IMAGE_SIZE / twoPowZMinusOne)))

            except:
                pass

    # Create the buffer array and write the image within it
    imageByteArray = io.BytesIO()
    image.save(imageByteArray, format='PNG')

    # Send the image
    return send_file(
        io.BytesIO(imageByteArray.getvalue()),
        mimetype='image/png',
        as_attachment=True,
        attachment_filename="%s_%s_%s.png" % (x, y, z))
"""

def generateChunkData():
    return [random.randint(0, 5) for i in range(CHUNK_SIZE * CHUNK_SIZE)]


def getHighestBlockAt(chunk, x, z):
    highestBlock = chunk.get_block(x, 0, z)
    highestZ = 0

    for y in range(256):
        block = chunk.get_block(x, y, z)
        if not block.id == "air":
            highestBlock = block
            highestZ = y

    return (highestBlock, highestZ)


def getChunkDataFromStringId(chunkPair):
    try:

        xChunk = int(chunkPair.split('_')[0])
        zChunk = int(chunkPair.split('_')[1])

        # We want to get the region from the chunk
        regionX = int(xChunk // 32)
        regionZ = int(zChunk // 32)

        chunkXInRegion = (xChunk % 32) - 16
        # chunkXInRegion = 0
        chunkZInRegion = (xChunk % 32) - 16
        # chunkZInRegion = 0

        return getChunkHighestBlocks(regions["%s.%s" % (regionX, regionZ)].get_chunk(0, 0))

    except:
        return ["air" for i in range(CHUNK_SIZE * CHUNK_SIZE)]


# Get an array with the highest blocks
def getChunkHighestBlocks(chunk):
    array = []
    for index in range(16 * 16):
        array.append(getHighestBlockAt(chunk, index % 16, index // 16)[0].id)

    return array


def openImagesInBuffer():
    for file in os.listdir("./regionImages"):
        if file.endswith(".png"):

            image = Image.open('./regionImages/' + file)

            image.load()

            bufferDict[file.replace("region_", "").replace(".png", "")] = image

    print("Images have been loaded")


# If we're running in stand alone mode, run the application
if __name__ == '__main__':
    # Open the images in the buffer
    openImagesInBuffer()

    # Run the server
    app.run(host='0.0.0.0', port=3000, debug=False, threaded=False)
    # app.run(host='0.0.0.0', port=3000, debug=False, threaded=False)
