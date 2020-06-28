/**
* For Testing we used mocha and chai for assertions. Chai provides way more assert
* options and we have to deal with slight rounding errors between our calculations
* and the ones from turf. For this reason the assert.closeTo function is nice :)
*/
var chai = require('chai');
assert = chai.assert;
var turf = require('@turf/distance');
var bearing = require('@turf/bearing');
var coordinate = require('../public/coordinateFunctions.js');


describe('Coordinates', function() {
  describe('#getDistance()', function() {
    it('should return 0', function () {
        assert.equal( (coordinate.getDistance(52,7,52,7))/1000, 0);
    });
    it('should return roughly the same value as turf.distance (short distance)', function () {
        assert.closeTo( (coordinate.getDistance(52.23,7.89,52.24,7.9))/1000, turf.default([7.89,52.23], [7.9,52.24]), 0.0005);
    });
    //Doomed to fail read Error message
    it('should return roughly the same value as turf.distance (large distance)', function () {
        assert.closeTo( (coordinate.getDistance(52,7,24,100))/1000, turf.default([7,52], [100,24]), 0.0005, 'This will fail because the difference between the turf distance and ours gets bigger with greater distances');
    });
    it('should return NaN when list of agruments incomplete', function () {
        assert.isNaN( (coordinate.getDistance(52,7,24))/1000);
    });
  });

  describe('#getBearing()', function() {
    it('should return 0 when comparing the same point', function () {
        assert.equal( coordinate.getBearing(52,7,52,7), 0);
    });
    //Doomed to fail read Error message
    it('should return roughly the same value as turf.distance (short distance)', function () {
        assert.equal(coordinate.getBearing(52.23,7.89,52.24,7.9), bearing.default([7.89,52.23], [7.9,52.24]), 'Fails because now it is reversed from the Distance situation.');
    });
    it('should return roughly the same value as turf.distance (large distance)', function () {
        assert.equal(coordinate.getBearing(52,7,24,100), bearing.default([7,52], [100,24]));
    });
    it('should return NaN when list of agruments incomplete', function () {
        assert.isNaN( coordinate.getBearing(52,7,24));
    });
  });
});
