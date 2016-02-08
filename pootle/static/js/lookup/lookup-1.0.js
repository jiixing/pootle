var __commonjs_global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports, __commonjs_global), module.exports; }


var babelHelpers_typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

var babelHelpers_asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      step("next");
    });
  };
};

var babelHelpers_classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var babelHelpers_createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var babelHelpers_slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var babelHelpers_toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var isSymbol = __commonjs(function (module) {
	'use strict';

	module.exports = function (x) {
		return x && ((typeof x === 'undefined' ? 'undefined' : babelHelpers_typeof(x)) === 'symbol' || x['@@toStringTag'] === 'Symbol') || false;
	};
});

var require$$0$3 = isSymbol && (typeof isSymbol === 'undefined' ? 'undefined' : babelHelpers_typeof(isSymbol)) === 'object' && 'default' in isSymbol ? isSymbol['default'] : isSymbol;

var validateSymbol = __commonjs(function (module) {
	'use strict';

	var isSymbol = require$$0$3;

	module.exports = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};
});

var require$$0$2 = validateSymbol && (typeof validateSymbol === 'undefined' ? 'undefined' : babelHelpers_typeof(validateSymbol)) === 'object' && 'default' in validateSymbol ? validateSymbol['default'] : validateSymbol;

var shim$1 = __commonjs(function (module) {
	'use strict';

	var indexOf = String.prototype.indexOf;

	module.exports = function (searchString /*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};
});

var require$$0$7 = shim$1 && (typeof shim$1 === 'undefined' ? 'undefined' : babelHelpers_typeof(shim$1)) === 'object' && 'default' in shim$1 ? shim$1['default'] : shim$1;

var isImplemented$2 = __commonjs(function (module) {
	'use strict';

	var str = 'razdwatrzy';

	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return str.contains('dwa') === true && str.contains('foo') === false;
	};
});

var require$$1$6 = isImplemented$2 && (typeof isImplemented$2 === 'undefined' ? 'undefined' : babelHelpers_typeof(isImplemented$2)) === 'object' && 'default' in isImplemented$2 ? isImplemented$2['default'] : isImplemented$2;

var index$3 = __commonjs(function (module) {
	'use strict';

	module.exports = require$$1$6() ? String.prototype.contains : require$$0$7;
});

var require$$0$5 = index$3 && (typeof index$3 === 'undefined' ? 'undefined' : babelHelpers_typeof(index$3)) === 'object' && 'default' in index$3 ? index$3['default'] : index$3;

var isCallable = __commonjs(function (module) {
  // Deprecated

  'use strict';

  module.exports = function (obj) {
    return typeof obj === 'function';
  };
});

var require$$1$4 = isCallable && (typeof isCallable === 'undefined' ? 'undefined' : babelHelpers_typeof(isCallable)) === 'object' && 'default' in isCallable ? isCallable['default'] : isCallable;

var normalizeOptions = __commonjs(function (module) {
	'use strict';

	var forEach = Array.prototype.forEach,
	    create = Object.create;

	var process = function process(src, obj) {
		var key;
		for (key in src) {
			obj[key] = src[key];
		}
	};

	module.exports = function (options /*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};
});

var require$$2 = normalizeOptions && (typeof normalizeOptions === 'undefined' ? 'undefined' : babelHelpers_typeof(normalizeOptions)) === 'object' && 'default' in normalizeOptions ? normalizeOptions['default'] : normalizeOptions;

var validValue = __commonjs(function (module) {
	'use strict';

	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};
});

var require$$0$8 = validValue && (typeof validValue === 'undefined' ? 'undefined' : babelHelpers_typeof(validValue)) === 'object' && 'default' in validValue ? validValue['default'] : validValue;

var shim$2 = __commonjs(function (module) {
	'use strict';

	var keys = Object.keys;

	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};
});

var require$$0$9 = shim$2 && (typeof shim$2 === 'undefined' ? 'undefined' : babelHelpers_typeof(shim$2)) === 'object' && 'default' in shim$2 ? shim$2['default'] : shim$2;

var isImplemented$3 = __commonjs(function (module) {
	'use strict';

	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) {
			return false;
		}
	};
});

var require$$1$8 = isImplemented$3 && (typeof isImplemented$3 === 'undefined' ? 'undefined' : babelHelpers_typeof(isImplemented$3)) === 'object' && 'default' in isImplemented$3 ? isImplemented$3['default'] : isImplemented$3;

var index$4 = __commonjs(function (module) {
	'use strict';

	module.exports = require$$1$8() ? Object.keys : require$$0$9;
});

var require$$1$7 = index$4 && (typeof index$4 === 'undefined' ? 'undefined' : babelHelpers_typeof(index$4)) === 'object' && 'default' in index$4 ? index$4['default'] : index$4;

var shim = __commonjs(function (module) {
	'use strict';

	var keys = require$$1$7,
	    value = require$$0$8,
	    max = Math.max;

	module.exports = function (dest, src /*, …srcn*/) {
		var error,
		    i,
		    l = max(arguments.length, 2),
		    assign;
		dest = Object(value(dest));
		assign = function assign(key) {
			try {
				dest[key] = src[key];
			} catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};
});

var require$$0$6 = shim && (typeof shim === 'undefined' ? 'undefined' : babelHelpers_typeof(shim)) === 'object' && 'default' in shim ? shim['default'] : shim;

var isImplemented$1 = __commonjs(function (module) {
	'use strict';

	module.exports = function () {
		var assign = Object.assign,
		    obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return obj.foo + obj.bar + obj.trzy === 'razdwatrzy';
	};
});

var require$$1$5 = isImplemented$1 && (typeof isImplemented$1 === 'undefined' ? 'undefined' : babelHelpers_typeof(isImplemented$1)) === 'object' && 'default' in isImplemented$1 ? isImplemented$1['default'] : isImplemented$1;

var index$2 = __commonjs(function (module) {
	'use strict';

	module.exports = require$$1$5() ? Object.assign : require$$0$6;
});

var require$$3 = index$2 && (typeof index$2 === 'undefined' ? 'undefined' : babelHelpers_typeof(index$2)) === 'object' && 'default' in index$2 ? index$2['default'] : index$2;

var index$1 = __commonjs(function (module) {
	'use strict';

	var assign = require$$3,
	    normalizeOpts = require$$2,
	    isCallable = require$$1$4,
	    contains = require$$0$5,
	    d;

	d = module.exports = function (dscr, value /*, options*/) {
		var c, e, w, options, desc;
		if (arguments.length < 2 || typeof dscr !== 'string') {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}

		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

	d.gs = function (dscr, get, set /*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}

		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};
});

var require$$1$1 = index$1 && (typeof index$1 === 'undefined' ? 'undefined' : babelHelpers_typeof(index$1)) === 'object' && 'default' in index$1 ? index$1['default'] : index$1;

var polyfill = __commonjs(function (module) {
	'use strict';

	var d = require$$1$1,
	    validateSymbol = require$$0$2,
	    create = Object.create,
	    defineProperties = Object.defineProperties,
	    defineProperty = Object.defineProperty,
	    objPrototype = Object.prototype,
	    Symbol,
	    HiddenSymbol,
	    globalSymbols = create(null);

	var generateName = function () {
		var created = create(null);
		return function (desc) {
			var postfix = 0,
			    name;
			while (created[desc + (postfix || '')]) {
				++postfix;
			}desc += postfix || '';
			created[desc] = true;
			name = '@@' + desc;
			defineProperty(objPrototype, name, d.gs(null, function (value) {
				defineProperty(this, name, d(value));
			}));
			return name;
		};
	}();

	HiddenSymbol = function Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
		return Symbol(description);
	};
	module.exports = Symbol = function Symbol(description) {
		var symbol;
		if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
		symbol = create(HiddenSymbol.prototype);
		description = description === undefined ? '' : String(description);
		return defineProperties(symbol, {
			__description__: d('', description),
			__name__: d('', generateName(description))
		});
	};
	defineProperties(Symbol, {
		for: d(function (key) {
			if (globalSymbols[key]) return globalSymbols[key];
			return globalSymbols[key] = Symbol(String(key));
		}),
		keyFor: d(function (s) {
			var key;
			validateSymbol(s);
			for (key in globalSymbols) {
				if (globalSymbols[key] === s) return key;
			}
		}),
		hasInstance: d('', Symbol('hasInstance')),
		isConcatSpreadable: d('', Symbol('isConcatSpreadable')),
		iterator: d('', Symbol('iterator')),
		match: d('', Symbol('match')),
		replace: d('', Symbol('replace')),
		search: d('', Symbol('search')),
		species: d('', Symbol('species')),
		split: d('', Symbol('split')),
		toPrimitive: d('', Symbol('toPrimitive')),
		toStringTag: d('', Symbol('toStringTag')),
		unscopables: d('', Symbol('unscopables'))
	});
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(Symbol),
		toString: d('', function () {
			return this.__name__;
		})
	});

	defineProperties(Symbol.prototype, {
		toString: d(function () {
			return 'Symbol (' + validateSymbol(this).__description__ + ')';
		}),
		valueOf: d(function () {
			return validateSymbol(this);
		})
	});
	defineProperty(Symbol.prototype, Symbol.toPrimitive, d('', function () {
		return validateSymbol(this);
	}));
	defineProperty(Symbol.prototype, Symbol.toStringTag, d('c', 'Symbol'));

	defineProperty(HiddenSymbol.prototype, Symbol.toPrimitive, d('c', Symbol.prototype[Symbol.toPrimitive]));
	defineProperty(HiddenSymbol.prototype, Symbol.toStringTag, d('c', Symbol.prototype[Symbol.toStringTag]));
});

var require$$0$1 = polyfill && (typeof polyfill === 'undefined' ? 'undefined' : babelHelpers_typeof(polyfill)) === 'object' && 'default' in polyfill ? polyfill['default'] : polyfill;

var isImplemented = __commonjs(function (module) {
	'use strict';

	module.exports = function () {
		var symbol;
		if (typeof Symbol !== 'function') return false;
		symbol = Symbol('test symbol');
		try {
			String(symbol);
		} catch (e) {
			return false;
		}
		if (babelHelpers_typeof(Symbol.iterator) === 'symbol') return true;

		// Return 'true' for polyfills
		if (babelHelpers_typeof(Symbol.isConcatSpreadable) !== 'object') return false;
		if (babelHelpers_typeof(Symbol.iterator) !== 'object') return false;
		if (babelHelpers_typeof(Symbol.toPrimitive) !== 'object') return false;
		if (babelHelpers_typeof(Symbol.toStringTag) !== 'object') return false;
		if (babelHelpers_typeof(Symbol.unscopables) !== 'object') return false;

		return true;
	};
});

var require$$1 = isImplemented && (typeof isImplemented === 'undefined' ? 'undefined' : babelHelpers_typeof(isImplemented)) === 'object' && 'default' in isImplemented ? isImplemented['default'] : isImplemented;

var index = __commonjs(function (module) {
  'use strict';

  module.exports = require$$1() ? Symbol : require$$0$1;
});

var require$$0 = index && (typeof index === 'undefined' ? 'undefined' : babelHelpers_typeof(index)) === 'object' && 'default' in index ? index['default'] : index;

var asap = __commonjs(function (module) {
    // Use the fastest possible means to execute a task in a future turn
    // of the event loop.

    // linked list of tasks (single, with head node)
    var head = { task: void 0, next: null };
    var tail = head;
    var flushing = false;
    var requestFlush = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();
            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;
                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestFlush = function requestFlush() {
            process.nextTick(flush);
        };
    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestFlush = setImmediate.bind(window, flush);
        } else {
            requestFlush = function requestFlush() {
                setImmediate(flush);
            };
        }
    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        requestFlush = function requestFlush() {
            channel.port2.postMessage(0);
        };
    } else {
        // old browsers
        requestFlush = function requestFlush() {
            setTimeout(flush, 0);
        };
    }

    function asap(task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestFlush();
        }
    };

    module.exports = asap;
});

var require$$0$4 = asap && (typeof asap === "undefined" ? "undefined" : babelHelpers_typeof(asap)) === 'object' && 'default' in asap ? asap['default'] : asap;

var core = __commonjs(function (module) {
  'use strict';

  var asap = require$$0$4;

  module.exports = Promise;
  function Promise(fn) {
    if (babelHelpers_typeof(this) !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    var state = null;
    var value = null;
    var deferreds = [];
    var self = this;

    this.then = function (onFulfilled, onRejected) {
      return new self.constructor(function (resolve, reject) {
        handle(new Handler(onFulfilled, onRejected, resolve, reject));
      });
    };

    function handle(deferred) {
      if (state === null) {
        deferreds.push(deferred);
        return;
      }
      asap(function () {
        var cb = state ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
          (state ? deferred.resolve : deferred.reject)(value);
          return;
        }
        var ret;
        try {
          ret = cb(value);
        } catch (e) {
          deferred.reject(e);
          return;
        }
        deferred.resolve(ret);
      });
    }

    function resolve(newValue) {
      try {
        //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
        if (newValue && ((typeof newValue === 'undefined' ? 'undefined' : babelHelpers_typeof(newValue)) === 'object' || typeof newValue === 'function')) {
          var then = newValue.then;
          if (typeof then === 'function') {
            doResolve(then.bind(newValue), resolve, reject);
            return;
          }
        }
        state = true;
        value = newValue;
        finale();
      } catch (e) {
        reject(e);
      }
    }

    function reject(newValue) {
      state = false;
      value = newValue;
      finale();
    }

    function finale() {
      for (var i = 0, len = deferreds.length; i < len; i++) {
        handle(deferreds[i]);
      }deferreds = null;
    }

    doResolve(fn, resolve, reject);
  }

  function Handler(onFulfilled, onRejected, resolve, reject) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        onFulfilled(value);
      }, function (reason) {
        if (done) return;
        done = true;
        onRejected(reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      onRejected(ex);
    }
  }
});

var require$$1$3 = core && (typeof core === 'undefined' ? 'undefined' : babelHelpers_typeof(core)) === 'object' && 'default' in core ? core['default'] : core;

var es6Extensions = __commonjs(function (module) {
  'use strict';

  //This file contains the ES6 extensions to the core Promises/A+ API

  var Promise = require$$1$3;
  var asap = require$$0$4;

  module.exports = Promise;

  /* Static Functions */

  function ValuePromise(value) {
    this.then = function (onFulfilled) {
      if (typeof onFulfilled !== 'function') return this;
      return new Promise(function (resolve, reject) {
        asap(function () {
          try {
            resolve(onFulfilled(value));
          } catch (ex) {
            reject(ex);
          }
        });
      });
    };
  }
  ValuePromise.prototype = Promise.prototype;

  var TRUE = new ValuePromise(true);
  var FALSE = new ValuePromise(false);
  var NULL = new ValuePromise(null);
  var UNDEFINED = new ValuePromise(undefined);
  var ZERO = new ValuePromise(0);
  var EMPTYSTRING = new ValuePromise('');

  Promise.resolve = function (value) {
    if (value instanceof Promise) return value;

    if (value === null) return NULL;
    if (value === undefined) return UNDEFINED;
    if (value === true) return TRUE;
    if (value === false) return FALSE;
    if (value === 0) return ZERO;
    if (value === '') return EMPTYSTRING;

    if ((typeof value === 'undefined' ? 'undefined' : babelHelpers_typeof(value)) === 'object' || typeof value === 'function') {
      try {
        var then = value.then;
        if (typeof then === 'function') {
          return new Promise(then.bind(value));
        }
      } catch (ex) {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      }
    }

    return new ValuePromise(value);
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;
      function res(i, val) {
        try {
          if (val && ((typeof val === 'undefined' ? 'undefined' : babelHelpers_typeof(val)) === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }
      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      values.forEach(function (value) {
        Promise.resolve(value).then(resolve, reject);
      });
    });
  };

  /* Prototype Methods */

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };
});

var require$$1$2 = es6Extensions && (typeof es6Extensions === 'undefined' ? 'undefined' : babelHelpers_typeof(es6Extensions)) === 'object' && 'default' in es6Extensions ? es6Extensions['default'] : es6Extensions;

var runtime = __commonjs(function (module, exports, global) {
  var g = (typeof global === 'undefined' ? 'undefined' : babelHelpers_typeof(global)) === "object" ? global : (typeof window === 'undefined' ? 'undefined' : babelHelpers_typeof(window)) === "object" ? window : this;
  var Promise = g.Promise || require$$1$2;
  var Symbol = g.Symbol || require$$0;

  /**
   * Copyright (c) 2014, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
   * additional grant of patent rights can be found in the PATENTS file in
   * the same directory.
   */

  !function (global) {
    "use strict";

    var hasOwn = Object.prototype.hasOwnProperty;
    var undefined; // More compressible than void 0.
    var iteratorSymbol = typeof Symbol === "function" && Symbol.iterator || "@@iterator";

    var inModule = (typeof module === 'undefined' ? 'undefined' : babelHelpers_typeof(module)) === "object";
    var runtime = global.regeneratorRuntime;
    if (runtime) {
      if (inModule) {
        // If regeneratorRuntime is defined globally and we're in a module,
        // make the exports object identical to regeneratorRuntime.
        module.exports = runtime;
      }
      // Don't bother evaluating the rest of this file if the runtime was
      // already defined globally.
      return;
    }

    // Define the runtime globally (as expected by generated code) as either
    // module.exports (if we're in a module) or a new, empty object.
    runtime = global.regeneratorRuntime = inModule ? module.exports : {};

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided, then outerFn.prototype instanceof Generator.
      var generator = Object.create((outerFn || Generator).prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    runtime.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        prototype[method] = function (arg) {
          return this._invoke(method, arg);
        };
      });
    }

    runtime.isGeneratorFunction = function (genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor ? ctor === GeneratorFunction ||
      // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };

    runtime.mark = function (genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `value instanceof AwaitArgument` to determine if the yielded value is
    // meant to be awaited. Some may consider the name of this method too
    // cutesy, but they are curmudgeons.
    runtime.awrap = function (arg) {
      return new AwaitArgument(arg);
    };

    function AwaitArgument(arg) {
      this.arg = arg;
    }

    function AsyncIterator(generator) {
      // This invoke function is written in a style that assumes some
      // calling function (or Promise) will handle exceptions.
      function invoke(method, arg) {
        var result = generator[method](arg);
        var value = result.value;
        return value instanceof AwaitArgument ? Promise.resolve(value.arg).then(invokeNext, invokeThrow) : Promise.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          return result;
        });
      }

      if ((typeof process === 'undefined' ? 'undefined' : babelHelpers_typeof(process)) === "object" && process.domain) {
        invoke = process.domain.bind(invoke);
      }

      var invokeNext = invoke.bind(generator, "next");
      var invokeThrow = invoke.bind(generator, "throw");
      var invokeReturn = invoke.bind(generator, "return");
      var previousPromise;

      function enqueue(method, arg) {
        var enqueueResult =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(function () {
          return invoke(method, arg);
        }) : new Promise(function (resolve) {
          resolve(invoke(method, arg));
        });

        // Avoid propagating enqueueResult failures to Promises returned by
        // later invocations of the iterator.
        previousPromise = enqueueResult["catch"](function (ignored) {});

        return enqueueResult;
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    runtime.async = function (innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

      return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
              // A return or throw (when the delegate iterator has no throw
              // method) always terminates the yield* loop.
              context.delegate = null;

              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              var returnMethod = delegate.iterator["return"];
              if (returnMethod) {
                var record = tryCatch(returnMethod, delegate.iterator, arg);
                if (record.type === "throw") {
                  // If the return method threw an exception, let that
                  // exception prevail over the original return or throw.
                  method = "throw";
                  arg = record.arg;
                  continue;
                }
              }

              if (method === "return") {
                // Continue with the outer return, now that the delegate
                // iterator has been terminated.
                continue;
              }
            }

            var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

            if (record.type === "throw") {
              context.delegate = null;

              // Like returning generator.throw(uncaught), but without the
              // overhead of an extra function call.
              method = "throw";
              arg = record.arg;
              continue;
            }

            // Delegate generator ran and handled its own exceptions so
            // regardless of what the method was, we continue as if it is
            // "next" with an undefined arg.
            method = "next";
            arg = undefined;

            var info = record.arg;
            if (info.done) {
              context[delegate.resultName] = info.value;
              context.next = delegate.nextLoc;
            } else {
              state = GenStateSuspendedYield;
              return info;
            }

            context.delegate = null;
          }

          if (method === "next") {
            if (state === GenStateSuspendedYield) {
              context.sent = arg;
            } else {
              context.sent = undefined;
            }
          } else if (method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw arg;
            }

            if (context.dispatchException(arg)) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              method = "next";
              arg = undefined;
            }
          } else if (method === "return") {
            context.abrupt("return", arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

            var info = {
              value: record.arg,
              done: context.done
            };

            if (record.arg === ContinueSentinel) {
              if (context.delegate && method === "next") {
                // Deliberately forget the last sent value so that we don't
                // accidentally pass it on to the delegate.
                arg = undefined;
              }
            } else {
              return info;
            }
          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(arg) call above.
            method = "throw";
            arg = record.arg;
          }
        }
      };
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[iteratorSymbol] = function () {
      return this;
    };

    Gp.toString = function () {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    runtime.keys = function (object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1,
              next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    runtime.values = values;

    function doneResult() {
      return { value: undefined, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function reset(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        this.sent = undefined;
        this.done = false;
        this.delegate = null;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
              this[name] = undefined;
            }
          }
        }
      },

      stop: function stop() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function dispatchException(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;
          return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function abrupt(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.next = finallyEntry.finallyLoc;
        } else {
          this.complete(record);
        }

        return ContinueSentinel;
      },

      complete: function complete(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" || record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = record.arg;
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }
      },

      finish: function finish(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function _catch(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function delegateYield(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        return ContinueSentinel;
      }
    };
  }(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  (typeof global === 'undefined' ? 'undefined' : babelHelpers_typeof(global)) === "object" ? global : (typeof window === 'undefined' ? 'undefined' : babelHelpers_typeof(window)) === "object" ? window : (typeof self === 'undefined' ? 'undefined' : babelHelpers_typeof(self)) === "object" ? self : this);
});

runtime && (typeof runtime === 'undefined' ? 'undefined' : babelHelpers_typeof(runtime)) === 'object' && 'default' in runtime ? runtime['default'] : runtime;

function getEmPixelSize(node) {
  return new Number(getComputedStyle(node, "").fontSize.match(/(\d*(\.\d*)?)px/)[1]);
}

var popups = new Set();
popupToElement = new Map();

var Popup = function () {
  // parent can be an element or Popup instance
  // location can be an offset or element

  function Popup(_ref) {
    var _this = this;

    var absoluteLocation = _ref.absoluteLocation;
    var parent = _ref.parent;
    var content = _ref.content;
    var protect = _ref.protect;
    var popupClassName = _ref.popupClassName;
    babelHelpers_classCallCheck(this, Popup);

    this.absoluteLocation = absoluteLocation;
    this.isAbsolute = false;
    this.markupTarget = $('main, body').first();
    this.entered = false;
    this.isPopupHover = false;
    this.protect = protect;
    this.parentPopup = null;
    this.childrenPopups = [];
    this.popupClassName = popupClassName || Popup.getDefaultClassName();
    this.mustDie = false;

    if (parent) {
      if (parent instanceof Popup) {
        this.parentPopup = parent;
        parent.childrenPopups.push(this);
      } else if (parent.nodeType == 1) {
        this.parentElement = parent;
      }
    }

    popups.add(this);
    if (this.parentElement) {
      popupToElement.set(this, this.parentElement);
      $(this.parentElement).addClass('.' + this.popupClassName + '-parent');
    }

    this.element = $('<div/>').addClass(this.popupClassName).append(content);

    this.align();

    this.element.mouseenter(function (event) {
      _this.isPopupHover = true;
    });

    this.element.mouseenter(function (event) {
      _this.entered = true;
      _this.isPopupHover = true;
      if (!_this.mustDie) {
        _this.element.stop().fadeIn(0);
      }
    });
    this.element.mouseleave(function (event) {
      _this.isPopupHover = false;
    });

    setTimeout(function () {
      _this.removeIfNeeded();
      _this.element.mouseleave(function () {
        return _this.removeIfNeeded();
      });
    }, 1500);

    return this;
  }

  babelHelpers_createClass(Popup, [{
    key: 'remove',
    value: function remove(fadeTime) {
      var _this2 = this;

      if (fadeTime === undefined) {
        fadeTime = 50;
      }
      this.element.fadeOut(fadeTime, function () {
        return _this2.removeNow();
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.childrenPopups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          child = _step.value;

          child.remove(fadeTime);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'removeNow',
    value: function removeNow() {
      popups.delete(this);
      $(this.parentElement).removeClass('.' + this.popupClassName + '-parent');
      this.element.remove();
      var element = popupToElement[this];
      popupToElement.delete(this);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.childrenPopups[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          child = _step2.value;

          child.removeNow();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'isHover',
    value: function isHover() {
      if (this.isPopupHover) {
        return true;
      }
      if (this.parentElement) {
        if ($(this.parentElement).is(':hover')) {
          return true;
        }
      }
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.childrenPopups[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          childPopup = _step3.value;

          if (childPopup.isHover()) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: 'removeIfNeeded',
    value: function removeIfNeeded() {
      var _this3 = this;

      if (this.isHover() || !this.entered) {
        return;
      }
      if (this.protect) return;
      var node = this.element,
          visited = [];

      while (node) {
        if ($(node).is(':hover')) {
          setTimeout(function () {
            return _this3.removeIfNeeded();
          }, 300);
          return;
        }
        node = $(node).data('parent');
        if (visited.indexOf(node) != -1) break;
        visited.push(node);
      }
      this.remove();
      self.isPopupHover = false;
    }
  }, {
    key: 'align',
    value: function align() {
      var offset = null,
          element = this.element,
          location = $(document.body);

      element.removeAttr('style');
      if (this.absoluteLocation) {
        offset = this.absoluteLocation;
        offset.left = offset.left || 0;
        offset.top = offset.top || 0;
        location = document.body;
        isAbsolute = true;
      } else if (this.parentElement) {
        $(this.parentElement).css({ display: 'inline-block' });
        var popupAnchor = $('<span style="display: inline-block; position: relative; margin-top: -1em"></span>').prependTo(this.parentElement);
        offset = popupAnchor.offset();
        var em = getEmPixelSize(popupAnchor[0]);
        offset.top -= 1.0 * em;
        popupAnchor.remove();
        $(this.parentElement).css({ display: '' });
      }

      //We need to measure the doc width now.
      var docWidth = $(document).width();
      // We need to create a dupe to measure it.
      var dupe = this.element.clone();

      this.markupTarget.append(dupe);
      var popupWidth = dupe.innerWidth(),
          popupHeight = dupe.innerHeight();
      dupe.remove();
      //The reason for the duplicity is because if you realize the
      //actual popup and measure that, then any transition effects
      //cause it to zip from it's original position...
      if (!this.absoluteLocation) {
        offset.top += location.innerHeight() - popupHeight - location.outerHeight();
        offset.left -= popupWidth / 2;
      }

      if (offset.left < 1) {
        offset.left = 1;
        element.innerWidth(popupWidth + 5);
      }

      if (offset.left + popupWidth + 5 > docWidth) {
        offset.left = docWidth - (popupWidth + 5);
      }
      element.offset(offset);
      this.markupTarget.append(element);
      if (offset.top < 0) {
        element.height(element.height() + offset.top);
        offset.top = 0;
        element.css({ 'overflow-x': 'initial',
          'overflow-y': 'scroll' });
      }
      element.offset(offset);
    }
  }], [{
    key: 'removeAll',
    value: function removeAll() {
      var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var removeProtected = _ref2.removeProtected;
      var exclude = _ref2.exclude;
      var time = _ref2.time;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = popups[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var popup = _step4.value;

          if (popup != exclude && removeProtected || !popup.protect) {
            popup.mustDie = true;
            if (time == 0) {
              popup.removeNow();
            } else {
              popup.remove(time);
            }
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: 'removeAllNow',
    value: function removeAllNow() {
      var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var removeProtected = _ref3.removeProtected;

      var time = 0;
      Popup.removeAll({ removeProtected: removeProtected, time: time });
    }
  }, {
    key: 'isAnyHover',
    value: function isAnyHover() {
      return $('.' + this.popupClassName() + ':hover').length > 0;
    }
  }, {
    key: 'hasPopup',
    value: function hasPopup(element) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = popupToElement.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          element = _step5.value;

          if (element == element) return true;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return false;
    }
  }, {
    key: 'getPopup',
    value: function getPopup(element) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = popupToElement.entries()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var _step6$value = babelHelpers_slicedToArray(_step6.value, 2);

          popup = _step6$value[0];
          element = _step6$value[1];

          if (element == element) return popup;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return null;
    }
  }, {
    key: 'getDefaultClassName',
    value: function getDefaultClassName() {
      return 'text-popup';
    }
  }]);
  return Popup;
}();

// suffix, keep count, min word length, replacement
var endings = [["ati", 0, "a"], ["āti", 0, "ā"], ["eti", 0, "e"], ["oti", 0, "o"], ["o", 0, "a"], ["ā", 0, "a"], ["aṃ", 0, "a"], ["ṃ", 0, ""], ["e", 0, "a"], ["ena", 0, "a"], ["ehi", 0, "a"], ["ebhi", 0, "a"], ["āya", 0, "a"], ["ssa", 0, ""], ["ānaṃ", 0, "a"], ["smā", 0, ""], ["mhā", 0, ""], ["smiṃ", 0, ""], ["mhi", 1, ""], ["esu", 0, "a"], ["ayo", 1, "i"], ["inā", 1, "i"], ["īhi", 1, "ī"], ["hi", 2, ""], ["ībhi", 1, "ī"], ["bhi", 1, ""], ["ino", 1, "i"], ["īnaṃ", 1, "ī"], ["īsu", 1, "ī"], ["i", 2, "ī"], ["inaṃ", 0, "i"], ["avo", 1, "u"], ["ave", 1, "u"], ["unā", 1, "u"], ["ūhi", 1, "ū"], ["ūbhi", 1, "ū"], ["uno", 1, "u"], ["ūnaṃ", 1, "ū"], ["ūsu", 1, "ū"], ["ū", 2, "u"], ["āni", 2, "a"], ["īni", 2, "ī"], ["ūni", 2, "ū"], ["a", 2, "ā"], ["āyo", 0, "a"], ["āhi", 0, "a"], ["ābhi", 0, "a"], ["āyaṃ", 0, "a"], ["āsu", 0, "a"], ["iyo", 0, "i"], ["iyā", 0, "i"], ["iyaṃ", 0, "i"], ["iyā", 0, "ī"], ["iyaṃ", 0, "ī"], ["iyaṃ", 0, "i"], ["āya", 0, "ī"], ["ī", 0, "a"], ["inī", 0, "a"], ["uyo", 0, "u"], ["uyā", 0, "u"], ["uyaṃ", 0, "u"], ["ā", 0, "ant"], ["a", 3, "ant"], ["ataṃ", 3, "ant"], ["antaṃ", 3, "ant"], ["anto", 3, "ant"], ["antā", 3, "ant"], ["ante", 3, "ant"], ["atā", 3, "ant"], ["antehi", 3, "ant"], ["ato", 3, "ant"], ["antānaṃ", 3, "ant"], ["ati", 3, "ant"], ["antesu", 3, "ant"], ["ā", 3, "anta"], ["a", 3, "anta"], ["ataṃ", 3, "anta"], ["ataṃ", 3, "ati"], ["antaṃ", 3, "anta"], ["anto", 3, "anta"], ["antā", 3, "anta"], ["ante", 3, "anta"], ["atā", 3, "anta"], ["antehi", 3, "anta"], ["ato", 3, "anta"], ["antānaṃ", 3, "anta"], ["ati", 3, "anta"], ["antesu", 3, "anta"], ["ā", 2, "ar"], ["āraṃ", 2, "ar"], ["ārā", 2, "ar"], ["u", 2, "ar"], ["uno", 2, "ar"], ["ari", 2, "ar"], ["āro", 2, "ar"], ["ūhi", 2, "ar"], ["ūbhi", 2, "ar"], ["ūnaṃ", 2, "ar"], ["ārānaṃ", 2, "ar"], ["ūsu", 2, "ar"], ["ā", 2, "ar"], ["a", 2, "ar"], ["araṃ", 2, "ar"], ["arā", 2, "ar"], ["aro", 2, "ar"], ["unā", 2, "ar"], ["arehi", 2, "ar"], ["arebhi", 2, "ar"], ["ānaṃ", 2, "ar"], ["arānaṃ", 2, "ar"], ["unnaṃ", 2, "ar"], ["ito", 2, "ar"], ["uyā", 2, "ar"], ["yā", 2, "ar"], ["yaṃ", 2, "ar"], ["uyaṃ", 2, "ar"], ["aṃ", 0, "ā"], ["āya", 0, "ā"], ["asā", 0, "o"], ["aso", 0, "o"], ["asi", 0, "o"], ["ā", 0, "o"], ["aṃ", 0, "o"], ["e", 0, "o"], ["ena", 0, "o"], ["ehi", 0, "o"], ["ebhi", 0, "o"], ["āya", 0, "o"], ["assa", 0, "o"], ["ānaṃ", 0, "o"], ["asmā", 0, "o"], ["amhā", 0, "o"], ["asmiṃ", 0, "o"], ["amhi", 0, "o"], ["esu", 0, "o"], ["ato", 2, "ati"], ["atā", 2, "ati"], ["ato", 2, "āti"], ["atā", 2, "āti"], ["eto", 2, "eti"], ["etā", 2, "eti"], ["oto", 2, "oti"], ["otā", 2, "oti"], ["ahi", 1, "a"], ["to", 2, ""], ["annaṃ", 1, "a"], ["unnaṃ", 1, "u"], ["innaṃ", 1, "i"], ["atā", 1, "ati"], ["iya", 2, "a"], ["uyaṃ", 0, ""], ["anti", 0, "ati"], ["si", 3, "ti"], ["asi", 0, "ati"], ["atha", 0, "āti"], ["āmi", 0, "ati"], ["āma", 0, "ati"], ["āmi", 0, "āti"], ["āma", 0, "āti"], ["onti", 0, "oti"], ["osi", 0, "oti"], ["otha", 0, "oti"], ["omi", 0, "oti"], ["oma", 0, "oti"], ["enti", 0, "eti"], ["esi", 0, "eti"], ["etha", 0, "eti"], ["emi", 0, "eti"], ["ema", 0, "eti"], ["hi", 3, "ti"], ["atu", 2, "ati"], ["antu", 1, "ati"], ["ohi", 0, "oti"], ["otu", 0, "oti"], ["ontu", 0, "oti"], ["etu", 0, "eti"], ["entu", 0, "eti"], ["ehi", 0, "eti"], ["eti", 2, "ati"], ["enti", 2, "ati"], ["esi", 2, "ati"], ["etha", 2, "ati"], ["emi", 2, "ati"], ["ema", 2, "ati"], ["eti", 2, "āti"], ["enti", 2, "āti"], ["esi", 2, "āti"], ["etha", 2, "āti"], ["emi", 2, "āti"], ["ema", 2, "āti"], ["entu", 2, "ati"], ["ayitvā", 2, "eti"], ["ayitvāna", 2, "eti"], ["vāna", 2, "i"], ["āpetvā", 0, "ati"], ["itvāna", 0, "ati"], ["itvāna", 0, "āti"], ["itvāna", 0, "eti"], ["etvāna", 0, "ati"], ["tvāna", 0, "ti"], ["itvā", 0, "ati"], ["itvā", 0, "āti"], ["itvā", 0, "eti"], ["etvā", 0, "ati"], ["tvā", 0, "ti"], ["āya", 0, "ati"], ["āya", 0, "ati"], ["āya", 0, "āti"], ["āya", 0, "eti"], ["tuṃ", 0, "ti"], ["ituṃ", 0, "ati"], ["ituṃ", 0, "āti"], ["a", 3, "ati"], ["i", 3, "ati"], ["imha", 0, "ati"], ["imhā", 0, "ati"], ["iṃsu", 1, "ati"], ["ittha", 0, "ati"], ["uṃ", 0, "ati"], ["suṃ", 0, "ti"], ["siṃ", 0, "ti"], ["iṃ", 0, "ati"], ["a", 3, "āti"], ["i", 3, "āti"], ["imha", 0, "āti"], ["imhā", 0, "āti"], ["iṃsu", 1, "āti"], ["ittha", 0, "āti"], ["uṃ", 0, "āti"], ["iṃ", 0, "āti"], ["a", 3, "eti"], ["i", 3, "eti"], ["imha", 0, "eti"], ["imhā", 0, "eti"], ["iṃsu", 1, "eti"], ["ayiṃsu", 1, "eti"], ["ittha", 0, "eti"], ["uṃ", 0, "eti"], ["iṃ", 0, "eti"], ["iyaṃ", 0, "eti"], ["eyya", 0, "ati"], ["eyyaṃ", 0, "ati"], ["eyyuṃ", 0, "ati"], ["eyyati", 0, "ati"], ["eyyasi", 0, "ati"], ["eyyātha", 0, "ati"], ["eyyāmi", 0, "ati"], ["eyyāsi", 0, "ati"], ["eyyāma", 0, "ati"], ["eyyanti", 0, "ati"], ["eyya", 0, "āti"], ["eyyaṃ", 0, "āti"], ["eyyuṃ", 0, "āti"], ["eyyati", 0, "āti"], ["eyyasi", 0, "āti"], ["eyyātha", 0, "āti"], ["eyyāmi", 0, "āti"], ["eyyāsi", 0, "āti"], ["eyyāma", 0, "āti"], ["eyyanti", 0, "āti"], ["eyya", 0, "eti"], ["eyyaṃ", 0, "eti"], ["eyyuṃ", 0, "eti"], ["eyyati", 0, "eti"], ["eyyasi", 0, "eti"], ["eyyātha", 0, "eti"], ["eyyāmi", 0, "eti"], ["eyyāsi", 0, "eti"], ["eyyāma", 0, "eti"], ["eyyanti", 0, "eti"], ["eyya", 0, "oti"], ["eyyaṃ", 0, "oti"], ["eyyuṃ", 0, "oti"], ["eyyati", 0, "oti"], ["eyyasi", 0, "oti"], ["eyyātha", 0, "oti"], ["eyyāmi", 0, "oti"], ["eyyāsi", 0, "oti"], ["eyyāma", 0, "oti"], ["eyyanti", 0, "oti"], ["issa", 2, "ati"], ["issā", 2, "ati"], ["issaṃsu", 2, "ati"], ["issatha", 2, "ati"], ["issaṃ", 2, "ati"], ["issāmi", 2, "ati"], ["issati", 3, "ati"], ["issāma", 2, "ati"], ["issa", 2, "āti"], ["issā", 2, "āti"], ["issaṃsu", 2, "āti"], ["issa", 2, "āti"], ["issatha", 2, "āti"], ["issaṃ", 2, "āti"], ["issāma", 2, "āti"], ["essa", 2, "eti"], ["essā", 2, "eti"], ["essaṃsu", 2, "eti"], ["essa", 2, "eti"], ["essatha", 2, "eti"], ["essaṃ", 2, "eti"], ["essāma", 2, "eti"], ["issanti", 3, "ati"]];

function conjugate(word) {
  var results = new Set([word]);
  if (word.length > 3) {
    results.add(word.slice(0, -1));
  }
  for (var pass = 0; pass < 2; pass++) {
    if (pass == 1) {
      if (word.slice(-1) == 'ṃ') {
        word = word.slice(0, -1);
      } else {
        break;
      }
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = endings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = babelHelpers_slicedToArray(_step.value, 3);

        var suffix = _step$value[0];
        var min_length = _step$value[1];
        var new_suffix = _step$value[2];

        if (word.length > min_length && word.slice(-suffix.length) == suffix) {
          var new_word = word.slice(0, -suffix.length) + new_suffix;
          if (new_word.length >= 2) {
            results.add(new_word);
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  return [].concat(babelHelpers_toConsumableArray(results));
}

var charRex = /(?:[aiueoāīū]|br|[kgcjtṭdḍbp]h|[kgcjtṭdḍp](?!h)|[mnyrlvshṅṇṃṃñḷ]|b(?![rh]))/ig;

function sanitizeTerm(term) {
  return term.replace(/n[”’]+ti$/, 'ṃ').replace(/[”’]+.*$/, '');
}

var callbacks = new Map();
var next_msg_id = 1;
var listeners = new Map();

function handleMessage(event) {
  "use strict";

  var result = event.data.result;
  var msg_id = event.data.id;
  var worker = event.target;

  if (msg_id === undefined) {
    return true;
  }

  if (callbacks[msg_id]) {
    callbacks[msg_id][0](result);
    callbacks.delete(msg_id);
    event.stopImmediatePropagation();
  }
}

function postMessageToWorker(worker, msg) {
  if (!(worker instanceof Worker)) {
    throw new TypeError('First parameter should be a Worker');
  }
  var msg_id = next_msg_id++;
  if (!(worker in listeners)) {
    listeners[worker] = worker.addEventListener('message', handleMessage);
  }
  worker.postMessage({ id: msg_id, source: msg });
  return new Promise(function (resolve, reject) {
    callbacks[msg_id] = [resolve, reject];
  });
}

function isString(thing) {
  return typeof thing == 'string' || thing instanceof String;
}

var LookupWorker = function () {
  function LookupWorker(src) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    babelHelpers_classCallCheck(this, LookupWorker);

    if (options.timings) {
      this.timings = true;
    }
    this.worker = new Worker(src);
  }

  babelHelpers_createClass(LookupWorker, [{
    key: 'setMessageHandler',
    value: function setMessageHandler(handler) {
      return this.worker.addEventListener('message', handler);
    }
  }, {
    key: 'postMessage',
    value: function postMessage(message) {
      var req = postMessageToWorker(this.worker, message);
      if (this.timings) {
        (function () {
          var msgstr = JSON.stringify(message);
          console.time(msgstr);
          req.then(function () {
            return console.timeEnd(msgstr);
          });
        })();
      }
      return req;
    }
  }, {
    key: 'init',
    value: function init(_ref) {
      var fromLang = _ref.fromLang;
      var toLang = _ref.toLang;
      var dataFile = _ref.dataFile;
      var glossaryFile = _ref.glossaryFile;
      var dbname = _ref.dbname;

      if (!dbname) {
        dbname = fromLang + '2' + toLang + 'Lookup';
      }
      if (!dataFile) {
        dataFile = '/json/' + fromLang + '2' + toLang + '-entries.json';
      }
      if (!glossaryFile) {
        glossaryFile = '/json/' + fromLang + '2' + toLang + '-glossary.json';
      }
      this.ready = this.postMessage({ init: { fromLang: fromLang, toLang: toLang, dataFile: dataFile, glossaryFile: glossaryFile, dbname: dbname } });
      return this.ready;
    }
  }, {
    key: 'store',
    value: function store(_ref2) {
      var key = _ref2.key;
      var value = _ref2.value;

      if (!key) {
        throw new TypeError('Message to be stored must define key');
      }
      //console.log('storing', {key, value})
      return this.postMessage({ store: { key: key, value: value } });
    }
  }, {
    key: 'retrieve',
    value: function retrieve(key) {
      if (key.key) key = key.key;
      if (!key) {
        throw new TypeError('key must be defined and not falsely');
      }

      return this.postMessage({ retrieve: { key: key } });
    }
  }, {
    key: 'getEntry',
    value: function getEntry(_ref3) {
      var term = _ref3.term;

      if (!term || !isString(term)) {
        throw new TypeError('term must be defined and be a string');
      }
      return this.postMessage({ getEntry: { term: term } });
    }
  }, {
    key: 'rank',
    value: function rank(query) {
      var term = query.term;
      var terms = query.terms;
      var conjugated = query.conjugated;

      if (!term && (!terms || terms.length == 0)) {
        throw new TypeError('either term or terms must be defined');
      }
      return this.postMessage({ rank: query });
    }
  }, {
    key: 'addGlossaryEntry',
    value: function addGlossaryEntry(entry) {
      return this.postMessage({ addGlossaryEntry: entry });
    }
  }, {
    key: 'getGlossaryEntries',
    value: function getGlossaryEntries(_ref4) {
      var term = _ref4.term;
      var terms = _ref4.terms;
      var exact = _ref4.exact;

      if (!term && (!terms || terms.length == 0)) {
        throw new TypeError('either term or terms must be defined');
      }
      if (term !== undefined && !isString(term)) {
        throw new TypeError('term must be a string');
      }
      if (terms !== undefined && !(terms instanceof Array)) {
        throw new TypeError('terms must be an array');
      }
      return this.postMessage({ getGlossaryEntries: { term: term, terms: terms, exact: exact } });
    }
  }, {
    key: 'getAllGlossaryEntries',
    value: function getAllGlossaryEntries(_ref5) {
      var origin = _ref5.origin;

      return this.postMessage({ getAllGlossaryEntries: { origin: origin } });
    }
  }]);
  return LookupWorker;
}();

// Returns a flattened array of descendent textNodes
// optionally filtered by *filter*, which should return
// true to include an element.
function textNodes(elements, filter) {
    var result = [];
    function iterNodes(node) {
        if (filter && $.proxy(filter, node)(node) == false) return;

        if (node.nodeType == 3) {
            result.push(node);
        } else {
            var _arr = [].concat(babelHelpers_toConsumableArray(node.childNodes));

            for (var _i = 0; _i < _arr.length; _i++) {
                child = _arr[_i];

                iterNodes(child);
            }
        }
    }

    var _arr2 = [].concat(babelHelpers_toConsumableArray(elements));

    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
        node = _arr2[_i2];

        iterNodes(node);
    }

    return result;
};

var defaultSources = {
  cped: {
    'brief': 'CPD',
    'name': 'Concise Pali English Dictionary'
  },
  pts_ped: {
    'brief': 'PTS',
    'name': 'PTS Pali English Dictionary'
  },
  dhammika_ff: {
    'brief': 'N&E',
    'name': "Nature and the Environment in Early Buddhism by S. Dhammika"
  },
  sc_dppn: {
    'brief': 'PPN',
    'name': 'Pali Proper Names'
  }
};

var LookupUtility = function () {
  function LookupUtility(_ref) {
    var _this = this;

    var selectorClass = _ref.selectorClass;
    var main = _ref.main;
    var popupClass = _ref.popupClass;
    var lookupWorkerSrc = _ref.lookupWorkerSrc;
    var sources = _ref.sources;
    var fromLang = _ref.fromLang;
    var toLang = _ref.toLang;
    var dataFile = _ref.dataFile;
    var glossaryFile = _ref.glossaryFile;
    babelHelpers_classCallCheck(this, LookupUtility);

    this.popups = [];
    this.popupClass = popupClass || Popup;

    this.selectorClass = selectorClass;
    this.main = $(main || this.getDefaultMain());
    this.lookupWorkerSrc = lookupWorkerSrc || 'lookup-worker.js';

    this.fromLang = fromLang;
    this.toLang = toLang;

    this.sources = sources || defaultSources;
    this.markupGenerator = new MarkupGenerator({ selectorClass: selectorClass });
    this.addHandlers({ selectorClass: selectorClass, main: main });
    this.ready = this.initWorker({ fromLang: fromLang, toLang: toLang, dataFile: dataFile, glossaryFile: glossaryFile }).then(function () {
      _this.glossary = new Glossary({ lookupUtility: _this });
      _this.termBreakCache = new TermBreakCache({ lookupWorker: _this.lookupWorker });
      _this.termBreakCache.loadFromServer();

      _this.enabled = true;
    });
  }

  babelHelpers_createClass(LookupUtility, [{
    key: 'makeLoadingPopup',
    value: function makeLoadingPopup() {
      this.loadingPopup = new LoadingPopup({ lookupUtility: this });
      return this.loadingPopup;
    }
  }, {
    key: 'progressHandler',
    value: function progressHandler(event) {
      if (event.data.progress) {
        //console.log('Progress: ' + event.data.progress);
      }
    }
  }, {
    key: 'initWorker',
    value: function () {
      var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref2) {
        var fromLang = _ref2.fromLang;
        var toLang = _ref2.toLang;
        var dataFile = _ref2.dataFile;
        var glossaryFile = _ref2.glossaryFile;
        var lookupWorker;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                lookupWorker = this.lookupWorker = new LookupWorker(this.lookupWorkerSrc);
                return _context.abrupt('return', lookupWorker.init({ fromLang: fromLang, toLang: toLang, dataFile: dataFile, glossaryFile: glossaryFile }));

              case 2:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
      return function initWorker(_x) {
        return ref.apply(this, arguments);
      };
    }()
  }, {
    key: 'mouseoverHandler',
    value: function mouseoverHandler(event) {
      var _this2 = this;

      if (!this.enabled) return;
      var target = $(event.target);
      ////console.log('mouseover', target);
      setTimeout(function () {
        if (target.is(':hover')) {
          Popup.removeAll({ removeProtected: true });
          _this2.lookup({ node: event.target, includeGlossary: true, useTermBreak: true });
        }
      }, 50);
    }
  }, {
    key: 'clickHandler',
    value: function clickHandler(event) {
      if (!this.enabled) return;
      Popup.removeAll();
      this.decomposeMode(event.target);
    }
  }, {
    key: 'getDefaultMain',
    value: function getDefaultMain() {
      return $('main, body').first();
    }
  }, {
    key: 'addHandlers',
    value: function addHandlers(_ref3) {
      var _this3 = this;

      var selectorClass = _ref3.selectorClass;

      this.main.on('click.lookup', '.' + selectorClass, function (e) {
        return _this3.clickHandler(e);
      });
      this.main.on('mouseover.lookup', '.' + selectorClass, function (e) {
        return _this3.mouseoverHandler(e);
      });
    }
  }, {
    key: 'removeHandlers',
    value: function removeHandlers(_ref4) {
      var main = _ref4.main;

      if (main === undefined) {
        main = this.getDefaultMain();
      }
      $(main).off('.lookup');
      Popup.removeAll();
    }
  }, {
    key: 'getTerm',
    value: function getTerm(node) {
      var term = node.childNodes[0].nodeValue;
      if (!term || term.match(/^\s+$/)) return null;
      return term.toLowerCase();
    }
  }, {
    key: 'lookup',
    value: function () {
      var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee2(_ref5) {
        var _this4 = this;

        var node = _ref5.node;
        var term = _ref5.term;
        var indeclinables = _ref5.indeclinables;
        var parent = _ref5.parent;
        var absoluteLocation = _ref5.absoluteLocation;
        var useTermBreak = _ref5.useTermBreak;
        var includeGlossary = _ref5.includeGlossary;
        var excludeFuzzy = _ref5.excludeFuzzy;
        var preFn = _ref5.preFn;
        var terms, termBreak, results, contentHtml, content, popup;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!($(node).hasClass('lookup-in-progress') && !indeclinables)) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt('return', null);

              case 2:
                $(node).addClass('lookup-in-progress');

                if (term) {
                  _context2.next = 7;
                  break;
                }

                term = this.getTerm(node);
                ////console.log('term is null');

                if (!(term == null)) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt('return');

              case 7:
                terms = [term];
                termBreak = undefined;

                if (useTermBreak) {
                  termBreak = this.termBreakCache.retrieve(term);
                }
                ////console.log({termBreak})

                ////console.log('Lookup: ' + term);
                _context2.next = 12;
                return this.lookupWorker.rank({ terms: terms, indeclinables: indeclinables, priorityTerms: termBreak, excludeFuzzy: excludeFuzzy });

              case 12:
                results = _context2.sent;
                contentHtml = '<table class="pali">\n    ' + results.map(function (hit) {
                  return '\n      <tr' + (hit.score < 1 ? ' class="poor-match hide"' : '') + '>\n        <td class="term">' + hit.term + '</td>\n        <td class="meaning">\n          <ul>\n          ' + hit.entries.map(function (entry) {
                    return '\n            <li>\n              <div class="content">\n                ' + _this4.makeSourceTag({ source: entry.source }) + '\n                ' + entry.html_content + '\n              </div>\n            </li>';
                  }).join('') + '\n          </ul>\n        </td>\n      </tr>';
                }).join('') + '\n    </table>';

                contentHtml = contentHtml.replace(/\s*\n\s*/g, '\n');
                content = $(contentHtml);

                this.massageEntryContent(content);

                if (includeGlossary) {
                  $('<tfoot><tr class="glossary"><td colspan=2></td></tr></tfoot>').appendTo(content).find('td').append(this.glossary.createInputBar(term));
                }

                if (preFn) {
                  preFn(content);
                }

                popup = new Popup({ absoluteLocation: absoluteLocation,
                  parent: node,
                  content: content,
                  protected: false });

                if (popup) {
                  popup.element.find('li').addClass('expandable');
                  popup.element.on('click', 'li', function (event) {
                    $(_this4).addClass('clicked');
                    var entry = $(event.target).is('.content') ? $(event.target) : $(event.target).parents('.content');
                    var source = entry.find('[data-source]').attr('data-source');
                    _this4.expandEntry({ entry: entry, popup: popup });
                    return false;
                  });

                  if (popup.element.tipsy) {
                    popup.element.find('[title]').removeAttr('title');
                  }
                  this.addUnhideBar({ popup: popup });
                }
                $(node).removeClass('lookup-in-progress');

              case 22:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
      return function lookup(_x2) {
        return ref.apply(this, arguments);
      };
    }()
  }, {
    key: 'makeSourceTag',
    value: function makeSourceTag(_ref6) {
      var source = _ref6.source;

      return '<span class="source" data-source="' + source + '" title="' + this.sources[source].name + '">' + this.sources[source].brief + '</span>';
    }
  }, {
    key: 'massageEntryContent',
    value: function massageEntryContent(content) {
      content.find('dt').remove();
      content.find('dd > p:first-child').contents().unwrap();
    }
  }, {
    key: 'addUnhideBar',
    value: function addUnhideBar(_ref7) {
      var _this5 = this;

      var popup = _ref7.popup;

      var table = popup.element.find('table');
      var hiddenCount = table.find('tr.hide td.term').length;
      var totalCount = table.find('tr td.term').length;
      ////console.log({hiddenCount, totalCount})
      if (hiddenCount == totalCount) {
        table.find('tr.hide').removeClass('hide');
        return;
      }
      if (hiddenCount > 0) {
        (function () {
          var tr = $('<tr><td colspan=3 class="unhide"><a style="width: 100%; display: inline-block;" title="Fuzzy results bear some resemblence but are less likely to be actually a correct match">' + hiddenCount + ' ' + (hiddenCount == 1 ? ' fuzzy result…' : ' fuzzy results…') + '</a></td></tr>').appendTo(table);
          popup.align();
          tr.find('a').one('click', function (event) {
            event.preventDefault();
            table.find('tr.hide').slice(0, hiddenCount == 5 ? 5 : 4).removeClass('hide');
            tr.remove();
            _this5.addUnhideBar({ popup: popup });
            popup.align();
            popup.align();
          });
        })();
      }
    }
  }, {
    key: 'retrieveEntry',
    value: function () {
      var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee3(_ref8) {
        var term = _ref8.term;
        var source = _ref8.source;

        var result, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.lookupWorker.getEntry({ term: term });

              case 2:
                result = _context3.sent;

                if (result) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt('return', null);

              case 5:
                ////console.log({result})
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context3.prev = 8;
                _iterator = result.entries[Symbol.iterator]();

              case 10:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context3.next = 17;
                  break;
                }

                entry = _step.value;

                if (!(entry.source == source)) {
                  _context3.next = 14;
                  break;
                }

                return _context3.abrupt('return', entry);

              case 14:
                _iteratorNormalCompletion = true;
                _context3.next = 10;
                break;

              case 17:
                _context3.next = 23;
                break;

              case 19:
                _context3.prev = 19;
                _context3.t0 = _context3['catch'](8);
                _didIteratorError = true;
                _iteratorError = _context3.t0;

              case 23:
                _context3.prev = 23;
                _context3.prev = 24;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 26:
                _context3.prev = 26;

                if (!_didIteratorError) {
                  _context3.next = 29;
                  break;
                }

                throw _iteratorError;

              case 29:
                return _context3.finish(26);

              case 30:
                return _context3.finish(23);

              case 31:
                return _context3.abrupt('return', null);

              case 32:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[8, 19, 23, 31], [24,, 26, 30]]);
      }));
      return function retrieveEntry(_x3) {
        return ref.apply(this, arguments);
      };
    }()
  }, {
    key: 'expandEntry',
    value: function expandEntry(_ref9) {
      var _this6 = this;

      var entry = _ref9.entry;
      var popup = _ref9.popup;

      ////console.log('Expanding Entry', {entry, popup});

      var textField = $('<div class="popup-text-overlay"/>').html($(entry)[0].outerHTML),
          closeButton = $('<div class="popup-close-button">✖</div>').css('float', 'right');
      textField.children('.content').prepend(closeButton);
      popup.element.append(textField);
      textField.find('[original-title]').attr('original-title', '');
      var content = textField.find('.content');
      var popupHeight = popup.element.height();
      var popupWidth = popup.element.width();
      var contentHeight = content.height();
      textField.height(Math.max(popupHeight, Math.min(contentHeight, popupWidth * 0.6)));

      //textField.css({'min-height': popupHeight});
      setTimeout(function () {
        textField.on('click', function (e) {
          if ($(e.target).is('.popup-text-overlay, .popup-close-button')) {
            textField.remove();
            return false;
          }
        });
      }, 400);

      textField.on('click', 'a', function (event) {
        event.preventDefault();
        var term = $(event.target).text();
        var source = textField.find('[data-source]').attr('data-source');

        _this6.retrieveEntry({ term: term, source: source }).then(function (entry) {
          if (entry == null) return;
          ////console.log('Expanding entry', {entry, popup});
          textField.remove();
          var content = $('<div class="content"/>').html(entry.html_content);
          _this6.massageEntryContent(content);
          content.prepend(_this6.makeSourceTag({ source: entry.source }));
          _this6.expandEntry({ entry: content, popup: popup });
        });
      });
    }
  }, {
    key: 'sanitizeTerm',
    value: function sanitizeTerm$$(term) {
      term = term.toLowerCase();
      if (this.fromLang == 'pi') {
        term = sanitizeTerm(term);
      }
      return term;
    }
  }, {
    key: 'decomposeMode',
    value: function decomposeMode(node) {
      var _this7 = this;

      Popup.removeAll({ removeProtected: true });
      var term = this.getTerm(node);
      var charRex$$ = /./g;
      term = this.sanitizeTerm(term);
      if (this.fromLang == 'pi') {
        charRex$$ = charRex;
      }
      if (!term) {
        return;
      }

      var content = $('<div class="decomposed"/>');

      term.match(charRex$$).forEach(function (char) {
        content.append($('<span class="letter"/>').text(char));
      });
      var em = getEmPixelSize(node);
      var pos = $(node).offset();
      $(node).css({ display: 'inline-block' });
      var popupAnchor = $('<span class="popup-anchor" style="display: inline-block"/>').prependTo(node);
      var offset = popupAnchor.offset();
      offset.top -= 1.0 * em;
      offset.left -= 1.0 * em;
      popupAnchor.remove();
      $(node).css({ display: '' });

      var decomposePopup = new Popup({ parent: node, absoluteLocation: offset, content: content, protect: true });
      ////console.log({decomposePopup, offset})
      decomposePopup.element.on('mouseover click', '.letter', function (event) {
        $('.letter.selected').removeClass('selected');
        var letters = $(event.target).add($(event.target).nextAll());
        letters.addClass('selected');
        var out = letters.map(function (i, e) {
          return $(e).text();
        }).get().join('');
        out = _this7.sanitizeTerm(out);
        Popup.removeAll({ exclude: decomposePopup });

        var decomposed = _this7.decompose({ term: out, charRex: charRex$$ });
        ////console.log({out, decomposed});
        _this7.lookup({ node: node,
          term: out,
          indeclinables: decomposed,
          excludeFuzzy: true,
          parent: decomposePopup,
          preFn: function preFn(content) {
            content.find('tr').each(function (i, element) {
              var tr = $(element),
                  td = $('<td class="accept">✓</td>'),
                  thisTerm = tr.children('.term').text();
              if ((_this7.termBreakCache.retrieve(term) || []).indexOf(thisTerm) != -1) {
                td.addClass('accepted');
              }
              tr.append(td);
            });
            content.on('click', '.accept', function (event) {
              var target = $(event.target);
              var thisTerm = target.siblings('.term').text();
              if (target.hasClass('accepted')) {
                target.removeClass('accepted');
                _this7.termBreakCache.unstore(term, thisTerm);
              } else {
                _this7.termBreakCache.store(term, thisTerm);
                target.addClass('accepted');
              }
            });
          }
        });
        return false;
      });
    }
  }, {
    key: 'decomposeVowels',
    value: function decomposeVowels(term) {
      var table = {
        'a': ['a'],
        'ā': ['ā', 'a'],
        'i': ['i'],
        'ī': ['ī', 'i'],
        'u': ['u'],
        'ū': ['ū', 'u'],
        'e': ['e', 'a', 'i'],
        'o': ['o', 'a', 'u']
      },
          firstChar = term[0],
          lastChar = term.slice(-1),
          terms = [];
      if (table[firstChar]) {
        table[firstChar].forEach(function (char) {
          terms.push(char + term.slice(1));
        });
      } else {
        terms.push(term);
      }
      terms2 = [];
      if (table[lastChar]) {
        terms.forEach(function (term) {
          table[lastChar].forEach(function (char) {
            terms2.push(term.slice(0, -1) + char);
          });
        });
      } else {
        terms2 = terms;
      }
      return terms2;
    }
  }, {
    key: 'decompose',
    value: function decompose(_ref10) {
      var term = _ref10.term;
      var charRex$$ = _ref10.charRex;

      var out = [],
          chars = term.match(charRex$$);

      for (var j = chars.length - 1; j > 0; j--) {
        subTerm = chars.slice(0, j).join('');
        if (subTerm.length <= 2) continue;
        out = out.concat(this.decomposeVowels(subTerm));
      }
      return out;
    }
  }]);
  return LookupUtility;
}();

var TermBreakCache = function () {
  function TermBreakCache(_ref11) {
    var lookupWorker = _ref11.lookupWorker;
    babelHelpers_classCallCheck(this, TermBreakCache);

    this.storage = {};
    this.mapping = {};
    this.lookupWorker = lookupWorker;
  }

  babelHelpers_createClass(TermBreakCache, [{
    key: 'updateMapping',
    value: function updateMapping(key) {
      var _this8 = this;

      if (key === undefined) {
        _.each(this.storage, function (value, key) {
          _this8.updateMapping(key);
        });
        return;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = conjugate(key)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          term = _step2.value;

          this.mapping[term] = key;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'keyize',
    value: function keyize(term) {
      return sanitizeTerm(term);
    }
  }, {
    key: 'store',
    value: function store(term, component) {
      var key = this.keyize(term);
      components = this.storage[key] || [];
      if (components.indexOf(component) == -1) {
        components.push(component);
        this.storage[key] = components;
        this.updateMapping(key);
        this.saveToServer();
      }
    }
  }, {
    key: 'unstore',
    value: function unstore(term, component) {
      var key = this.keyize(term),
          components = this.storage[key] || [],
          index = components.indexOf(component);
      if (index >= 0) {
        components.splice(index, 1);
        this.storage[key] = components;
      }
    }
  }, {
    key: 'retrieve',
    value: function retrieve(term) {
      var key = this.keyize(term),
          result = this.storage[key];
      if (!result || result.length == 0) {
        var terms = conjugate(key);
        for (var i = 0; i < terms.length; ++i) {
          var mappedTerm = this.mapping[terms[i]];
          if (mappedTerm) {
            result = this.storage[mappedTerm];
            break;
          }
        }
      }
      return result;
    }
  }, {
    key: 'remove',
    value: function remove(term) {
      delete this.storage[this.keyize(term)];
    }
  }, {
    key: 'saveToServer',
    value: function saveToServer() {
      this.lookupWorker.store({ key: 'termBreakCache.user', value: this.storage });
    }
  }, {
    key: 'loadFromServer',
    value: function () {
      var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var result;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.lookupWorker.retrieve({ key: 'termBreakCache.user' });

              case 2:
                result = _context4.sent;

                if (result && result.value) {
                  this.storage = result.value;
                } else {
                  this.storage = {};
                }

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));
      return function loadFromServer() {
        return ref.apply(this, arguments);
      };
    }()
  }]);
  return TermBreakCache;
}();

var Glossary = function () {
  function Glossary(_ref12) {
    var lookupUtility = _ref12.lookupUtility;
    babelHelpers_classCallCheck(this, Glossary);

    this.lookupUtility = lookupUtility;
    this.lookupWorker = lookupUtility.lookupWorker;
  }

  babelHelpers_createClass(Glossary, [{
    key: 'addEntry',
    value: function addEntry(_ref13) {
      var term = _ref13.term;
      var context = _ref13.context;
      var gloss = _ref13.gloss;
      var comment = _ref13.comment;
      var origin = _ref13.origin;

      return this.lookupWorker.addGlossaryEntry({ term: term, context: context, gloss: gloss, comment: comment, origin: origin });
    }
  }, {
    key: 'getEntry',
    value: function getEntry(term) {
      return this.lookupWorker.getGlossaryEntries({ term: term, origin: 'user' });
    }
  }, {
    key: 'getEntries',
    value: function getEntries(terms) {
      return this.lookupWorker.getGlossaryEntries({ terms: terms });
    }
  }, {
    key: 'getAllUserEntries',
    value: function getAllUserEntries() {
      return this.lookupWorker.getAllGlossaryEntries({ origin: 'user' });
    }
  }, {
    key: 'normalizeTerm',
    value: function normalizeTerm(term) {
      return this.lookupUtility.sanitizeTerm(term);
    }
  }, {
    key: 'createInputBar',
    value: function createInputBar(term) {
      var _this9 = this;

      term = this.normalizeTerm(term);
      var form = $('<form disabled class="add-glossary-entry">\n    <input name="term" title="term" value="' + term + '" required>\n    <input name="gloss" title="gloss" placeholder="gloss" value="">\n    <input name="context" title="context" placeholder="context" value="">\n    <input name="comment" title="comment" placeholder="comment">\n    <input name="origin" type="hidden" value="user">\n    <button>+</button>\n    </form>');

      this.getEntry(term).then(function (results) {
        console.log({ form: form, results: results });
        if (results.length > 0) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = results[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              result = _step3.value;

              //console.log({result});
              if (result.origin == 'user') {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                  for (var _iterator4 = Object.keys(result)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var name = _step4.value;

                    var e = form.find('[name=' + name + ']');
                    var value = result[name];
                    if (!value) {
                      e.attr('placeholder', null);
                    } else {
                      e.val(value);
                    }
                  }
                } catch (err) {
                  _didIteratorError4 = true;
                  _iteratorError4 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                      _iterator4.return();
                    }
                  } finally {
                    if (_didIteratorError4) {
                      throw _iteratorError4;
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        }
      });

      form.on('submit', function () {
        event.preventDefault();

        var items = {};

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = form.serializeArray()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _step5$value = _step5.value;
            var name = _step5$value.name;
            var value = _step5$value.value;

            items[name] = value;
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        if (!items.gloss && !items.comment) {
          return;
        }

        items.term = items.term.toLowerCase();

        form.children().attr('disabled', 'disabled');
        _this9.addEntry(items).then(function () {
          form.find('button').text('✓');
        });
      });
      return form;
    }
  }]);
  return Glossary;
}();

var MarkupGenerator = function () {
  function MarkupGenerator() {
    var _ref14 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var alphaRex = _ref14.alphaRex;
    var wordRex = _ref14.wordRex;
    var splitRex = _ref14.splitRex;
    var selectorClass = _ref14.selectorClass;
    babelHelpers_classCallCheck(this, MarkupGenerator);

    this.alphaRex = alphaRex || /([aiueokgcjtdnpbmyrlvshāīūṭḍṅṇṃñḷ])/i;
    this.wordRex = wordRex || /([aiueokgcjtdnpbmyrlvshāīūṭḍṅṇṃñḷ’­”]+)/ig;
    this.splitRex = splitRex || /(&[a-z]+;|<\??[a-z]+[^>]*>|[^  \n,.– —:;?!"'“‘\/\-]+)/i;
    this.selectorClass = selectorClass;
    this.markupOpen = this.getMarkupOpen();
    this.markupClose = this.getMarkupClose();
  }

  babelHelpers_createClass(MarkupGenerator, [{
    key: 'getMarkupOpen',
    value: function getMarkupOpen() {
      return '<span class="' + this.selectorClass + '">';
    }
  }, {
    key: 'getMarkupClose',
    value: function getMarkupClose() {
      return '</span>';
    }
  }, {
    key: 'shouldExclude',
    value: function shouldExclude(node) {
      var parent = $(node).parent();
      if (!parent.is(':lang(pi)')) return true;
      if (parent.is('a')) {
        if (parent.parents('h1,h2,h3,h4,h5').length == 0) {
          return false;
        }
        return true;
      }
      return false;
    }
  }, {
    key: 'wrapWords',
    value: function wrapWords(node) {
      var _this10 = this;

      var nodes = textNodes($(node));
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        var _loop = function _loop() {
          var textNode = _step6.value;

          var markupOpen = _this10.markupOpen;
          var markupClose = _this10.markupClose;
          if (_this10.shouldExclude(textNode)) {
            return {
              v: undefined
            };
          }

          text = textNode.nodeValue;

          if (text.search(self.alphaRex) == -1) {
            return {
              v: undefined
            };
          }

          newHtml = text.replace(_this10.wordRex, function (m, word) {
            return markupOpen + word + markupClose;
          });
          proxy = $('<span/>')[0];

          textNode.parentNode.replaceChild(proxy, textNode);
          proxy.outerHTML = newHtml;
        };

        for (var _iterator6 = nodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var text;
          var newHtml;
          var proxy;

          var _ret2 = _loop();

          if ((typeof _ret2 === 'undefined' ? 'undefined' : babelHelpers_typeof(_ret2)) === "object") return _ret2.v;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: 'startMarkupOnDemand',
    value: function startMarkupOnDemand(_ref15) {
      var _this11 = this;

      var targetSelector = _ref15.targetSelector;
      var exclusions = _ref15.exclusions;

      ////console.log({targetSelector})
      $('body').on('mouseover.lookupMarkup', targetSelector, function (event) {
        var target = $(event.target);
        if (!target.is(targetSelector)) {
          return;
        }

        if (target.is(exclusions)) {
          return true;
        }

        if (target.hasClass('lookup-marked-up')) {
          return;
        }

        _this11.wrapWords(target);

        target.addClass('lookup-marked-up');
      });
    }
  }, {
    key: 'stopMarkupOnDemand',
    value: function stopMarkupOnDemand() {
      $('body').off('.lookupMarkup');
    }
  }]);
  return MarkupGenerator;
}();

var LoadingPopup = function () {
  function LoadingPopup(_ref16) {
    var _this12 = this;

    var lookupUtility = _ref16.lookupUtility;
    babelHelpers_classCallCheck(this, LoadingPopup);

    this.lookupUtility = lookupUtility;
    this.popup = this.createPopup();
    this.progressElement = this.popup.element.find('#progress');
    this.handle = lookupUtility.lookupWorker.setMessageHandler(function (event) {
      return _this12.progressHandler(event);
    });
    lookupUtility.ready.then(function () {
      return _this12.popup.remove(500);
    });
  }

  babelHelpers_createClass(LoadingPopup, [{
    key: 'progressHandler',
    value: function progressHandler(event) {
      if (event.data.progress) {
        this.progressElement.text(event.data.progress);
      }
    }
  }, {
    key: 'createPopup',
    value: function createPopup() {
      var content = $('<div class="loading"><p><em>Lookup is Loading</em></p><p id="progress"></p></div>');
      return new Popup({ location: { top: 40, left: 40 }, content: content, parent: document.body });
    }
  }]);
  return LoadingPopup;
}();

var smartInit = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var mouseoverTarget, targetSelector, lookupUtility;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            mouseoverTarget = $('#text, main, body').first();
            targetSelector = 'p, h1, h2, h3, h4, h5';

            console.time('init');
            lookupUtility = new LookupUtility({ selectorClass: 'lookup',
              fromLang: 'pi',
              toLang: 'en' });

            console.log({ lookupUtility: lookupUtility });

            lookupUtility.lookupWorker.setMessageHandler(function (e) {
              if (e.data.progress) console.log(e.data.progress);
            });
            lookupUtility.markupGenerator.startMarkupOnDemand({ targetSelector: targetSelector });
            lookupUtility.ready.then(function () {
              return console.timeEnd('init');
            });

            loadingPopup = lookupUtility.makeLoadingPopup();
            loadingPopup.popup.element.hide();
            setTimeout(function () {
              if (lookupUtility.enabled) {} else {
                loadingPopup.popup.element.show();
              }
            }, 250);
            window.lookupUtility = lookupUtility;
            return _context.abrupt('return', { lookupUtility: lookupUtility });

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return function smartInit() {
    return ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=lookup-1.0.js.map
