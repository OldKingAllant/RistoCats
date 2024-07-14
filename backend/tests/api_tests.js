const { describe, afterEach } = require('node:test')
const server = require('../../index')
const request = require('supertest')
const should = require('should')
const { default: expect } = require('expect')

let token = ""; //Global token to perform most actions
//Global test variables that are set by one test case
//and used by another
let dish0 = null;
let dish1 = null;
let orderid = null;
let table1 = null;

/**Automatic tests using Mocha*/

/**Multiple tests are performed on the same API endpoint, testing 
 * all status codes
 */

/**Test login functionality */

/**After the recent changes, all routes should have /api/ as prefix */

/**
 * Route /api/users tests:
 * 
 * Test functionaly of the users api:
 * - POST login
 * - GET verify
 * - GET role
 */

describe('POST /users/login', async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
            .post('/api/users/login')               //Login route
            .set('Content-Type', 'application/json')//Server always wants request body as json
            .set('Accept', 'application/json')      //Server always responds with json
            .send({"field1" : "empty"}) //Set an unused property, which will be ignored by the server
                                        //and avoid setting the token field

        expect(resp.status).toEqual(401); //On this route, server will always respond 401 if something's not ok
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json'); //Verify response content type
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"}); //Response body must match 
    })

    it('Responds with 200 ok', async() => {
        //Do as before but this time using a valid request format
        const resp = await request(server)
            .post('/api/users/login')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"token" : "token", "test": true}) //Add the 'test' field to avoid google token verifications
                                                     //and to receive supreme privileges

        expect(resp.status).toEqual(200);
        expect(resp.headers['content-type']).toContain('application/json');
        expect(resp.body).toHaveProperty('jwt');
        console.log(`Received token: ${resp.body.jwt}`);
        token = resp.body.jwt; //Save for later use
    })
})

/**Use this route to verify JWT tokens */
describe('GET /users/verify', async() => {
    it('Responds with 401, missing token (empty query)', async() => {
        //Test with empty query (missing token)
        const resp = await request(server)
            .get('/api/users/verify')
            .query({})
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"});
    })

    it('Responds with 401, missing token', async() => {
        //Same but with unused field
        const resp = await request(server)
            .get('/api/users/verify')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Accept', 'application/json')
            .query({"field1": "empty"});

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"});
    })

    it('Responds with 200 ok', async() => {
        //Send the previously received token
        //and verify that it is correct
        const resp = await request(server)
            .get('/api/users/verify')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Accept', 'application/json')
            .query({"jwt": token});

        expect(resp.status).toEqual(200);
        expect(resp.headers['content-type']).toContain('application/json');
        expect(resp.body).toEqual({"valid": true});
    })
})

describe("GET /users/role", async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
        .get(`/api/users/role`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it('Responds 200 with role', async() => {
        const resp = await request(server)
        .get(`/api/users/role`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toHaveProperty('role');
        expect(resp.body.role).toEqual('admin');
    })
})

/////////////////////////////////////////////////////////////////////////////////
/**
 * Route /api/menu tests:
 * 
 * Test functionaly of the menu api:
 * - GET overview?filter_enable=true
 * - GET overview?filter_enable=false
 * - PUT modify
 * - GET <dish_id>/properties
 */

/**
 * Discussion:
 * Testing between missing and invalid token/parameters is not
 * really useful, since the server does not have a consistent
 * behavior to handle such things.
 * 
 * Moreover, in regard to the difference between missing/invalid
 * token, we need to test it once, since
 * the server will always behave the same way for routes
 * which do require a token
 * 
 * However, we wil do it anyway
 */

/**Get enabled dishes */
describe('GET /menu/overview?filter_enable=true', async() => {
    it('Responds with 401, missing token', async() => {
        //First, test that the server will respond with 'missing token' instead of 'invalid token'
        const resp = await request(server)
        .get('/api/menu/overview')
        .query({"lang": "it", "filter_enable": "true"}) //Set language as italian and filter_enable to true to get only the enabled dishes
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"});
    })

    it('Responds with 401, invalid token', async() => {
        //Send an invalid token and test the server's response

        const resp = await request(server)
        .get('/api/menu/overview')
        .query({"lang": "it", "filter_enable": "true"})
        .set('Authorization', 'Bearer something')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "invalid token"});
    })

    it('Responds with list of dishes', async() => {
        //This time perform the correct request
        const resp = await request(server)
        .get('/api/menu/overview')
        .query({"lang": "it", "filter_enable": "true"})
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');

        //Verify format of the body
        expect(resp.body).toBeInstanceOf(Object);
        expect(resp.body).toHaveProperty('dishes');
        expect(resp.body.dishes).toBeInstanceOf(Array);

        //Check format of every entry in the list
        resp.body.dishes.forEach(element => {
            expect(element).toBeInstanceOf(Object);
            expect(element).toHaveProperty('name');
            expect(element).toHaveProperty('image');
            expect(element).toHaveProperty('ingredients');
            expect(element).toHaveProperty('price');
            expect(element).toHaveProperty('id');
        });

        //Save one dish for later usage
        dish0 = resp.body.dishes[0];
    })
})

/**Get properties of one dish */
describe('GET /menu/<dish>/properties', async() => {
    //As stated before, this should not be necessary, however, 
    //we will do it anyway
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .get('/api/menu/overview')
        .set('Authorization', 'Bearer something')
        .set('Content-Type', 'application/x-www-form-urlencoded') //This is not necessary, since the body is unused
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with dish properties", async() => {
        const wanted_dish = dish0.id;

        //Get properties of previously selected dish
        const resp = await request(server)
        .get(`/api/menu/${wanted_dish}/properties`)
        .query({"lang": "it"})
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toBeInstanceOf(Object);

        //Verify response
        expect(resp.body).toHaveProperty('name');
        expect(resp.body.name).toEqual(dish0.name);
        expect(resp.body).toHaveProperty('allergens');
    })
})

/**Get all dishes */
describe('GET /menu/overview?filter_enable=false', async() => {
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .get('/api/menu/overview')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .query({"lang": "it", "filter_enable": "false"});

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 200, all dishes", async() => {
        //Effectively get all dishes
        const resp = await request(server)
        .get('/api/menu/overview')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .query({"lang": "en", "filter_enable": "false"});

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toHaveProperty('dishes');

        console.log(`All dishes: ${resp.body.dishes.map(JSON.stringify)}`);

        //Save for later use
        dish1 = resp.body.dishes[1];
        //For these tests to work, there must be at least two dishes in total
        expect(resp.body.dishes.length).toBeGreaterThanOrEqual(2);
    })
})

/**Modify the menu, removing/adding the dish saved in the 'dish1' variable */
describe('PUT /menu/modify', async() => {
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .put('/api/menu/modify')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 400, invalid request", async() => {
        const resp = await request(server)
        .put('/api/menu/modify')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({"list": [{"invalid": "invalid"}]});

        expect(resp.status).toEqual(400);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 200, menu updated (invert enable property of the second dish)", async() => {
        //Yes, if the second dish in the list is enabled, disable it, else do the opposite
        const resp = await request(server)
        .put('/api/menu/modify')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({"list": [{"id": dish1.id, "enable": dish1.enabled ? 'N' : 'Y' }]});

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })
})
//////////////////////////////////////////////////////////////////////////////////


/**
 * Route /api/orders tests:
 * 
 * Test functionaly of the orders api:
 * - POST <table_id>/place
 * - GET remaining
 * - GET details
 * - DELETE <order_id>/dish/<dish_id>
 * 
 */

/**Place an order */
describe('POST /orders/<table>/place', async() => {
    const table_id = 0;

    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .post(`/api/orders/${table_id}/place`)
        .set('Authorization', 'Bearer something')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 400, invalid dish list", async() => {
        //Try with empty list
        const resp = await request(server)
        .post(`/api/orders/${table_id}/place`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({"dishes": []})

        expect(resp.status).toEqual(400);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds 200, order placed", async() => {
        //Use previously selected dish to place an order

        let dish = {"id": dish0.id, "quantity": 10, "infos": "blah blah blah"};

        const resp = await request(server)
        .post(`/api/orders/${table_id}/place`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({"dishes": [dish]})

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toHaveProperty('orderid');

        //Necessary for testing a specific thing
        orderid = resp.body.orderid;
    })
})

/**Get orders */
describe('GET /orders/remaining', async() => {
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .get('/api/orders/remaining')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 200, list of orders", async() => {
        const resp = await request(server)
        .get('/api/orders/remaining')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })
})

/**Get details of a single order (the order that was created in a previous test case) */
describe('GET /orders/<id>/details', async() => {
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .get(`/api/orders/${orderid}/details`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 200, order details", async() => {
        //Get the order
        const resp = await request(server)
        .get(`/api/orders/${orderid}/details`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })
})

/**Remove dish from an order */
describe('DELETE /orders/<id>/dish/<dishid>', async() => {
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .delete(`/api/orders/${orderid}/dish/${dish0.id}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 400, bad quantity", async() => {
        //Quantity must be as positive integer number
        const resp = await request(server)
        .delete(`/api/orders/${orderid}/dish/${dish0.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(400);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 200, dish removed", async() => {
        //Effectively delete the order that was placed
        //previously
        const resp = await request(server)
        .delete(`/api/orders/${orderid}/dish/${dish0.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .query({"quantity": 10})

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })
})
//////////////////////////////////////////////////////////////////////////////////////////


/**
 * Route /api/tables tests:
 * 
 * Test functionaly of the tables api:
 * - GET overview?free=true
 * - GET overview?free=false
 * - PUT <table_id>/status
 */



/**
 * Get only free tables
 */
describe('GET /tables/overview?free=true', async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
        .get(`/api/tables/overview`)
        .query({'free': 'true'})
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it('Responds with 200, free tables', async() => {
        const resp = await request(server)
        .get(`/api/tables/overview`)
        .query({'free': 'true'})
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toHaveProperty('list');

        console.log(`Tables: ${JSON.stringify(resp.body.list)}`);
    })
})

/**
 * Get all tables
 */
describe('GET /tables/overview?free=false', async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
        .get(`/api/tables/overview`)
        .query({'free': 'false'})
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it('Responds with 200, all tables', async() => {
        const resp = await request(server)
        .get(`/api/tables/overview`)
        .query({'free': 'false'})
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toHaveProperty('list');

        console.log(`Tables: ${JSON.stringify(resp.body.list)}`);

        table1 = resp.body.list[1]; //Save for later use
    })
})

/**
 * Update table status
 */
describe('PUT /tables/<table_id>/status', async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
        .put(`/api/tables/1/status`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it('Responds with 400, malformed request', async() => {
        //Server expects a body with a property 'free' which is equal to Y/N
        const resp = await request(server)
        .put(`/api/tables/1/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(400);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it('Responds with 200, state changed', async() => {
        //Invert status
        let new_status = table1.free == true ? 'N' : 'Y';

        const resp = await request(server)
        .put(`/api/tables/1/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({"free": new_status});

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })
})