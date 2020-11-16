import anvil

def getHighestBlockAt(chunk, x, z):
    highestBlock = chunk.get_block(x, 0, z)
    highestZ = 0

    for y in range(256):
        block = chunk.get_block(x, y, z)
        if not block.id == "air":
            highestBlock = block
            highestZ = y

    return (highestBlock, highestZ)

region = anvil.Region.from_file('r.0.0.mca')

# You can also provide the region file name instead of the object
chunk = anvil.Chunk.from_region(region, 0, 0)

chunk = region.get_chunk(0, 0)

# Get an array with the highest blocks
def getChunkHighestBlocks(chunk):

    array = []

    for index in range(16 * 16):
        array.append(getHighestBlockAt(chunk, index%16, index//16)[0].id)

    return array

getChunkHighestBlocks(chunk)
