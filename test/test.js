'use strict'

// 3rd party library imports
var cron = require('cron')
var sinon = require('sinon')
var twilio = require('twilio')
var fs = require('fs')

// project imports
var forecast = require('../temp_forecast')
var cron_job = require('../cron_job')

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
describe("Sending Messages", () =>{
    var sendStub, getTempStub
    var tempObj = {
        '99501': 16, '99502': 16, '99503': 40
    }
    beforeEach(function(){
        sendStub = sinon.stub(cron_job, 'sendToTwilio')
        getTempStub = sinon.stub(forecast, 'getLowTemps')
        getTempStub.yields(null, tempObj)
    })
    afterEach(function(){
        sendStub.restore()
        getTempStub.restore()
    })
    it("Calls sendToTwilio", function(done) {
        cron_job.sendMessages(function(){
            sinon.assert.calledWith(sendStub, '+19075551111')
            sinon.assert.calledWith(sendStub, '+19075551112')
            sinon.assert.neverCalledWith(sendStub, '+19075551113')
            done()
        })
    })
})
})
