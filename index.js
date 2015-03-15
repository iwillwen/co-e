/**!
 *
 * co-e - Better error stack and error controlling for co and koa
 *
 * iwillwen(willwengunn@gmail.com)
 *
 * @example
 *
 * // better error stack for debugging
 * try {
 *   var resp = yield e(somethingWillGoWrong());
 *   // Or
 *   var resp = yield e('should return something', somethingWillGoWrong());
 * } catch(err) {
 *   console.log(err.stack); //=> Better error stack
 * }
 *
 * // defer without label
 * var a = yield e.defer(somethingWillGoWrong());
 * // Still running...
 * if (e.hasError()) { // Chech the last time e.defer
 *   console.log(e.error().stack);
 * }
 *
 * // defer with labels
 * var foo = yield e.defer('foo', somethingWillGoWrong());
 * var bar = yield e.defer('bar', somethingWillGoWrong());
 *
 * if (e.hasError('foo') && e.hasError('bar')) {
 *   // ...
 * }
 */

var co = require('co');

/**
 * e
 * @param  {String} label the label of the async task
 * @required @param  {Any} gen   the object to yield
 * @return {Function}       trunked function
 */
function e(label, gen) {
  if (!gen) {
    gen = label;
    label = '';
  }
  var hackErr = new Error('hack');
  hackErr.label = label;

  return function(callback) {
    co(function *() {
      var res = yield gen;
      callback(null, res);
    }).catch(function(err) {
      callback(buildError(err, hackErr));
    });
  };
}

// Build the full error stack
function buildError(err, hackErr) {
  var stack1 = err.stack;
  var stack2 = hackErr.stack;
  var label = hackErr.label;

  var stack = [];

  stack1.split('\n').forEach(function(line, index, arr) {
    if (line.match(/^    at GeneratorFunctionPrototype.next/)) {
      stack = stack.concat(arr.slice(0, index));
      return;
    }
  });

  stack = stack.concat(stack2.split('\n').slice(2));
  if (!stack[0].match(/^Error:/)) {
    stack.unshift(err.message);
  }
  if (!!label) {
    stack.unshift('[DEBUG: ' + label + ']');
  }
  stack = stack.join('\n');

  var newError = new Error();
  newError.message = err.message;
  newError.stack = stack;

  return newError;
}

var defers = {};
var lastLabel = null;

/**
 * e.defer
 * @param  {String} label the label of the async task
 * @required @param  {Any} gen   the object to yield
 * @return {Function}       the trunked function
 */
e.defer = function(label, gen) {
  if (!gen) {
    gen = label;
    label = Math.random().toString(32).substr(2);
  }
  var hackErr = new Error('hack');
  hackErr.label = label;
  lastLabel = label;

  return function(callback) {
    co(function *() {
      var res = yield gen;
      callback(null, res);
    }).catch(function(err) {
      var err = buildError(err, hackErr);
      defers[label] = err;
      callback(null, null);
    });
  };
}

/**
 * e.hasError
 * @param  {String}  label the label of the async task
 * @return {Boolean}       The status of the async task
 */
e.hasError = function(label) {
  label = label || lastLabel;

  if (defers[label]) {
    return true;
  }

  return false;
};

/**
 * e.error
 * @param  {String} label the label of the async task
 * @return {Error}       error
 */
e.error = function(label) {
  label = label || lastLabel;

  return defers[label];
};

module.exports = e;