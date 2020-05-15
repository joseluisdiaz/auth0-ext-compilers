/* eslint-env node, mocha */

'use strict';

const Assert = require('assert')
const Compilers = require('../index');
const simulate = require('./simulate');
const nodejsCompiler = require('./nodejsCompiler');


describe('password-exchange', function () {
    const compiler = Compilers['password-exchange'];

    it('compiles to a function with 2 arguments', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { cb(null, ctx); };'
        }, function (error, func) {
            Assert.ifError(error);
            Assert.equal(typeof func, 'function');
            Assert.equal(func.length, 3);
            done();
        });
    });

    it('success when scope is undefined (unauthenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { client.baz = "baz"; cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);

            simulate(func, {
                body: { user: {}, client: { id: 'client' }, audience: 'audience' },
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(typeof data.client, 'object');
                Assert.equal(data.client.id, 'client');
                Assert.equal(data.client.baz, 'baz');
                Assert.equal(Object.keys(data.client).length, 2);
                Assert.equal(typeof data.scope, 'undefined');
                Assert.equal(data.audience, 'audience');
                Assert.equal(Object.keys(data).length, 2);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (unauthenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { client.baz = "baz"; context.hello = "moon"; delete context.webtask; cb(null, { client, scope, audience, context }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { user: {}, client: { id: 'client' }, scope: ['scope'], audience: 'audience', context: { hello: 'world', foo: 'bar' } },
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(typeof data.client, 'object');
                Assert.equal(data.client.id, 'client');
                Assert.equal(data.client.baz, 'baz');
                Assert.equal(Object.keys(data.client).length, 2);
                Assert.ok(Array.isArray(data.scope));
                Assert.equal(data.scope.length, 1);
                Assert.equal(data.scope[0], 'scope');
                Assert.equal(data.audience, 'audience');
                Assert.equal(typeof data.context, 'object');
                Assert.equal(data.context.hello, 'moon');
                Assert.equal(data.context.foo, 'bar');
                Assert.equal(Object.keys(data.context).length, 2);
                Assert.equal(Object.keys(data).length, 4);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (unauthenticated, pb!=1)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { client.baz = "baz"; context.hello = "moon"; delete context.webtask; cb(null, { client, scope, audience, context }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { user: {}, client: { id: 'client' }, scope: ['scope'], audience: 'audience', context: { hello: 'world', foo: 'bar' } },
                headers: {},
                method: 'POST',
                parseBody: false,
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(typeof data.client, 'object');
                Assert.equal(data.client.id, 'client');
                Assert.equal(data.client.baz, 'baz');
                Assert.equal(Object.keys(data.client).length, 2);
                Assert.ok(Array.isArray(data.scope));
                Assert.equal(data.scope.length, 1);
                Assert.equal(data.scope[0], 'scope');
                Assert.equal(data.audience, 'audience');
                Assert.equal(typeof data.context, 'object');
                Assert.equal(data.context.hello, 'moon');
                Assert.equal(data.context.foo, 'bar');
                Assert.equal(Object.keys(data.context).length, 2);
                Assert.equal(Object.keys(data).length, 4);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (authenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { client.baz = "baz"; context.hello = "moon"; delete context.webtask; cb(null, { client, scope, audience, context }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { user: {}, client: { id: 'client' }, scope: ['scope'], audience: 'audience', context: { hello: 'world', foo: 'bar' } },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer foo' },
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(typeof data.client, 'object');
                Assert.equal(data.client.id, 'client');
                Assert.equal(data.client.baz, 'baz');
                Assert.equal(Object.keys(data.client).length, 2);
                Assert.ok(Array.isArray(data.scope));
                Assert.equal(data.scope.length, 1);
                Assert.equal(data.scope[0], 'scope');
                Assert.equal(data.audience, 'audience');
                Assert.equal(typeof data.context, 'object');
                Assert.equal(data.context.hello, 'moon');
                Assert.equal(data.context.foo, 'bar');
                Assert.equal(Object.keys(data.context).length, 2);
                Assert.equal(Object.keys(data).length, 4);
                done();
            });
        });
    });

    it('creates a default, empty context object with the webtask property', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { cb(null, { type: typeof context, length: Object.keys(context).length, webtask: typeof context.webtask }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { user: {}, client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                headers: { 'authorization': 'Bearer foo' },
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(data.type, 'object');
                Assert.equal(data.length, 1);
                Assert.equal(data.webtask, 'object');
                Assert.equal(Object.keys(data).length, 3);
                done();
            });
        });
    });

    it('rejects calls with invalid payload', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: 'no good',
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.equal(data.message, 'Body received by extensibility point is not an object');
                
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad user)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { user: 'bad user', client: {}, audience: 'audience' },
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.equal(data.message, 'Body.user received by extensibility point is not an object');
                
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad client)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { user: {}, client: 'client', audience: 'audience' },
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.equal(data.message, 'Body.client received by extensibility point is not an object');
                
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad scope)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { user: {}, client: {}, scope: 'scope', audience: 'audience' },
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.equal(data.message, 'Body.scope received by extensibility point is neither empty nor an array');
                
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad audience)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { client: {}, scope: 'scope', audience: [] },
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.equal(data.message, 'Body.audience received by extensibility point is not a string');
                
                done();
            });
        });
    });

    it('rejects calls without authorization secret', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { user: {}, client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.equal(data.message, "Unauthorized extensibility point");
                
                done();
            });
        });
    });

    it('rejects calls with wrong authorization secret', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(user, client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { user: {}, client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer bar' },
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.equal(data.message, "Unauthorized extensibility point");
                
                done();
            });
        });
    });
});
