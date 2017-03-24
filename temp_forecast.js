'use strict'

var request = require('requestretry');
var parseString = require('xml2js').parseString;

// the weather service delivers forecasts in 3 hour blocks
// start and end should be 3 hours apart if you want just one temp
var LOW_TEMP_START_HOUR = '00' // midnight
var LOW_TEMP_END_HOUR = '03' // 3am

// these are all the zipcodes in anchorage that can have weather (there are some
// weird ones that make the weather API error)
var ZIPCODES = require('./zipcodes')

// settings for retrying the weather API
var MAX_RETRIES = 5
var RETRY_DELAY = 5000 // 5 seconds

function getWeatherUrl() {
    var d = new Date()
    d.setDate(d.getDate() + 1)
    var tomorrow_string = d.toISOString().substring(0,10)

    return 'http://graphical.weather.gov/' +
        'xml/sample_products/browser_interface/ndfdXMLclient.php?' +
        'whichClient=NDFDgenMultiZipCode&' +
        'lat=&' +
        'lon=&' +
        'listLatLon=&' +
        'lat1=&' +
        'lon1=&' +
        'lat2=&' +
        'lon2=&' +
        'resolutionSub=&' +
        'listLat1=&' +
        'listLon1=&' +
        'listLat2=&' +
        'listLon2=&' +
        'resolutionList=&' +
        'endPoint1Lat=&' +
        'endPoint1Lon=&' +
        'endPoint2Lat=&' +
        'endPoint2Lon=&' +
        'listEndPoint1Lat=&' +
        'listEndPoint1Lon=&' +
        'listEndPoint2Lat=&' +
        'listEndPoint2Lon=&' +
        'zipCodeList=' + ZIPCODES.join('+') + '&' +
        'listZipCodeList=&' +
        'centerPointLat=&' +
        'centerPointLon=&' +
        'distanceLat=&' +
        'distanceLon=&' +
        'resolutionSquare=&' +
        'listCenterPointLat=&' +
        'listCenterPointLon=&' +
        'listDistanceLat=&' +
        'listDistanceLon=&' +
        'listResolutionSquare=&' +
        'citiesLevel=&' +
        'listCitiesLevel=&' +
        'sector=&' +
        'gmlListLatLon=&' +
        'featureType=&' +
        'requestedTime=&' +
        'startTime=&' +
        'endTime=&' +
        'compType=&' +
        'propertyName=&' +
        'product=time-series&' +
        'begin=' + tomorrow_string + 'T' + LOW_TEMP_START_HOUR + '%3A00%3A00&' +
        'end=' + tomorrow_string + 'T' + LOW_TEMP_END_HOUR + '%3A00%3A00&' +
        'Unit=e&' +
        'temp=temp&' +
        'Submit=Submit'
}


function getLowTemps(callback) {
    let options = {
        url: getWeatherUrl(),
        maxAttempts: MAX_RETRIES,
        retryDelay: exports.RETRY_DELAY, // using the export to facilitate test mocking
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
        }
    }

    request(
        options,
        function (err, response, body) {
            if (err) return callback(err)

            if (response.statusCode != 200) {
                var msg = response.statusCode + ' response from weather.gov'
                return callback(new Error(msg))
            }

            getTempsFromWeatherData(body, callback)
        }
    )
}


function getTempsFromWeatherData(data, callback) {
    var temps = {}

    parseString(data, function (err, result) {
        if (err) return callback(err)

        ZIPCODES.forEach(function(zip, i) {
            var t = result.dwml.data[0].parameters[i].temperature[0].value[0]
            temps[zip] = parseInt(t)
        })

        callback(null, temps)
    })
}

exports.getLowTemps = getLowTemps
exports.RETRY_DELAY = RETRY_DELAY

// getLowTemps((e,d)=>{console.log(e); console.dir(d)})
