const test = require('node:test');
const assert = require('node:assert/strict');
const utils = require('../utils');

test('uid returns the requested length', () => {
    const id = utils.uid(12);
    assert.equal(id.length, 12);
});

test('uid contains only alphanumeric characters', () => {
    const id = utils.uid(20);
    assert.match(id, /^[A-Za-z0-9]+$/);
});

test('ran_no returns a number inside the requested range', () => {
    for (let i = 0; i < 100; i++) {
        const value = utils.ran_no(1, 10);
        assert.ok(value >= 1 && value <= 10);
    }
});

test('forbidden returns an HTTP 403 response', () => {
    const headers = {};
    let responseBody = '';

    const res = {
        statusCode: 200,

        setHeader(name, value) {
            headers[name] = value;
        },

        end(body) {
            responseBody = body;
        }
    };

    utils.forbidden(res);

    assert.equal(res.statusCode, 403);
    assert.equal(headers['Content-Type'], 'text/plain');
    assert.equal(responseBody, 'Forbidden');
});

