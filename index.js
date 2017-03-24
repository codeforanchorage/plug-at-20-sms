'use strict'

// 3rd party library imports
var express = require('express')
var body_parser = require('body-parser')
var rollbar = require("rollbar")
var request = require("request")

// project imports
var text = require('./message_text.json')
var cron_job = require('./cron_job').job
var db = require('./db')
var ZIPCODES = require('./zipcodes')

// Slack Webhook Token
var SLACK_WEBHOOK = process.env.SLACK_WEBHOOK


var app = express() // instantiate express


// serve files from the public dir for testing via web
app.get('/', express.static(__dirname + '/public'))
// parse POST bodies
app.use(body_parser.urlencoded({ extended: true }))


// Twilio hits this endpoint
app.post('/', function(req, res, next) {
    var message = req.body.Body
    var phone_number = req.body.From
    var zipcode_regex = /^\d{5}(?:[-\s]\d{4})?$/
    var zip = null

    // this is necessary
    res.set('Content-Type', 'text/plain');

    var match = message.match(zipcode_regex)
    if (match) zip = match[0]

    var is_subscriber = db('subscribers').find(function(item) {
        return item.phone == phone_number
    })

    // if they sent a zipcode
    if (zip) {
        if (ZIPCODES.indexOf(zip) > -1) {
            db('subscribers').push({
                phone: phone_number,
                zip: zip,
            })
            return res.send(text.CONFIRMATION)
        }
        else {
            return res.send(text.BAD_ZIP)
        }
    }
    // if we know this number, what the hell are they trying to tell us?
    else if (is_subscriber) {
        // log the message, maybe it's interesting
        db('unknown_commands').push({
            phone: phone_number,
            message: message,
        })
        // decode URI encodings, setup the messages.
        var decoded_msg = decodeURIComponent(message)
        var fallback_msg = "FROM: " + phone_number + " - " + decoded_msg
        var title_msg = "FROM: " + phone_number
        request.post(SLACK_WEBHOOK).form(JSON.stringify({
            "username":"Citizen Feedback",
            "attachments": [
                {
                    "fallback": fallback_msg,
                    "title": title_msg,
                    "text": decoded_msg
                }
            ]
        }))
        return res.send(text.INSTRUCTIONS)
    }
    // else just say Hello
    else {
        return res.send(text.WELCOME)
    }
});


// error handlers
app.use(rollbar.errorHandler(process.env.ROLLBAR_TOKEN));
rollbar.handleUncaughtExceptionsAndRejections(
    process.env.ROLLBAR_TOKEN,
    {exitOnUncaughtException: true}
);


// start the server
var port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('plug-at-20 app running on port', port);
});


// start the cron job
cron_job.start()
