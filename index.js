require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const DbDriver = require('./backend/database/driver')
const cors = require('cors')
const google = require('googleapis')

/**
 * Create database driver and Google OAuth client
 * and save them in global variables
 */
let driver = new DbDriver(process.env.DB_ACCESS_STRING, process.env.DB_NAME);

const oauth_client = new google.Auth.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.SERVER_URL + ':' + process.env.PORT + '/static/pages/login_redirect.html'
})

process.oauth_client = oauth_client;

const server = express()
const server_port = process.env.PORT;
const server_path = __dirname;

let verify = require('./backend/login/verify')

server.use(cors())

//Default base route, redirects to index page
server.use('/', async(req, resp, next) => {
    if(req.path != '/') {
        next();
    } else {
        resp.sendFile(__dirname + '/frontend/pages/index.html');
    }
})

//Serve static files
server.use('/static', express.static(__dirname + '/frontend'))

//urlencoded + json parsers
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json())

//If the request reaches here, verify if the db driver is connected
//to the mongodb server and if not do the connection
server.use(async(req, resp, next) => {
    if(!driver.is_connected) {
        process.db_driver = driver;
        try { 
            await driver.connect();
            console.log("Database connection established");
         }
        catch(err) {
            console.log("Database connection failed");
        }
    }

    next();
})

let users = require('./backend/routers/users');
let menu = require('./backend/routers/menu')
let orders = require('./backend/routers/orders')
let user_pages = require('./backend/frontend_router')
let tables = require('./backend/routers/table')

//Route to verify if server is active, will always
//respond, not auth required
server.get('/alive', (req, resp) => {
    resp.status(200)
        .contentType('application/json')
        .json({"status": "running"});
})


//Middleware used to verify token
server.use(async(req, resp, next) => {
    const route = req.path;

    //Exclude routes that do not require auth
    if(route == '/users/login' || route == '/users/verify' || route == '/alive' ||
        route == '/users/loginurl'
    ) {
        next();
        return;
    }

    //Extract jwt from authorization header

    if(req.headers['authorization'] == null) {
        resp.status(401)
        .json({"valid": false, "reason": "missing token"});
        return;
    }

    let authorization = req.headers['authorization'].split(' ');
    let type = authorization[0];

    if(type !== 'Bearer') {
        resp.status(401)
        .json({"valid": false, "reason": "missing token"});
        return;
    }

    //Verify :
    //1. JWT signature
    //2. Mail contained in payload
    //3. Google ID token
    let token_or_err = await verify.verify_token(authorization[1], process.env.JWT_SECRET);

    if(token_or_err == false) {
        resp.status(401)
        .json({"valid": false, "reason": "invalid token"});
        return;
    }

    req.user_role = token_or_err.role;

    next();
})

//Set all other routes
server.use('/users', users)
server.use('/menu', menu)
server.use('/orders', orders)
server.use(user_pages)
server.use('/tables', tables)

//Middleware used to handle internal server errors to 
//not leak callstacks
server.use((err, req, resp, next) => {
    console.log(`Internal error: ${err.message}`);
    console.log(new Error().stack);
    resp.status(err.status || 500)
        .contentType('application/json')
        .json({"valid": false, "internal error": err.message});
})

server.listen(server_port, () => {
    console.log(`Server is listening on port ${server_port}`);
    console.log(`Server path ${server_path}`);
})

module.exports = server