'use strict';
var forecast = require('../temp_forecast');
var nock = require('nock');
var expect = require("chai").expect;
var fs = require("fs");

var xml = fs.readFileSync(__dirname + "/fixtures/xml_response.xml", "UTF-8");

var tempObj = {
    '99501': 16, '99502': 16, '99503': 17, '99504': 12,
    '99507': 13, '99508': 11, '99509': 17, '99510': 16,
    '99511': 14, '99513': 17, '99514': 11, '99515': 14,
    '99516': 10, '99517': 17, '99518': 14, '99519': 16,
    '99520': 16, '99521': 11, '99522': 14, '99523': 17,
    '99524': 17, '99577': 7, '99599': 16, '99645': 11,
    '99652': 17, '99654': 15, '99667': 13, '99674': 9,
    '99676': 4, '99683': 8, '99687': 16, '99688': 12,
    '99694': 13, '99695': 17
};

describe('getLowTemps function', function () {

    // Adjust retry rate so these tests don't take forever
    forecast.RETRY_DELAY = 1

    // Unmock weather api after these tests are done
    after(function () { nock.cleanAll(); });

    describe('test retry success', function () {
        before(function () {
            // respond with 504 status code 4 times, then responded with 200 code and xml response
            nock('http://graphical.weather.gov')
                .filteringPath(function (path) {
                    return '/';
                })
                .get('/')
                .times(4)
                .reply(504);

            nock('http://graphical.weather.gov')
                .filteringPath(function (path) {
                    return '/';
                })
                .get('/')
                .times(1)
                .reply(200, xml, {
                    'Content-Type': 'text/xml'
                });
        });

        it('it retries 5 times, when successful it continues on parsing xml and returns object', function (done) {
            forecast.getLowTemps(function (err, data) {
                expect(JSON.stringify(data)).to.eq(JSON.stringify(tempObj));
                done();
            })
        });
    });

    describe('test retry failure', function () {
        // adjust mocha testing framework default timeout, this is needed for the retries which have long delay
        this.timeout(15000);
        before(function () {
            nock('http://graphical.weather.gov')
                .filteringPath(function (path) {
                    return '/';
                })
                .get('/')
                .times(5)
                .reply(504);
        });
        it('it returns correct error if response code is NOT 200 after 5 trys', function (done) {
            forecast.getLowTemps(function (err, data) {
                expect(err.message).to.eq("504 response from weather.gov");
                done();
            })
        });
    });
});
