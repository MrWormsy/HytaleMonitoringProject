import os
from PIL import Image
import anvil
import time
import threading

RESSOURCE_IMAGE_SIZE = 32
CHUNK_SIZE = 16
NUMBER_CHUNKS_IN_REGION = 32

maxImageLevel = 6

imagesMapping = ["air", "anvil_base","anvil_top_damaged_0","anvil_top_damaged_1","anvil_top_damaged_2","beacon","bed_feet_end","bed_feet_side","bed_feet_top","bed_head_end","bed_head_side","bed_head_top","bedrock","beetroots_stage_0","beetroots_stage_1","beetroots_stage_2","beetroots_stage_3","bookshelf","brewing_stand","brewing_stand_base","brick","cactus_bottom","cactus_side","cactus_top","cake_bottom","cake_inner","cake_side","cake_top","carrots_stage_0","carrots_stage_1","carrots_stage_2","carrots_stage_3","cauldron_bottom","cauldron_inner","cauldron_side","cauldron_top","chain_command_block_back","chain_command_block_conditional","chain_command_block_front","chain_command_block_side","chorus_flower","chorus_flower_dead","chorus_plant","clay","coal_block","coal_ore","coarse_dirt","cobblestone","cobblestone_mossy","cocoa_stage_0","cocoa_stage_1","cocoa_stage_2","command_block_back","command_block_conditional","command_block_front","command_block_side","comparator_off","comparator_on","crafting_table_front","crafting_table_side","crafting_table_top","daylight_detector_inverted_top","daylight_detector_side","daylight_detector_top","deadbush","debug","debug2","destroy_stage_0","destroy_stage_1","destroy_stage_2","destroy_stage_3","destroy_stage_4","destroy_stage_5","destroy_stage_6","destroy_stage_7","destroy_stage_8","destroy_stage_9","diamond_block","diamond_ore","dirt","dirt_podzol_side","dirt_podzol_top","dispenser_front_horizontal","dispenser_front_vertical","door_acacia_lower","door_acacia_upper","door_birch_lower","door_birch_upper","door_dark_oak_lower","door_dark_oak_upper","door_iron_lower","door_iron_upper","door_jungle_lower","door_jungle_upper","door_spruce_lower","door_spruce_upper","door_wood_lower","door_wood_upper","double_plant_fern_bottom","double_plant_fern_top","double_plant_grass_bottom","double_plant_grass_top","double_plant_paeonia_bottom","double_plant_paeonia_top","double_plant_rose_bottom","double_plant_rose_top","double_plant_sunflower_back","double_plant_sunflower_bottom","double_plant_sunflower_front","double_plant_sunflower_top","double_plant_syringa_bottom","double_plant_syringa_top","dragon_egg","dropper_front_horizontal","dropper_front_vertical","emerald_block","emerald_ore","enchanting_table_bottom","enchanting_table_side","enchanting_table_top","end_bricks","endframe_eye","endframe_side","endframe_top","end_rod","end_stone","farmland_dry","farmland_wet","fern","fire_layer_0","fire_layer_1","flower_allium","flower_blue_orchid","flower_dandelion","flower_houstonia","flower_oxeye_daisy","flower_paeonia","flower_pot","flower_rose","flower_tulip_orange","flower_tulip_pink","flower_tulip_red","flower_tulip_white","frosted_ice_0","frosted_ice_1","frosted_ice_2","frosted_ice_3","furnace_front_off","furnace_front_on","furnace_side","furnace_top","glass","glass_black","glass_blue","glass_brown","glass_cyan","glass_gray","glass_green","glass_light_blue","glass_lime","glass_magenta","glass_orange","glass_pane_top","glass_pane_top_black","glass_pane_top_blue","glass_pane_top_brown","glass_pane_top_cyan","glass_pane_top_gray","glass_pane_top_green","glass_pane_top_light_blue","glass_pane_top_lime","glass_pane_top_magenta","glass_pane_top_orange","glass_pane_top_pink","glass_pane_top_purple","glass_pane_top_red","glass_pane_top_silver","glass_pane_top_white","glass_pane_top_yellow","glass_pink","glass_purple","glass_red","glass_silver","glass_white","glass_yellow","glowstone","gold_block","gold_ore","grass_block","grass_path_side","grass_path_top","grass_side","grass_side_overlay","grass_side_snowed","grass_top","gravel","hardened_clay","hardened_clay_stained_black","hardened_clay_stained_blue","hardened_clay_stained_brown","hardened_clay_stained_cyan","hardened_clay_stained_gray","hardened_clay_stained_green","hardened_clay_stained_light_blue","hardened_clay_stained_lime","hardened_clay_stained_magenta","hardened_clay_stained_orange","hardened_clay_stained_pink","hardened_clay_stained_purple","hardened_clay_stained_red","hardened_clay_stained_silver","hardened_clay_stained_white","hardened_clay_stained_yellow","hay_block_side","hay_block_top","hopper_inside","hopper_outside","hopper_top","ice","ice_packed","iron_bars","iron_block","iron_ore","iron_trapdoor","itemframe_background","jukebox_side","jukebox_top","ladder","lapis_block","lapis_ore","lava_flow","lava_still","leaves_acacia","leaves_big_oak","leaves_birch","leaves_jungle","leaves_oak","leaves_spruce","lever","log_acacia","log_acacia_top","log_big_oak","log_big_oak_top","log_birch","log_birch_top","log_jungle","log_jungle_top","log_oak","log_oak_top","log_spruce","log_spruce_top","melon_side","melon_stem_connected","melon_stem_disconnected","melon_top","mob_spawner","mushroom_block_inside","mushroom_block_skin_brown","mushroom_block_skin_red","mushroom_block_skin_stem","mushroom_brown","mushroom_red","mycelium_side","mycelium_top","nether_brick","netherrack","nether_wart_stage_0","nether_wart_stage_1","nether_wart_stage_2","noteblock","obsidian","piston_bottom","piston_inner","piston_side","piston_top_normal","piston_top_sticky","planks_acacia","planks_big_oak","planks_birch","planks_jungle","planks_oak","planks_spruce","portal","potatoes_stage_0","potatoes_stage_1","potatoes_stage_2","potatoes_stage_3","prismarine_bricks","prismarine_dark","prismarine_rough","pumpkin_face_off","pumpkin_face_on","pumpkin_side","pumpkin_stem_connected","pumpkin_stem_disconnected","pumpkin_top","purpur_block","purpur_pillar","purpur_pillar_top","quartz_block_bottom","quartz_block_chiseled","quartz_block_chiseled_top","quartz_block_lines","quartz_block_lines_top","quartz_block_side","quartz_block_top","quartz_ore","rail_activator","rail_activator_powered","rail_detector","rail_detector_powered","rail_golden","rail_golden_powered","rail_normal","rail_normal_turned","red_sand","red_sandstone_bottom","red_sandstone_carved","red_sandstone_normal","red_sandstone_smooth","red_sandstone_top","redstone_block","redstone_dust_dot","redstone_dust_line0","redstone_dust_line1","redstone_dust_overlay","redstone_lamp_off","redstone_lamp_on","redstone_ore","redstone_torch_off","redstone_torch_on","reeds","repeater_off","repeater_on","repeating_command_block_back","repeating_command_block_conditional","repeating_command_block_front","repeating_command_block_side","sand","sandstone_bottom","sandstone_carved","sandstone_normal","sandstone_smooth","sandstone_top","sapling_acacia","sapling_birch","sapling_jungle","sapling_oak","sapling_roofed_oak","sapling_spruce","sea_lantern","slime","snow","soul_sand","sponge","sponge_wet","stone","stone_andesite","stone_andesite_smooth","stonebrick","stonebrick_carved","stonebrick_cracked","stonebrick_mossy","stone_diorite","stone_diorite_smooth","stone_granite","stone_granite_smooth","stone_slab_side","stone_slab_top","structure_block","structure_block_corner","structure_block_data","structure_block_load","structure_block_save","tallgrass","tnt_bottom","tnt_side","tnt_top","torch_on","trapdoor","trip_wire","trip_wire_source","vine","water","water_flow","waterlily","water_overlay","water_still","web","wheat_stage_0","wheat_stage_1","wheat_stage_2","wheat_stage_3","wheat_stage_4","wheat_stage_5","wheat_stage_6","wheat_stage_7","wool_colored_black","wool_colored_blue","wool_colored_brown","wool_colored_cyan","wool_colored_gray","wool_colored_green","wool_colored_light_blue","wool_colored_lime","wool_colored_magenta","wool_colored_orange","wool_colored_pink","wool_colored_purple","wool_colored_red","wool_colored_silver","wool_colored_white","wool_colored_yellow"]

listOfBlocks = []

imgs = {}

def getAllRegionFiles():

    regions = []

    for file in os.listdir("./regions"):
        if file.endswith(".mca"):
            regions.append([anvil.Region.from_file('./regions/' + file), "%s_%s" % (file.split('.')[1], file.split('.')[2])])


    return regions

# We want to get the image for a whole region (32 chunks by 32 chunks) thus we will
def getImageImageFromRegion(regionPair, region):

    timea = time.time()

    # Create a new Image with a given size
    image = Image.new(mode = "RGBA", size = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE * NUMBER_CHUNKS_IN_REGION, RESSOURCE_IMAGE_SIZE * CHUNK_SIZE * NUMBER_CHUNKS_IN_REGION))

    for xChunk in range(32):
        for zChunk in range(32):
            try:

                chunkImage = getAllYImages(region.get_chunk(xChunk, zChunk))

                # Paste the image if it exists
                image.paste(chunkImage, (xChunk * (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE), zChunk * (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE)))

                # chunkImage.save("./chunkImages/chunk_%s_%s.png" % (xChunk, zChunk))
            except:

                # If it does not exist we pass
                pass

    image.save("./regionImages/region_%s.png" % regionPair)

    print("Region %s -> %s s" % (regionPair, time.time() - timea))

# We want to get the image for a whole region (32 chunks by 32 chunks) thus we will
def getImageImageFromRegionUsingThreads(region):

    pass

    threads = []

    # Create a new Image with a given size
    image = Image.new(mode = "RGBA", size = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE * NUMBER_CHUNKS_IN_REGION, RESSOURCE_IMAGE_SIZE * CHUNK_SIZE * NUMBER_CHUNKS_IN_REGION))

    for xChunk in range(32):
            try:

                thread = threading.Thread(target=getAllYImagesUsingThreads, args=(image, xChunk, region))

                threads.append(thread)

                thread.start()

                # getAllYImagesUsingThreads(image, xChunk, zChunk, region.get_chunk(xChunk, zChunk))

            except:

                # If it does not exist we pass
                pass

    for t in threads:
        t.join()

    image.save("region.png")

def getImageFromChunk(chunk):

    # Create a new Image with a given size
    image = Image.new(mode = "RGBA", size = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE, RESSOURCE_IMAGE_SIZE * CHUNK_SIZE))

    chunkDataHighestBlock = getChunkHighestBlocks(chunk)

    for (index, data) in enumerate(chunkDataHighestBlock):
        try:
            Image.Image.paste(image, imgs[data], ((index % 16) * RESSOURCE_IMAGE_SIZE, (index // 16) * RESSOURCE_IMAGE_SIZE))
        except:
            pass

    return image

def getImageFromChunkOld(chunk):

    # Create a new Image with a given size
    image = Image.new(mode = "RGBA", size = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE, RESSOURCE_IMAGE_SIZE * CHUNK_SIZE))

    chunkDataHighestBlock = getChunkHighestBlocks(chunk)

    for (index, data) in enumerate(chunkDataHighestBlock):
        try:
            Image.Image.paste(image, imgs[data], ((index % 16) * RESSOURCE_IMAGE_SIZE, (index // 16) * RESSOURCE_IMAGE_SIZE))
        except:
            pass

    return image

def getHighestBlockAt(chunk, x, z):
    highestBlock = chunk.get_block(x, 0, z)
    highestZ = 0

    for y in range(256):
        block = chunk.get_block(x, y, z)

        if not block.id in listOfBlocks:
            listOfBlocks.append(block.id)

        if not block.id == "air":
            highestBlock = block
            highestZ = y

    return (highestBlock, highestZ)

# Get an array with the highest blocks
def getChunkHighestBlocks(chunk):
    array = []
    for index in range(16 * 16):
        array.append(getHighestBlockAt(chunk, index%16, index//16)[0].id)

    return array

def getAllYImages(chunk):
    # Create a new Image with a given size
    image = Image.new(mode = "RGBA", size = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE, RESSOURCE_IMAGE_SIZE * CHUNK_SIZE))

    for x in range(16):
        for z in range(16):
            for y in range(256):
                try:
                    block = chunk.get_block(x=x, y=y, z=z)
                    if (not block.id == "air"):
                        image.paste(imgs[block.id], (x * RESSOURCE_IMAGE_SIZE, z * RESSOURCE_IMAGE_SIZE))
                except:
                    pass

    return image

def getAllYImagesUsingThreads(mainImage, xChunk, region):

    for zChunk in range(32):

        chunk = region.get_chunk(xChunk, zChunk)

        # Create a new Image with a given size
        image = Image.new(mode = "RGBA", size = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE, RESSOURCE_IMAGE_SIZE * CHUNK_SIZE))

        for x in range(16):
            for z in range(16):
                for y in range(256):
                    try:
                        block = chunk.get_block(x=x, y=y, z=z)
                        if (not block.id == "air"):
                            image.paste(imgs[block.id], (x * RESSOURCE_IMAGE_SIZE, z * RESSOURCE_IMAGE_SIZE))
                    except:
                        pass

        mainImage.paste(image, (xChunk * (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE), zChunk * (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE)))

def loadTextures():
    for imgName in imagesMapping:
        tempImage = Image.open('ressources/' + imgName + '.png').resize((RESSOURCE_IMAGE_SIZE, RESSOURCE_IMAGE_SIZE))
        tempImage.load()
        imgs[imgName] = tempImage

    print("Block textures are loaded")

# Create an image from a chunk
def createChunkImagesFromRegion(region, regionId):

    # Get the region coordinates
    regionX = int(regionId.split("_")[0])
    regionZ = int(regionId.split("_")[1])

    # Create every Chunks' images
    for xChunk in range(32):
        for zChunk in range(32):
            createChunkImage(region, xChunk, zChunk, regionX, regionZ)

"""
def getRegionFromChunkCoordinate(x, z):
    return [x - ()]

def getChunkCoordinateFromRegionAndRelativeChunk()
"""


def createChunkImage(region, xChunk, zChunk, regionX, regionZ):

    # Then get the y cumulated texture
    # Create a new Image with a given size
    image = Image.new(mode = "RGBA", size = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE, RESSOURCE_IMAGE_SIZE * CHUNK_SIZE))


    try:
        # Get the chunk
        chunk = region.get_chunk(xChunk, zChunk)

        for x in range(16):
            for z in range(16):
                image.paste(getYTexture(chunk, x, z), (x * RESSOURCE_IMAGE_SIZE, z * RESSOURCE_IMAGE_SIZE))
    except:
        pass

    # Save the image
    image.save("./levels/level1/%s_%s.png" % (((regionX << 5) + xChunk), ((regionZ << 5) + zChunk)))

def getYTexture(chunk, x, z):

    # Create a new Image with a given size
    image = Image.new(mode = "RGBA", size = (RESSOURCE_IMAGE_SIZE, RESSOURCE_IMAGE_SIZE))

    # Loop through all the blocks in the chunk from the bottom to the top
    for y in range(256):
        try:
            block = chunk.get_block(x=x, y=y, z=z)
            if (not block.id == "air"):
                image = Image.blend(image, imgs[block.id], alpha=1)
                # image.paste(imgs[block.id], (0, 0))
        except:
            pass

    # Return the image of the y coordinate
    return image

def createLevelNImagesFromRegionId(regionId, level):

    # Get the region coordinates
    regionX = int(regionId.split("_")[0])
    regionZ = int(regionId.split("_")[1])

    # We want to loop through all the chunks of this section
    for x in range(int(32 >> (level-1))):
        for z in range(int(32 >> (level-1))):
            concatenateImages(regionX, regionZ, x, z, level)

    print("Level %s done !" % level)


def concatenateImages(regionX, regionZ, x, z, level):

    rc2 = int(RESSOURCE_IMAGE_SIZE * CHUNK_SIZE / 2)

    image = Image.new(mode = "RGBA", size = (RESSOURCE_IMAGE_SIZE * CHUNK_SIZE, RESSOURCE_IMAGE_SIZE * CHUNK_SIZE))

    # print(regionX, regionX * (32 >> (level - 1)) + x*2)
    # print(regionZ, regionZ * (32 >> (level - 1)) + z*2 + 1)

    # factor = 1 << (level - 1)
    factor = 2

    baseX = int((regionX * 32) / (1 << (level - 2)))
    baseZ = int((regionZ * 32) / (1 << (level - 2)))

    # Level 2
    # section 0,-1 => upper left chunk = 0, -32
    # 0,-32 1,-32
    # 0,-31 1,-31
    # => it will become 0,-16

    # Level 3
    # section 0,-1 => upper left chunk = 0, -16
    # 0,-16 1,-15
    # 0,-16 1,-15
    # => it will become 0,-8

    try:
        image.paste(Image.open("./levels/level%s/%s_%s.png" % ((level-1), baseX + factor*x, baseZ + factor*z)).resize((rc2, rc2)), (0, 0))
        image.paste(Image.open("./levels/level%s/%s_%s.png" % ((level-1), baseX + factor*x + 1, baseZ + factor*z)).resize((rc2, rc2)), (rc2, 0))
        image.paste(Image.open("./levels/level%s/%s_%s.png" % ((level-1), baseX + factor*x, baseZ + factor*z + 1)).resize((rc2, rc2)), (0, rc2))
        image.paste(Image.open("./levels/level%s/%s_%s.png" % ((level-1), baseX + factor*x + 1, baseZ + factor*z + 1)).resize((rc2, rc2)), (rc2, rc2))
    except:
        pass

    # Save the image
    image.save("./levels/level%s/%s_%s.png" % (level, int(baseX / factor) + x, int(baseZ / factor) + z))

if __name__ == '__main__':

    # Load the textures
    loadTextures()

    # Get all the regions
    regions = getAllRegionFiles()

    # The first thing we want to do it to create the images for the chunks which will be the level 1
    # createChunkImagesFromRegion(regions[0][0], regions[0][1])

    # Loop for maxImageLevel levels
    for level in range(1, maxImageLevel + 1):

        # Loop all the regions
        for region in regions:

            # If the level is 1 that is to say we want to create the
            if level == 1:
                createChunkImagesFromRegion(region[0], region[1])
            else:
                createLevelNImagesFromRegionId(region[1], level)

    # Now that we have all the images of the chunks we can group those chunks 2 by 2
    # createLevelNImagesFromRegionId(regions[0][1], 2)

    # Now the next level ie. 3
    # createLevelNImagesFromRegionId(regions[0][1], 3)
    # createLevelNImagesFromRegionId(regions[0][1], 4)
    # createLevelNImagesFromRegionId(regions[0][1], 5)
    # createLevelNImagesFromRegionId(regions[0][1], 6)











    """
    pass

    timea = time.time()

    regions = getAllRegionFiles()

    threads = []

    for regionData in regions:

        thread = threading.Thread(target=getImageImageFromRegion, args=(regionData[1], regionData[0]))
        threads.append(thread)
        thread.start()

    for t in threads:
        t.join()

    # 280 -160

    print(regions)


    # getImageImageFromRegion(anvil.Region.from_file('./regions/r.0.-1.mca'))


    # getImageImageFromRegionUsingThreads(anvil.Region.from_file('./regions/r.0.-1.mca'))



    print("%s s" % (time.time() - timea))

    # getAllYImages(anvil.Region.from_file('./regions/r.0.-1.mca').get_chunk(21, 31)).save("chunkTest.png")

    """
