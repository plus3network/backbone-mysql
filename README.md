# backbone-mysql

A sync module for Backbone.js and Node.js for use with MySQL

## Getting Started
Install the module with: `npm install backbone-mysql`

```javascript
var Backbone = require('backbone-mysql');
var mysql = require('mysql');
Backbone.client = mysql.createClient();

var MyModel = Backbone.Model.extend({
  urlRoot: '/users'
});

var example = new MyModel({ id: 1 });
example.fetch({
  success: function (model, response, options) {
    model.save({ name: 'Foo' }, {
      success: function (model, response, options) {
        // Do somthing awesome here.
      }
    });
  }
});
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).

## Release History
v0.1.0 Inital Development Release

## License
Copyright (c) 2012 Chris Cowan  
Licensed under the MIT license.
