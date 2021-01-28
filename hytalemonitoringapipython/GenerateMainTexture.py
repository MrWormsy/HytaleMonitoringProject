# the material decorator
def Material(idArray=[], dataArray=[0], **kwargs):

    # We do this way to be sure both idArray and dataArray are iterable
    try:
        iter(idArray)
    except Exception:
        idArray = [idArray,]
    try:
        iter(dataArray)
    except Exception:
        dataArray = [dataArray,]

    def myFunc(func):
        print(idArray)
        print(dataArray)

        return func

    return myFunc

@Material(idArray=1, dataArray=list(range(1)))
def testBlock(self, idArray, dataArray):

    print(self)

    self.testFunc()

    return "Coucou"

@Material(idArray=2, dataArray=list(range(3)))
def testBlock2(idArray, dataArray):
    return "Coucou"

if __name__ == '__main__':
    pass
