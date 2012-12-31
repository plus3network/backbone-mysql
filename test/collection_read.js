var Backbone = require('backbone');
var backbone_mysql = require('../lib/backbone-mysql.js');
var sinon = require('sinon');
var expect = require('expect.js');
expect = require('sinon-expect').enhance(expect, sinon, 'was');


var Collection = Backbone.Collection.extend({
  url: '/users'
});

describe('read opperation', function () {
  var query, collection;
  beforeEach(function () {
    query = sinon.stub();
    collection = new Collection();
    Backbone.client = { query: query };
  });

    afterEach(function () {
      query.reset();
    });

  describe('success', function () {

    beforeEach(function () {
      query.yields(null, [{ id: 1, name: 'Test User' },{ id: 2, name: 'Test User' }]);
    });

    it('should call the collection sync method on fetch', function (done) {
      collection.fetch({
        data: {
          rank: { value: 2, op: '>' },
          is_active: true
        },
        success: function (collection, response, options) {
          expect(query).was.called();
          done();
        }
      });
    });

    it('should match a select query statement', function (done) {
      collection.fetch({
        data: {
          rank: { value: 2, op: '>' },
          is_active: true
        },
        success: function (collection, response, options) {
          expect(query.args[0][0]).to.eql('SELECT * FROM `users` WHERE `rank` > ? AND `is_active` = ?');
          done();
        }
      });
    });

    it('should populate pass the where clauses', function (done) {
      collection.fetch({
        data: {
          rank: { value: 2, op: '>' },
          is_active: true
        },
        success: function (collection, response, options) {
          expect(query.args[0][1]).to.eql([2, true]);
          done();
        }
      });
    });

    it('should match a select query statement with order by', function (done) {
      collection.fetch({
        data: {
          rank: { value: 2, op: '>' },
          orderBy: { rank: 'desc', name: 'asc' }
        },
        success: function (collection, response, options) {
          expect(query.args[0][0]).to.eql('SELECT * FROM `users` WHERE `rank` > ? ORDER BY `rank` DESC, `name` ASC');
          done();
        }
      });
    });

    it('should match a select query statement with order by and limit', function (done) {
      collection.fetch({
        data: {
          rank: { value: 2, op: '>' },
          orderBy: { rank: 'desc', name: 'asc' },
          limit: 2,
          offset: 3
        },
        success: function (collection, response, options) {
          expect(query.args[0][0]).to.eql('SELECT * FROM `users` WHERE `rank` > ? ORDER BY `rank` DESC, `name` ASC LIMIT 2 OFFSET 3');
          done();
        }
      });
    });

    it('should populate the collection', function (done) {
      collection.fetch({
        success: function (collection, response, options) {
          expect(collection).to.have.length(2);
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
      collection.fetch({
        error: function (model, err, options) {
          expect(err).to.be.an(Error);
          done();
        }
      });
    });

  });

});
