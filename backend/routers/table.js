const express = require('express')
let table = express.Router()

/**
 * Retrieve all/free tables
 * 
 * Accessible by:
 * - Admin
 * - Dining hall
 */
table.get('/overview', async(req, resp, next) => {
    try {
        //Check role
        if(req.user_role != 'admin' && req.user_role != 'dining_hall') {
            resp.status(403)
            .contentType('application/json')
            .json({"valid": false, "reason": "unauthorized"});
            return;
        }

        //The 'free' query param is necessary
        if(req.query.free == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing filter"});
            return;
        }

        let result = [];

        if(req.query.free == 'true') {
            //If 'free' is true, filter all tables searching for free ones
            result = await process.db_driver.getFreeTables();
        } else {
            //Return all tables
            result = await process.db_driver.getAllTables();
        }

        resp.status(200)
        .contentType('application/json')
        .json({"list": result});
    } catch(except) {
        next(except);
    }
})

/**
 * Change table status to 'available' or 'uccupied'
 * 
 * Accessible by:
 * - Admin
 * - Dining hall
 */
table.put('/:id/status', async(req, resp, next) => {
    try {
        //Check
        if(req.user_role != 'admin' && req.user_role != 'dining_hall') {
            resp.status(403)
            .contentType('application/json')
            .json({"valid": false, "reason": "unauthorized"});
            return;
        }
        
        //Table id is required
        if(isNaN(Number(req.params.id))) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "tableid must be a decimal number"});
            return;
        }

        //Check request format
        if(req.body.free == undefined || (req.body.free != 'Y' &&
            req.body.free != 'N'
        )) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid status"});
            return;
        }

        //Update status
        let result = await process.db_driver.setTableStatus(Number(req.params.id), 
        req.body.free == 'Y');

        if(!result) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "update failed"});
            return;
        } else {
            resp.status(200)
            .contentType('application/json')
            .json({});
        }
    } catch(except) {
        next(except);
    }
})

module.exports = table;