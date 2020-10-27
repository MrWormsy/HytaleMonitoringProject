// Accounts' Schemas
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema =
    new Schema({
        username: String,
        ip: {
            type: String,
            default: "192.168.1.1"
        },
        server: {
            type: Schema.Types.ObjectId,
            ref: 'server'
        },
        at: {
            type: Number,
            default: Date.now
        }
    }, {collection: 'vote'});

module.exports = {
    Vote: mongoose.model('vote', VoteSchema)
};
