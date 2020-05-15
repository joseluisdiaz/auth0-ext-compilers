'use strict';

const Authz = require('../authorization');
const Factory = require('./compilerFactory');
const ExtensibilityUserError = require('../errors/ExtensibilityUserError');

class PreUserRegistrationError extends ExtensibilityUserError {
    constructor(message, friendlyMessage) {
        super(message);
        this.friendlyMessage = friendlyMessage || message;
    }
}

module.exports = Factory.createCompiler(userRegistrationHandler, [PreUserRegistrationError]);

function userRegistrationHandler (func, webtaskContext, cb) {
    return Authz.is_authorized(webtaskContext, error => {
        if (error) return cb(error);

        if (!webtaskContext.body || typeof webtaskContext.body !== 'object') {
            return cb(new Error('Body received by extensibility point is not an object'));
        }

        if (!webtaskContext.body.user || typeof webtaskContext.body.user !== 'object') {
            return cb(new Error('Body.user received by extensibility point is not an object'));
        }

        if (!webtaskContext.body.context || typeof webtaskContext.body.context !== 'object') {
            return cb(new Error('Body.context received by extensibility point is not an object'));
        }

        if (!webtaskContext.body.context.connection || typeof webtaskContext.body.context.connection !== 'object') {
            return cb(new Error('Body.context.connection received by extensibility point is not an object'));
        }

        var context = Object.assign({}, webtaskContext.body.context, { webtask: webtaskContext });

        return func(webtaskContext.body.user, context, (e,d) => {
            return cb(e, e ? undefined : (d || {}));
        });
    });
}
