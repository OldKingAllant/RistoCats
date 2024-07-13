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

describe('POST /users/login', async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
            .post('/api/users/login')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"field1" : "empty"})

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"});
    })

    it('Responds with 200 ok', async() => {
        const resp = await request(server)
            .post('/api/users/login')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"token" : "token", "test": true})

        expect(resp.status).toEqual(200);
        expect(resp.headers['content-type']).toContain('application/json');
        expect(resp.body).toHaveProperty('jwt');
        console.log(`Received token: ${resp.body.jwt}`);
        token = resp.body.jwt; //Save for later use
    })
})

describe('GET /users/verify', async() => {
    it('Responds with 401, missing token (empty query)', async() => {
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

describe('GET /menu/overview?filter_enable=true', async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
        .get('/api/menu/overview')
        .query({"lang": "it", "filter_enable": "true"})
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"});
    })

    it('Responds with 401, invalid token', async() => {
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
        const resp = await request(server)
        .get('/api/menu/overview')
        .query({"lang": "it", "filter_enable": "true"})
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toBeInstanceOf(Object);
        expect(resp.body).toHaveProperty('dishes');
        expect(resp.body.dishes).toBeInstanceOf(Array);

        resp.body.dishes.forEach(element => {
            expect(element).toBeInstanceOf(Object);
            expect(element).toHaveProperty('name');
            expect(element).toHaveProperty('image');
            expect(element).toHaveProperty('ingredients');
            expect(element).toHaveProperty('price');
            expect(element).toHaveProperty('id');
        });

        dish0 = resp.body.dishes[0];
    })
})

describe('GET /menu/<dish>/properties', async() => {
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .get('/api/menu/overview')
        .set('Authorization', 'Bearer something')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with dish properties", async() => {
        const wanted_dish = dish0.id;

        const resp = await request(server)
        .get(`/api/menu/${wanted_dish}/properties`)
        .query({"lang": "it"})
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toBeInstanceOf(Object);

        expect(resp.body).toHaveProperty('name');
        expect(resp.body.name).toEqual(dish0.name);
        expect(resp.body).toHaveProperty('allergens');
    })
})

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

        orderid = resp.body.orderid;
    })
})

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

        dish1 = resp.body.dishes[1];
        expect(resp.body.dishes.length).toBeGreaterThanOrEqual(2);
    })
})

describe('POST /menu/modify', async() => {
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .post('/api/menu/modify')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 400, invalid request", async() => {
        const resp = await request(server)
        .post('/api/menu/modify')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({"list": [{"invalid": "invalid"}]});

        expect(resp.status).toEqual(400);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 200, menu updated (invert enable property of the second dish)", async() => {
        const resp = await request(server)
        .post('/api/menu/modify')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({"list": [{"id": dish1.id, "enable": dish1.enabled ? 'N' : 'Y' }]});

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })
})

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
        const resp = await request(server)
        .get(`/api/orders/${orderid}/details`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })
})

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
        const resp = await request(server)
        .delete(`/api/orders/${orderid}/dish/${dish0.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(400);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 200, dish removed", async() => {
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

        table1 = resp.body.list[1];
    })
})

describe('POST /tables/<table_id>/status', async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
        .post(`/api/tables/1/status`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it('Responds with 400, malformed request', async() => {
        const resp = await request(server)
        .post(`/api/tables/1/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

        expect(resp.status).toEqual(400);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it('Responds with 200, state changed', async() => {
        let new_status = table1.free == true ? 'N' : 'Y';

        const resp = await request(server)
        .post(`/api/tables/1/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({"free": new_status});

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })
})