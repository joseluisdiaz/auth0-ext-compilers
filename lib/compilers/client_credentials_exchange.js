'use strict';

const Authz = require('../authorization');
const Factory = require('./compilerFactory');
const ExtensibilityUserError = require('../errors/ExtensibilityUserError');

class InvalidRequestError extends ExtensibilityUserError {
    constructor(message) {
        super(message);
    }
}

class InvalidScopeError extends ExtensibilityUserError {
    constructor(message) {
        super(message);
    }
}

class ServerError extends ExtensibilityUserError {
    constructor(message) {
        super(message);
    }
}

const PRELUDE_ITEMS = [
    InvalidRequestError,
    InvalidScopeError,
    ServerError
];
module.exports = Factory.createCompiler(clientCredentialsExchangeHandler, PRELUDE_ITEMS);

function clientCredentialsExchangeHandler (func, webtaskContext, cb) {
    return Authz.is_authorized(webtaskContext, error => {
        if (error) return cb(error);

        if (typeof webtaskContext.body !== 'object')
            return cb(new Error('Body received by extensibility point is not an object'));
        if (typeof webtaskContext.body.client !== 'object')
            return cb(new Error('Body .client received by extensibility point is not an object'));
        if (webtaskContext.body.scope && !Array.isArray(webtaskContext.body.scope))
            return cb(new Error('Body .scope received by extensibility point is neither empty nor an array'));
        if (typeof webtaskContext.body.audience !== 'string')
            return cb(new Error('Body .audience received by extensibility point is not a string'));

        const context = typeof webtaskContext.body.context === 'object'
              ?   webtaskContext.body.context
              :   {};

        context.webtask = webtaskContext;

        return func(webtaskContext.body.client, webtaskContext.body.scope, webtaskContext.body.audience, context, cb);
  });
}
