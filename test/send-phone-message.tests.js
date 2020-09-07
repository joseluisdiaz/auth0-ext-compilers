/* eslint-env node, mocha */

'use strict';

const Assert = require('assert')
const Compilers = require('../index');
const simulate = require('./simulate');
const nodejsCompiler = require('./nodejsCompiler');


describe('send-phone-message', function () {
    const compiler = Compilers['send-phone-message'];

    it('compiles to a function with 3 arguments', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
        }, function (error, func) {
            Assert.ifError(error);
            Assert.equal(typeof func, 'function');
            Assert.equal(func.length, 3);
            done();
        });
    });

    describe('invalid payload', () => {
        it('rejects when recipient is not set', function (done) {
            compiler({
                nodejsCompiler,
                script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
            }, function (error, func) {
                Assert.ifError(error);

                simulate(func, {
                    body: {text: 'dis iz a text', context: {}},
                    headers: {},
                    method: 'POST',
            }, function (error, envelope) {
                    Assert.ifError(error);
                    const { status, data } = envelope;
                    Assert.equal(status, "error");
                    Assert.equal(data.message, 'Body.recipient received by extensibility point is not a string');
                    done();
                });
            });
        });
        it('rejects when text is not set', function (done) {
            compiler({
                nodejsCompiler,
                script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
            }, function (error, func) {
                Assert.ifError(error);

                simulate(func, {
                    body: {recipient: '1-999-888-657-2134', context: {}},
                    headers: {},
                    method: 'POST',
            }, function (error, envelope) {
                    Assert.ifError(error);
                    const { status, data } = envelope;
                    Assert.equal(status, "error");
                    Assert.equal(data.message, 'Body.text received by extensibility point is not a string');
                    
                    done();
                });
            });
        });
        describe('context', () => {
            it('rejects context is not an object', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {recipient: '1-999-888-657-2134', text: 'dis iz a text', context: 'context'},
                        headers: {},
                        method: 'POST',
                    }, function (error, envelope) {
                        Assert.ifError(error);
                        const { data } = envelope;
                        Assert.equal(data.message, 'Body.context received by extensibility point is not an object');
                        
                        done();
                    });
                });
            });

            it('rejects bad message_type', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {
                            recipient: '1-999-888-657-2134',
                            text: 'dis iz a text',
                            context: {message_type: 'telephone'}
                        },
                        headers: {},
                        method: 'POST',
                    }, function (error, envelope) {
                        Assert.ifError(error);
                        const { status, data } = envelope;
                        Assert.equal(status, "error");
                        Assert.equal(data.message, 'Body.context.message_type received by extensibility point is not `sms` or `voice`');
                        
                        done();
                    });
                });
            });

            it('does not fail on `voice` message_type', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {
                            recipient: '1-999-888-657-2134',
                            text: 'dis iz a text',
                            context: {message_type: 'voice'}
                        },
                        headers: {},
                        method: 'POST',
                    }, function (error, envelope) {
                        Assert.ifError(error);
                        const { status, data } = envelope;
                        Assert.equal(status, "error");
                        Assert.notEqual(data.message, 'Body.context.message_type received by extensibility point is not `sms` or `voice`');
                        done();
                    });
                });
            });

            it('does not fail on `second-factor-authentication` action type', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {
                            recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                message_type: 'sms',
                                action: 'second-factor-authentication'
                            }
                        },
                        headers: {},
                        method: 'POST',
                    }, function (error, envelope) {
                        Assert.ifError(error);
                        const { status, data } = envelope;
                        Assert.equal(status, "error");
                        Assert.notEqual(data.message, 'Body.context.action received by extensibility point is not `enrollment` or `second-factor-authentication`');
                        done();
                    });
                });
            });

            it('rejects bad action', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {
                            recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                message_type: 'sms',
                                action: 'wrong'
                            }
                        },
                        headers: {},
                        method: 'POST',
                    }, function (error, envelope) {
                        Assert.ifError(error);
                        const { status, data } = envelope;
                        Assert.equal(status, "error");
                        Assert.equal(data.message, 'Body.context.action received by extensibility point is not `enrollment` or `second-factor-authentication`');
                        
                        done();
                    });
                });
            });

            it('rejects bad language', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {
                            recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                message_type: 'sms',
                                action: 'enrollment',
                                language: {}
                            }
                        },
                        headers: {},
                        method: 'POST',
                    }, function (error, envelope) {
                        Assert.ifError(error);
                        const { status, data } = envelope;
                        Assert.equal(status, "error");
                        Assert.equal(data.message, 'Body.context.language received by extensibility point is not a string');
                        
                        done();
                    });
                });
            });

            it('rejects bad code', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {
                            recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                message_type: 'sms',
                                action: 'enrollment',
                                language: 'korean',
                                code: 12345
                            }
                        },
                        headers: {},
                        method: 'POST',
                    }, function (error, envelope) {
                        Assert.ifError(error);
                        const { status, data } = envelope;
                        Assert.equal(status, "error");
                        Assert.equal(data.message, 'Body.context.code received by extensibility point is not a string');
                        
                        done();
                    });
                });
            });

            it('rejects bad ip', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {
                            recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                message_type: 'sms',
                                action: 'enrollment',
                                language: 'korean',
                                code: 'SOMEOTP12345',
                                ip: 127,
                            }
                        },
                        headers: {},
                        method: 'POST',
                    }, function (error, envelope) {
                        Assert.ifError(error);
                        const { status, data } = envelope;
                        Assert.equal(status, "error");
                        Assert.equal(data.message, 'Body.context.ip received by extensibility point is not a string');
                        
                        done();
                    });
                });
            });

            it('rejects bad user_agent', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {
                            recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                message_type: 'sms',
                                action: 'enrollment',
                                language: 'korean',
                                code: 'SOMEOTP12345',
                                ip: '127.0.0.1',
                                user_agent: {},

                            }
                        },
                        headers: {},
                        method: 'POST',
                    }, function (error, envelope) {
                        Assert.ifError(error);
                        const { status, data } = envelope;
                        Assert.equal(status, "error");
                        Assert.equal(data.message, 'Body.context.user_agent received by extensibility point is not a string');
                        
                        done();
                    });
                });
            });

            describe('invalid client', () => {
                it('rejects bad client format', function (done) {
                    compiler({
                        nodejsCompiler,
                        script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                    }, function (error, func) {
                        Assert.ifError(error);

                        simulate(func, {
                            body: {
                                recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                    message_type: 'sms',
                                    action: 'enrollment',
                                    language: 'korean',
                                    code: 'SOMEOTP12345',
                                    ip: '127.0.0.1',
                                    user_agent: 'someAgent',
                                    client: '123'
                                }
                            },
                            headers: {},
                            method: 'POST',
                        }, function (error, envelope) {
                            Assert.ifError(error);
                            const { status, data } = envelope;
                            Assert.equal(status, "error");
                            Assert.equal(data.message, 'Body.context.client received by extensibility point is not an object');
                            
                            done();
                        });
                    });
                });

                it('rejects bad client_id', function (done) {
                    compiler({
                        nodejsCompiler,
                        script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                    }, function (error, func) {
                        Assert.ifError(error);
                        simulate(func, {
                            body: {
                                recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                    message_type: 'sms',
                                    action: 'enrollment',
                                    language: 'korean',
                                    code: 'SOMEOTP12345',
                                    ip: '127.0.0.1',
                                    user_agent: 'someAgent',
                                    client: {
                                        client_id: 123
                                    }
                                }
                            },
                            headers: {},
                            method: 'POST',
                        }, function (error, envelope) {
                            Assert.ifError(error);
                            const { status, data } = envelope;
                            Assert.equal(status, "error");
                            Assert.equal(data.message, 'Body.context.client.client_id received by extensibility point is not a string');
                            
                            done();
                        });
                    });
                });

                it('rejects bad name', function (done) {
                    compiler({
                        nodejsCompiler,
                        script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                    }, function (error, func) {
                        Assert.ifError(error);
                        simulate(func, {
                            body: {
                                recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                    message_type: 'sms',
                                    action: 'enrollment',
                                    language: 'korean',
                                    code: 'SOMEOTP12345',
                                    ip: '127.0.0.1',
                                    user_agent: 'someAgent',
                                    client: {
                                        client_id: 'someClientId',
                                        name: {}
                                    }
                                }
                            },
                            headers: {},
                            method: 'POST',
                        }, function (error, envelope) {
                            Assert.ifError(error);
                            const { status, data } = envelope;
                            Assert.equal(status, "error");
                            Assert.equal(data.message, 'Body.context.client.name received by extensibility point is not a string');
                            
                            done();
                        });
                    });
                });
                it('rejects bad client_metadata', function (done) {
                    compiler({
                        nodejsCompiler,
                        script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                    }, function (error, func) {
                        Assert.ifError(error);
                        simulate(func, {
                            body: {
                                recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                    message_type: 'sms',
                                    action: 'enrollment',
                                    language: 'korean',
                                    code: 'SOMEOTP12345',
                                    ip: '127.0.0.1',
                                    user_agent: 'someAgent',
                                    client: {
                                        client_id: 'someClientId',
                                        name: 'Test Application',
                                        client_metadata: 'someBadData'
                                    }
                                }
                            },
                            headers: {},
                            method: 'POST',
                        }, function (error, envelope) {
                            Assert.ifError(error);
                            const { status, data } = envelope;
                            Assert.equal(status, "error");
                            Assert.equal(data.message, 'Body.context.client.client_metadata received by extensibility point is not an object');
                            
                            done();
                        });
                    });
                });
            });
            it('rejects bad user format', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: {
                            recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                message_type: 'sms',
                                action: 'enrollment',
                                language: 'korean',
                                code: 'SOMEOTP12345',
                                ip: '127.0.0.1',
                                user_agent: 'someAgent',
                                client: {
                                    client_id: 'someClientId',
                                    name: 'Test Application',
                                    client_metadata: {}
                                },
                                user: 'someBadUserFormat'
                            }
                        },
                        headers: {},
                        method: 'POST',
                        }, function (error, envelope) {
                        Assert.ifError(error);
                        const { status, data } = envelope;
                        Assert.equal(status, "error");
                        Assert.equal(data.message, 'Body.context.user received by extensibility point is not an object');
                        
                        done();
                    });
                });
            });
        });
    }); // invalid payload

    describe('valid payload', function() {
        it('works without client', function (done) {
            compiler({
                nodejsCompiler,
                script: 'module.exports = function(recipient, text, context, cb) { cb(null, JSON.stringify({})); };'
            }, function (error, func) {
                Assert.ifError(error);

                simulate(func, {
                    body: {
                        recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                            message_type: 'sms',
                            action: 'enrollment',
                            language: 'korean',
                            code: 'SOMEOTP12345',
                            ip: '127.0.0.1',
                            user_agent: 'someAgent',
                            user: {}
                        }
                    },
                    headers: {},
                    method: 'POST',
                }, function (error, envelope) {
                    Assert.ifError(error);
                    const { status, data } = envelope;
                    Assert.equal(status, "success");
                    Assert.ok(data);
                    done();
                });
            });
        });

        it('works with a client', function (done) {
            compiler({
                nodejsCompiler,
                script: 'module.exports = function(recipient, text, context, cb) { cb(null, JSON.stringify({})); };'
            }, function (error, func) {
                Assert.ifError(error);

                simulate(func, {
                    body: {
                        recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                            message_type: 'sms',
                            action: 'second-factor-authentication',
                            language: 'korean',
                            code: 'SOMEOTP12345',
                            ip: '127.0.0.1',
                            user_agent: 'someAgent',
                            user: {},
                            client: {
                                client_id: 'someClientId',
                                name: 'Test Application',
                                client_metadata: {}
                            }
                        }
                    },
                    headers: {},
                    method: 'POST',
                }, function (error, envelope) {
                    Assert.ifError(error);
                    const { status, data } = envelope;
                    Assert.equal(status, "success");
                    Assert.ok(data);
                    done();
                });
            });
        });

        it('works with a client with no client_metadata', function (done) {
            compiler({
                nodejsCompiler,
                script: 'module.exports = function(recipient, text, context, cb) { cb(null, JSON.stringify({})); };'
            }, function (error, func) {
                Assert.ifError(error);

                simulate(func, {
                    body: {
                        recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                            message_type: 'sms',
                            action: 'second-factor-authentication',
                            language: 'korean',
                            code: 'SOMEOTP12345',
                            ip: '127.0.0.1',
                            user_agent: 'someAgent',
                            user: {},
                            client: {
                                client_id: 'someClientId',
                                name: 'Test Application',
                                client_metadata: {}
                            }
                        }
                    },
                    headers: {},
                    method: 'POST',
                }, function (error, envelope) {
                    Assert.ifError(error);
                    const { status, data } = envelope;
                    Assert.equal(status, "success");
                    Assert.ok(data);
                    done();
                });
            });
        });

        it('provides a custom error object', function (done) {
            compiler({
                nodejsCompiler,
                script: 'module.exports = function(recipient, text, context, cb) { cb(new SendPhoneMessageError("e1", "e2")); };'
            }, function (error, func) {
                Assert.ifError(error);

                simulate(func, {
                    body: {
                        recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                            message_type: 'sms',
                            action: 'second-factor-authentication',
                            language: 'korean',
                            code: 'SOMEOTP12345',
                            ip: '127.0.0.1',
                            user_agent: 'someAgent',
                            user: {},
                            client: {
                                client_id: 'someClientId',
                                name: 'Test Application',
                                client_metadata: {}
                            }
                        }
                    },
                    headers: {},
                    method: 'POST',
                }, function (error, envelope) {
                    Assert.ifError(error);
                    const { status, data } = envelope;
                    Assert.equal(status, 'error');
                    Assert.equal(data.name, 'SendPhoneMessageError');
                    Assert.equal(data.message, 'e1');
                    Assert.equal(data.friendlyMessage, 'e2');

                    done();
                });
            });
        });

    }); // valid payload
});
