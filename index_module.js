module.exports = function (request, url, q, console, cache) {

    function LocalCache() {
        var localCacheObj = {};

        return {
            set: function(key, value, callback) {
                localCacheObj[key] = value;
                callback();
            },
            get: function(key, callback) {
                callback(null, localCacheObj[key]);
            }
        }
    }

    return function(username, email, password) {
        var mode = arguments.length === 1 ? "local" : "remote";

        var hue = {};

        if (cache) {
            hue.cache = cache;
        } else {
            hue.cache = LocalCache();
        }

        hue.lights = function lights(lightIdentifier) {
            var self = {};

            self.apiUrl = mode === "local" ? username : "https://www.meethue.com/api/";

            self.deferred = q.defer();

            self.list = function(callback) {
                hue.cache.get('token', function(err, token) {
                    var url = mode === "local" ? self.apiUrl + "lights" : self.apiUrl + 'getbridge?token=' + token;

                    console.log("Getting light list from %s...", url);
                    request.get({
                        url: url,
                        json: true
                    }, function(err, response, body) {
                        callback(null, mode === "local" ? body : body.lights);
                    });
                })
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
                console.log('A light has been told to switch off');
                self.state({"on": false});
                return self;
            };

            self.on = function() {
                console.log('A light has been told to switch on');
                self.state({ "on" : true });
                return self;
            };

            self.color = function(name) {
                console.log('A light has been told to turn %s', name);
                var state = {};

                name = name.toLowerCase();

                state.sat = name.substring(0, 5) === "light" ? 180 : 254;

                name = name.replace("light", "").replace("-","").trim();

                switch (name) {
                    case "red":
                        hue = 0;
                        break;
                    case "orange":
                        hue = 8500;
                        break;
                    case "yellow":
                        hue = 17000;
                        break;
                    case "green":
                        hue = 25500;
                        break;
                    case "white":
                        hue = 34000;
                        break;
                    case "blue":
                        hue = 46920;
                        break;
                    case "purple":
                        hue = 48000;
                        break;
                    case "magenta":
                        hue = 54000;
                        break;
                    case "pink":
                        hue = 60000;
                        break;
                    default:
                        hue = 15000;
                }

                state.hue = hue;

                self.state(state);
            };

            self.breathe = function() {
                console.log('A light has been told to breathe');
                self.state({ "alert" : "select" });
                return self;
            };

            self.hue = function(hue) {
                console.log('A light has been told to change hue');
                self.state({ "hue" : hue });
                return self;
            };

            self.saturation = function(saturation) {
                console.log('A light has been told to change saturation');
                self.state({ "sat" : saturation });
                return self;
            };

            self.brightness = function(brightness) {
                console.log('A light has been told to change brightness');
                self.state({ "bri" : brightness });
                return self;
            };

            self.colorTemperature = function(colorTemperature) {
                console.log('A light has been told to change color temperature');
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
                hue.cache.get('bridge', function(err, bridge) {
                    var clipmessage = {
                        bridgeId : bridge.id,
                        clipCommand : {
                            url: "/api/" + username + "/lights/" + self.lightIdentifier + "/state",
                            method: "PUT",
                            body: state
                        }
                    };

                    hue.cache.get('token', function(err, token) {
                        request.post("https://www.meethue.com/api/sendmessage?token=" + token, {
                            form: {
                                clipmessage : JSON.stringify(clipmessage)
                            }
                        });
                    });
                });
            }

            self.state = function(state) {
                if (self.deferred.promise.inspect().state === 'pending') {
                    console.log("Trying to find a matching light...");
                    self.deferred.promise.then(self.state.bind(self, state));
                } else {
                    console.log("Setting light state to:", state);
                    hue.cache.get('token', function(err, token) {
                        if (token) {
                            sendMessage(state);
                        } else {
                            request.put({
                                url: self.apiUrl + 'lights/' + self.lightIdentifier + '/state',
                                form: JSON.stringify(state)
                            });
                        }

                        return self;
                    });
                }
            };

            return self;
        };

        function login(options) {
            var deferred = q.defer();

            console.log('Logging in...');
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

            console.log('Getting authentication token...');
            request({
                "url" : "https://www.meethue.com/en-us/api/getaccesstokenpost",
                "followRedirect" : false,
                "jar" : cookies
            }, function(error, response) {
                var redirectUrl = url.parse(response.headers.location, true).query.redirectUrl;
                request({
                    url: redirectUrl,
                    followRedirect: false,
                    headers: {
                        "accept-language": "en-US,en;q=0.8"
                    }
                }, function(err, response) {
                    var tokenCookie = response.headers['set-cookie'][0].split(";")[0];
                    deferred.resolve(tokenCookie.substring(tokenCookie.indexOf("=") + 2, tokenCookie.length - 1));
                });
            });

            return deferred.promise;
        }

        function getBridge() {
            var deferred = q.defer();

            hue.cache.get('token', function(err, token) {
                var bridgeUrl = "https://www.meethue.com/api/getbridge?token=" + token;
                console.log('Getting bridge details from %s...', bridgeUrl);
                request({
                    url: bridgeUrl,
                    json: true
                }, function(error, response, body) {
                    var id = body.config.mac.replace(/:/g, "");
                    id = id.substring(0, 6) + "fffe" + id.substring(6, 12);
                    var bridge = {
                        id : id,
                        internalipaddress : body.config.ipaddress
                    };
                    hue.cache.set('bridge', bridge, function() {
                        deferred.resolve(bridge);
                    });
                });
            });

            return deferred.promise;
        }

        function getAuthenticationDetails() {
            var deferred = q.defer(),
                cookies = request.jar();

            console.log('Getting login cookie...');
            request({
                url : "https://www.meethue.com/en-us/api/gettoken?appid=myhue&devicename=Chrome&deviceid=Browser",
                jar : cookies
            }, function() {
                deferred.resolve({ email:email, password:password, cookies:cookies });
            });

            return deferred.promise;
        }

        hue.authenticate = function() {
            var deferred = q.defer();

            function getTokenAndBridge() {
                getAuthenticationDetails()
                    .then(login)
                    .then(getToken)
                    .then(function(token) {
                        hue.cache.set('token', token, function() {
                            getBridge().then(function(bridge) {
                                deferred.resolve(hue.lights);
                            });
                        })
                    });
            }

            hue.cache.get('token', function(err, token) {
                hue.cache.get('bridge', function(err, bridge) {
                    if (bridge && token) {
                        deferred.resolve(hue.lights);
                    } else {
                        if (token) {
                            console.log('Already authenticated...');
                            deferred.resolve(hue.lights);
                        } else {
                            getTokenAndBridge();
                        }
                    }
                })
            });

            return deferred.promise;
        };

        return hue;
    };
};