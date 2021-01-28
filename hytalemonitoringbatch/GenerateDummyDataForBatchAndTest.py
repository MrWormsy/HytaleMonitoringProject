import time
import os

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

server = "5fbacfa1b9445012ab8b7271"

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


def runHourlyBatch():
    stream = os.popen('/media/mrwormsy/Data/Projects/Hytale/HytaleMonitoring/venv/bin/python /media/mrwormsy/Data/Projects/Hytale/HytaleMonitoring/hytalemonitoringbatch/BatchLuigi.py --local-scheduler StepProcessHourlyBatchOnServer --serverId=5fbacfa1b9445012ab8b7271')
    stream.read()


def runDailyBatch():
    stream = os.popen('/media/mrwormsy/Data/Projects/Hytale/HytaleMonitoring/venv/bin/python /media/mrwormsy/Data/Projects/Hytale/HytaleMonitoring/hytalemonitoringbatch/BatchLuigi.py --local-scheduler StepProcessDailyBatchOnServer --serverId=5fbacfa1b9445012ab8b7271')
    stream.read()


def runOneWeekBatchWithDummyData():

    # The idea here is to run generateDummyBulkData and then run the batch 24 * 7 * 25 = 168 * 25 times
    for i in range(24 * 25):
        generateDummyBulkData(server)

        # Every hour we want to run a hourly batch
        runHourlyBatch()

        # Every 24 hours we want to run a daily batch
        if (i + 1) % 24 == 0:
            runDailyBatch()


if __name__ == '__main__':
    # generateDummyBulkData(server)

    runOneWeekBatchWithDummyData()
