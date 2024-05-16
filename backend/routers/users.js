const express = require('express')

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

        resp.status(200)
            .header('Content-Type', 'application/json')
            .json({"valid": true});
    } catch(except) {
        next(except);
    }
})

module.exports = router;