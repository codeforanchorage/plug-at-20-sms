'use strict'

// 3rd party library imports
var cron = require('cron')
var twilio = require('twilio')
var rollbar = require("rollbar")
rollbar.init(process.env.ROLLBAR_TOKEN)

// project imports
var db = require('./db')
var message_text = require('./message_text.json')
var forecast = require('./temp_forecast')


// constants
var NOTIFICATION_TIME = 20 // 8 pm
var NOTIFICATION_TEMPERATURE = 20
var TWILIO_SID = 'AC4d903012a56c8cba55657d6f9520846e'
var TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
var TWILIO_NUMBER = '+19073122014'


var job = new cron.CronJob({
    // run every day at the hour specified above
    cronTime: '0 ' + NOTIFICATION_TIME + ' * * *',
    // cronTime: '* * * * *', // every minute
    onTick: sendMessages,
    timeZone: 'America/Anchorage'
});

function sendMessages(cb) {
    var DELAY = 500; // throttle calles to twilio

    // get weather
    forecast.getLowTemps(function(err, data) {
        if (err) return rollbar.handleError(err)
        var subscribers = db('subscribers').filter(sub => data[sub.zip] <= NOTIFICATION_TEMPERATURE)
        // loop over subscribers with delay
        var inter = setInterval( gen => {
            var next = gen.next()
            if (next.done) {
                clearInterval(inter)
                return cb()
            }
            var subscriber = next.value
            module.exports.sendToTwilio(subscriber.phone, randomElement(message_text.NOTIFICATIONS))
        }, DELAY, subscribers[Symbol.iterator]())
    })
}

function sendToTwilio(to, body){
    var twilio_client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN)
    twilio_client.sendMessage(
        {
            to: subscriber.phone,
            from: TWILIO_NUMBER,
            body: randomElement(message_text.NOTIFICATIONS),
        },
        function (err, response) {
            if (err) return rollbar.handleError(err)

            console.log(response)
        }
    )
}

function randomElement(items) {
    return items[Math.floor(Math.random()*items.length)]
}

module.exports.job = job
module.exports.sendMessages = sendMessages
module.exports.sendToTwilio = sendToTwilio
