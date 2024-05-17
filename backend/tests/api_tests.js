const { describe, afterEach } = require('node:test')
const server = require('../../index')
const request = require('supertest')
const should = require('should')
const jest = require('jest')
const { default: expect } = require('expect')

let token = "";

describe('POST /users/login', async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
            .post('/users/login')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"field1" : "empty"})

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"});
    })

    it('Responds with 200 ok', async() => {
        const resp = await request(server)
            .post('/users/login')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"token" : "token"})

        expect(resp.status).toEqual(200);
        expect(resp.headers['content-type']).toContain('application/json');
        expect(resp.body).toHaveProperty('jwt');
        console.log(`Received token: ${resp.body.jwt}`);
        token = resp.body.jwt;
    })
})

describe('GET /users/verify', async() => {
    it('Responds with 401, missing token (empty query)', async() => {
        const resp = await request(server)
            .get('/users/verify')
            .query({})
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"});
    })

    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
            .get('/users/verify')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Accept', 'application/json')
            .query({"field1": "empty"});

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"});
    })

    it('Responds with 200 ok', async() => {
        const resp = await request(server)
            .get('/users/verify')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Accept', 'application/json')
            .query({"jwt": token});

        expect(resp.status).toEqual(200);
        expect(resp.headers['content-type']).toContain('application/json');
        expect(resp.body).toEqual({"valid": true});
    })
})

describe('GET /menu/overview', async() => {
    it('Responds with 401, missing token', async() => {
        const resp = await request(server)
        .get('/menu/overview')
        .query({"lang": "it"})
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "missing token"});
    })

    it('Responds with 401, invalid token', async() => {
        const resp = await request(server)
        .get('/menu/overview')
        .query({"lang": "it"})
        .set('Authorization', 'Bearer something')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toEqual({"valid": false, "reason": "invalid token"});
    })

    it('Responds with list of dishes', async() => {
        const resp = await request(server)
        .get('/menu/overview')
        .query({"lang": "it"})
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

            /*expect(element.name).toBeInstanceOf(String);
            expect(element.image).toBeInstanceOf(String);
            expect(element.ingredients).toBeInstanceOf(String);
            expect(element.price).toBeInstanceOf(Number);*/
        });
    })
})

describe('GET /menu/<dish>/properties', async() => {
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .get('/menu/overview')
        .set('Authorization', 'Bearer something')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with dish properties", async() => {
        const wanted_dish = 0;

        const resp = await request(server)
        .get(`/menu/${wanted_dish}/properties`)
        .query({"lang": "it"})
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
        expect(resp.body).toBeInstanceOf(Object);

        expect(resp.body).toHaveProperty('name');
        expect(resp.body.name).toEqual('any');
        expect(resp.body).toHaveProperty('calories');
        expect(resp.body).toHaveProperty('allergens');
    })
})

describe('POST /orders/place', async() => {
    it("Responds with 401, missing/invalid token", async() => {
        const resp = await request(server)
        .get('/orders/place')
        .set('Authorization', 'Bearer something')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', 'application/json')

        expect(resp.status).toEqual(401);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds with 400, invalid dish list", async() => {
        const resp = await request(server)
        .post('/orders/place')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({"dishes": []})

        expect(resp.status).toEqual(400);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })

    it("Responds 200, order placed", async() => {
        let dish = {"id": 0, "quantity": 10, "infos": "blah blah blah"};

        const resp = await request(server)
        .post('/orders/place')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({"dishes": [dish]})

        expect(resp.status).toEqual(200);
        expect(resp.headers['Content-Type'.toLowerCase()]).toContain('application/json');
    })
})