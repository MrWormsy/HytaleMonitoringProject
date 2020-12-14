import time

from random import seed, randint

from bson import ObjectId
from pymongo import MongoClient

# The seed init
seed(time.time())

# The mongo client
mongoClient = MongoClient('mongodb://localhost:27017/')

# The HytaleMonitoring Database
hytaleMonitoringDatabase = mongoClient['hytalemonitoring']

# The collections
bulkdataCollection = hytaleMonitoringDatabase['bulkdata']
hourlyplayersdensityCollection = hytaleMonitoringDatabase['hourlyplayersdensity']
playerstatsCollection = hytaleMonitoringDatabase['playerstats']


def generateDummyBulkData(serverId):
    now = time.time() * 1000

    data = []

    # We want to generate data from now to one hour before with random players
    for i in range(60):
        data.append({"server": ObjectId(serverId),
                     "players": ["Player{}".format(randint(0, 1000)) for j in range(0, randint(0, 20))],
                     "timestamp": now - ((60 - i) * 1000 * 60),
                     })

    # Insert the data
    bulkdataCollection.insert_many(data)

server = "5fbacfa1b9445012ab8b7271"

if __name__ == '__main__':
    generateDummyBulkData(server)
