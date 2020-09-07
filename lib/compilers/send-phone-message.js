'use strict';

const Authz = require('../authorization');
const Factory = require('./compilerFactory');

const ExtensibilityUserError = require('../errors/ExtensibilityUserError');

class SendPhoneMessageError extends ExtensibilityUserError {
    constructor(message, friendlyMessage) {
        super(message);
        this.friendlyMessage = friendlyMessage || message;
    }
}

module.exports = Factory.createCompiler(sendPhoneMessageHandler, [SendPhoneMessageError]);

function sendPhoneMessageHandler (func, webtaskContext, cb) {
    return Authz.is_authorized(webtaskContext, error => {
        if (error) return cb(error);

        if (typeof webtaskContext.body !== 'object')
            return cb(new Error('Body received by extensibility point is not an object'));

        if (typeof webtaskContext.body.recipient !== 'string') {
            return cb(new Error('Body.recipient received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.text !== 'string') {
            return cb(new Error('Body.text received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.context !== 'object') {
            return cb(new Error('Body.context received by extensibility point is not an object'));
        }
        if (!((webtaskContext.body.context.message_type === 'sms') ||
            webtaskContext.body.context.message_type === 'voice')) {
            return cb(new Error('Body.context.message_type received by extensibility point is not `sms` or `voice`'));
        }
        if (!((webtaskContext.body.context.action === 'enrollment') ||
            webtaskContext.body.context.action ==='second-factor-authentication')) {
            return cb(new Error('Body.context.action received by extensibility point is not `enrollment` or `second-factor-authentication`'));
        }
        if (typeof webtaskContext.body.context.language !== 'string') {
            return cb(new Error('Body.context.language received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.context.code !== 'string') {
            return cb(new Error('Body.context.code received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.context.ip !== 'string') {
            return cb(new Error('Body.context.ip received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.context.user_agent !== 'string') {
            return cb(new Error('Body.context.user_agent received by extensibility point is not a string'));
        }
        // This is optional for now.
        if(webtaskContext.body.context.client !== undefined) {
            if (typeof webtaskContext.body.context.client !== 'object') {
                return cb(new Error('Body.context.client received by extensibility point is not an object'));
            }
            if (typeof webtaskContext.body.context.client.client_id !== 'string') {
                return cb(new Error('Body.context.client.client_id received by extensibility point is not a string'));
            }
            if (typeof webtaskContext.body.context.client.name !== 'string') {
                return cb(new Error('Body.context.client.name received by extensibility point is not a string'));
            }
            if (webtaskContext.body.context.client.client_metadata !== undefined) {
                if (typeof webtaskContext.body.context.client.client_metadata !== 'object') {
                    return cb(new Error('Body.context.client.client_metadata received by extensibility point is not an object'));
                }
            }
        }
        if (typeof webtaskContext.body.context.user !== 'object') {
            return cb(new Error('Body.context.user received by extensibility point is not an object'));
        }

        webtaskContext.body.context.webtask = webtaskContext;

        return func(webtaskContext.body.recipient, webtaskContext.body.text, webtaskContext.body.context, cb);
    });
}
