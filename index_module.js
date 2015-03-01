module.exports = function (request) {
    return function(apiUrl) {
        var self = {};

        self.apiUrl = apiUrl;

        self.lights = function lights(number) {
            var self = {};

            self.number = number;

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
                        url: apiUrl + 'lights/' + number + '/state',
                        form: JSON.stringify(state)
                    }, function(err, response, body) {
                        if (callback) callback(null, body);
                    });

                    return self;
                }

                request.get({
                    url: apiUrl + 'lights/' + number,
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