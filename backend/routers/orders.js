const express = require('express')
let orders = express.Router()

function verify_dish(dish) {
    if(dish.id == undefined || dish.quantity == undefined || dish.infos == undefined) return false;
    //Verify against database
    return true;
}

orders.post('/:tableid/place', (req, resp, next) => {
    try {
        if(req.body == undefined || req.body == null || req.body.dishes == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "body empty"})
            return;
        }

        if(req.params.tableid == undefined || req.params.tableid == null) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing table id"});
            return;
        }

        if(req.body.dishes == [] || req.body.dishes.length == 0) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid dish list"})
            return;
        }

        let all_respect_format = req.body.dishes.every(verify_dish);

        if(!all_respect_format) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid dish list"})
            return;
        }

        resp.status(200)
        .contentType('application/json')
        .json({"valid": true})
    } catch(except) {
        next(except);
    }
})

module.exports = orders