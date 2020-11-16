(function () {
    var app = angular.module('minecraftCoordinateTools', []);
    app.controller('CoordinateController', function () {
        this.block = {x: 0, y: 0, z: 0, changed: false};
        this.chunk = {x: 0, y: 0, z: 0, minBlock: {x: 0, y: 0, z: 0}, maxBlock: {x: 0, y: 0, z: 0}, changed: false};
        this.region = {
            x: 0,
            z: 0,
            minBlock: {x: 0, y: 0, z: 0},
            maxBlock: {x: 0, y: 0, z: 0},
            minChunk: {x: 0, y: 0, z: 0},
            maxChunk: {x: 0, y: 0, z: 0},
            changed: false,
            text: ""
        };
        this.getMinBlockFromChunk = function (chunk) {
            return {x: chunk.x << 4, y: chunk.y << 4, z: chunk.z << 4};
        }
        this.getMaxBlockFromChunk = function (chunk) {
            return {x: (chunk.x + 1 << 4) - 1, y: (chunk.y + 1 << 4) - 1, z: (chunk.z + 1 << 4) - 1};
        }
        this.getMinChunkFromRegion = function (region) {
            return {x: region.x << 5, y: 0, z: region.z << 5};
        }
        this.getMaxChunkFromRegion = function (region) {
            return {x: (region.x + 1 << 5) - 1, y: 15, z: (region.z + 1 << 5) - 1};
        }
        this.resetBlockCoordinates = function () {
            this.block.x = 0;
            this.block.y = 0;
            this.block.z = 0;
            this.block.changed = false;
        }
        this.resetChunkCoordinates = function () {
            this.chunk.x = 0;
            this.chunk.y = 0;
            this.chunk.z = 0;
            this.chunk.changed = false;
            this.updateChunkInfo();
            this.resetBlockCoordinates();
        }
        this.updateFromBlockCoordinates = function () {
            this.chunk.x = this.block.x >> 4;
            this.chunk.y = this.block.y >> 4;
            this.chunk.z = this.block.z >> 4;
            this.block.changed = true;
            this.updateFromChunkCoordinates();
        }
        this.updateChunkInfo = function () {
            this.chunk.minBlock = this.getMinBlockFromChunk(this.chunk);
            this.chunk.maxBlock = this.getMaxBlockFromChunk(this.chunk);
        };
        this.updateFromChunkCoordinates = function () {
            this.updateChunkInfo();
            this.region.x = this.chunk.x >> 5;
            this.region.z = this.chunk.z >> 5;
            this.chunk.changed = true;
            this.updateFromRegionCoordinates();
        }
        this.updateRegionInfo = function () {
            this.region.minChunk = this.getMinChunkFromRegion(this.region);
            this.region.maxChunk = this.getMaxChunkFromRegion(this.region);
            this.region.minBlock = this.getMinBlockFromChunk(this.region.minChunk);
            this.region.maxBlock = this.getMaxBlockFromChunk(this.region.maxChunk);
        };
        this.updateFromRegionCoordinates = function () {
            this.updateRegionInfo();
            this.region.changed = true;
            this.region.text = "r." + this.region.x + "." + this.region.z + ".mca";
        }
        this.updateFromRegionText = function () {
            var match = this.region.text.match(/^\s*r\.(-?\d+)\.(-?\d+)\.mca\s*$/i);
            if (match) {
                this.region.x = parseInt(match[1], 10);
                this.region.z = parseInt(match[2], 10);
                this.updateRegionInfo();
            }
            this.region.changed = true;
        }
        this.lastChangedIs = function (value) {
            return this.lastChanged === value;
        }
        this.updateFromBlockCoordinates();
    });
})();
