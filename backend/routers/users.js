const express = require('express')
const jsonwebtoken = require('jsonwebtoken')
const verify_token = require('../login/verify')
const google = require('googleapis')

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

router.get('/loginurl', (req, resp, next) => {
    const url = process.oauth_client.generateAuthUrl({
        scope: 'https://www.googleapis.com/auth/userinfo.email'
    })

    resp.status(200)
    .contentType('application/json')
    .json({"url": url});
})

router.post('/login', async(req, resp, next) => {
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
        let user = await process.db_driver.getUserByMail(test_mail);
        const jwt = jsonwebtoken.sign({"mail": test_mail, "google_token": req.body.token, 
            "role": user.role
        }, process.env.JWT_SECRET, 
            { expiresIn: process.env.TOKEN_TTL });

        resp.status(200)
            .header('Content-Type', 'application/json')
            .json({"valid": true, "jwt": jwt});
    } catch(except) {
        next(except);
    }
})

router.get('/home', async(req, resp, next) => {
    if(req.user_role == 'admin') {
        resp.redirect(301, '/static/pages/customerview.html');
    } else if(req.user_role == 'dining_hall') {
        resp.redirect(301, '/static/pages/login.html');
    } else if(req.user_role == 'kitchen') {
        resp.redirect(301, '/static/pages/kitchen.html');
    } else if(req.user_role == 'table') {
        resp.redirect(301, '/static/pages/customerview.html');
    }
})

module.exports = router;