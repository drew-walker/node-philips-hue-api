module.exports = function (request) {
    return function(apiUrl) {
        var self = {};

        self.apiUrl = apiUrl;

        self.lights = function lights(lightIdentifier, callback) {
            var self = {};

            self.list = function(callback) {
                request.get({
                    url: apiUrl + 'lights',
                    json: true
                }, function(err, response, body) {
                    callback(null, body);
                });
            };

            if (typeof lightIdentifier === "string") {
                self.list(function(error, lights) {
                    var matchingLights = Object.keys(lights).filter(function(lightKey) {
                        return lights[lightKey].name === lightIdentifier;
                    });

                    if (matchingLights.length === 0) return callback('Could not find light "' + lightIdentifier + '".', self);
                    self.number = matchingLights[0];
                    callback(null, self);
                });
            } else {
                self.number = lightIdentifier;
            }

            self.off = function(callback) {
                self.state({ "on" : false }, callback);
            };

            self.on = function(callback) {
                self.state({ "on" : true }, callback);
            };

            self.breathe = function(callback) {
                self.state({ "alert" : "select" }, callback);
                return self;
            };

            self.hue = function(hue, callback) {
                self.state({ "hue" : hue }, callback);
                return self;
            };

            self.saturation = function(saturation, callback) {
                self.state({ "sat" : saturation }, callback);
                return self;
            };

            self.brightness = function(brightness, callback) {
                self.state({ "bri" : brightness }, callback);
                return self;
            };

            self.colorTemperature = function(colorTemperature, callback) {
                self.state({ "ct" : colorTemperature}, callback);
                return self;
            };

            self.state = function(state, callback) {
                if (typeof state === "object") {
                    request.put({
                        url: apiUrl + 'lights/' + self.number + '/state',
                        form: JSON.stringify(state)
                    }, function(err, response, body) {
                        if (callback) callback(null, body);
                    });

                    return self;
                }

                request.get({
                    url: apiUrl + 'lights/' + self.number,
                    json: true
                }, function(err, response, body) {
                    if (state) state(null, body);
                });

                return self;
            };

            return self;
        };

        return self;
    };
};