const express = require('express');
const session = require('express-session');
const Routes = require('./routes');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client = redis.createClient();

const dotenv = require('dotenv');
dotenv.config();

// We create the app as well as the server and the io part
const app = express();
let port = 3000;
const server = require('http').Server(app).listen(port);

// Session part
app.use(session({
    secret: 'hytalemonitoring',
    store: new redisStore({host: 'localhost', port: 6379, client: client, ttl: 86400}),
    saveUninitialized: false,
    resave: false
}));

// Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));

// We use the body parser as json
app.use(bodyParser.json());

// Set the routes path
app.use(Routes);

// MongoDB
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
database = 'mongodb://localhost:27017/hytalemonitoring';
mongoose.connect(database, (err) => {
    if (err)
        throw err;
    console.log('Connect to the database');
});

// Path and Views
const path = require('path');
let dirViews = [path.join(__dirname, './views')];
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', dirViews);
app.set('view engine', 'ejs');

console.log("waiting on localhost:" + port);
