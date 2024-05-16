require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');

const server = express()
const server_port = process.env.PORT;
const server_path = __dirname;

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json())

let users = require('./backend/routers/users');


server.get('/alive', (req, resp) => {
    resp.status(200)
        .contentType('application/json')
        .json({"status": "running"});
})

server.use('/users', users)

server.use((err, req, resp, next) => {
    console.log(`Internal error: ${err.message}`);
    resp.status(err.status || 500)
        .contentType('application/json')
        .json({"valid": false, "internal error": err.message});
})

server.listen(server_port, () => {
    console.log(`Server is listening on port ${server_port}`);
    console.log(`Server path ${server_path}`);
})

module.exports = server