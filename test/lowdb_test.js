var fs = require('fs')
var expect = require('chai').expect

var dbobj = JSON.parse(fs.readFileSync(__dirname + "/../db.json", "utf-8"))

describe('lowdbStuct', function() {
    it('should exist', function(done) {
        expect(dbobj).to.exist
        done()
    });
    it('should have a property of subscribers', function(done) {
        expect(dbobj).to.have.property('subscribers')
        done()
    })
    it('should have subscribers be an Array', function(done) {
        expect(dbobj.subscribers).to.be.instanceof(Array)
        done()
    })
    it('should have subscribers have a property of phone', function(done) {
        expect(dbobj.subscribers[0]).to.have.property('phone')
        done()
    })
    // should not have a duplicate user with same phone number and zipcode
    it('should not duplicate phone numbers', function(done) {
        for(var i=0, j=1; j<dbobj.subscribers.length; i++,j++) {
            expect(dbobj.subscribers[i].phone).to.not.equal(dbobj.subscribers[j].phone)
        }
        done()
    })
})

