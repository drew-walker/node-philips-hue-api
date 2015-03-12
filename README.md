[![Build Status](https://travis-ci.org/drew-walker/node-philips-hue-api.svg?branch=master)](https://travis-ci.org/drew-walker/node-philips-hue-api)
[![Coverage Status](https://coveralls.io/repos/drew-walker/node-philips-hue-api/badge.svg?branch=master)](https://coveralls.io/r/drew-walker/node-philips-hue-api?branch=master)

NOTE: This package will currently only work if you're on the same network as your Hue base station.

# Install

    npm install philips-hue-api --save

# Usage

## When you're on the same network as your Hue (good for testing)

    var Hue = require('philips-hue-api'),
        hue = Hue('http://192.168.x.x/api/your_username');

    hue.lights(1).on(); // Turns on light number 1.

## When you're not on the same network (good for real-world applications)

    var Hue = require('philips-hue-api'),
        hue = Hue('username', 'me@here.com', 'my-amazing-password');

    hue.authenticate().then(function(lights) {
        lights(1).off();
    });

# API

## Lights

**list()** - Asynchronous function that returns the available lights (as JSON) for the current bridge.

    Hue('http://192.168.x.x/api/username/').lights().list(function(error, lights) {
        console.log(lights);
    });

**off()** - Turns off the specified light.

**on()** - Turns on the specified light.

**breathe()** - Causes the specified light to perform a breath cycle (transition to a higher brightness, then lower brightness, then back).

**hue(int)** - Sets the hue (color) of the specified lights (between 0 and 65535). Both 0 and 65535 are red, 25500 is green and 46920 is blue.

**color(string)** - Helper function for setting the hue of the specified light. Can be: red, orange, yellow, green, white, blue, purple, magenta, or pink.

**saturation(int)** - Sets the saturation of the specified light. 254 is the most saturated (colored) and 0 is the least saturated (white).

**brightness(int)** - Sets the brightness of the specified light (between 1 and 254). 1 is the darkest and 254 is the brightest.

**colorTemperature(int)** - Sets the color temperature of the specified light (between 153 and 500). 153 is 6500K, 500 is 2000K.

**state(object)**

# More Examples

## Listing Lights

    var Hue = require('philips-hue-api'),
        hue = Hue("[your-username]", "[your-email]", "[your-password]");

    hue.authenticate().then(function(lights) {
        lights().list();
    });

## Turning a light on by its name

    var Hue = require('philips-hue-api'),
        hue = Hue("[your-username]", "[your-email]", "[your-password]");

    hue.authenticate().then(function(lights) {
        lights('Bedroom').on();
    });

## Making your light turn blue

    var Hue = require('philips-hue-api'),
        hue = Hue("[your-username]", "[your-email]", "[your-password]");

    hue.authenticate().then(function(lights) {
        lights('Bedroom').color('blue');
    });