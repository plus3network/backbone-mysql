var Backbone = require('backbone');
var backbone_mysql = require('../lib/backbone-mysql.js');
var sinon = require('sinon');
var expect = require('expect.js');
expect = require('sinon-expect').enhance(expect, sinon, 'was');


var Model = Backbone.Model.extend({
  urlRoot: '/users'
});

describe('delete opperation', function () {

  var query, model;
  beforeEach(function () {
    query = sinon.stub();
    model = new Model({ id: 1 });
    Backbone.client = { query: query };
  });

    afterEach(function () {
      query.reset();
    });

  describe('success', function () {

    beforeEach(function () {
      query.yields(null, [{ id: 1, name: 'Test User' }]);
    });

    it('should call query method on fetch', function (done) {
      model.destroy({
        success: function (model, response, options) {
          expect(query).was.called();
          done();
        }
      });
    });

    it('should match a delete query statement', function (done) {
      model.destroy({
        success: function (model, response, options) {
          expect(query.args[0][0]).to.eql('DELETE FROM `users` WHERE `id` = ?');
          done();
        }
      });
    });

    it('should pass the id as an argument for the query', function (done) {
      model.destroy({
        success: function (model, response, options) {
          expect(query.args[0][1]).to.eql([1]);
          done();
        }
      });
    });

  });

  describe('error', function () {

    beforeEach(function () {
      query.yields(new Error('Some bad happened!'));
    });

    it('should pass an Error object', function (done) {
      model.destroy({
        error: function (model, err, options) {
          expect(err).to.be.an(Error);
          done();
        }
      });
    });

  });

});
