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

var enabled = true;
var enabledDefer = true;

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

  if (!enabled) {
    return gen;
  }

  var hackErr = new Error('hack');
  hackErr.label = label;

  return function *() {
    try {
      return yield gen;
    } catch(err) {
      throw buildError(err, hackErr);
    }
  };
}

e.enable = function() {
  return enabled = true;
};

e.disable = function() {
  return enabled = false;
};

e.toggle = function() {
  return enabled = !enabled;
};

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
var records = {};
var lastRecordLabel = null;

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

  if (enabled) {
    var hackErr = new Error('hack');
    hackErr.label = label;
    lastLabel = label;
  }

  if (!enabledDefer) {
    return gen;
  }

  return function *() {
    try {
      return yield gen;
    } catch(err) {
      if (enabled) {
        var _err = buildError(err, hackErr);
        defers[label] = _err;
      } else {
        defers[label] = err;
      }

      if (lastRecordLabel) {
        records[lastRecordLabel][label] = defers[label];
      }
      return null;
    }
  };
};

e.defer.enable = function() {
  return enabledDefer = true;
};

e.defer.disable = function() {
  return enabledDefer = false;
};

e.defer.toggle = function() {
  return enabledDefer = !enabledDefer;
};

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

e.record = function(label) {
  label = label || Math.random().toString(32).substr(2);

  records[label] = {};
  lastRecordLabel = label;
};

e.stop = function(label, callback) {
  if (!callback) {
    callback = label;
    label = lastRecordLabel;
  }
  lastRecordLabel = null;

  return callback(records[label]);
};

module.exports = e;