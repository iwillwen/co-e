var co = require('co');
var e = require('./');

function *A() {
  throw new Error('Something wrong');
}

function *B(msg) {
  return 'B:' + msg;
}

function *C(msg) {
  return msg + ':C';
}

// Normal
co(function *test() {
  var msg = 'Hello Co!';

  var a = yield e.defer(A()); //=> null
  var b = yield e(B(msg));    //=> 'B:Hello Co!'
  var c = yield e(C(b));      //=> 'B:Hello Co!:C'

  if (e.hasError()) { // Check the last time e.defer
    console.error(e.error().stack); //=> Error Full Stack
  }

  console.log('---------');
  console.log(c);
}).catch(function(err) {
  console.log(err.stack);
});

// Throw errors
co(function *anotherTest() {
  yield e(A()); //=> Throw
}).catch(function(err) {
  console.log(err.stack);
});

// With labels
co(function *withLabelsTest() {
  yield e.defer('deferred', A());

  if (e.hasError('deferred')) {
    console.error(e.error('deferred').stack);
  }

  yield e('not deferred', A());
}).catch(function(err) {
  console.log(err.stack);
});