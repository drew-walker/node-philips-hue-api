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

        Hue = require('../index_module')(
            requestMock
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