const express = require('express')
let menu = express.Router()

/**
 * Route used to retrive menu
 * 
 * Accessible by all users
 */
menu.get('/overview', async(req, resp, next) => {
    try {
        //Do not check roles, access is unrestricted

        //lang parameter is required
        if(req.query.lang == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing lang"});
            return;
        }

        //The filter for enabled dishes is required
        if(req.query.filter_enable == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing filter"});
            return;
        }

        let menu = [];

        if(req.query.filter_enable == 'true') {
            //If the filter is enabled, get only dishes
            //currently inserted in the menu
            menu = await process.db_driver.getMenu(req.query.lang);
        } else {
            //Retrieved all dishes
            menu = await process.db_driver.getAllDishes(req.query.lang);
        }

        resp.status(200)
            .contentType('application/json')
            .json({"valid": true, "dishes": menu})
    } catch(except) {
        next(except);
    }
})

/**
 * Get properties of a single dish 
 * 
 * Accessible by:
 * - Admin
 * - Table
 */
menu.get('/:id/properties', async(req, resp, next) => {
    try {
        if(req.user_role != 'admin' && req.user_role != 'table' && req.user_role != 'kitchen') {
            resp.status(403)
            .contentType('application/json')
            .json({"valid": false, "reason": "unauthorized"});
            return;
        }

        //Obviously, dish id is required
        if(req.params.id == null || req.params.id == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing dish id"});
            return;
        }

        //Check if language parameter is defined
        if(req.query.lang == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing lang"});
            return;
        }

        //Retrieve dish descriptor
        let dish = await process.db_driver.getDish(req.params.id, req.query.lang);

        resp.status(200)
        .contentType('application/json')
        .json(dish);
    } catch(except) {
        next(except);
    }
})

/**
 * Update/modify the menu
 * 
 * Accessible by:
 * - Admin
 * - Kitchen
 */
menu.put('/modify', async(req, resp, next) => {
    try {
        //Check role
        if(req.user_role != 'admin' && req.user_role != 'kitchen') {
            resp.status(403)
            .contentType('application/json')
            .json({"valid": false, "reason": "unauthorized"});
            return;
        }

        //Get update list
        if(req.body.list == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid request format"});
            return;
        }

        //all entries in list must have format :
        //dish_id : Y/N
        let respects_format = req.body.list.every((elem) => {
            return elem.id != undefined && elem.enable != undefined && (
                elem.enable == 'Y' || elem.enable == 'N'
            );
        });

        if(!respects_format) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid request format"});
            return;
        }

        //Apply changes one dish at a time
        for(dish of req.body.list) {
            let result = await process.db_driver.enableDish(dish.id, 
                dish.enable == 'Y'
            );

            //Bail out if a single failure happens (no rollback done)
            if(!result) {
                resp.status(400)
                .contentType('application/json')
                .json({"valid": false, "reason": "dish update failed"});
                return;
            }
        }

        resp.status(200)
        .contentType('application/json')
        .json({"valid": true});
    } catch(except) {
        next(except);
    }
})

module.exports = menu;