/* eslint-env node, mocha */

'use strict';

const Assert = require('assert')
const Compilers = require('../index');
const simulate = require('./simulate');
const nodejsCompiler = require('./nodejsCompiler');


describe('generic', function () {
    const compiler = Compilers['generic'];

    it('compiles to a function with 2 arguments', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { cb(null, context); };'
        }, function (error, func) {
            Assert.ifError(error);
            Assert.equal(typeof func, 'function');
            Assert.equal(func.length, 3);
            done();
        });
    });

    it('success getting, modifying, and returning body (unauthenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { context.body.baz = "baz"; cb(null, context.body); };'
        }, function (error, func) {
            Assert.ifError(error);

            simulate(func, {
                body: { id: 'client' },
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(data.id, 'client');
                Assert.equal(data.baz, 'baz');
                Assert.equal(Object.keys(data).length, 2);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (unauthenticated, pb!=1)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { context.body.baz = "baz"; cb(null, context.body); };'
        }, function (error, func) {
            Assert.ifError(error);

            simulate(func, {
                body: { id: 'client' },
                headers: {},
                method: 'POST',
                parseBody: false,
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(data.id, 'client');
                Assert.equal(data.baz, 'baz');
                Assert.equal(Object.keys(data).length, 2);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (authenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { context.body.baz = "baz"; cb(null, context.body); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { id: 'client' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer foo' },
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { data } = envelope;
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(data.id, 'client');
                Assert.equal(data.baz, 'baz');
                Assert.equal(Object.keys(data).length, 2);
                done();
            });
        });
    });

    it('rejects calls without authorization secret', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { cb(null, context); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { id: 'client' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: {},
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { status } = envelope;
                Assert.equal(status, "error");
                done();
            });
        });
    });

    it('rejects calls with wrong authorization secret', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { cb(null, context); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { id: 'client' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer bar' },
                method: 'POST',
            }, function (error, envelope) {
                Assert.ifError(error);
                const { status } = envelope;
                Assert.equal(status, "error");
                done();
            });
        });
    });

});
