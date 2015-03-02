module.exports = function (request, q) {
    return function(apiUrl) {
        var self = {};

        self.apiUrl = apiUrl;

        self.lights = function lights(lightIdentifier) {
            var self = {};

            self.deferred = q.defer();

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
                    self.deferred.resolve();
                });
            } else {
                self.number = lightIdentifier;
                self.deferred.resolve();
            }

            self.off = function() {
                self.state({"on": false});
                return self;
            };

            self.on = function() {
                self.state({ "on" : true });
                return self;
            };

            self.breathe = function() {
                self.state({ "alert" : "select" });
                return self;
            };

            self.hue = function(hue) {
                self.state({ "hue" : hue });
                return self;
            };

            self.saturation = function(saturation) {
                self.state({ "sat" : saturation });
                return self;
            };

            self.brightness = function(brightness) {
                self.state({ "bri" : brightness });
                return self;
            };

            self.colorTemperature = function(colorTemperature) {
                self.state({ "ct" : colorTemperature});
                return self;
            };

            self.state = function(state) {
                if (self.deferred.promise.inspect().state === 'pending') {
                    self.deferred.promise.then(function() {
                        self.state(state);
                    });
                } else {
                    if (typeof state === "object") {
                        request.put({
                            url: apiUrl + 'lights/' + self.number + '/state',
                            form: JSON.stringify(state)
                        });

                        return self;
                    }

                    request.get({
                        url: apiUrl + 'lights/' + self.number, json: true
                    }, function (err, response, body) {
                        if (state) state(null, body);
                    });

                    return self;
                }
            };

            return self;
        };

        return self;
    };
};