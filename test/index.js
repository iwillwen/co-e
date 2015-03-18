var e = require('../');

require('co-mocha');
var assert = require('assert');
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('e(gen)', function() {
  it('should return the correct value', function *() {
    var value = yield e(somethingRight());

    value.should.equal('Hello');
  });

  it('should throw an error', function *() {
    try {
      yield e(somethingWrong());
    } catch(err) {
      expect(err instanceof Error).to.be.true;
    }
  });
});

describe('e(label, gen)', function() {
  it('should return the correct value', function *() {
    var value = yield e('somethingRight', somethingRight());

    value.should.equal('Hello');
  });

  it('should throw an error', function *() {
    try {
      yield e('somethingWrong', somethingWrong());
    } catch(err) {
      expect(err instanceof Error).to.be.true;
    }
  });
});

describe('e.defer(gen)', function() {
  it('should return the correct value', function *() {
    var value = yield e.defer(somethingRight());

    value.should.equal('Hello');
  });

  it('should return null and defer the error', function *() {
    var value = yield e.defer(somethingWrong());

    expect(value).to.be.a('null');
  });

  it('should return the error that was deferred', function *() {
    var value = yield e.defer(somethingWrong());
    if (e.hasError()) {
      var err = e.error();
    }

    expect(value).to.be.a('null');
    expect(err instanceof Error).to.be.true;
  });
});

describe('e.defer(label, gen)', function() {
  it('should return the correct value', function *() {
    var value = yield e.defer('somethingRight', somethingRight());

    value.should.equal('Hello');
  });

  it('should return null and defer the error', function *() {
    var value = yield e.defer('somethingWrong', somethingWrong());

    expect(value).to.be.a('null');
  });

  it('should return the error that was deferred', function *() {
    var value = yield e.defer('somethingWrong', somethingWrong());
    if (e.hasError('somethingWrong')) {
      var err = e.error('somethingWrong');
    }

    expect(value).to.be.a('null');
    expect(err instanceof Error).to.be.true;
  });
});

function somethingRight() {
  return function(callback) {
    setTimeout(function() {
      callback(null, 'Hello');
    }, 100);
  }
}

function somethingWrong() {
  return function(callback) {
    throw new Error('Something Wrong');
  };
}