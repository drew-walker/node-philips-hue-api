module.exports = function (request, url, q) {
    return function(username, email, password) {
        var mode = arguments.length === 1 ? "local" : "remote";

        var hue = {};

        hue.lights = function lights(lightIdentifier) {
            var self = {};

            self.apiUrl = mode === "local" ? username : 'http://' + hue.bridge.internalipaddress + '/api/' + username + '/';

            self.deferred = q.defer();

            self.list = function(callback) {
                request.get({
                    url: self.apiUrl + 'lights',
                    json: true
                }, function(err, response, body) {
                    callback(null, body);
                });
            };

            if (typeof lightIdentifier === "string") {
                self.list(function(error, lights) {
                    var matchingLights = Object.keys(lights).filter(function(lightKey) {
                        return lights[lightKey].name.toLowerCase() === lightIdentifier.toLowerCase();
                    });

                    if (matchingLights.length === 0) console.error('Could not find light "' + lightIdentifier + '".');
                    self.lightIdentifier = matchingLights[0];
                    self.deferred.resolve();
                });
            } else {
                self.lightIdentifier = lightIdentifier;
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

            self.getState = function(callback) {
                if (self.deferred.promise.inspect().state === 'pending') {
                    self.deferred.promise.then(self.getState.bind(self, callback));
                } else {
                    request.get({
                        url: self.apiUrl + 'lights/' + self.lightIdentifier, json: true
                    }, function (err, response, body) {
                        if (callback) callback(null, body);
                    });

                    return self;
                }
            };

            function sendMessage(state) {
                var clipmessage = {
                    bridgeId : hue.bridge.id,
                    clipCommand : {
                        url: "/api/" + username + "/lights/" + self.lightIdentifier + "/state",
                        method: "PUT",
                        body: state
                    }
                };

                request.post("https://www.meethue.com/api/sendmessage?token=" + hue.token, {
                    form: {
                        clipmessage : JSON.stringify(clipmessage)
                    }
                });
            }

            self.state = function(state) {
                if (self.deferred.promise.inspect().state === 'pending') {
                    self.deferred.promise.then(self.state.bind(self, state));
                } else {
                    if (hue.token) {
                        sendMessage(state);
                    } else {
                        request.put({
                            url: self.apiUrl + 'lights/' + self.lightIdentifier + '/state',
                            form: JSON.stringify(state)
                        });
                    }
                    return self;
                }
            };

            return self;
        };

        function login(options) {
            var deferred = q.defer();

            request({
                url:"https://www.meethue.com/en-us/api/getaccesstokengivepermission",
                method:"POST",
                jar : options.cookies,
                form: {
                    email: options.email,
                    password: options.password
                }
            }, function() {
                deferred.resolve(options.cookies);
            });

            return deferred.promise;
        }

        function getToken(cookies) {
            var deferred = q.defer();

            request({
                "url" : "https://www.meethue.com/en-us/api/getaccesstokenpost",
                "followRedirect" : false,
                "jar" : cookies
            }, function(error, response) {
                deferred.resolve(
                    url.parse(response.headers.location, true)
                        .query.redirectUrl.replace('phhueapp://sdk/login/', ''));
            });

            return deferred.promise;
        }

        function getBridge() {
            var deferred = q.defer();

            request({
                url: "https://www.meethue.com/api/nupnp",
                json: true
            }, function(error, response, body) {
                deferred.resolve(body[0]);
            });

            return deferred.promise;
        }

        function getAuthenticationDetails(bridgeId) {
            var deferred = q.defer(),
                cookies = request.jar();

            request({
                url : "https://www.meethue.com/en-us/api/gettoken?appid=hueapp&devicename=iPhone+5&deviceid=" + bridgeId,
                jar : cookies
            }, function() {
                deferred.resolve({ email:email, password:password, cookies:cookies });
            });

            return deferred.promise;
        }

        hue.authenticate = function() {
            var deferred = q.defer();

            function returnOrGetToken(bridge) {
                hue.bridge = bridge;
                if (hue.token) {
                    deferred.resolve(hue.lights);
                } else {
                    getAuthenticationDetails(bridge.id)
                        .then(login)
                        .then(getToken)
                        .then(function(token) {
                            hue.token = token;
                            deferred.resolve(hue.lights);
                        });
                }
            }

            if (hue.bridge && hue.token) {
                deferred.resolve(hue.lights);
            } else {
                getBridge().then(returnOrGetToken);
            }

            return deferred.promise;
        };

        return hue;
    };
};