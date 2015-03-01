[![Build Status](https://travis-ci.org/drew-walker/node-philips-hue-api.svg?branch=master)](https://travis-ci.org/drew-walker/node-philips-hue-api)
[![Coverage Status](https://coveralls.io/repos/drew-walker/node-philips-hue-api/badge.svg)](https://coveralls.io/r/drew-walker/node-philips-hue-api)

NOTE: This package will currently only work if you're on the same network as your Hue basestation.

# Install

    npm install philips-hue-api --save

# Usage

    var Hue = require('philips-hue-api'),
        hue = Hue('http://192.168.x.x/api/your_username');

    hue.lights(1).on(); // Turns on light number 1.
