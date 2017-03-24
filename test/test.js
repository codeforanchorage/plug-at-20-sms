'use strict'

// 3rd party library imports
var cron = require('cron')
var twilio = require('twilio')

// project imports
var forecast = require('../temp_forecast')

// Super basic test to make sure the messages.json file is valid
require('../message_text.json')

describe("Hit the weather API, make sure zipcodes don't error", () => {
  it('should work', (done) => {
    // Really basic test just to make sure the zipcodes don't error
    forecast.getLowTemps(function(err, data) {
        // console.dir(data, {depth:5, color:true})
        done(err)
    })
  })
})
