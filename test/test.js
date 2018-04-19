'use strict';

const chai = require('chai');
const expect = require('chai').expect;
chai.use(require('chai-http'));
const app = require('../app.js'); 

describe('API endpoint /pricing', function () {
  this.timeout(5000); 

  // GET - List all coupons
  it('should return all coupons', function () {
    return chai.request(app)
      .get('/pricing/allcoupons')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
      });
  });

  // GET - specific coupon
  it('should return a coupon', function () {
    return chai.request(app)
      .get('/pricing')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
      });
  });

});