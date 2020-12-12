# luigid &
# python3 BatchLuigi.py --scheduler-host localhost MainBatch

import os
import pprint
import time

import luigi
from bson import ObjectId
from pymongo import MongoClient

TASK_DATA_FOLDER = './tasksData/'

# The mongo client
mongoClient = MongoClient('mongodb://localhost:27017/')

# The HytaleMonitoring Database
hytaleMonitoringDatabase = mongoClient['hytalemonitoring']

# The collections
bulkdataCollection = hytaleMonitoringDatabase['bulkdata']
hourlyplayersdensityCollection = hytaleMonitoringDatabase['hourlyplayersdensity']
playerstatsCollection = hytaleMonitoringDatabase['playerstats']

# The server ids we want to proceed
serverIds = ["5fbacfa1b9445012ab8b7271"]


class StepPurge(luigi.Task):
    # Remove the log file
    for file in os.listdir(TASK_DATA_FOLDER):
        os.remove(TASK_DATA_FOLDER + file)

    # Requires nothing
    def requires(self):
        return None

    # The output
    def output(self):
        return luigi.LocalTarget(TASK_DATA_FOLDER + 'StepPurge.log')

    # Run
    def run(self):
        with self.output().open('w') as outfile:
            outfile.write('Step one begins\n')


# Step that takes the data of the last hour from the bulk data
class StepGetLastHourDataForServer(luigi.Task):

    # The constructor
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.lastHourData = []
        self.timestampAtBatch = None
        self.minTimestamp = None
        self.maxTimestamp = None

    # This step takes a parameter (the serverId)
    serverId = luigi.Parameter()

    # Step that requires the purge
    def requires(self):
        return StepPurge()

    # The output
    def output(self):
        return luigi.LocalTarget(TASK_DATA_FOLDER + 'StepGetLastHourDataForServer_{}log'.format(self.serverId))

    # Run the Step
    def run(self):
        with self.output().open('w') as outfile:
            outfile.write('StepGetLastHourDataForServer for server {} begins\n'.format(self.serverId))

            self.timestampAtBatch = time.time() * 1000

            # Number of ms in an hour
            oneHourInMs = 60 * 60 * 1000

            # We want to get the data of the last hour (in ms) AND the server
            # Loop through the data and keep only the timestamps and the players
            for currentData in bulkdataCollection.find(
                    {"server": ObjectId(self.serverId), "timestamp": {"$gte": self.timestampAtBatch - oneHourInMs}}):

                # Get the max and the min timestamp
                if self.minTimestamp is None or self.maxTimestamp is None:
                    self.minTimestamp = currentData["timestamp"]
                    self.maxTimestamp = currentData["timestamp"]
                else:
                    self.minTimestamp = min(self.minTimestamp, currentData["timestamp"])
                    self.maxTimestamp = max(self.maxTimestamp, currentData["timestamp"])

                self.lastHourData.append({"timestamp": currentData["timestamp"], "players": currentData["players"]})

            # If there is no data and thus minTimestamp and maxTimestamp are None we set it as now
            if self.minTimestamp is None or self.maxTimestamp is None:
                self.minTimestamp = self.timestampAtBatch
                self.maxTimestamp = self.timestampAtBatch


# Get the player density of last our for a given server
class StepGetHourPlayerDensity(luigi.Task):

    # The constructor
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # The needed step
        self.stepGetLastHourDataForServer = None

        # The unique player during last hour
        self.uniquePlayers = None

    # This step takes a parameter (the serverId)
    serverId = luigi.Parameter()

    # It requires the StepGetLastHourDataForServer for the server
    def requires(self):
        self.stepGetLastHourDataForServer = StepGetLastHourDataForServer(self.serverId)

        return self.stepGetLastHourDataForServer

    # The output
    def output(self):
        return luigi.LocalTarget(TASK_DATA_FOLDER + 'StepGetHourPlayerDensity_{}log'.format(self.serverId))

    # Run
    def run(self):
        with self.output().open('w') as outfile:
            outfile.write('StepGetHourPlayerDensity for server {} begins\n'.format(self.serverId))

            # The unique players set
            self.uniquePlayers = set()

            # We want to get the unique players that have been in the server the past hour
            for data in self.stepGetLastHourDataForServer.lastHourData:
                # As we are working with a set we just have to add the data
                # and it will check if a player must be added or not
                self.uniquePlayers.update(data["players"])

            # When all the data has been processed we can save it to the database,
            # where the timestamp is the minimum timestamp of the data
            hourlyplayersdensityCollection.insert_one(
                {"timestamp": self.stepGetLastHourDataForServer.minTimestamp, "server": ObjectId(self.serverId),
                 "players": len(self.uniquePlayers)})


# Update the time spent of a player on a server
class StepUpdatePlayerTimeSpentOnServer(luigi.Task):

    # The constructor
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # The needed step
        self.stepGetLastHourDataForServer = None

    # This step takes a parameter (the serverId)
    serverId = luigi.Parameter()

    # It requires the StepGetLastHourDataForServer for the server
    def requires(self):

        self.stepGetLastHourDataForServer = StepGetLastHourDataForServer(self.serverId)

        return self.stepGetLastHourDataForServer

    # The output
    def output(self):
        return luigi.LocalTarget(TASK_DATA_FOLDER + 'StepUpdatePlayerTimeSpentOnServer_{}log'.format(self.serverId))

    # Run
    def run(self):
        with self.output().open('w') as outfile:
            outfile.write('StepUpdatePlayerTimeSpentOnServer for server {} begins\n'.format(self.serverId))

            # We need to get how many minutes the players has been playing on the server
            playerTimeSpentDict = {}

            lastTimestamp = None
            timeSpent = None
            for data in self.stepGetLastHourDataForServer.lastHourData:

                # If this is not the first element we can proceed, otherwise we wait
                if lastTimestamp is not None:

                    # The time spent between the last timestamp (in seconds)
                    timeSpent = round((data["timestamp"] - lastTimestamp) / 1000)

                    # We loop though all the players and add the time (in s)
                    for player in data["players"]:

                        # If the player key do not exists we add one with a default time 0
                        if player not in playerTimeSpentDict:
                            playerTimeSpentDict[player] = 0

                        # Increment the time spent of the player (is s)
                        playerTimeSpentDict[player] += timeSpent

                # We update the last timestamp value
                lastTimestamp = data["timestamp"]

            # We will need to do an upsert to be sure that the data will be added
            # even if the database do not contains the player's stats
            # We add an activity to the player's stats database
            for player in playerTimeSpentDict:
                playerstatsCollection.update_one(
                    {"player": player, "server": ObjectId(self.serverId)},
                    {"$push": {"activity": {"d": playerTimeSpentDict[player],
                                            "t": self.stepGetLastHourDataForServer.minTimestamp}}},
                    True
                )


# This is the batch called every hour, which requires a lot of
# steps and then remove the data from the bulkData collection
class StepProcessHourlyBatchOnServer(luigi.Task):

    # The constructor
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # This step will be used to know at which moment we will need to delete the data from the bulkData collection
        self.stepGetLastHourDataForServer = None

        # This step is used to get get the hourly density of a server in term of players
        self.stepGetHourPlayerDensity = None

        # This step is used to update the time spent of a list of player on a given server
        self.stepUpdatePlayerTimeSpentOnServer = None

    # This step takes a parameter (the serverId)
    serverId = luigi.Parameter()

    # It requires the StepGetLastHourDataForServer for the server
    def requires(self):
        self.stepGetLastHourDataForServer = StepGetLastHourDataForServer(self.serverId)
        self.stepGetHourPlayerDensity = StepGetHourPlayerDensity(self.serverId)
        self.stepUpdatePlayerTimeSpentOnServer = StepUpdatePlayerTimeSpentOnServer(self.serverId)

        return [self.stepGetLastHourDataForServer, self.stepGetHourPlayerDensity,
                self.stepUpdatePlayerTimeSpentOnServer]

    # The output
    def output(self):
        return luigi.LocalTarget(TASK_DATA_FOLDER + 'StepProcessHourlyBatchOnServer_{}log'.format(self.serverId))

    # Run
    def run(self):
        with self.output().open('w') as outfile:
            outfile.write('StepProcessHourlyBatchOnServer for server {} begins\n'.format(self.serverId))

            # Once the requirements are fulfilled we can delete all the data of the server in the bulkData collection
            # gathered before the launch of the batch (TEST : OK)
            bulkdataCollection.delete_many({"server": ObjectId(self.serverId),
                                            "timestamp": {"$lte": self.stepGetLastHourDataForServer.maxTimestamp}})


class MainBatch(luigi.Task):

    # Requires to gather the bulk data of the last hour for the server
    def requires(self):
        # The steps that gather the data of the last hour
        self.steps = [{"serverId": serverId, "step": StepProcessHourlyBatchOnServer(serverId)} for serverId in
                      serverIds]

        # Return the required tasks
        return [stepDict["step"] for stepDict in self.steps]

    # The output
    def output(self):
        return luigi.LocalTarget(TASK_DATA_FOLDER + 'MainBatch.log')

    # Run
    def run(self):
        with self.output().open('w') as outfile:
            outfile.write('MainBatch begins\n')

            for data in hourlyplayersdensityCollection.find():
                pprint.pprint(data, outfile)


if __name__ == '__main__':
    luigi.run()
