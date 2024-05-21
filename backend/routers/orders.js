const express = require('express')
let orders = express.Router()

function verify_dish(dish, menu) {
    if(dish.id == undefined || dish.quantity == undefined || dish.infos == undefined) return false;
    
    return menu.find((elem) => elem.id == dish.id) != null;
}

orders.post('/:tableid/place', async(req, resp, next) => {
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

        let menu = await process.db_driver.getMenu();

        let all_respect_format = req.body.dishes.every((elem) => verify_dish(elem, menu));

        if(!all_respect_format) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid dish list"})
            return;
        }

        let order = {
            tableid: Number(req.params.tableid),
            dishes: req.body.dishes
        };

        let result = process.db_driver.placeOrder(order);

        if(result == null) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "could not insert"});
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