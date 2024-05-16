require('dotenv').config()
const express = require('express')
const server = express()
const server_port = process.env.PORT;
const server_path = __dirname;

server.get('/alive', (req, resp) => {
    resp.status(200);
    resp.json({"status": "running"});
})

/*server.get('/users/verify', (req, resp) => {
    const body = JSON.parse(req.body());
    if(body.jwt == undefined || body.jwt == null) {
        resp.status(401);
        resp.json({"valid": false, "reason": "missing token"});
        return;
    }

    resp.status(200);
    resp.json({"valid": true});
})*/

server.listen(server_port, () => {
    console.log(`Server is listening on port ${server_port}`);
    console.log(`Server path ${server_path}`);
})