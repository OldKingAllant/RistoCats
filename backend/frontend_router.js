const express = require('express')
let frontend_routes = express.Router()

frontend_routes.get('/pages', (req, resp, next) => {
    //Token has already been verified
    //Here we should select the page based on 
    //user role and parameters
    resp.status(200)
    .contentType('application/json')
    .json({})
})

module.exports = frontend_routes;