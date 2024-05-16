const express = require('express')
let menu = express.Router()

menu.get('/overview', (req, resp, next) => {
    try {
        const generic_dish = {"name": "Pasta Pomodoro", "image": "", "ingredients": "", "price": 10.0};

        resp.status(200)
            .contentType('application/json')
            .json({"valid": true, "dishes": [generic_dish]})
    } catch(except) {
        next(except);
    }
})

menu.get('/:name/properties', (req, resp, next) => {
    try {
        if(req.params.name == null || req.params.name == undefined) {
            resp.status(400)
            .contentType('application/json')
            .json({"valid": false, "reason": "missing dish name"});
            return;
        }

        const calories = 100;
        const allergens = "...";

        resp.status(200)
        .contentType('application/json')
        .json({"name": req.params.name, "calories": calories, "allergens": allergens});
    } catch(except) {
        next(except);
    }
})

module.exports = menu;