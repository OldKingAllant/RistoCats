const express = require('express')
let menu = express.Router()

menu.get('/overview', (req, resp, next) => {
    try {
        if(req.query.lang == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing lang"});
            return;
        }
        const generic_dish = {"id": 0, "name": "Pasta Pomodoro", "image": "", "ingredients": "", "price": 10.0};

        resp.status(200)
            .contentType('application/json')
            .json({"valid": true, "dishes": [generic_dish]})
    } catch(except) {
        next(except);
    }
})

menu.get('/:id/properties', (req, resp, next) => {
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

        const calories = 100;
        const allergens = "...";

        resp.status(200)
        .contentType('application/json')
        .json({"id": req.params.id, "name": "any", "calories": calories, "allergens": allergens});
    } catch(except) {
        next(except);
    }
})

module.exports = menu;