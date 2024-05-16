const { describe, afterEach } = require('node:test')
const server = require('./index')
const request = require('supertest')
const should = require('should')
const jest = require('jest')
const { default: expect } = require('expect')

describe('GET /users/verify', async() => {
    it('Responds with 401, missing token', async() => {
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
})