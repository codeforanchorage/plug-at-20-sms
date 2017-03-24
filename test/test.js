'use strict'

// 3rd party library imports
var cron = require('cron')
var twilio = require('twilio')

// project imports
var forecast = require('../temp_forecast')

// Super basic test to make sure the messages.json file is valid
require('../message_text.json')

describe("Hit the weather API", () => {
  it('zipcodes should not error', function (done) {
    this.timeout(30000)

    // Really basic test just to make sure the zipcodes don't error
    forecast.getLowTemps(function(err, data) {
        // console.dir(data, {depth:5, color:true})
        done(err)
    })
  })
})
