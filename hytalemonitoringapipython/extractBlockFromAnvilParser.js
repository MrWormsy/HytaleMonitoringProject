const fs = require('fs');
const data = require('./legacy_blocks.json')

let dataArray = []

for (const [id, d] of Object.entries(data)) {

    if (!dataArray.includes(d[0])) {
        dataArray.push(d[0])
    }
}

fs.writeFileSync('blocksInAnvilParser.json', JSON.stringify(dataArray));
