var Backbone = require('backbone');
var backbone_mysql = require('../lib/backbone-mysql.js');
var sinon = require('sinon');
var expect = require('expect.js');
expect = require('sinon-expect').enhance(expect, sinon, 'was');


var Model = Backbone.Model.extend({
  urlRoot: '/users'
});

describe('read opperation', function () {
    var query;
    beforeEach(function () {
      query = sinon.stub();
      Backbone.client = { query: query };
    });

    afterEach(function () {
      query.reset();
    });

  describe('success', function () {

    beforeEach(function () {
      query.yields(null, [{ id: 1, name: 'Test User' }]);
    });

    it('should call the backbone_mysql.syncModel method on fetch', function (done) {
      var model = new Model({ id: 1 });
      model.fetch({
        success: function (model, response, options) {
          expect(query).was.called();
          done();
        }
      });
    });

    it('should match a select query statement', function (done) {
      var model = new Model({ id: 1 });
      model.fetch({
        success: function (model, response, options) {
          expect(query.args[0][0]).to.eql('SELECT * FROM `users` WHERE `id` = ?');
          done();
        }
      });
    });

    it('should pass the id as an argument for the query', function (done) {
      var model = new Model({ id: 1 });
      model.fetch({
        success: function (model, response, options) {
          expect(query.args[0][1]).to.eql([1]);
          done();
        }
      });
    });

    it('should populate the attributes', function (done) {
      var model = new Model({ id: 1 });
      model.fetch({
        success: function (model, response, options) {
          expect(model.id).to.eql(1);
          expect(model.get('name')).to.eql('Test User');
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
      var model = new Model({ id: 1 });
      model.fetch({
        error: function (model, err, options) {
          expect(err).to.be.an(Error);
          done();
        }
      });
    });

  });

});
