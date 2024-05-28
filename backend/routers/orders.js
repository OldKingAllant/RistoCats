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

        let result = await process.db_driver.placeOrder(order);

        if(result == null) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "could not insert"});
            return;
        }

        resp.status(200)
        .contentType('application/json')
        .json({"valid": true, "orderid": result})
    } catch(except) {
        next(except);
    }
})

orders.get('/remaining', async(req, resp, next) => {
    try {
        let orders = await process.db_driver.getOrders();

        resp.status(200)
        .contentType('application/json')
        .json({"list": orders});
    } catch(except) {
        next(except);
    }
})

orders.get('/:id/details', async(req, resp, next) => {
    try {
        let order = await process.db_driver.getOrderDetails(req.params.id);

        if(order == null) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "order does not exist"})
        } else {
            resp.status(200)
            .contentType('application/json')
            .json({"order": order});
        } 
    } catch(except) {
        next(except);
    }
})

orders.delete('/:id/dish/:dishid', async(req, resp, next) => {
    try {
        let quantity = req.body.quantity;

        if(isNaN(Number(quantity))) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "bad quantity"});
            return;
        }
 
        let result = await process.db_driver.removeDishFromOrder(req.params.id, 
            req.params.dishid, Number(quantity)
        );

        if(!result) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "remove failed"});
        } else {
            resp.status(200)
            .contentType('application/json')
            .json({});
        }
    } catch(except) {
        next(except);
    }
})

module.exports = orders