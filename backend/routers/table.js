const express = require('express')
let table = express.Router()

table.get('/free', async(req, resp, next) => {
    try {
        let result = await process.db_driver.getFreeTables();

        resp.status(200)
        .contentType('application/json')
        .json({"list": result});
    } catch(except) {
        next(except);
    }
})

table.get('/all_tables', async(req, resp, next) => {
    try {
        let result = await process.db_driver.getAllTables();

        resp.status(200)
        .contentType('application/json')
        .json({"list": result});
    } catch(except) {
        next(except);
    }
})

table.post('/:id/status', async(req, resp, next) => {
    try {
        if(isNaN(Number(req.params.id))) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "tableid must be a decimal number"});
            return;
        }

        if(req.body.free == undefined || (req.body.free != 'Y' &&
            req.body.free != 'N'
        )) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid status"});
            return;
        }

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