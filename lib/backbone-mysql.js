/*
 * backbone-mysql
 * https://github.com/plus3network/backbone-mysql
 *
 * Copyright (c) 2012 Chris Cowan
 * Licensed under the MIT license.
 */

var util = require('util');
var Backbone = module.exports = require('backbone');
var _ = require('underscore');
var utils = {};

Backbone.tableMatch = /^\/([^\/]+)/;

utils.getTable = function (model) {
  var url = typeof(model.url) === 'function' && model.url() || model.url;
  var matches = url.match(Backbone.tableMatch);
  return matches[1];
};

var ORM = Backbone.ORM = { utils: {}, model: {}, collection: {} };

ORM.utils = utils;

ORM.model.create = function (model, options) {
  var client = Backbone.client;
  var data = model.toJSON();
  var values = [];
  var keys = _.chain(Object.keys(data))
    .filter(function (key) {
      return typeof(data[key]) !== 'object' && typeof(data[key]) !== 'function';
    })
    .map(function (key) {
      values.push(data[key]);
      return util.format('`%s`', key); 
    })
    .value();

  var placeholders = _.map(keys, function () {
    return '?';
  });

  var query = util.format(
    'INSERT INTO `%s` (%s) VALUES (%s)',
    utils.getTable(model),
    keys.join(','),
    placeholders.join(',')
  );

  client.query(query, values, function (err, results) {
    if (err && options.error) return options.error.call(model, model, err, options);
    data.id = client.insertId; 
    model.set(data);
    if (options.success) options.success.call(model, model, data, options);
  });
};

ORM.model.read = function (model, options) {
  var client = Backbone.client; 
  var query = util.format('SELECT * FROM `%s` WHERE `id` = ?', utils.getTable(model));
  client.query(query, [model.id], function (err, results) {
    if (err && options.error) return options.error.call(model, model, err, options);
    if (results.length === 0 && options.error) return options.error.call(model, model, new Error('Resource Not Found'), null, options);
    var data = results[0];
    model.set(data);
    if (options.success) options.success.call(null, model, data, options);
  });
};

ORM.model.update = function (model, options) {
  var client = Backbone.client;
  var data = model.toJSON();
  var values = [];
  var keys = _.chain(Object.keys(data))
    .filter(function (key) {
      return typeof(data[key]) !== 'object' && typeof(data[key]) !== 'function';
    })
    .filter(function (key) {
      return key !== 'id';
    })
    .map(function (key) {
      values.push(data[key]);
      return util.format('`%s` = ?', key); 
    })
    .value();

  values.push(model.id);

  var query = util.format(
    'UPDATE `%s` SET %s WHERE `id` = ?',
    utils.getTable(model),
    keys.join(',')
  );

  client.query(query, values, function (err, results) {
    if (err && options.error) return options.error.call(model, model, err, options);
    if (options.success) options.success.call(null, model, data, options);
  });

};

ORM.model['delete'] = function (model, options) {
  var client = Backbone.client;
  var query = util.format('DELETE FROM `%s` WHERE `id` = ?', utils.getTable(model));
  client.query(query, [model.id], function (err, info) {
    if (err && options.error) return options.error.call(null, model, err, options);
    if (options.success) options.success.call(null, model, model, info, options);
  });
};

ORM.collection.read = function (collection, options) {
  var client = Backbone.client;
  var values = [];
  var query = util.format('SELECT * FROM `%s`', utils.getTable(collection));

  if(options.data) {
    var data = _.omit(options.data, 'limit', 'orderBy', 'offset');
    var conditions = _.map(data, function (value, key, list) {
      var op = '=';
      if(typeof(value) === 'object' && value.value && value.op) {
        op = value.op;
        value = value.value;
      }
      values.push(value);
      return util.format('`%s` %s ?', key, op);
    });

    query += ' WHERE ' + conditions.join(' AND ');

    if (options.data.orderBy) {
      var orderStmts = _.map(options.data.orderBy, function (value, key, list) {
        return util.format('`%s` %s', key, value.toUpperCase()); 
      });
      query += ' ORDER BY ' + orderStmts.join(', '); 
    }

    if (options.data.limit) {
      query += util.format(' LIMIT %d', options.data.limit);

      if (options.data.offset) {
        query += util.format(' OFFSET %d', options.data.offset);
      }
    }
  }

  client.query(query, values, function (err, results) {
    if (err && options.error) return options.error.call(null, collection, err, options);
    if (options.success) options.success.call(null, results, true, options);
  });
};

Backbone.Model.prototype.sync = function (method, model, options) {
  ORM.model[method].call(null, model, options);  
};

Backbone.Collection.prototype.sync = function (method, collection, options) {
  ORM.collection[method].call(null, collection, options);
};
