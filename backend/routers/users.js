const express = require('express')
const jsonwebtoken = require('jsonwebtoken')
const verify_token = require('../login/verify')

let router = express.Router();

router.get('/verify', (req, resp, next) => {
    try {
        if(req.query == undefined || req.query == null) {
            resp.status(400)
                .contentType('application/json')
                .json({"valid": false, "reason": "empty query"});
            return;
        }

        if(req.query.jwt == undefined || req.query.jwt == null) {
            resp.status(401)
                .contentType('application/json')
                .json({"valid": false, "reason": "missing token"});
            return;
        }

        if(!verify_token(req.query.jwt, process.env.JWT_SECRET)) {
            resp.status(401)
                .contentType('application/json')
                .json({"valid": false, "reason": "invalid token"});
            return;
        }

        resp.status(200)
            .header('Content-Type', 'application/json')
            .json({"valid": true});
    } catch(except) {
        next(except);
    }
})

router.post('/login', (req, resp, next) => {
    try {
        if(req.body == undefined || req.body == null) {
            resp.status(400)
                .contentType('application/json')
                .json({"valid": false, "reason": "empty query"});
            return;
        }

        if(req.body.token == undefined || req.body.token == null) {
            resp.status(401)
                .contentType('application/json')
                .json({"valid": false, "reason": "missing token"});
            return;
        }

        const test_mail = "mario.rossi@studenti.unitn.it";
        const jwt = jsonwebtoken.sign({"mail": test_mail}, process.env.JWT_SECRET, 
            { expiresIn: process.env.TOKEN_TTL });

        resp.status(200)
            .header('Content-Type', 'application/json')
            .json({"valid": true, "jwt": jwt});
    } catch(except) {
        next(except);
    }
})

module.exports = router;