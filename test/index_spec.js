var expect = require('chai').expect,
    sinon = require('sinon'),
    requestMock,
    Hue;

describe('Philips Hue node module', function() {

    beforeEach(function() {
        requestMock = {
            put: sinon.spy(),
            get: sinon.spy()
        };

        qMock = {
            defer: function() {
                return {
                    resolve: sinon.spy(),
                    promise: {
                        inspect: function() {
                            return {
                                state: ""
                            }
                        },
                        then: function() {}
                    }
                }
            }
        };

        Hue = require('../index_module')(
            requestMock,
            qMock
        );
    });

    it('should be a function', function() {
        expect(Hue).to.be.a('function');
    });

    it('should return an object', function() {
        expect(Hue()).to.be.an('object');
    });

    it('should have an "apiUrl" property that equals the string passed into the module', function() {
        expect(Hue('blah').apiUrl).to.equal('blah');
    });

    describe('lights function', function() {
        it('should be a function', function() {
            expect(Hue().lights).to.be.a('function');
        });

        it('should return an object', function() {
            expect(Hue().lights()).to.be.an('object');
        });

        it('should have a "lightIdentifier" property that equals the number passed into the function', function() {
            expect(Hue().lights(1).lightIdentifier).to.equal(1);
        });

        describe('on function', function() {
            it('should call the state function with { on : true }', function() {
                var light = Hue('http://localhost/').lights(1);

                sinon.spy(light, "state");

                light.on();
                expect(light.state.calledOnce).to.equal(true);
                expect(light.state.firstCall.args[0]).to.deep.equal({ on : true });

                light.state.restore();
            })
        });

        describe('off function', function() {
            it('should call the state function with { on : false }', function() {
                var light = Hue('http://localhost/').lights(1);

                sinon.spy(light, "state");

                light.off();
                expect(light.state.calledOnce).to.equal(true);
                expect(light.state.firstCall.args[0]).to.deep.equal({ on : false });

                light.state.restore();
            })
        });

        describe('hue function', function() {
            it('should call the state function with { hue : [value] }', function() {
                var light = Hue('http://localhost/').lights(1);

                sinon.spy(light, "state");

                light.hue(101);
                expect(light.state.calledOnce).to.equal(true);
                expect(light.state.firstCall.args[0]).to.deep.equal({ hue : 101 });

                light.state.restore();
            })
        });

        describe('saturation function', function() {
            it('should call the state function with { sat : [value] }', function() {
                var light = Hue('http://localhost/').lights(1);

                sinon.spy(light, "state");

                light.saturation(101);
                expect(light.state.calledOnce).to.equal(true);
                expect(light.state.firstCall.args[0]).to.deep.equal({ sat : 101 });

                light.state.restore();
            })
        });

        describe('breathe function', function() {
            it('should call the state function with { alert : select }', function() {
                var light = Hue('http://localhost/').lights(1);

                sinon.spy(light, "state");

                light.breathe();
                expect(light.state.calledOnce).to.equal(true);
                expect(light.state.firstCall.args[0]).to.deep.equal({ alert : "select" });

                light.state.restore();
            })
        });

        describe('brightness function', function() {
            it('should call the state function with { bri : [value] }', function() {
                var light = Hue('http://localhost/').lights(1);

                sinon.spy(light, "state");

                light.brightness(101);
                expect(light.state.calledOnce).to.equal(true);
                expect(light.state.firstCall.args[0]).to.deep.equal({ bri : 101 });

                light.state.restore();
            })
        });

        describe('colorTemperature function', function() {
            it('should call the state function with { ct : [value] }', function() {
                var light = Hue('http://localhost/').lights(1);

                sinon.spy(light, "state");

                light.colorTemperature(500);
                expect(light.state.calledOnce).to.equal(true);
                expect(light.state.firstCall.args[0]).to.deep.equal({ ct : 500 });

                light.state.restore();
            })
        });

        describe('list function', function() {
            it('should make a request with the correct URL and json : true', function() {
                Hue('http://localhost/').lights().list();
                expect(requestMock.get.calledOnce).to.equal(true);
                expect(requestMock.get.firstCall.args[0]).to.deep.equal({ url: 'http://localhost/lights', json: true });
            });

            it('should call the callback with no error and the request body when the get request succeeds', function() {
                var callback = sinon.spy();
                requestMock.get = function(options, response) {
                    callback(null, "test");
                };
                Hue('http://localhost/').lights().list(callback);
                expect(callback.calledOnce).to.equal(true);
                expect(callback.firstCall.args[0]).to.equal(null);
                expect(callback.firstCall.args[1]).to.equal("test");
            });
        });

        describe('state function', function() {
            it('should queue up a state change if the promise state is "pending"', function() {
                var state = { "on" : false};
                var light = Hue('http://localhost/').lights('Master Bedroom');

                sinon.stub(light.deferred.promise, "inspect").returns({ state: 'pending' });
                sinon.spy(light.deferred.promise, "then");
                sinon.stub(light.state, "bind").returns("blah");

                light.state(state);

                expect(light.deferred.promise.then.calledOnce).to.equal(true);
                expect(light.deferred.promise.then.firstCall.args[0]).to.equal("blah");
                expect(light.state.bind.calledOnce).to.equal(true);
                expect(light.state.bind.firstCall.args[0]).to.equal(light);
                expect(light.state.bind.firstCall.args[1]).to.equal(state);

                light.deferred.promise.inspect.restore();
                light.deferred.promise.then.restore();
                light.state.bind.restore();
            });

            it('should make a request with the correct URL and data when state is an object', function() {
                Hue('http://localhost/').lights(1).state({ "on" : false});

                expect(requestMock.put.calledOnce).to.equal(true);
                expect(requestMock.put.firstCall.args[0]).to.deep.equal({
                    url: 'http://localhost/lights/1/state',
                    form: '{"on":false}'
                });
            });

            it('should vary the request URL when a different light is called', function() {
                Hue('http://localhost/').lights(2).state({ "on" : false});

                expect(requestMock.put.calledOnce).to.equal(true);
                expect(requestMock.put.firstCall.args[0]).to.deep.equal({
                    url: 'http://localhost/lights/2/state',
                    form: '{"on":false}'
                });
            });

            it('should vary the request URL when a different API url is used', function() {
                Hue('http://192.168.0.1/').lights(2).state({ "on" : false});

                expect(requestMock.put.calledOnce).to.equal(true);
                expect(requestMock.put.firstCall.args[0]).to.deep.equal({
                    url: 'http://192.168.0.1/lights/2/state',
                    form: '{"on":false}'
                });
            });

            it('should vary the request data when different state data is passed in', function() {
                Hue('http://192.168.0.1/').lights(2).state({ "on" : true});

                expect(requestMock.put.calledOnce).to.equal(true);
                expect(requestMock.put.firstCall.args[0]).to.deep.equal({
                    url: 'http://192.168.0.1/lights/2/state',
                    form: '{"on":true}'
                });
            });
        });

        describe('getState function', function() {
            it('should queue up a state change if the promise state is "pending"', function() {
                var callback = function(error, body) {};
                var light = Hue('http://localhost/').lights('Master Bedroom');

                sinon.stub(light.deferred.promise, "inspect").returns({ state: 'pending' });
                sinon.spy(light.deferred.promise, "then");
                sinon.stub(light.getState, "bind").returns("test");

                light.getState(callback);

                expect(light.deferred.promise.then.calledOnce).to.equal(true);
                expect(light.deferred.promise.then.firstCall.args[0]).to.equal("test");
                expect(light.getState.bind.calledOnce).to.equal(true);
                expect(light.getState.bind.firstCall.args[0]).to.equal(light);
                expect(light.getState.bind.firstCall.args[1]).to.equal(callback);

                light.deferred.promise.inspect.restore();
                light.deferred.promise.then.restore();
                light.getState.bind.restore();
            });

            it('should make a request with the correct URL and json : true', function() {
                Hue('http://localhost/').lights(1).getState();

                expect(requestMock.get.calledOnce).to.equal(true);
                expect(requestMock.get.firstCall.args[0]).to.deep.equal({
                    url: 'http://localhost/lights/1',
                    json: true
                });
            });

            it('should vary the request URL when a different light is called', function() {
                Hue('http://localhost/').lights(2).getState();

                expect(requestMock.get.calledOnce).to.equal(true);
                expect(requestMock.get.firstCall.args[0]).to.deep.equal({
                    url: 'http://localhost/lights/2',
                    json: true
                });
            });

            it('should vary the request URL when a different API url is used', function() {
                Hue('http://192.168.0.1/').lights(2).getState();

                expect(requestMock.get.calledOnce).to.equal(true);
                expect(requestMock.get.firstCall.args[0]).to.deep.equal({
                    url: 'http://192.168.0.1/lights/2',
                    json: true
                });
            });
        });
    });
});