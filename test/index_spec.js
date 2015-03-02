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
                        }
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

        it('should have a "number" property that equals the number passed into the function', function() {
            expect(Hue().lights(1).number).to.equal(1);
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

        describe('state function', function() {
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
    });
});