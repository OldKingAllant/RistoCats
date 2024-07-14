const express = require('express')
const jsonwebtoken = require('jsonwebtoken')
const verify = require('../login/verify')
const google = require('googleapis')

let router = express.Router();

/**
 * Verifies that the token is valid
 * 
 * Can be used by every user
 */
router.get('/verify', async(req, resp, next) => {
    try {
        if(req.query == undefined || req.query == null) {
            resp.status(400)
                .contentType('application/json')
                .json({"valid": false, "reason": "empty query"});
            return;
        }

        //JWT is required (how strange)
        if(req.query.jwt == undefined || req.query.jwt == null) {
            resp.status(401)
                .contentType('application/json')
                .json({"valid": false, "reason": "missing token"});
            return;
        }

        //Verify token immediately
        if(!(await verify.verify_token(req.query.jwt, process.env.JWT_SECRET))) {
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

/**
 * Returns a generated google login url
 * 
 * Can be used by everyone
 */
router.get('/loginurl', (req, resp, next) => {
    //Generate url
    const url = process.oauth_client.generateAuthUrl({
        scope: 'https://www.googleapis.com/auth/userinfo.email'
    })

    resp.status(200)
    .contentType('application/json')
    .json({"url": url});
})

/**
 * Perform login given the google generated code
 * 
 * Can be used by everyone
 */
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

        let mail = "";
        let id_token = null;

        //NOT SAFE
        if(req.body.test != undefined) {
            //Used for testing
            mail = "mario.rossi@studenti.unitn.it";
        } else {
            try {
                let {tokens} = await process.oauth_client.getToken(req.body.token); //Retrieve tokens using code
                let content = await verify.extract_token_payload(tokens.id_token);  //extract data
                mail = content.mail;
                id_token = tokens.id_token;
            } catch(err) {
                console.log(`Oauth error: ${err}`);
                resp.status(401)
                .contentType('application/json')
                .json({"valid": false, "reason": "invalid token"});
                return;
            }
        }

        //Get user by google mail
        let user = await process.db_driver.getUserByMail(mail);

        //Bail out if the user does not exist in the database
        if(user == null) {
            resp.status(401)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid email"});
            return;
        }

        //Create JWT and sign it
        const jwt = jsonwebtoken.sign({"mail": mail, "google_token": id_token, 
            "role": user.role, "test": req.body.test != undefined
        }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_TTL });

        resp.status(200)
            .header('Content-Type', 'application/json')
            .json({"valid": true, "jwt": jwt});
    } catch(except) {
        next(except);
    }
})

/**
 * Returns the role of the user associated to the JWT
 * 
 * Can be used only by a logged in user
 */
router.get('/role', async(req, resp, next) => {
    try {
        //Force the client to not cache the response
        resp.setHeader(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate'
        );
        
        resp.status(200)
            .header('Content-Type', 'application/json')
            .contentType('application/json')
            .json({"valid": true, "role": req.user_role});
    } catch(except) {
        next(except);
    }
})

module.exports = router;