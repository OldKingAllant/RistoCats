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

menu.get('/all_dishes', async(req, resp, next) => {
    try {
        if(req.query.lang == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing lang"});
            return;
        }

        let all_dishes = await process.db_driver.getAllDishes();

        resp.status(200)
        .contentType('application/json')
        .json({"list": all_dishes});
    } catch(except) {
        next(except);
    }
})

menu.post('/modify', async(req, resp, next) => {
    try {
        if(req.body.list == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "invalid request format"});
            return;
        }

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

        for(dish of req.body.list) {
            let result = await process.db_driver.enableDish(dish.id, 
                dish.enable == 'Y'
            );

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