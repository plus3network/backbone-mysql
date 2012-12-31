var Backbone = require('backbone');
var backbone_mysql = require('../lib/backbone-mysql.js');
var sinon = require('sinon');
var expect = require('expect.js');
expect = require('sinon-expect').enhance(expect, sinon, 'was');


var Model = Backbone.Model.extend({
  urlRoot: '/users'
});

describe('create opperation', function () {

  var query, model;
  beforeEach(function () {
    query = sinon.stub();
    model = new Model({ id: 2, name: "Test User" });
    Backbone.client = { query: query };
  });

    afterEach(function () {
      query.reset();
    });

  describe('success', function () {

    beforeEach(function () {
      query.yields(null, { affectedRows: 1, insertId: 2 });
    });

    it('should call query method on update', function (done) {
      model.save(null, {
        success: function (model, response, options) {
          expect(query).was.called();
          done();
        }
      });
    });

    it('should match a update query statement', function (done) {
      model.save(null, {
        success: function (model, response, options) {
          expect(query.args[0][0]).to.eql('UPDATE `users` SET `name` = ? WHERE `id` = ?');
          done();
        }
      });
    });

    it('should pass the id as an argument for the query', function (done) {
      model.save(null, {
        success: function (model, response, options) {
          expect(query.args[0][1]).to.eql(['Test User', 2]);
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
      model.save(null, {
        error: function (model, err, options) {
          expect(err).to.be.an(Error);
          done();
        }
      });
    });

  });

});
