from PIL import Image, ImageEnhance
import numpy
import math

class Textures():


        def __init__(self):

            self.textureSize = 24
            self.textureDimensions = (self.textureSize, self.textureSize)

        @staticmethod
        def transform_image_top(img):
            """Takes a PIL image and rotates it left 45 degrees and shrinks the y axis
            by a factor of 2. Returns the resulting image, which will be 24x12 pixels

            """

            # Resize to 17x17, since the diagonal is approximately 24 pixels, a nice
            # even number that can be split in half twice
            img = img.resize((17, 17), Image.ANTIALIAS)

            # Build the Affine transformation matrix for this perspective
            transform = numpy.matrix(numpy.identity(3))
            # Translate up and left, since rotations are about the origin
            transform *= numpy.matrix([[1,0,8.5],[0,1,8.5],[0,0,1]])
            # Rotate 45 degrees
            ratio = math.cos(math.pi/4)
            #transform *= numpy.matrix("[0.707,-0.707,0;0.707,0.707,0;0,0,1]")
            transform *= numpy.matrix([[ratio,-ratio,0],[ratio,ratio,0],[0,0,1]])
            # Translate back down and right
            transform *= numpy.matrix([[1,0,-12],[0,1,-12],[0,0,1]])
            # scale the image down by a factor of 2
            transform *= numpy.matrix("[1,0,0;0,2,0;0,0,1]")

            transform = numpy.array(transform)[:2,:].ravel().tolist()

            newimg = img.transform((24,12), Image.AFFINE, transform)
            return newimg


        @staticmethod
        def transform_image_side(img):
            """Takes an image and shears it for the left side of the cube (reflect for
            the right side)"""

            # Size of the cube side before shear
            img = img.resize((12,12), Image.ANTIALIAS)

            # Apply shear
            transform = numpy.matrix(numpy.identity(3))
            transform *= numpy.matrix("[1,0,0;-0.5,1,0;0,0,1]")

            transform = numpy.array(transform)[:2,:].ravel().tolist()

            newimg = img.transform((12,18), Image.AFFINE, transform)

            return newimg


        def build_block(self, top, side):
            """From a top texture and a side texture, build a block image.
            top and side should be 16x16 image objects. Returns a 24x24 image

            """
            img = Image.new("RGBA", (24,24))

            top = self.transform_image_top(top)

            if not side:
                return img

            side = self.transform_image_side(side)
            otherside = side.transpose(Image.FLIP_LEFT_RIGHT)

            img.paste(side, (0, 6), side)
            img.paste(otherside, (12, 6), otherside)
            img.paste(top, (0, 0), top)

            # Manually touch up 6 pixels that leave a gap because of how the
            # shearing works out. This makes the blocks perfectly tessellate-able
            for x,y in [(13,23), (17,21), (21,19)]:
                # Copy a pixel to x,y from x-1,y
                img.putpixel((x,y), img.getpixel((x-1,y)))
            for x,y in [(3,4), (7,2), (11,0)]:
                # Copy a pixel to x,y from x+1,y
                img.putpixel((x,y), img.getpixel((x+1,y)))

            img.save('side.png')

            return img



if __name__ == "__main__":

    texture = Textures()

    dirt = Image.open('ressources/grass_side.png')
    grass = Image.open('ressources/grass_block.png')

    newImage = texture.build_block(grass, dirt)

    newImage.save('iso.png')
