const express = require('express')
let orders = express.Router()

function verify_dish(dish, menu) {
    //first verify that all attributes are in place
    if(dish.id == undefined || dish.quantity == undefined || dish.infos == undefined) return false;
    
    //verify that dish exists and is active
    return menu.find((elem) => elem.id == dish.id) != null;
}

/**
 * Place an order
 * 
 * Accessible by:
 * - Admin
 * - Table
 */
orders.post('/:tableid/place', async(req, resp, next) => {
    try {
        //Check role
        if(req.user_role != 'admin' && req.user_role != 'table') {
            resp.status(403)
            .contentType('application/json')
            .json({"valid": false, "reason": "unauthorized"});
            return;
        }

        //Check if order is present
        if(req.body == undefined || req.body == null || req.body.dishes == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "body empty"})
            return;
        }

        //Table id is required
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

        //Retrieve menu and verify against order
        let menu = await process.db_driver.getMenu(req.query.lang);

        //Check if order formar is correct 
        let all_respect_format = req.body.dishes.every((elem) => verify_dish(elem, menu));

        //Bail out if not
        if(!all_respect_format) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid dish list"})
            return;
        }

        //Generate DB order record
        let order = {
            tableid: Number(req.params.tableid),
            dishes: req.body.dishes
        };

        let result = await process.db_driver.placeOrder(order);

        //Update stats of dishes in order
        for(dish of req.body.dishes) {
            await process.db_driver.updateStats(dish.id, dish.quantity);
        }

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

/**
 * Get all orders (this application only keeps track 
 * of orders that have not yet been completed, completed orders
 * are simply remove)
 * 
 * Accessible by:
 * - Admin
 * - Kitchen
 */
orders.get('/remaining', async(req, resp, next) => {
    try {
        //Check role
        if(req.user_role != 'admin' && req.user_role != 'kitchen') {
            resp.status(403)
            .contentType('application/json')
            .json({"valid": false, "reason": "unauthorized"});
            return;
        }

        //Retrieve orders
        let orders = await process.db_driver.getOrders();

        resp.status(200)
        .contentType('application/json')
        .json({"list": orders});
    } catch(except) {
        next(except);
    }
})

/**
 * Get details of a single order
 * 
 * Accessible by:
 * - Admin 
 * - Kitchen
 */
orders.get('/:id/details', async(req, resp, next) => {
    try {
        //Check role
        if(req.user_role != 'admin' && req.user_role != 'kitchen') {
            resp.status(403)
            .contentType('application/json')
            .json({"valid": false, "reason": "unauthorized"});
            return;
        }

        //Retrieve order
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

/**
 * Remove dish from order, remove order if no dishes remain
 * 
 * Accessible by:
 * - Admin
 * - Kitchen
 */
orders.delete('/:id/dish/:dishid', async(req, resp, next) => {
    try {
        //Check roles
        if(req.user_role != 'admin' && req.user_role != 'kitchen') {
            resp.status(403)
            .contentType('application/json')
            .json({"valid": false, "reason": "unauthorized"});
            return;
        }

        //Check if quantity exists and is a valid number
        let quantity = req.query.quantity;
        let quant_num = Number(quantity);

        if(isNaN(quant_num) || quant_num <= 0 || !Number.isInteger(quant_num)) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "bad quantity"});
            return;
        }
 
        //Apply modification
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