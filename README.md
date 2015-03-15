## co-e ![NPM version](https://img.shields.io/npm/v/co-e.svg?style=flat) 

Better error stack and error controlling for co and koa

### Installation
```bash
$ npm install co-e
```

### Example
```js
var e = require('co-e');

// better error stack for debugging
try {
  var resp = yield e(somethingWillGoWrong());
  // Or
  var resp = yield e('should return something', somethingWillGoWrong());
} catch(err) {
  console.log(err.stack); //=> Better error stack
}

// defer without label
var a = yield e.defer(somethingWillGoWrong());
// Still running...
if (e.hasError()) { // Chech the last time e.defer
  console.log(e.error().stack);
}

// defer with labels
var foo = yield e.defer('foo', somethingWillGoWrong());
var bar = yield e.defer('bar', somethingWillGoWrong());

if (e.hasError('foo') && e.hasError('bar')) {
  // ...
}
```

### API

- e([label,] gen)
- e.defer([label,] gen)
- e.hasError([label])
- e.error([label])

Read more in [examples.js](https://github.com/iwillwen/co-e/blob/master/examples.js)

### Why `co-e`?

function `somethingWrong` will be called in `example.js`.

#### Before
```
Error: Something wrong
    at somethingWrong (/path/to/script/examples.js:5:9)
    at GeneratorFunctionPrototype.next (native)
    at onFulfilled (/path/to/script/node_modules/co/index.js:61:19)
    at /path/to/script/node_modules/co/index.js:50:5
    at co (/path/to/script/node_modules/co/index.js:49:10)
    at toPromise (/path/to/script/node_modules/co/index.js:114:63)
    at next (/path/to/script/node_modules/co/index.js:95:29)
    at onFulfilled (/path/to/script/node_modules/co/index.js:65:7)
    at /path/to/script/node_modules/co/index.js:50:5
    at co (/path/to/script/node_modules/co/index.js:49:10)
```

#### After
```
Error: Something wrong
    at somethingWrong (/path/to/script/examples.js:5:9)
    at /path/to/script/examples.js:61:9
    at GeneratorFunctionPrototype.next (native)
    at onFulfilled (/path/to/script/node_modules/co/index.js:61:19)
    at /path/to/script/node_modules/co/index.js:50:5
    at co (/path/to/script/node_modules/co/index.js:49:10)
    at Object.<anonymous> (/path/to/script/examples.js:60:1)
    at Module._compile (module.js:446:26)
    at Object.Module._extensions..js (module.js:464:10)
    at Module.load (module.js:341:32)
```

### Contributing
- Fork this repo
- Clone your repo
- Install dependencies
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Open a pull request, and enjoy <3

### MIT license
Copyright (c) 2015 iwillwen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---
![docor](https://raw.githubusercontent.com/turingou/docor/master/docor.png)
built upon love by [docor](https://github.com/turingou/docor.git) v0.2.0