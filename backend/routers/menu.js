const express = require('express')
let menu = express.Router()

menu.get('/overview', async(req, resp, next) => {
    try {
        if(req.query.lang == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing lang"});
            return;
        }
        
        let menu = await process.db_driver.getMenu();

        resp.status(200)
            .contentType('application/json')
            .json({"valid": true, "dishes": menu})
    } catch(except) {
        next(except);
    }
})

menu.get('/:id/properties', async(req, resp, next) => {
    try {
        if(req.params.id == null || req.params.id == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing dish id"});
            return;
        }

        if(req.query.lang == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing lang"});
            return;
        }

        let dish = await process.db_driver.getDish(req.params.id);

        resp.status(200)
        .contentType('application/json')
        .json(dish);
    } catch(except) {
        next(except);
    }
})

module.exports = menu;