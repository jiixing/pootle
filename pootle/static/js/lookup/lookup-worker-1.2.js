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

var callbacks = new Map();
var listeners = new Map();

function setMessageHandler(selfOrPort, handler) {
  selfOrPort.onmessage = function () {
    var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee(event) {
      var source, msg_id, result;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              source = event.data.source, msg_id = event.data.id;
              _context.next = 3;
              return handler(source);

            case 3:
              result = _context.sent;

              selfOrPort.postMessage({ id: msg_id, result: result });

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
    return function (_x) {
      return ref.apply(this, arguments);
    };
  }();
}

/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * By David Fahlander, david.fahlander@gmail.com
 *
 * Version 1.3.0, Tue Nov 17 2015
 * www.dexie.com
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 */

var keys = Object.keys;
var isArray = Array.isArray;

function _extend(obj, extension) {
    if ((typeof extension === 'undefined' ? 'undefined' : babelHelpers_typeof(extension)) !== 'object') extension = extension(); // Allow to supply a function returning the extension. Useful for simplifying private scopes.
    keys(extension).forEach(function (key) {
        obj[key] = extension[key];
    });
    return obj;
}

function derive(Child) {
    return {
        from: function from(Parent) {
            Child.prototype = Object.create(Parent.prototype);
            Child.prototype.constructor = Child;
            return {
                extend: function extend(extension) {
                    _extend(Child.prototype, (typeof extension === 'undefined' ? 'undefined' : babelHelpers_typeof(extension)) !== 'object' ? extension(Parent.prototype) : extension);
                }
            };
        }
    };
}

var _slice = [].slice;
function slice(args, start, end) {
    return _slice.call(args, start, end);
}

function override(origFunc, overridedFactory) {
    return overridedFactory(origFunc);
}

if (typeof global === 'undefined') {
    var global = self || window;
}

function Dexie(dbName, options) {
    /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
    var addons = options && options.addons || Dexie.addons;
    // Resolve all external dependencies:
    var deps = Dexie.dependencies;
    var indexedDB = deps.indexedDB,
        IDBKeyRange = deps.IDBKeyRange,
        IDBTransaction = deps.IDBTransaction;

    var DOMError = deps.DOMError,
        TypeError = deps.TypeError,
        Error = deps.Error;

    var globalSchema = this._dbSchema = {};
    var versions = [];
    var dbStoreNames = [];
    var allTables = {};
    var notInTransFallbackTables = {};
    ///<var type="IDBDatabase" />
    var idbdb = null; // Instance of IDBDatabase
    var db_is_blocked = true;
    var dbOpenError = null;
    var isBeingOpened = false;
    var READONLY = "readonly",
        READWRITE = "readwrite";
    var db = this;
    var pausedResumeables = [];
    var autoSchema = true;
    var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn();

    function init() {
        // If browser (not node.js or other), subscribe to versionchange event and reload page
        db.on("versionchange", function (ev) {
            // Default behavior for versionchange event is to close database connection.
            // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
            // Let's not block the other window from making it's delete() or open() call.
            db.close();
            db.on('error').fire(new Error("Database version changed by other database connection."));
            // In many web applications, it would be recommended to force window.reload()
            // when this event occurs. Do do that, subscribe to the versionchange event
            // and call window.location.reload(true);
        });
    }

    //
    //
    //
    // ------------------------- Versioning Framework---------------------------
    //
    //
    //

    this.version = function (versionNumber) {
        /// <param name="versionNumber" type="Number"></param>
        /// <returns type="Version"></returns>
        if (idbdb) throw new Error("Cannot add version when database is open");
        this.verno = Math.max(this.verno, versionNumber);
        var versionInstance = versions.filter(function (v) {
            return v._cfg.version === versionNumber;
        })[0];
        if (versionInstance) return versionInstance;
        versionInstance = new Version(versionNumber);
        versions.push(versionInstance);
        versions.sort(lowerVersionFirst);
        return versionInstance;
    };

    function Version(versionNumber) {
        this._cfg = {
            version: versionNumber,
            storesSource: null,
            dbschema: {},
            tables: {},
            contentUpgrade: null
        };
        this.stores({}); // Derive earlier schemas by default.
    }

    _extend(Version.prototype, {
        stores: function stores(_stores) {
            /// <summary>
            ///   Defines the schema for a particular version
            /// </summary>
            /// <param name="stores" type="Object">
            /// Example: <br/>
            ///   {users: "id++,first,last,&amp;username,*email", <br/>
            ///   passwords: "id++,&amp;username"}<br/>
            /// <br/>
            /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
            /// Special characters:<br/>
            ///  "&amp;"  means unique key, <br/>
            ///  "*"  means value is multiEntry, <br/>
            ///  "++" means auto-increment and only applicable for primary key <br/>
            /// </param>
            this._cfg.storesSource = this._cfg.storesSource ? _extend(this._cfg.storesSource, _stores) : _stores;

            // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
            var storesSpec = {};
            versions.forEach(function (version) {
                // 'versions' is always sorted by lowest version first.
                _extend(storesSpec, version._cfg.storesSource);
            });

            var dbschema = this._cfg.dbschema = {};
            this._parseStoresSpec(storesSpec, dbschema);
            // Update the latest schema to this version
            // Update API
            globalSchema = db._dbSchema = dbschema;
            removeTablesApi([allTables, db, notInTransFallbackTables]);
            setApiOnPlace([notInTransFallbackTables], tableNotInTransaction, keys(dbschema), READWRITE, dbschema);
            setApiOnPlace([allTables, db, this._cfg.tables], db._transPromiseFactory, keys(dbschema), READWRITE, dbschema, true);
            dbStoreNames = keys(dbschema);
            return this;
        },
        upgrade: function upgrade(upgradeFunction) {
            /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
            var self = this;
            fakeAutoComplete(function () {
                upgradeFunction(db._createTransaction(READWRITE, keys(self._cfg.dbschema), self._cfg.dbschema)); // BUGBUG: No code completion for prev version's tables wont appear.
            });
            this._cfg.contentUpgrade = upgradeFunction;
            return this;
        },
        _parseStoresSpec: function _parseStoresSpec(stores, outSchema) {
            keys(stores).forEach(function (tableName) {
                if (stores[tableName] !== null) {
                    var instanceTemplate = {};
                    var indexes = parseIndexSyntax(stores[tableName]);
                    var primKey = indexes.shift();
                    if (primKey.multi) throw new Error("Primary key cannot be multi-valued");
                    if (primKey.keyPath) setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
                    indexes.forEach(function (idx) {
                        if (idx.auto) throw new Error("Only primary key can be marked as autoIncrement (++)");
                        if (!idx.keyPath) throw new Error("Index must have a name and cannot be an empty string");
                        setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () {
                            return "";
                        }) : "");
                    });
                    outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
                }
            });
        }
    });

    function runUpgraders(oldVersion, idbtrans, reject, openReq) {
        if (oldVersion === 0) {
            //globalSchema = versions[versions.length - 1]._cfg.dbschema;
            // Create tables:
            keys(globalSchema).forEach(function (tableName) {
                createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
            });
            // Populate data
            var t = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
            t.idbtrans = idbtrans;
            t.idbtrans.onerror = eventRejectHandler(reject, ["populating database"]);
            t.on('error').subscribe(reject);
            Promise$1.newPSD(function () {
                Promise$1.PSD.trans = t;
                try {
                    db.on("populate").fire(t);
                } catch (err) {
                    openReq.onerror = idbtrans.onerror = function (ev) {
                        ev.preventDefault();
                    }; // Prohibit AbortError fire on db.on("error") in Firefox.
                    try {
                        idbtrans.abort();
                    } catch (e) {}
                    idbtrans.db.close();
                    reject(err);
                }
            });
        } else {
            // Upgrade version to version, step-by-step from oldest to newest version.
            // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
            var queue = [];
            var oldVersionStruct = versions.filter(function (version) {
                return version._cfg.version === oldVersion;
            })[0];
            if (!oldVersionStruct) throw new Error("Dexie specification of currently installed DB version is missing");
            globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
            var anyContentUpgraderHasRun = false;

            var versToRun = versions.filter(function (v) {
                return v._cfg.version > oldVersion;
            });
            versToRun.forEach(function (version) {
                /// <param name="version" type="Version"></param>
                var oldSchema = globalSchema;
                var newSchema = version._cfg.dbschema;
                adjustToExistingIndexNames(oldSchema, idbtrans);
                adjustToExistingIndexNames(newSchema, idbtrans);
                globalSchema = db._dbSchema = newSchema;
                {
                    var diff = getSchemaDiff(oldSchema, newSchema);
                    diff.add.forEach(function (tuple) {
                        queue.push(function (idbtrans, cb) {
                            createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                            cb();
                        });
                    });
                    diff.change.forEach(function (change) {
                        if (change.recreate) {
                            throw new Error("Not yet support for changing primary key");
                        } else {
                            queue.push(function (idbtrans, cb) {
                                var store = idbtrans.objectStore(change.name);
                                change.add.forEach(function (idx) {
                                    addIndex(store, idx);
                                });
                                change.change.forEach(function (idx) {
                                    store.deleteIndex(idx.name);
                                    addIndex(store, idx);
                                });
                                change.del.forEach(function (idxName) {
                                    store.deleteIndex(idxName);
                                });
                                cb();
                            });
                        }
                    });
                    if (version._cfg.contentUpgrade) {
                        queue.push(function (idbtrans, cb) {
                            anyContentUpgraderHasRun = true;
                            var t = db._createTransaction(READWRITE, slice(idbtrans.db.objectStoreNames), newSchema);
                            t.idbtrans = idbtrans;
                            var uncompletedRequests = 0;
                            t._promise = override(t._promise, function (orig_promise) {
                                return function (mode, fn, writeLock) {
                                    ++uncompletedRequests;
                                    function proxy(fn) {
                                        return function () {
                                            fn.apply(this, arguments);
                                            if (--uncompletedRequests === 0) cb(); // A called db operation has completed without starting a new operation. The flow is finished, now run next upgrader.
                                        };
                                    }
                                    return orig_promise.call(this, mode, function (resolve, reject, trans) {
                                        arguments[0] = proxy(resolve);
                                        arguments[1] = proxy(reject);
                                        fn.apply(this, arguments);
                                    }, writeLock);
                                };
                            });
                            idbtrans.onerror = eventRejectHandler(reject, ["running upgrader function for version", version._cfg.version]);
                            t.on('error').subscribe(reject);
                            version._cfg.contentUpgrade(t);
                            if (uncompletedRequests === 0) cb(); // contentUpgrade() didnt call any db operations at all.
                        });
                    }
                    if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug()) {
                        // Dont delete old tables if ieBug is present and a content upgrader has run. Let tables be left in DB so far. This needs to be taken care of.
                        queue.push(function (idbtrans, cb) {
                            // Delete old tables
                            deleteRemovedTables(newSchema, idbtrans);
                            cb();
                        });
                    }
                }
            });

            // Now, create a queue execution engine
            var runNextQueuedFunction = function runNextQueuedFunction() {
                try {
                    if (queue.length) queue.shift()(idbtrans, runNextQueuedFunction);else createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
                } catch (err) {
                    openReq.onerror = idbtrans.onerror = function (ev) {
                        ev.preventDefault();
                    }; // Prohibit AbortError fire on db.on("error") in Firefox.
                    try {
                        idbtrans.abort();
                    } catch (e) {}
                    idbtrans.db.close();
                    reject(err);
                }
            };
            runNextQueuedFunction();
        }
    }

    function getSchemaDiff(oldSchema, newSchema) {
        var diff = {
            del: [], // Array of table names
            add: [], // Array of [tableName, newDefinition]
            change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
        };
        for (var table in oldSchema) {
            if (!newSchema[table]) diff.del.push(table);
        }
        for (var table in newSchema) {
            var oldDef = oldSchema[table],
                newDef = newSchema[table];
            if (!oldDef) diff.add.push([table, newDef]);else {
                var change = {
                    name: table,
                    def: newSchema[table],
                    recreate: false,
                    del: [],
                    add: [],
                    change: []
                };
                if (oldDef.primKey.src !== newDef.primKey.src) {
                    // Primary key has changed. Remove and re-add table.
                    change.recreate = true;
                    diff.change.push(change);
                } else {
                    var oldIndexes = oldDef.indexes.reduce(function (prev, current) {
                        prev[current.name] = current;return prev;
                    }, {});
                    var newIndexes = newDef.indexes.reduce(function (prev, current) {
                        prev[current.name] = current;return prev;
                    }, {});
                    for (var idxName in oldIndexes) {
                        if (!newIndexes[idxName]) change.del.push(idxName);
                    }
                    for (var idxName in newIndexes) {
                        var oldIdx = oldIndexes[idxName],
                            newIdx = newIndexes[idxName];
                        if (!oldIdx) change.add.push(newIdx);else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
                    }
                    if (change.recreate || change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                        diff.change.push(change);
                    }
                }
            }
        }
        return diff;
    }

    function createTable(idbtrans, tableName, primKey, indexes) {
        /// <param name="idbtrans" type="IDBTransaction"></param>
        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
        indexes.forEach(function (idx) {
            addIndex(store, idx);
        });
        return store;
    }

    function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(function (tableName) {
            if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
            }
        });
    }

    function deleteRemovedTables(newSchema, idbtrans) {
        for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
            var storeName = idbtrans.db.objectStoreNames[i];
            if (newSchema[storeName] === null || newSchema[storeName] === undefined) {
                idbtrans.db.deleteObjectStore(storeName);
            }
        }
    }

    function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
    }

    //
    //
    //      Dexie Protected API
    //
    //

    this._allTables = allTables;

    this._tableFactory = function createTable(mode, tableSchema, transactionPromiseFactory) {
        /// <param name="tableSchema" type="TableSchema"></param>
        if (mode === READONLY) return new Table(tableSchema.name, transactionPromiseFactory, tableSchema, Collection);else return new WriteableTable(tableSchema.name, transactionPromiseFactory, tableSchema);
    };

    this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
        return new Transaction(mode, storeNames, dbschema, parentTransaction);
    };

    function tableNotInTransaction(mode, storeNames) {
        throw new Error("Table " + storeNames[0] + " not part of transaction. Original Scope Function Source: " + Dexie.Promise.PSD.trans.scopeFunc.toString());
    }

    this._transPromiseFactory = function transactionPromiseFactory(mode, storeNames, fn) {
        // Last argument is "writeLocked". But this doesnt apply to oneshot direct db operations, so we ignore it.
        if (db_is_blocked && (!Promise$1.PSD || !Promise$1.PSD.letThrough)) {
            // Database is paused. Wait til resumed.
            if (!isBeingOpened) db.open(); // Force open if not being opened.
            var blockedPromise = new Promise$1(function (resolve, reject) {
                pausedResumeables.push({
                    resume: function resume() {
                        var p = db._transPromiseFactory(mode, storeNames, fn);
                        blockedPromise.onuncatched = p.onuncatched;
                        p.then(resolve, reject);
                    }
                });
            });
            return blockedPromise;
        } else {
            var trans = db._createTransaction(mode, storeNames, globalSchema);
            return trans._promise(mode, function (resolve, reject) {
                // An uncatched operation will bubble to this anonymous transaction. Make sure
                // to continue bubbling it up to db.on('error'):
                trans.error(function (err) {
                    db.on('error').fire(err);
                });
                Promise$1.newPSD(function () {
                    Promise$1.PSD.trans = trans;
                    fn(function (value) {
                        // Instead of resolving value directly, wait with resolving it until transaction has completed.
                        // Otherwise the data would not be in the DB if requesting it in the then() operation.
                        // Specifically, to ensure that the following expression will work:
                        //
                        //   db.friends.put({name: "Arne"}).then(function () {
                        //       db.friends.where("name").equals("Arne").count(function(count) {
                        //           assert (count === 1);
                        //       });
                        //   });
                        //
                        trans.complete(function () {
                            resolve(value);
                        });
                    }, reject, trans);
                });
            });
        }
    };

    this._whenReady = function (fn) {
        if (!fake && db_is_blocked && (!Promise$1.PSD || !Promise$1.PSD.letThrough)) {
            if (!isBeingOpened) db.open(); // Force open if not being opened.
            return new Promise$1(function (resolve, reject) {
                pausedResumeables.push({
                    resume: function resume() {
                        fn(resolve, reject);
                    }
                });
            });
        }
        return new Promise$1(fn);
    };

    //
    //
    //
    //
    //      Dexie API
    //
    //
    //

    this.verno = 0;

    this.open = function () {
        return new Promise$1(function (resolve, reject) {
            if (fake) resolve(db);
            if (idbdb) {
                resolve(db);return;
            }
            if (isBeingOpened) {
                db._whenReady(function () {
                    resolve(db);
                }, function (e) {
                    reject(e);
                });return;
            }
            var req,
                dbWasCreated = false;
            function openError(err) {
                try {
                    req.transaction.abort();
                } catch (e) {}
                /*if (dbWasCreated) {
                    // Workaround for issue with some browsers. Seem not to be needed though.
                    // Unit test "Issue#100 - not all indexes are created" works without it on chrome,FF,opera and IE.
                    idbdb.close();
                    indexedDB.deleteDatabase(db.name); 
                }*/
                isBeingOpened = false;
                dbOpenError = err;
                db_is_blocked = false;
                reject(dbOpenError);
                pausedResumeables.forEach(function (resumable) {
                    // Resume all stalled operations. They will fail once they wake up.
                    resumable.resume();
                });
                pausedResumeables = [];
            }
            try {
                dbOpenError = null;
                isBeingOpened = true;

                // Make sure caller has specified at least one version
                if (versions.length > 0) autoSchema = false;

                // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
                // IE fails when deleting objectStore after reading from it.
                // A future version of Dexie.js will stopover an intermediate version to workaround this.
                // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.
                if (!indexedDB) throw new Error("indexedDB API not found. If using IE10+, make sure to run your code on a server URL (not locally). If using Safari, make sure to include indexedDB polyfill.");
                req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
                if (!req) throw new Error("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134
                req.onerror = eventRejectHandler(openError, ["opening database", dbName]);
                req.onblocked = function (ev) {
                    db.on("blocked").fire(ev);
                };
                req.onupgradeneeded = trycatch(function (e) {
                    if (autoSchema && !db._allowEmptyDB) {
                        // Unless an addon has specified db._allowEmptyDB, lets make the call fail.
                        // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
                        // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
                        // do not create a new database by accident here.
                        req.onerror = function (event) {
                            event.preventDefault();
                        }; // Prohibit onabort error from firing before we're done!
                        req.transaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
                        // Close database and delete it.
                        req.result.close();
                        var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
                        delreq.onsuccess = delreq.onerror = function () {
                            openError(new Error("Database '" + dbName + "' doesnt exist"));
                        };
                    } else {
                        if (e.oldVersion === 0) dbWasCreated = true;
                        req.transaction.onerror = eventRejectHandler(openError);
                        var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
                        runUpgraders(oldVer / 10, req.transaction, openError, req);
                    }
                }, openError);
                req.onsuccess = trycatch(function (e) {
                    isBeingOpened = false;
                    idbdb = req.result;
                    if (autoSchema) readGlobalSchema();else if (idbdb.objectStoreNames.length > 0) adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
                    idbdb.onversionchange = db.on("versionchange").fire; // Not firing it here, just setting the function callback to any registered subscriber.
                    if (!hasNativeGetDatabaseNames) {
                        // Update localStorage with list of database names
                        globalDatabaseList(function (databaseNames) {
                            if (databaseNames.indexOf(dbName) === -1) return databaseNames.push(dbName);
                        });
                    }
                    // Now, let any subscribers to the on("ready") fire BEFORE any other db operations resume!
                    // If an the on("ready") subscriber returns a Promise, we will wait til promise completes or rejects before
                    Promise$1.newPSD(function () {
                        Promise$1.PSD.letThrough = true; // Set a Promise-Specific Data property informing that onready is firing. This will make db._whenReady() let the subscribers use the DB but block all others (!). Quite cool ha?
                        try {
                            var res = db.on.ready.fire();
                            if (res && typeof res.then === 'function') {
                                // If on('ready') returns a promise, wait for it to complete and then resume any pending operations.
                                res.then(resume, function (err) {
                                    idbdb.close();
                                    idbdb = null;
                                    openError(err);
                                });
                            } else {
                                asap(resume); // Cannot call resume directly because then the pauseResumables would inherit from our PSD scope.
                            }
                        } catch (e) {
                            openError(e);
                        }

                        function resume() {
                            db_is_blocked = false;
                            pausedResumeables.forEach(function (resumable) {
                                // If anyone has made operations on a table instance before the db was opened, the operations will start executing now.
                                resumable.resume();
                            });
                            pausedResumeables = [];
                            resolve(db);
                        }
                    });
                }, openError);
            } catch (err) {
                openError(err);
            }
        });
    };

    this.close = function () {
        if (idbdb) {
            idbdb.close();
            idbdb = null;
            db_is_blocked = true;
            dbOpenError = null;
        }
    };

    this.delete = function () {
        var args = arguments;
        return new Promise$1(function (resolve, reject) {
            if (args.length > 0) throw new Error("Arguments not allowed in db.delete()");
            function doDelete() {
                db.close();
                var req = indexedDB.deleteDatabase(dbName);
                req.onsuccess = function () {
                    if (!hasNativeGetDatabaseNames) {
                        globalDatabaseList(function (databaseNames) {
                            var pos = databaseNames.indexOf(dbName);
                            if (pos >= 0) return databaseNames.splice(pos, 1);
                        });
                    }
                    resolve();
                };
                req.onerror = eventRejectHandler(reject, ["deleting", dbName]);
                req.onblocked = function () {
                    db.on("blocked").fire();
                };
            }
            if (isBeingOpened) {
                pausedResumeables.push({ resume: doDelete });
            } else {
                doDelete();
            }
        });
    };

    this.backendDB = function () {
        return idbdb;
    };

    this.isOpen = function () {
        return idbdb !== null;
    };
    this.hasFailed = function () {
        return dbOpenError !== null;
    };
    this.dynamicallyOpened = function () {
        return autoSchema;
    };

    /*this.dbg = function (collection, counter) {
        if (!this._dbgResult || !this._dbgResult[counter]) {
            if (typeof collection === 'string') collection = this.table(collection).toCollection().limit(100);
            if (!this._dbgResult) this._dbgResult = [];
            var db = this;
            new Promise(function () {
                Promise.PSD.letThrough = true;
                db._dbgResult[counter] = collection.toArray();
            });
        }
        return this._dbgResult[counter]._value;
    }*/

    //
    // Properties
    //
    this.name = dbName;

    // db.tables - an array of all Table instances.
    // TODO: Change so that tables is a simple member and make sure to update it whenever allTables changes.
    Object.defineProperty(this, "tables", {
        get: function get() {
            /// <returns type="Array" elementType="WriteableTable" />
            return keys(allTables).map(function (name) {
                return allTables[name];
            });
        }
    });

    //
    // Events
    //
    this.on = events(this, "error", "populate", "blocked", { "ready": [promisableChain, nop], "versionchange": [reverseStoppableEventChain, nop] });

    // Handle on('ready') specifically: If DB is already open, trigger the event immediately. Also, default to unsubscribe immediately after being triggered.
    this.on.ready.subscribe = override(this.on.ready.subscribe, function (origSubscribe) {
        return function (subscriber, bSticky) {
            function proxy() {
                if (!bSticky) db.on.ready.unsubscribe(proxy);
                return subscriber.apply(this, arguments);
            }
            origSubscribe.call(this, proxy);
            if (db.isOpen()) {
                if (db_is_blocked) {
                    pausedResumeables.push({ resume: proxy });
                } else {
                    proxy();
                }
            }
        };
    });

    fakeAutoComplete(function () {
        db.on("populate").fire(db._createTransaction(READWRITE, dbStoreNames, globalSchema));
        db.on("error").fire(new Error());
    });

    this.transaction = function (mode, tableInstances, scopeFunc) {
        /// <summary>
        ///
        /// </summary>
        /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
        /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
        /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>

        // Let table arguments be all arguments between mode and last argument.
        tableInstances = slice(arguments, 1, arguments.length - 1);
        // Let scopeFunc be the last argument
        scopeFunc = arguments[arguments.length - 1];
        var parentTransaction = Promise$1.PSD && Promise$1.PSD.trans;
        // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
        if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1) parentTransaction = null;
        var onlyIfCompatible = mode.indexOf('?') !== -1;
        mode = mode.replace('!', '').replace('?', '');
        //
        // Get storeNames from arguments. Either through given table instances, or through given table names.
        //
        var tables = isArray(tableInstances[0]) ? tableInstances.reduce(function (a, b) {
            return a.concat(b);
        }) : tableInstances;
        var error = null;
        var storeNames = tables.map(function (tableInstance) {
            if (typeof tableInstance === "string") {
                return tableInstance;
            } else {
                if (!(tableInstance instanceof Table)) error = error || new TypeError("Invalid type. Arguments following mode must be instances of Table or String");
                return tableInstance.name;
            }
        });

        //
        // Resolve mode. Allow shortcuts "r" and "rw".
        //
        if (mode == "r" || mode == READONLY) mode = READONLY;else if (mode == "rw" || mode == READWRITE) mode = READWRITE;else error = new Error("Invalid transaction mode: " + mode);

        if (parentTransaction) {
            // Basic checks
            if (!error) {
                if (parentTransaction && parentTransaction.mode === READONLY && mode === READWRITE) {
                    if (onlyIfCompatible) parentTransaction = null; // Spawn new transaction instead.
                    else error = error || new Error("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                }
                if (parentTransaction) {
                    storeNames.forEach(function (storeName) {
                        if (!parentTransaction.tables.hasOwnProperty(storeName)) {
                            if (onlyIfCompatible) parentTransaction = null; // Spawn new transaction instead.
                            else error = error || new Error("Table " + storeName + " not included in parent transaction. Parent Transaction function: " + parentTransaction.scopeFunc.toString());
                        }
                    });
                }
            }
        }
        if (parentTransaction) {
            // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
            return parentTransaction._promise(mode, enterTransactionScope, "lock");
        } else {
            // If this is a root-level transaction, wait til database is ready and then launch the transaction.
            return db._whenReady(enterTransactionScope);
        }

        function enterTransactionScope(resolve, reject) {
            // Our transaction. To be set later.
            var trans = null;

            try {
                // Throw any error if any of the above checks failed.
                // Real error defined some lines up. We throw it here from within a Promise to reject Promise
                // rather than make caller need to both use try..catch and promise catching. The reason we still
                // throw here rather than do Promise.reject(error) is that we like to have the stack attached to the
                // error. Also because there is a catch() clause bound to this try() that will bubble the error
                // to the parent transaction.
                if (error) throw error;

                //
                // Create Transaction instance
                //
                trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);

                // Provide arguments to the scope function (for backward compatibility)
                var tableArgs = storeNames.map(function (name) {
                    return trans.tables[name];
                });
                tableArgs.push(trans);

                // If transaction completes, resolve the Promise with the return value of scopeFunc.
                var returnValue;
                var uncompletedRequests = 0;

                // Create a new PSD frame to hold Promise.PSD.trans. Must not be bound to the current PSD frame since we want
                // it to pop before then() callback is called of our returned Promise.
                Promise$1.newPSD(function () {
                    // Let the transaction instance be part of a Promise-specific data (PSD) value.
                    Promise$1.PSD.trans = trans;
                    trans.scopeFunc = scopeFunc; // For Error ("Table " + storeNames[0] + " not part of transaction") when it happens. This may help localizing the code that started a transaction used on another place.

                    if (parentTransaction) {
                        // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
                        trans.idbtrans = parentTransaction.idbtrans;
                        trans._promise = override(trans._promise, function (orig) {
                            return function (mode, fn, writeLock) {
                                ++uncompletedRequests;
                                function proxy(fn2) {
                                    return function (val) {
                                        var retval;
                                        // _rootExec needed so that we do not loose any IDBTransaction in a setTimeout() call.
                                        Promise$1._rootExec(function () {
                                            retval = fn2(val);
                                            // _tickFinalize makes sure to support lazy micro tasks executed in Promise._rootExec().
                                            // We certainly do not want to copy the bad pattern from IndexedDB but instead allow
                                            // execution of Promise.then() callbacks until the're all done.
                                            Promise$1._tickFinalize(function () {
                                                if (--uncompletedRequests === 0 && trans.active) {
                                                    trans.active = false;
                                                    trans.on.complete.fire(); // A called db operation has completed without starting a new operation. The flow is finished
                                                }
                                            });
                                        });
                                        return retval;
                                    };
                                }
                                return orig.call(this, mode, function (resolve2, reject2, trans) {
                                    return fn(proxy(resolve2), proxy(reject2), trans);
                                }, writeLock);
                            };
                        });
                    }
                    trans.complete(function () {
                        resolve(returnValue);
                    });
                    // If transaction fails, reject the Promise and bubble to db if noone catched this rejection.
                    trans.error(function (e) {
                        if (trans.idbtrans) trans.idbtrans.onerror = preventDefault; // Prohibit AbortError from firing.
                        try {
                            trans.abort();
                        } catch (e2) {}
                        if (parentTransaction) {
                            parentTransaction.active = false;
                            parentTransaction.on.error.fire(e); // Bubble to parent transaction
                        }
                        var catched = reject(e);
                        if (!parentTransaction && !catched) {
                            db.on.error.fire(e); // If not catched, bubble error to db.on("error").
                        }
                    });

                    // Finally, call the scope function with our table and transaction arguments.
                    Promise$1._rootExec(function () {
                        returnValue = scopeFunc.apply(trans, tableArgs); // NOTE: returnValue is used in trans.on.complete() not as a returnValue to this func.
                    });
                });
                if (!trans.idbtrans || parentTransaction && uncompletedRequests === 0) {
                    trans._nop(); // Make sure transaction is being used so that it will resolve.
                }
            } catch (e) {
                // If exception occur, abort the transaction and reject Promise.
                if (trans && trans.idbtrans) trans.idbtrans.onerror = preventDefault; // Prohibit AbortError from firing.
                if (trans) trans.abort();
                if (parentTransaction) parentTransaction.on.error.fire(e);
                asap(function () {
                    // Need to use asap(=setImmediate/setTimeout) before calling reject because we are in the Promise constructor and reject() will always return false if so.
                    if (!reject(e)) db.on("error").fire(e); // If not catched, bubble exception to db.on("error");
                });
            }
        }
    };

    this.table = function (tableName) {
        /// <returns type="WriteableTable"></returns>
        if (fake && autoSchema) return new WriteableTable(tableName);
        if (!allTables.hasOwnProperty(tableName)) {
            throw new Error("Table does not exist");return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 };
        }
        return allTables[tableName];
    };

    //
    //
    //
    // Table Class
    //
    //
    //
    function Table(name, transactionPromiseFactory, tableSchema, collClass) {
        /// <param name="name" type="String"></param>
        this.name = name;
        this.schema = tableSchema;
        this.hook = allTables[name] ? allTables[name].hook : events(null, {
            "creating": [hookCreatingChain, nop],
            "reading": [pureFunctionChain, mirror],
            "updating": [hookUpdatingChain, nop],
            "deleting": [nonStoppableEventChain, nop]
        });
        this._tpf = transactionPromiseFactory;
        this._collClass = collClass || Collection;
    }

    _extend(Table.prototype, function () {
        function failReadonly() {
            throw new Error("Current Transaction is READONLY");
        }
        return {
            //
            // Table Protected Methods
            //

            _trans: function getTransaction(mode, fn, writeLocked) {
                return this._tpf(mode, [this.name], fn, writeLocked);
            },
            _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
                if (fake) return new Promise$1(fn); // Simplify the work for Intellisense/Code completion.
                var self = this;
                return this._tpf(mode, [this.name], function (resolve, reject, trans) {
                    fn(resolve, reject, trans.idbtrans.objectStore(self.name), trans);
                }, writeLocked);
            },

            //
            // Table Public Methods
            //
            get: function get(key, cb) {
                var self = this;
                return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                    fake && resolve(self.schema.instanceTemplate);
                    var req = idbstore.get(key);
                    req.onerror = eventRejectHandler(reject, ["getting", key, "from", self.name]);
                    req.onsuccess = function () {
                        resolve(self.hook.reading.fire(req.result));
                    };
                }).then(cb);
            },
            where: function where(indexName) {
                return new WhereClause(this, indexName);
            },
            count: function count(cb) {
                return this.toCollection().count(cb);
            },
            offset: function offset(_offset) {
                return this.toCollection().offset(_offset);
            },
            limit: function limit(numRows) {
                return this.toCollection().limit(numRows);
            },
            reverse: function reverse() {
                return this.toCollection().reverse();
            },
            filter: function filter(filterFunction) {
                return this.toCollection().and(filterFunction);
            },
            each: function each(fn) {
                var self = this;
                fake && fn(self.schema.instanceTemplate);
                return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                    var req = idbstore.openCursor();
                    req.onerror = eventRejectHandler(reject, ["calling", "Table.each()", "on", self.name]);
                    iterate(req, null, fn, resolve, reject, self.hook.reading.fire);
                });
            },
            toArray: function toArray(cb) {
                var self = this;
                return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                    fake && resolve([self.schema.instanceTemplate]);
                    var a = [];
                    var req = idbstore.openCursor();
                    req.onerror = eventRejectHandler(reject, ["calling", "Table.toArray()", "on", self.name]);
                    iterate(req, null, function (item) {
                        a.push(item);
                    }, function () {
                        resolve(a);
                    }, reject, self.hook.reading.fire);
                }).then(cb);
            },
            orderBy: function orderBy(index) {
                return new this._collClass(new WhereClause(this, index));
            },

            toCollection: function toCollection() {
                return new this._collClass(new WhereClause(this));
            },

            mapToClass: function mapToClass(constructor, structure) {
                /// <summary>
                ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
                ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
                /// </summary>
                /// <param name="constructor">Constructor function representing the class.</param>
                /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
                this.schema.mappedClass = constructor;
                var instanceTemplate = Object.create(constructor.prototype);
                if (structure) {
                    // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
                    applyStructure(instanceTemplate, structure);
                }
                this.schema.instanceTemplate = instanceTemplate;

                // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
                // no matter which method to use for reading (Table.get() or Table.where(...)... )
                var readHook = function readHook(obj) {
                    if (!obj) return obj; // No valid object. (Value is null). Return as is.
                    // Create a new object that derives from constructor:
                    var res = Object.create(constructor.prototype);
                    // Clone members:
                    for (var m in obj) {
                        if (obj.hasOwnProperty(m)) res[m] = obj[m];
                    }return res;
                };

                if (this.schema.readHook) {
                    this.hook.reading.unsubscribe(this.schema.readHook);
                }
                this.schema.readHook = readHook;
                this.hook("reading", readHook);
                return constructor;
            },
            defineClass: function defineClass(structure) {
                /// <summary>
                ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
                ///     as well as making it possible to extend the prototype of the returned constructor function.
                /// </summary>
                /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
                return this.mapToClass(Dexie.defineClass(structure), structure);
            },
            add: failReadonly,
            put: failReadonly,
            'delete': failReadonly,
            clear: failReadonly,
            update: failReadonly
        };
    });

    //
    //
    //
    // WriteableTable Class (extends Table)
    //
    //
    //
    function WriteableTable(name, transactionPromiseFactory, tableSchema, collClass) {
        Table.call(this, name, transactionPromiseFactory, tableSchema, collClass || WriteableCollection);
    }

    derive(WriteableTable).from(Table).extend(function () {

        function BulkErrorHandler(errorList, resolve, hookCtx, transaction) {
            return function (ev) {
                if (ev.stopPropagation) ev.stopPropagation();
                if (ev.preventDefault) ev.preventDefault();
                errorList.push(ev.target.error);
                if (hookCtx && hookCtx.onerror) {
                    Promise$1.newPSD(function () {
                        Promise$1.PSD.trans = transaction;
                        hookCtx.onerror(ev.target.error);
                    });
                }
                if (resolve) resolve(errorList); // Only done in last request.
            };
        }

        function BulkSuccessHandler(errorList, resolve, hookCtx, transaction) {
            return hookCtx ? function (ev) {
                hookCtx.onsuccess && Promise$1.newPSD(function () {
                    Promise$1.PSD.trans = transaction;
                    hookCtx.onsuccess(ev.target.result);
                });
                if (resolve) resolve(errorList);
            } : function () {
                resolve(errorList);
            };
        }

        return {
            bulkAdd: function bulkAdd(objects) {
                var self = this,
                    creatingHook = this.hook.creating.fire;
                return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                    if (!idbstore.keyPath) throw new Error("bulkAdd() only support inbound keys");
                    if (objects.length === 0) return resolve([]); // Caller provided empty list.
                    var req,
                        errorList = [],
                        errorHandler,
                        successHandler;
                    if (creatingHook !== nop) {
                        //
                        // There are subscribers to hook('creating')
                        // Must behave as documented.
                        //
                        var keyPath = idbstore.keyPath,
                            hookCtx = { onerror: null, onsuccess: null };
                        errorHandler = BulkErrorHandler(errorList, null, hookCtx, trans);
                        successHandler = BulkSuccessHandler(errorList, null, hookCtx, trans);
                        for (var i = 0, l = objects.length; i < l; ++i) {
                            var obj = objects[i],
                                effectiveKey = getByKeyPath(obj, keyPath),
                                keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);
                            if (effectiveKey === undefined && keyToUse !== undefined) {
                                obj = deepClone(obj);
                                setByKeyPath(obj, keyPath, keyToUse);
                            }

                            req = idbstore.add(obj);
                            if (i < l - 1) {
                                req.onerror = errorHandler;
                                if (hookCtx.onsuccess) req.onsuccess = successHandler;
                                // Reset event listeners for next iteration.
                                hookCtx.onerror = null;
                                hookCtx.onsuccess = null;
                            }
                        }
                        req.onerror = BulkErrorHandler(errorList, resolve, hookCtx, trans);
                        req.onsuccess = BulkSuccessHandler(errorList, resolve, hookCtx, trans);
                    } else {
                        //
                        // Standard Bulk (no 'creating' hook to care about)
                        //
                        errorHandler = BulkErrorHandler(errorList);
                        for (var i = 0, l = objects.length; i < l; ++i) {
                            req = idbstore.add(objects[i]);
                            req.onerror = errorHandler;
                        }
                        // Only need to catch success or error on the last operation
                        // according to the IDB spec.
                        req.onerror = BulkErrorHandler(errorList, resolve);
                        req.onsuccess = BulkSuccessHandler(errorList, resolve);
                    }
                });
            },
            add: function add(obj, key) {
                /// <summary>
                ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
                /// </summary>
                /// <param name="obj" type="Object">A javascript object to insert</param>
                /// <param name="key" optional="true">Primary key</param>
                var self = this,
                    creatingHook = this.hook.creating.fire;
                return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                    var thisCtx = { onsuccess: null, onerror: null };
                    if (creatingHook !== nop) {
                        var effectiveKey = key || (idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined);
                        var keyToUse = creatingHook.call(thisCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
                        if (effectiveKey === undefined && keyToUse !== undefined) {
                            if (idbstore.keyPath) setByKeyPath(obj, idbstore.keyPath, keyToUse);else key = keyToUse;
                        }
                    }
                    var req = key ? idbstore.add(obj, key) : idbstore.add(obj);
                    req.onerror = eventRejectHandler(function (e) {
                        if (thisCtx.onerror) Promise$1.newPSD(function () {
                            Promise$1.PSD.trans = trans;
                            thisCtx.onerror(e);
                        });
                        return reject(e);
                    }, ["adding", obj, "into", self.name]);
                    req.onsuccess = function (ev) {
                        var keyPath = idbstore.keyPath;
                        if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
                        if (thisCtx.onsuccess) Promise$1.newPSD(function () {
                            Promise$1.PSD.trans = trans;
                            thisCtx.onsuccess(ev.target.result);
                        });
                        resolve(req.result);
                    };
                });
            },

            put: function put(obj, key) {
                /// <summary>
                ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
                /// </summary>
                /// <param name="obj" type="Object">A javascript object to insert or update</param>
                /// <param name="key" optional="true">Primary key</param>
                var self = this,
                    creatingHook = this.hook.creating.fire,
                    updatingHook = this.hook.updating.fire;
                if (creatingHook !== nop || updatingHook !== nop) {
                    //
                    // People listens to when("creating") or when("updating") events!
                    // We must know whether the put operation results in an CREATE or UPDATE.
                    //
                    return this._trans(READWRITE, function (resolve, reject, trans) {
                        // Since key is optional, make sure we get it from obj if not provided
                        var effectiveKey = key || self.schema.primKey.keyPath && getByKeyPath(obj, self.schema.primKey.keyPath);
                        if (effectiveKey === undefined) {
                            // No primary key. Must use add().
                            trans.tables[self.name].add(obj).then(resolve, reject);
                        } else {
                            // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
                            trans._lock(); // Needed because operation is splitted into modify() and add().
                            // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
                            obj = deepClone(obj);
                            trans.tables[self.name].where(":id").equals(effectiveKey).modify(function (value) {
                                // Replace extisting value with our object
                                // CRUD event firing handled in WriteableCollection.modify()
                                this.value = obj;
                            }).then(function (count) {
                                if (count === 0) {
                                    // Object's key was not found. Add the object instead.
                                    // CRUD event firing will be done in add()
                                    return trans.tables[self.name].add(obj, key); // Resolving with another Promise. Returned Promise will then resolve with the new key.
                                } else {
                                        return effectiveKey; // Resolve with the provided key.
                                    }
                            }).finally(function () {
                                trans._unlock();
                            }).then(resolve, reject);
                        }
                    });
                } else {
                    // Use the standard IDB put() method.
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                        var req = key ? idbstore.put(obj, key) : idbstore.put(obj);
                        req.onerror = eventRejectHandler(reject, ["putting", obj, "into", self.name]);
                        req.onsuccess = function (ev) {
                            var keyPath = idbstore.keyPath;
                            if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
                            resolve(req.result);
                        };
                    });
                }
            },

            'delete': function _delete(key) {
                /// <param name="key">Primary key of the object to delete</param>
                if (this.hook.deleting.subscribers.length) {
                    // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                    // call the CRUD event. Only WriteableCollection.delete() will know whether an object was actually deleted.
                    return this.where(":id").equals(key).delete();
                } else {
                    // No one listens. Use standard IDB delete() method.
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                        var req = idbstore.delete(key);
                        req.onerror = eventRejectHandler(reject, ["deleting", key, "from", idbstore.name]);
                        req.onsuccess = function (ev) {
                            resolve(req.result);
                        };
                    });
                }
            },

            clear: function clear() {
                if (this.hook.deleting.subscribers.length) {
                    // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                    // call the CRUD event. Only WriteableCollection.delete() will knows which objects that are actually deleted.
                    return this.toCollection().delete();
                } else {
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                        var req = idbstore.clear();
                        req.onerror = eventRejectHandler(reject, ["clearing", idbstore.name]);
                        req.onsuccess = function (ev) {
                            resolve(req.result);
                        };
                    });
                }
            },

            update: function update(keyOrObject, modifications) {
                if ((typeof modifications === 'undefined' ? 'undefined' : babelHelpers_typeof(modifications)) !== 'object' || isArray(modifications)) throw new Error("db.update(keyOrObject, modifications). modifications must be an object.");
                if ((typeof keyOrObject === 'undefined' ? 'undefined' : babelHelpers_typeof(keyOrObject)) === 'object' && !isArray(keyOrObject)) {
                    // object to modify. Also modify given object with the modifications:
                    keys(modifications).forEach(function (keyPath) {
                        setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                    });
                    var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                    if (key === undefined) Promise$1.reject(new Error("Object does not contain its primary key"));
                    return this.where(":id").equals(key).modify(modifications);
                } else {
                    // key to modify
                    return this.where(":id").equals(keyOrObject).modify(modifications);
                }
            }
        };
    });

    //
    //
    //
    // Transaction Class
    //
    //
    //
    function Transaction(mode, storeNames, dbschema, parent) {
        /// <summary>
        ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
        /// </summary>
        /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
        /// <param name="storeNames" type="Array">Array of table names to operate on</param>
        var self = this;
        this.db = db;
        this.mode = mode;
        this.storeNames = storeNames;
        this.idbtrans = null;
        this.on = events(this, ["complete", "error"], "abort");
        this._reculock = 0;
        this._blockedFuncs = [];
        this._psd = null;
        this.active = true;
        this._dbschema = dbschema;
        if (parent) this.parent = parent;
        this._tpf = transactionPromiseFactory;
        this.tables = Object.create(notInTransFallbackTables); // ...so that all non-included tables exists as instances (possible to call table.name for example) but will fail as soon as trying to execute a query on it.

        function transactionPromiseFactory(mode, storeNames, fn, writeLocked) {
            // Creates a Promise instance and calls fn (resolve, reject, trans) where trans is the instance of this transaction object.
            // Support for write-locking the transaction during the promise life time from creation to success/failure.
            // This is actually not needed when just using single operations on IDB, since IDB implements this internally.
            // However, when implementing a write operation as a series of operations on top of IDB(collection.delete() and collection.modify() for example),
            // lock is indeed needed if Dexie APIshould behave in a consistent manner for the API user.
            // Another example of this is if we want to support create/update/delete events,
            // we need to implement put() using a series of other IDB operations but still need to lock the transaction all the way.
            return self._promise(mode, fn, writeLocked);
        }

        for (var i = storeNames.length - 1; i !== -1; --i) {
            var name = storeNames[i];
            var table = db._tableFactory(mode, dbschema[name], transactionPromiseFactory);
            this.tables[name] = table;
            if (!this[name]) this[name] = table;
        }
    }

    _extend(Transaction.prototype, {
        //
        // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
        //

        _lock: function _lock() {
            // Temporary set all requests into a pending queue if they are called before database is ready.
            ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
            if (this._reculock === 1 && Promise$1.PSD) Promise$1.PSD.lockOwnerFor = this;
            return this;
        },
        _unlock: function _unlock() {
            if (--this._reculock === 0) {
                if (Promise$1.PSD) Promise$1.PSD.lockOwnerFor = null;
                while (this._blockedFuncs.length > 0 && !this._locked()) {
                    var fn = this._blockedFuncs.shift();
                    try {
                        fn();
                    } catch (e) {}
                }
            }
            return this;
        },
        _locked: function _locked() {
            // Checks if any write-lock is applied on this transaction.
            // To simplify the Dexie API for extension implementations, we support recursive locks.
            // This is accomplished by using "Promise Specific Data" (PSD).
            // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
            // Promise.PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
            //         * callback given to the Promise() constructor  (function (resolve, reject){...})
            //         * callbacks given to then()/catch()/finally() methods (function (value){...})
            // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
            // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
            // Promise.PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
            return this._reculock && (!Promise$1.PSD || Promise$1.PSD.lockOwnerFor !== this);
        },
        _nop: function _nop(cb) {
            // An asyncronic no-operation that may call given callback when done doing nothing. An alternative to asap() if we must not lose the transaction.
            this.tables[this.storeNames[0]].get(0).then(cb);
        },
        _promise: function _promise(mode, fn, bWriteLock) {
            var self = this;
            return Promise$1.newPSD(function () {
                var p;
                // Read lock always
                if (!self._locked()) {
                    p = self.active ? new Promise$1(function (resolve, reject) {
                        if (!self.idbtrans && mode) {
                            if (!idbdb) throw dbOpenError ? new Error("Database not open. Following error in populate, ready or upgrade function made Dexie.open() fail: " + dbOpenError) : new Error("Database not open");
                            var idbtrans = self.idbtrans = idbdb.transaction(safariMultiStoreFix(self.storeNames), self.mode);
                            idbtrans.onerror = function (e) {
                                self.on("error").fire(e && e.target.error);
                                e.preventDefault(); // Prohibit default bubbling to window.error
                                self.abort(); // Make sure transaction is aborted since we preventDefault.
                            };
                            idbtrans.onabort = function (e) {
                                // Workaround for issue #78 - low disk space on chrome.
                                // onabort is called but never onerror. Call onerror explicitely.
                                // Do this in a future tick so we allow default onerror to execute before doing the fallback.
                                asap(function () {
                                    self.on('error').fire(new Error("Transaction aborted for unknown reason"));
                                });

                                self.active = false;
                                self.on("abort").fire(e);
                            };
                            idbtrans.oncomplete = function (e) {
                                self.active = false;
                                self.on("complete").fire(e);
                            };
                        }
                        if (bWriteLock) self._lock(); // Write lock if write operation is requested
                        try {
                            fn(resolve, reject, self);
                        } catch (e) {
                            // Direct exception happened when doin operation.
                            // We must immediately fire the error and abort the transaction.
                            // When this happens we are still constructing the Promise so we don't yet know
                            // whether the caller is about to catch() the error or not. Have to make
                            // transaction fail. Catching such an error wont stop transaction from failing.
                            // This is a limitation we have to live with.
                            Dexie.ignoreTransaction(function () {
                                self.on('error').fire(e);
                            });
                            self.abort();
                            reject(e);
                        }
                    }) : Promise$1.reject(stack(new Error("Transaction is inactive. Original Scope Function Source: " + self.scopeFunc.toString())));
                    if (self.active && bWriteLock) p.finally(function () {
                        self._unlock();
                    });
                } else {
                    // Transaction is write-locked. Wait for mutex.
                    p = new Promise$1(function (resolve, reject) {
                        self._blockedFuncs.push(function () {
                            self._promise(mode, fn, bWriteLock).then(resolve, reject);
                        });
                    });
                }
                p.onuncatched = function (e) {
                    // Bubble to transaction. Even though IDB does this internally, it would just do it for error events and not for caught exceptions.
                    Dexie.ignoreTransaction(function () {
                        self.on("error").fire(e);
                    });
                    self.abort();
                };
                return p;
            });
        },

        //
        // Transaction Public Methods
        //

        complete: function complete(cb) {
            return this.on("complete", cb);
        },
        error: function error(cb) {
            return this.on("error", cb);
        },
        abort: function abort() {
            if (this.idbtrans && this.active) try {
                // TODO: if !this.idbtrans, enqueue an abort() operation.
                this.active = false;
                this.idbtrans.abort();
                this.on.error.fire(new Error("Transaction Aborted"));
            } catch (e) {}
        },
        table: function table(name) {
            if (!this.tables.hasOwnProperty(name)) {
                throw new Error("Table " + name + " not in transaction");return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 };
            }
            return this.tables[name];
        }
    });

    //
    //
    //
    // WhereClause
    //
    //
    //
    function WhereClause(table, index, orCollection) {
        /// <param name="table" type="Table"></param>
        /// <param name="index" type="String" optional="true"></param>
        /// <param name="orCollection" type="Collection" optional="true"></param>
        this._ctx = {
            table: table,
            index: index === ":id" ? null : index,
            collClass: table._collClass,
            or: orCollection
        };
    }

    _extend(WhereClause.prototype, function () {

        // WhereClause private methods

        function fail(collection, err) {
            try {
                throw err;
            } catch (e) {
                collection._ctx.error = e;
            }
            return collection;
        }

        function getSetArgs(args) {
            return slice(args.length === 1 && isArray(args[0]) ? args[0] : args);
        }

        function upperFactory(dir) {
            return dir === "next" ? function (s) {
                return s.toUpperCase();
            } : function (s) {
                return s.toLowerCase();
            };
        }
        function lowerFactory(dir) {
            return dir === "next" ? function (s) {
                return s.toLowerCase();
            } : function (s) {
                return s.toUpperCase();
            };
        }
        function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
            var length = Math.min(key.length, lowerNeedle.length);
            var llp = -1;
            for (var i = 0; i < length; ++i) {
                var lwrKeyChar = lowerKey[i];
                if (lwrKeyChar !== lowerNeedle[i]) {
                    if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                    if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                    if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                    return null;
                }
                if (cmp(key[i], lwrKeyChar) < 0) llp = i;
            }
            if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
            if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
            return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
        }

        function addIgnoreCaseAlgorithm(c, match, needle) {
            /// <param name="needle" type="String"></param>
            var upper, lower, compare, upperNeedle, lowerNeedle, direction;
            function initDirection(dir) {
                upper = upperFactory(dir);
                lower = lowerFactory(dir);
                compare = dir === "next" ? ascending : descending;
                upperNeedle = upper(needle);
                lowerNeedle = lower(needle);
                direction = dir;
            }
            initDirection("next");
            c._ondirectionchange = function (direction) {
                // This event onlys occur before filter is called the first time.
                initDirection(direction);
            };
            c._addAlgorithm(function (cursor, advance, resolve) {
                /// <param name="cursor" type="IDBCursor"></param>
                /// <param name="advance" type="Function"></param>
                /// <param name="resolve" type="Function"></param>
                var key = cursor.key;
                if (typeof key !== 'string') return false;
                var lowerKey = lower(key);
                if (match(lowerKey, lowerNeedle)) {
                    advance(function () {
                        cursor.continue();
                    });
                    return true;
                } else {
                    var nextNeedle = nextCasing(key, lowerKey, upperNeedle, lowerNeedle, compare, direction);
                    if (nextNeedle) {
                        advance(function () {
                            cursor.continue(nextNeedle);
                        });
                    } else {
                        advance(resolve);
                    }
                    return false;
                }
            });
        }

        //
        // WhereClause public methods
        //
        return {
            between: function between(lower, upper, includeLower, includeUpper) {
                /// <summary>
                ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
                /// </summary>
                /// <param name="lower"></param>
                /// <param name="upper"></param>
                /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
                /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
                /// <returns type="Collection"></returns>
                includeLower = includeLower !== false; // Default to true
                includeUpper = includeUpper === true; // Default to false
                if (lower > upper || lower === upper && (includeLower || includeUpper) && !(includeLower && includeUpper)) return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.only(lower);
                }).limit(0); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper);
                });
            },
            equals: function equals(value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.only(value);
                });
            },
            above: function above(value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.lowerBound(value, true);
                });
            },
            aboveOrEqual: function aboveOrEqual(value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.lowerBound(value);
                });
            },
            below: function below(value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.upperBound(value, true);
                });
            },
            belowOrEqual: function belowOrEqual(value) {
                return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.upperBound(value);
                });
            },
            startsWith: function startsWith(str) {
                /// <param name="str" type="String"></param>
                if (typeof str !== 'string') return fail(new this._ctx.collClass(this), new TypeError("String expected"));
                return this.between(str, str + String.fromCharCode(65535), true, true);
            },
            startsWithIgnoreCase: function startsWithIgnoreCase(str) {
                /// <param name="str" type="String"></param>
                if (typeof str !== 'string') return fail(new this._ctx.collClass(this), new TypeError("String expected"));
                if (str === "") return this.startsWith(str);
                var c = new this._ctx.collClass(this, function () {
                    return IDBKeyRange.bound(str.toUpperCase(), str.toLowerCase() + String.fromCharCode(65535));
                });
                addIgnoreCaseAlgorithm(c, function (a, b) {
                    return a.indexOf(b) === 0;
                }, str);
                c._ondirectionchange = function () {
                    fail(c, new Error("reverse() not supported with WhereClause.startsWithIgnoreCase()"));
                };
                return c;
            },
            equalsIgnoreCase: function equalsIgnoreCase(str) {
                /// <param name="str" type="String"></param>
                if (typeof str !== 'string') return fail(new this._ctx.collClass(this), new TypeError("String expected"));
                var c = new this._ctx.collClass(this, function () {
                    return IDBKeyRange.bound(str.toUpperCase(), str.toLowerCase());
                });
                addIgnoreCaseAlgorithm(c, function (a, b) {
                    return a === b;
                }, str);
                return c;
            },
            anyOf: function anyOf(valueArray) {
                var ctx = this._ctx,
                    schema = ctx.table.schema;
                var idxSpec = ctx.index ? schema.idxByName[ctx.index] : schema.primKey;
                var isCompound = idxSpec && idxSpec.compound;
                var set = getSetArgs(arguments);
                var compare = isCompound ? compoundCompare(ascending) : ascending;
                set.sort(compare);
                if (set.length === 0) return new this._ctx.collClass(this, function () {
                    return IDBKeyRange.only("");
                }).limit(0); // Return an empty collection.
                var c = new this._ctx.collClass(this, function () {
                    return IDBKeyRange.bound(set[0], set[set.length - 1]);
                });

                c._ondirectionchange = function (direction) {
                    compare = direction === "next" ? ascending : descending;
                    if (isCompound) compare = compoundCompare(compare);
                    set.sort(compare);
                };
                var i = 0;
                c._addAlgorithm(function (cursor, advance, resolve) {
                    var key = cursor.key;
                    while (compare(key, set[i]) > 0) {
                        // The cursor has passed beyond this key. Check next.
                        ++i;
                        if (i === set.length) {
                            // There is no next. Stop searching.
                            advance(resolve);
                            return false;
                        }
                    }
                    if (compare(key, set[i]) === 0) {
                        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                        advance(function () {
                            cursor.continue();
                        });
                        return true;
                    } else {
                        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                        advance(function () {
                            cursor.continue(set[i]);
                        });
                        return false;
                    }
                });
                return c;
            },

            notEqual: function notEqual(value) {
                return this.below(value).or(this._ctx.index).above(value);
            },

            noneOf: function noneOf(valueArray) {
                var ctx = this._ctx,
                    schema = ctx.table.schema;
                var idxSpec = ctx.index ? schema.idxByName[ctx.index] : schema.primKey;
                var isCompound = idxSpec && idxSpec.compound;
                var set = getSetArgs(arguments);
                if (set.length === 0) return new this._ctx.collClass(this); // Return entire collection.
                var compare = isCompound ? compoundCompare(ascending) : ascending;
                set.sort(compare);
                // Transform ["a","b","c"] to a set of ranges for between/above/below: [[null,"a"], ["a","b"], ["b","c"], ["c",null]]
                var ranges = set.reduce(function (res, val) {
                    return res ? res.concat([[res[res.length - 1][1], val]]) : [[null, val]];
                }, null);
                ranges.push([set[set.length - 1], null]);
                // Transform range-sets to a big or() expression between ranges:
                var thiz = this,
                    index = ctx.index;
                return ranges.reduce(function (collection, range) {
                    return collection ? range[1] === null ? collection.or(index).above(range[0]) : collection.or(index).between(range[0], range[1], false, false) : thiz.below(range[1]);
                }, null);
            },

            startsWithAnyOf: function startsWithAnyOf(valueArray) {
                var ctx = this._ctx,
                    set = getSetArgs(arguments);

                if (!set.every(function (s) {
                    return typeof s === 'string';
                })) {
                    return fail(new ctx.collClass(this), new TypeError("startsWithAnyOf() only works with strings"));
                }
                if (set.length === 0) return new ctx.collClass(this, function () {
                    return IDBKeyRange.only("");
                }).limit(0); // Return an empty collection.

                var setEnds = set.map(function (s) {
                    return s + String.fromCharCode(65535);
                });

                var sortDirection = ascending;
                set.sort(sortDirection);
                var i = 0;
                function keyIsBeyondCurrentEntry(key) {
                    return key > setEnds[i];
                }
                function keyIsBeforeCurrentEntry(key) {
                    return key < set[i];
                }
                var checkKey = keyIsBeyondCurrentEntry;

                var c = new ctx.collClass(this, function () {
                    return IDBKeyRange.bound(set[0], set[set.length - 1] + String.fromCharCode(65535));
                });

                c._ondirectionchange = function (direction) {
                    if (direction === "next") {
                        checkKey = keyIsBeyondCurrentEntry;
                        sortDirection = ascending;
                    } else {
                        checkKey = keyIsBeforeCurrentEntry;
                        sortDirection = descending;
                    }
                    set.sort(sortDirection);
                    setEnds.sort(sortDirection);
                };

                c._addAlgorithm(function (cursor, advance, resolve) {
                    var key = cursor.key;
                    while (checkKey(key)) {
                        // The cursor has passed beyond this key. Check next.
                        ++i;
                        if (i === set.length) {
                            // There is no next. Stop searching.
                            advance(resolve);
                            return false;
                        }
                    }
                    if (key >= set[i] && key <= setEnds[i]) {
                        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                        advance(function () {
                            cursor.continue();
                        });
                        return true;
                    } else {
                        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                        advance(function () {
                            if (sortDirection === ascending) cursor.continue(set[i]);else cursor.continue(setEnds[i]);
                        });
                        return false;
                    }
                });
                return c;
            }
        };
    });

    //
    //
    //
    // Collection Class
    //
    //
    //
    function Collection(whereClause, keyRangeGenerator) {
        /// <summary>
        ///
        /// </summary>
        /// <param name="whereClause" type="WhereClause">Where clause instance</param>
        /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
        var keyRange = null,
            error = null;
        if (keyRangeGenerator) try {
            keyRange = keyRangeGenerator();
        } catch (ex) {
            error = ex;
        }

        var whereCtx = whereClause._ctx;
        this._ctx = {
            table: whereCtx.table,
            index: whereCtx.index,
            isPrimKey: !whereCtx.index || whereCtx.table.schema.primKey.keyPath && whereCtx.index === whereCtx.table.schema.primKey.name,
            range: keyRange,
            op: "openCursor",
            dir: "next",
            unique: "",
            algorithm: null,
            filter: null,
            isMatch: null,
            offset: 0,
            limit: Infinity,
            error: error, // If set, any promise must be rejected with this error
            or: whereCtx.or
        };
    }

    _extend(Collection.prototype, function () {

        //
        // Collection Private Functions
        //

        function addFilter(ctx, fn) {
            ctx.filter = combine(ctx.filter, fn);
        }

        function addMatchFilter(ctx, fn) {
            ctx.isMatch = combine(ctx.isMatch, fn);
        }

        function getIndexOrStore(ctx, store) {
            if (ctx.isPrimKey) return store;
            var indexSpec = ctx.table.schema.idxByName[ctx.index];
            if (!indexSpec) throw new Error("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
            return ctx.isPrimKey ? store : store.index(indexSpec.name);
        }

        function openCursor(ctx, store) {
            return getIndexOrStore(ctx, store)[ctx.op](ctx.range || null, ctx.dir + ctx.unique);
        }

        function iter(ctx, fn, resolve, reject, idbstore) {
            if (!ctx.or) {
                iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, ctx.filter), fn, resolve, reject, ctx.table.hook.reading.fire);
            } else {
                (function () {
                    var filter = ctx.filter;
                    var set = {};
                    var primKey = ctx.table.schema.primKey.keyPath;
                    var resolved = 0;

                    function resolveboth() {
                        if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
                    }

                    function union(item, cursor, advance) {
                        if (!filter || filter(cursor, advance, resolveboth, reject)) {
                            var key = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                            if (!set.hasOwnProperty(key)) {
                                set[key] = true;
                                fn(item, cursor, advance);
                            }
                        }
                    }

                    ctx.or._iterate(union, resolveboth, reject, idbstore);
                    iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, ctx.table.hook.reading.fire);
                })();
            }
        }
        function getInstanceTemplate(ctx) {
            return ctx.table.schema.instanceTemplate;
        }

        return {

            //
            // Collection Protected Functions
            //

            _read: function _read(fn, cb) {
                var ctx = this._ctx;
                if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
                    reject(ctx.error);
                });else return ctx.table._idbstore(READONLY, fn).then(cb);
            },
            _write: function _write(fn) {
                var ctx = this._ctx;
                if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
                    reject(ctx.error);
                });else return ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
            },
            _addAlgorithm: function _addAlgorithm(fn) {
                var ctx = this._ctx;
                ctx.algorithm = combine(ctx.algorithm, fn);
            },

            _iterate: function _iterate(fn, resolve, reject, idbstore) {
                return iter(this._ctx, fn, resolve, reject, idbstore);
            },

            //
            // Collection Public methods
            //

            each: function each(fn) {
                var ctx = this._ctx;

                fake && fn(getInstanceTemplate(ctx));

                return this._read(function (resolve, reject, idbstore) {
                    iter(ctx, fn, resolve, reject, idbstore);
                });
            },

            count: function count(cb) {
                if (fake) return Promise$1.resolve(0).then(cb);
                var self = this,
                    ctx = this._ctx;

                if (ctx.filter || ctx.algorithm || ctx.or) {
                    // When filters are applied or 'ored' collections are used, we must count manually
                    var count = 0;
                    return this._read(function (resolve, reject, idbstore) {
                        iter(ctx, function () {
                            ++count;return false;
                        }, function () {
                            resolve(count);
                        }, reject, idbstore);
                    }, cb);
                } else {
                    // Otherwise, we can use the count() method if the index.
                    return this._read(function (resolve, reject, idbstore) {
                        var idx = getIndexOrStore(ctx, idbstore);
                        var req = ctx.range ? idx.count(ctx.range) : idx.count();
                        req.onerror = eventRejectHandler(reject, ["calling", "count()", "on", self.name]);
                        req.onsuccess = function (e) {
                            resolve(Math.min(e.target.result, Math.max(0, ctx.limit - ctx.offset)));
                        };
                    }, cb);
                }
            },

            sortBy: function sortBy(keyPath, cb) {
                /// <param name="keyPath" type="String"></param>
                var ctx = this._ctx;
                var parts = keyPath.split('.').reverse(),
                    lastPart = parts[0],
                    lastIndex = parts.length - 1;
                function getval(obj, i) {
                    if (i) return getval(obj[parts[i]], i - 1);
                    return obj[lastPart];
                }
                var order = this._ctx.dir === "next" ? 1 : -1;

                function sorter(a, b) {
                    var aVal = getval(a, lastIndex),
                        bVal = getval(b, lastIndex);
                    return aVal < bVal ? -order : aVal > bVal ? order : 0;
                }
                return this.toArray(function (a) {
                    return a.sort(sorter);
                }).then(cb);
            },

            toArray: function toArray(cb) {
                var ctx = this._ctx;
                return this._read(function (resolve, reject, idbstore) {
                    fake && resolve([getInstanceTemplate(ctx)]);
                    var a = [];
                    iter(ctx, function (item) {
                        a.push(item);
                    }, function arrayComplete() {
                        resolve(a);
                    }, reject, idbstore);
                }, cb);
            },

            offset: function offset(_offset2) {
                var ctx = this._ctx;
                if (_offset2 <= 0) return this;
                ctx.offset += _offset2; // For count()
                if (!ctx.or && !ctx.algorithm && !ctx.filter) {
                    addFilter(ctx, function offsetFilter(cursor, advance, resolve) {
                        if (_offset2 === 0) return true;
                        if (_offset2 === 1) {
                            --_offset2;return false;
                        }
                        advance(function () {
                            cursor.advance(_offset2);_offset2 = 0;
                        });
                        return false;
                    });
                } else {
                    addFilter(ctx, function offsetFilter(cursor, advance, resolve) {
                        return --_offset2 < 0;
                    });
                }
                return this;
            },

            limit: function limit(numRows) {
                this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
                addFilter(this._ctx, function (cursor, advance, resolve) {
                    if (--numRows <= 0) advance(resolve); // Stop after this item has been included
                    return numRows >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
                });
                return this;
            },

            until: function until(filterFunction, bIncludeStopEntry) {
                var ctx = this._ctx;
                fake && filterFunction(getInstanceTemplate(ctx));
                addFilter(this._ctx, function (cursor, advance, resolve) {
                    if (filterFunction(cursor.value)) {
                        advance(resolve);
                        return bIncludeStopEntry;
                    } else {
                        return true;
                    }
                });
                return this;
            },

            first: function first(cb) {
                return this.limit(1).toArray(function (a) {
                    return a[0];
                }).then(cb);
            },

            last: function last(cb) {
                return this.reverse().first(cb);
            },

            and: function and(filterFunction) {
                /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
                fake && filterFunction(getInstanceTemplate(this._ctx));
                addFilter(this._ctx, function (cursor) {
                    return filterFunction(cursor.value);
                });
                addMatchFilter(this._ctx, filterFunction); // match filters not used in Dexie.js but can be used by 3rd part libraries to test a collection for a match without querying DB. Used by Dexie.Observable.
                return this;
            },

            or: function or(indexName) {
                return new WhereClause(this._ctx.table, indexName, this);
            },

            reverse: function reverse() {
                this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
                if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
                return this;
            },

            desc: function desc() {
                return this.reverse();
            },

            eachKey: function eachKey(cb) {
                var ctx = this._ctx;
                fake && cb(getByKeyPath(getInstanceTemplate(this._ctx), this._ctx.index ? this._ctx.table.schema.idxByName[this._ctx.index].keyPath : this._ctx.table.schema.primKey.keyPath));
                if (!ctx.isPrimKey) ctx.op = "openKeyCursor"; // Need the check because IDBObjectStore does not have "openKeyCursor()" while IDBIndex has.
                return this.each(function (val, cursor) {
                    cb(cursor.key, cursor);
                });
            },

            eachUniqueKey: function eachUniqueKey(cb) {
                this._ctx.unique = "unique";
                return this.eachKey(cb);
            },

            keys: function keys(cb) {
                var ctx = this._ctx;
                if (!ctx.isPrimKey) ctx.op = "openKeyCursor"; // Need the check because IDBObjectStore does not have "openKeyCursor()" while IDBIndex has.
                var a = [];
                if (fake) return new Promise$1(this.eachKey.bind(this)).then(function (x) {
                    return [x];
                }).then(cb);
                return this.each(function (item, cursor) {
                    a.push(cursor.key);
                }).then(function () {
                    return a;
                }).then(cb);
            },

            uniqueKeys: function uniqueKeys(cb) {
                this._ctx.unique = "unique";
                return this.keys(cb);
            },

            firstKey: function firstKey(cb) {
                return this.limit(1).keys(function (a) {
                    return a[0];
                }).then(cb);
            },

            lastKey: function lastKey(cb) {
                return this.reverse().firstKey(cb);
            },

            distinct: function distinct() {
                var set = {};
                addFilter(this._ctx, function (cursor) {
                    var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                    var found = set.hasOwnProperty(strKey);
                    set[strKey] = true;
                    return !found;
                });
                return this;
            }
        };
    });

    //
    //
    // WriteableCollection Class
    //
    //
    function WriteableCollection() {
        Collection.apply(this, arguments);
    }

    derive(WriteableCollection).from(Collection).extend({

        //
        // WriteableCollection Public Methods
        //

        modify: function modify(changes) {
            var self = this,
                ctx = this._ctx,
                hook = ctx.table.hook,
                updatingHook = hook.updating.fire,
                deletingHook = hook.deleting.fire;

            fake && typeof changes === 'function' && changes.call({ value: ctx.table.schema.instanceTemplate }, ctx.table.schema.instanceTemplate);

            return this._write(function (resolve, reject, idbstore, trans) {
                var modifyer;
                if (typeof changes === 'function') {
                    // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
                    if (updatingHook === nop && deletingHook === nop) {
                        // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
                        modifyer = changes;
                    } else {
                        // People want to know exactly what is being modified or deleted.
                        // Let modifyer be a proxy function that finds out what changes the caller is actually doing
                        // and call the hooks accordingly!
                        modifyer = function modifyer(item) {
                            var origItem = deepClone(item); // Clone the item first so we can compare laters.
                            if (changes.call(this, item) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
                            if (!this.hasOwnProperty("value")) {
                                // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
                                deletingHook.call(this, this.primKey, item, trans);
                            } else {
                                // No deletion. Check what was changed
                                var objectDiff = getObjectDiff(origItem, this.value);
                                var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
                                if (additionalChanges) {
                                    // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                                    item = this.value;
                                    keys(additionalChanges).forEach(function (keyPath) {
                                        setByKeyPath(item, keyPath, additionalChanges[keyPath]); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                    });
                                }
                            }
                        };
                    }
                } else if (updatingHook === nop) {
                        // changes is a set of {keyPath: value} and no one is listening to the updating hook.
                        var keyPaths = keys(changes);
                        var numKeys = keyPaths.length;
                        modifyer = function modifyer(item) {
                            var anythingModified = false;
                            for (var i = 0; i < numKeys; ++i) {
                                var keyPath = keyPaths[i],
                                    val = changes[keyPath];
                                if (getByKeyPath(item, keyPath) !== val) {
                                    setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                    anythingModified = true;
                                }
                            }
                            return anythingModified;
                        };
                    } else {
                        // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
                        // allow it to add additional modifications to make.
                        var origChanges = changes;
                        changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
                        modifyer = function modifyer(item) {
                            var anythingModified = false;
                            var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
                            if (additionalChanges) _extend(changes, additionalChanges);
                            keys(changes).forEach(function (keyPath) {
                                var val = changes[keyPath];
                                if (getByKeyPath(item, keyPath) !== val) {
                                    setByKeyPath(item, keyPath, val);
                                    anythingModified = true;
                                }
                            });
                            if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration
                            return anythingModified;
                        };
                    }

                var count = 0;
                var successCount = 0;
                var iterationComplete = false;
                var failures = [];
                var failKeys = [];
                var currentKey = null;

                function modifyItem(item, cursor, advance) {
                    currentKey = cursor.primaryKey;
                    var thisContext = {
                        primKey: cursor.primaryKey,
                        value: item,
                        onsuccess: null,
                        onerror: null
                    };

                    function onerror(e) {
                        failures.push(e);
                        failKeys.push(thisContext.primKey);
                        if (thisContext.onerror) Promise$1.newPSD(function () {
                            Promise$1.PSD.trans = trans;
                            thisContext.onerror(e);
                        });
                        checkFinished();
                        return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
                    }

                    if (modifyer.call(thisContext, item) !== false) {
                        // If a callback explicitely returns false, do not perform the update!
                        var bDelete = !thisContext.hasOwnProperty("value");
                        ++count;
                        miniTryCatch(function () {
                            var req = bDelete ? cursor.delete() : cursor.update(thisContext.value);
                            req.onerror = eventRejectHandler(onerror, bDelete ? ["deleting", item, "from", ctx.table.name] : ["modifying", item, "on", ctx.table.name]);
                            req.onsuccess = function (ev) {
                                if (thisContext.onsuccess) Promise$1.newPSD(function () {
                                    Promise$1.PSD.trans = trans;
                                    thisContext.onsuccess(thisContext.value);
                                });
                                ++successCount;
                                checkFinished();
                            };
                        }, onerror);
                    } else if (thisContext.onsuccess) {
                        // Hook will expect either onerror or onsuccess to always be called!
                        thisContext.onsuccess(thisContext.value);
                    }
                }

                function doReject(e) {
                    if (e) {
                        failures.push(e);
                        failKeys.push(currentKey);
                    }
                    return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
                }

                function checkFinished() {
                    if (iterationComplete && successCount + failures.length === count) {
                        if (failures.length > 0) doReject();else resolve(successCount);
                    }
                }
                self._iterate(modifyItem, function () {
                    iterationComplete = true;
                    checkFinished();
                }, doReject, idbstore);
            });
        },

        'delete': function _delete() {
            return this.modify(function () {
                delete this.value;
            });
        }
    });

    //
    //
    //
    // ------------------------- Help functions ---------------------------
    //
    //
    //

    function lowerVersionFirst(a, b) {
        return a._cfg.version - b._cfg.version;
    }

    function setApiOnPlace(objs, transactionPromiseFactory, tableNames, mode, dbschema, enableProhibitedDB) {
        tableNames.forEach(function (tableName) {
            var tableInstance = db._tableFactory(mode, dbschema[tableName], transactionPromiseFactory);
            objs.forEach(function (obj) {
                if (!obj[tableName]) {
                    if (enableProhibitedDB) {
                        Object.defineProperty(obj, tableName, {
                            configurable: true,
                            enumerable: true,
                            get: function get() {
                                var currentTrans = Promise$1.PSD && Promise$1.PSD.trans;
                                if (currentTrans && currentTrans.db === db) {
                                    return currentTrans.tables[tableName];
                                }
                                return tableInstance;
                            }
                        });
                    } else {
                        obj[tableName] = tableInstance;
                    }
                }
            });
        });
    }

    function removeTablesApi(objs) {
        objs.forEach(function (obj) {
            for (var key in obj) {
                if (obj[key] instanceof Table) delete obj[key];
            }
        });
    }

    function iterate(req, filter, fn, resolve, reject, readingHook) {
        var psd = Promise$1.PSD;
        readingHook = readingHook || mirror;
        if (!req.onerror) req.onerror = eventRejectHandler(reject);
        if (filter) {
            req.onsuccess = trycatch(function filter_record(e) {
                var cursor = req.result;
                if (cursor) {
                    var c = function c() {
                        cursor.continue();
                    };
                    if (filter(cursor, function (advancer) {
                        c = advancer;
                    }, resolve, reject)) fn(readingHook(cursor.value), cursor, function (advancer) {
                        c = advancer;
                    });
                    c();
                } else {
                    resolve();
                }
            }, reject, psd);
        } else {
            req.onsuccess = trycatch(function filter_record(e) {
                var cursor = req.result;
                if (cursor) {
                    var c = function c() {
                        cursor.continue();
                    };
                    fn(readingHook(cursor.value), cursor, function (advancer) {
                        c = advancer;
                    });
                    c();
                } else {
                    resolve();
                }
            }, reject, psd);
        }
    }

    function parseIndexSyntax(indexes) {
        /// <param name="indexes" type="String"></param>
        /// <returns type="Array" elementType="IndexSpec"></returns>
        var rv = [];
        indexes.split(',').forEach(function (index) {
            index = index.trim();
            var name = index.replace("&", "").replace("++", "").replace("*", "");
            var keyPath = name.indexOf('[') !== 0 ? name : index.substring(index.indexOf('[') + 1, index.indexOf(']')).split('+');

            rv.push(new IndexSpec(name, keyPath || null, index.indexOf('&') !== -1, index.indexOf('*') !== -1, index.indexOf("++") !== -1, isArray(keyPath), keyPath.indexOf('.') !== -1));
        });
        return rv;
    }

    function ascending(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    function descending(a, b) {
        return a < b ? 1 : a > b ? -1 : 0;
    }

    function compoundCompare(itemCompare) {
        return function (a, b) {
            var i = 0;
            while (true) {
                var result = itemCompare(a[i], b[i]);
                if (result !== 0) return result;
                ++i;
                if (i === a.length || i === b.length) return itemCompare(a.length, b.length);
            }
        };
    }

    function combine(filter1, filter2) {
        return filter1 ? filter2 ? function () {
            return filter1.apply(this, arguments) && filter2.apply(this, arguments);
        } : filter1 : filter2;
    }

    function hasIEDeleteObjectStoreBug() {
        // Assume bug is present in IE10 and IE11 but dont expect it in next version of IE (IE12)
        return navigator.userAgent.indexOf("Trident") >= 0 || navigator.userAgent.indexOf("MSIE") >= 0;
    }

    function readGlobalSchema() {
        db.verno = idbdb.version / 10;
        db._dbSchema = globalSchema = {};
        dbStoreNames = slice(idbdb.objectStoreNames, 0);
        if (dbStoreNames.length === 0) return; // Database contains no stores.
        var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
        dbStoreNames.forEach(function (storeName) {
            var store = trans.objectStore(storeName),
                keyPath = store.keyPath,
                dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
            var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
            var indexes = [];
            for (var j = 0; j < store.indexNames.length; ++j) {
                var idbindex = store.index(store.indexNames[j]);
                keyPath = idbindex.keyPath;
                dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
                indexes.push(index);
            }
            globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
        });
        setApiOnPlace([allTables], db._transPromiseFactory, keys(globalSchema), READWRITE, globalSchema);
    }

    function adjustToExistingIndexNames(schema, idbtrans) {
        /// <summary>
        /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
        /// </summary>
        /// <param name="schema" type="Object">Map between name and TableSchema</param>
        /// <param name="idbtrans" type="IDBTransaction"></param>
        var storeNames = idbtrans.db.objectStoreNames;
        for (var i = 0; i < storeNames.length; ++i) {
            var storeName = storeNames[i];
            var store = idbtrans.objectStore(storeName);
            for (var j = 0; j < store.indexNames.length; ++j) {
                var indexName = store.indexNames[j];
                var keyPath = store.index(indexName).keyPath;
                var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
                if (schema[storeName]) {
                    var indexSpec = schema[storeName].idxByName[dexieName];
                    if (indexSpec) indexSpec.name = indexName;
                }
            }
        }
    }

    _extend(this, {
        Collection: Collection,
        Table: Table,
        Transaction: Transaction,
        Version: Version,
        WhereClause: WhereClause,
        WriteableCollection: WriteableCollection,
        WriteableTable: WriteableTable
    });

    init();

    addons.forEach(function (fn) {
        fn(db);
    });
}

//
// Promise Class
//
// A variant of promise-light (https://github.com/taylorhakes/promise-light) by https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
//
// Modified by David Fahlander to be indexedDB compliant (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
// This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
// the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise. We fix this by using the member variable constructing to check
// whether the object is being constructed when reject or resolve is called. If so, the use setTimeout/setImmediate to fulfill the promise, otherwise, we know that it's not needed.
//
// This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45 and this implementation solves that issue.
//
// Another feature with this Promise implementation is that reject will return false in case no one catched the reject call. This is used
// to stopPropagation() on the IDBRequest error event in case it was catched but not otherwise.
//
// Also, the event new Promise().onuncatched is called in case no one catches a reject call. This is used for us to manually bubble any request
// errors to the transaction. We must not rely on IndexedDB implementation to do this, because it only does so when the source of the rejection
// is an error event on a request, not in case an ordinary exception is thrown.
var Promise$1 = function () {

    // The use of asap in handle() is remarked because we must NOT use setTimeout(fn,0) because it causes premature commit of indexedDB transactions - which is according to indexedDB specification.
    var _asap = global.setImmediate || function (fn) {
        var args = slice(arguments, 1);

        // If not FF13 and earlier failed, we could use this call here instead: setTimeout.call(this, [fn, 0].concat(arguments));
        setTimeout(function () {
            fn.apply(global, args);
        }, 0);
    };

    doFakeAutoComplete(function () {
        // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
        _asap = asap = enqueueImmediate = function enqueueImmediate(fn) {
            var args = arguments;setTimeout(function () {
                fn.apply(global, slice(args, 1));
            }, 0);
        };
    });

    var asap = _asap,
        isRootExecution = true;

    var operationsQueue = [];
    var tickFinalizers = [];
    function enqueueImmediate(fn, args) {
        operationsQueue.push([fn, slice(arguments, 1)]);
    }

    function executeOperationsQueue() {
        var queue = operationsQueue;
        operationsQueue = [];
        for (var i = 0, l = queue.length; i < l; ++i) {
            var item = queue[i];
            item[0].apply(global, item[1]);
        }
    }

    //var PromiseID = 0;
    function Promise(fn) {
        if (babelHelpers_typeof(this) !== 'object') throw new TypeError('Promises must be constructed via new');
        if (typeof fn !== 'function') throw new TypeError('not a function');
        this._state = null; // null (=pending), false (=rejected) or true (=resolved)
        this._value = null; // error or result
        this._deferreds = [];
        this._catched = false; // for onuncatched
        //this._id = ++PromiseID;
        var self = this;
        var constructing = true;
        this._PSD = Promise.PSD;

        try {
            doResolve(this, fn, function (data) {
                if (constructing) asap(resolve, self, data);else resolve(self, data);
            }, function (reason) {
                if (constructing) {
                    asap(reject, self, reason);
                    return false;
                } else {
                    return reject(self, reason);
                }
            });
        } finally {
            constructing = false;
        }
    }

    function handle(self, deferred) {
        if (self._state === null) {
            self._deferreds.push(deferred);
            return;
        }

        var cb = self._state ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
            // This Deferred doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
            return (self._state ? deferred.resolve : deferred.reject)(self._value);
        }
        var ret,
            isRootExec = isRootExecution;
        isRootExecution = false;
        asap = enqueueImmediate;
        try {
            var outerPSD = Promise.PSD;
            Promise.PSD = self._PSD;
            ret = cb(self._value);
            if (!self._state && (!ret || typeof ret.then !== 'function' || ret._state !== false)) setCatched(self); // Caller did 'return Promise.reject(err);' - don't regard it as catched!
            deferred.resolve(ret);
        } catch (e) {
            var catched = deferred.reject(e);
            if (!catched && self.onuncatched) {
                try {
                    self.onuncatched(e);
                } catch (e) {}
            }
        } finally {
            Promise.PSD = outerPSD;
            if (isRootExec) {
                do {
                    while (operationsQueue.length > 0) {
                        executeOperationsQueue();
                    }var finalizer = tickFinalizers.pop();
                    if (finalizer) try {
                        finalizer();
                    } catch (e) {}
                } while (tickFinalizers.length > 0 || operationsQueue.length > 0);
                asap = _asap;
                isRootExecution = true;
            }
        }
    }

    function _rootExec(fn) {
        var isRootExec = isRootExecution;
        isRootExecution = false;
        asap = enqueueImmediate;
        try {
            fn();
        } finally {
            if (isRootExec) {
                do {
                    while (operationsQueue.length > 0) {
                        executeOperationsQueue();
                    }var finalizer = tickFinalizers.pop();
                    if (finalizer) try {
                        finalizer();
                    } catch (e) {}
                } while (tickFinalizers.length > 0 || operationsQueue.length > 0);
                asap = _asap;
                isRootExecution = true;
            }
        }
    }

    function setCatched(promise) {
        promise._catched = true;
        if (promise._parent) setCatched(promise._parent);
    }

    function resolve(promise, newValue) {
        var outerPSD = Promise.PSD;
        Promise.PSD = promise._PSD;
        try {
            //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
            if (newValue === promise) throw new TypeError('A promise cannot be resolved with itself.');
            if (newValue && ((typeof newValue === 'undefined' ? 'undefined' : babelHelpers_typeof(newValue)) === 'object' || typeof newValue === 'function')) {
                if (typeof newValue.then === 'function') {
                    doResolve(promise, function (resolve, reject) {
                        //newValue instanceof Promise ? newValue._then(resolve, reject) : newValue.then(resolve, reject);
                        newValue.then(resolve, reject);
                    }, function (data) {
                        resolve(promise, data);
                    }, function (reason) {
                        reject(promise, reason);
                    });
                    return;
                }
            }
            promise._state = true;
            promise._value = newValue;
            finale.call(promise);
        } catch (e) {
            reject(e);
        } finally {
            Promise.PSD = outerPSD;
        }
    }

    function reject(promise, newValue) {
        var outerPSD = Promise.PSD;
        Promise.PSD = promise._PSD;
        promise._state = false;
        promise._value = newValue;

        finale.call(promise);
        if (!promise._catched) {
            try {
                if (promise.onuncatched) promise.onuncatched(promise._value);
                Promise.on.error.fire(promise._value);
            } catch (e) {}
        }
        Promise.PSD = outerPSD;
        return promise._catched;
    }

    function finale() {
        for (var i = 0, len = this._deferreds.length; i < len; i++) {
            handle(this, this._deferreds[i]);
        }
        this._deferreds = [];
    }

    function Deferred(onFulfilled, onRejected, resolve, reject) {
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
    function doResolve(promise, fn, onFulfilled, onRejected) {
        var done = false;
        try {
            fn(function Promise_resolve(value) {
                if (done) return;
                done = true;
                onFulfilled(value);
            }, function Promise_reject(reason) {
                if (done) return promise._catched;
                done = true;
                return onRejected(reason);
            });
        } catch (ex) {
            if (done) return;
            return onRejected(ex);
        }
    }

    Promise.on = events(null, "error");

    Promise.all = function () {
        var args = slice(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

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

    /* Prototype Methods */
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var self = this;
        var p = new Promise(function (resolve, reject) {
            if (self._state === null) handle(self, new Deferred(onFulfilled, onRejected, resolve, reject));else asap(handle, self, new Deferred(onFulfilled, onRejected, resolve, reject));
        });
        p._PSD = this._PSD;
        p.onuncatched = this.onuncatched; // Needed when exception occurs in a then() clause of a successful parent promise. Want onuncatched to be called even in callbacks of callbacks of the original promise.
        p._parent = this; // Used for recursively calling onuncatched event on self and all parents.
        return p;
    };

    Promise.prototype._then = function (onFulfilled, onRejected) {
        handle(this, new Deferred(onFulfilled, onRejected, nop, nop));
    };

    Promise.prototype['catch'] = function (onRejected) {
        if (arguments.length === 1) return this.then(null, onRejected);
        // First argument is the Error type to catch
        var type = arguments[0],
            callback = arguments[1];
        if (typeof type === 'function') return this.then(null, function (e) {
            // Catching errors by its constructor type (similar to java / c++ / c#)
            // Sample: promise.catch(TypeError, function (e) { ... });
            if (e instanceof type) return callback(e);else return Promise.reject(e);
        });else return this.then(null, function (e) {
            // Catching errors by the error.name property. Makes sense for indexedDB where error type
            // is always DOMError but where e.name tells the actual error type.
            // Sample: promise.catch('ConstraintError', function (e) { ... });
            if (e && e.name === type) return callback(e);else return Promise.reject(e);
        });
    };

    Promise.prototype['finally'] = function (onFinally) {
        return this.then(function (value) {
            onFinally();
            return value;
        }, function (err) {
            onFinally();
            return Promise.reject(err);
        });
    };

    Promise.prototype.onuncatched = null; // Optional event triggered if promise is rejected but no one listened.

    Promise.resolve = function (value) {
        if (value && typeof value.then === 'function') return value;
        var p = new Promise(function () {});
        p._state = true;
        p._value = value;
        return p;
    };

    Promise.reject = function (value) {
        var p = new Promise(function () {});
        p._state = false;
        p._value = value;
        return p;
    };

    Promise.race = function (values) {
        return new Promise(function (resolve, reject) {
            values.map(function (value) {
                value.then(resolve, reject);
            });
        });
    };

    Promise.PSD = null; // Promise Specific Data - a TLS Pattern (Thread Local Storage) for Promises. TODO: Rename Promise.PSD to Promise.data

    Promise.newPSD = function (fn) {
        // Create new PSD scope (Promise Specific Data)
        var outerScope = Promise.PSD;
        Promise.PSD = outerScope ? Object.create(outerScope) : {};
        try {
            return fn();
        } finally {
            Promise.PSD = outerScope;
        }
    };

    Promise._rootExec = _rootExec;
    Promise._tickFinalize = function (callback) {
        if (isRootExecution) throw new Error("Not in a virtual tick");
        tickFinalizers.push(callback);
    };

    return Promise;
}();

//
//
// ------ Exportable Help Functions -------
//
//

function nop() {}
function mirror(val) {
    return val;
}

function pureFunctionChain(f1, f2) {
    // Enables chained events that takes ONE argument and returns it to the next function in chain.
    // This pattern is used in the hook("reading") event.
    if (f1 === mirror) return f2;
    return function (val) {
        return f2(f1(val));
    };
}

function callBoth(on1, on2) {
    return function () {
        on1.apply(this, arguments);
        on2.apply(this, arguments);
    };
}

function hookCreatingChain(f1, f2) {
    // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
    // This pattern is used in the hook("creating") event.
    if (f1 === nop) return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res !== undefined) arguments[0] = res;
        var onsuccess = this.onsuccess,
            // In case event listener has set this.onsuccess
        onerror = this.onerror; // In case event listener has set this.onerror
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res2 !== undefined ? res2 : res;
    };
}

function hookUpdatingChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res !== undefined) _extend(arguments[0], res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
        var onsuccess = this.onsuccess,
            // In case event listener has set this.onsuccess
        onerror = this.onerror; // In case event listener has set this.onerror
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res === undefined ? res2 === undefined ? undefined : res2 : res2 === undefined ? res : _extend(res, res2);
    };
}

function stoppableEventChain(f1, f2) {
    // Enables chained events that may return false to stop the event chain.
    if (f1 === nop) return f2;
    return function () {
        if (f1.apply(this, arguments) === false) return false;
        return f2.apply(this, arguments);
    };
}

function reverseStoppableEventChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        if (f2.apply(this, arguments) === false) return false;
        return f1.apply(this, arguments);
    };
}

function nonStoppableEventChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        f1.apply(this, arguments);
        f2.apply(this, arguments);
    };
}

function promisableChain(f1, f2) {
    if (f1 === nop) return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res && typeof res.then === 'function') {
            var thiz = this,
                args = arguments;
            return res.then(function () {
                return f2.apply(thiz, args);
            });
        }
        return f2.apply(this, arguments);
    };
}

function events(ctx, eventNames) {
    var args = arguments;
    var evs = {};
    var rv = function rv(eventName, subscriber) {
        if (subscriber) {
            // Subscribe
            var args = slice(arguments, 1);
            var ev = evs[eventName];
            ev.subscribe.apply(ev, args);
            return ctx;
        } else if (typeof eventName === 'string') {
            // Return interface allowing to fire or unsubscribe from event
            return evs[eventName];
        }
    };
    rv.addEventType = add;

    function add(eventName, chainFunction, defaultFunction) {
        if (isArray(eventName)) return addEventGroup(eventName);
        if ((typeof eventName === 'undefined' ? 'undefined' : babelHelpers_typeof(eventName)) === 'object') return addConfiguredEvents(eventName);
        if (!chainFunction) chainFunction = stoppableEventChain;
        if (!defaultFunction) defaultFunction = nop;

        var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function subscribe(cb) {
                context.subscribers.push(cb);
                context.fire = chainFunction(context.fire, cb);
            },
            unsubscribe: function unsubscribe(cb) {
                context.subscribers = context.subscribers.filter(function (fn) {
                    return fn !== cb;
                });
                context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
        };
        evs[eventName] = rv[eventName] = context;
        return context;
    }

    function addConfiguredEvents(cfg) {
        // events(this, {reading: [functionChain, nop]});
        keys(cfg).forEach(function (eventName) {
            var args = cfg[eventName];
            if (isArray(args)) {
                add(eventName, cfg[eventName][0], cfg[eventName][1]);
            } else if (args === 'asap') {
                // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
                // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
                var context = add(eventName, null, function fire() {
                    var args = arguments;
                    context.subscribers.forEach(function (fn) {
                        asap(function fireEvent() {
                            fn.apply(global, args);
                        });
                    });
                });
                context.subscribe = function (fn) {
                    // Change how subscribe works to not replace the fire function but to just add the subscriber to subscribers
                    if (context.subscribers.indexOf(fn) === -1) context.subscribers.push(fn);
                };
                context.unsubscribe = function (fn) {
                    // Change how unsubscribe works for the same reason as above.
                    var idxOfFn = context.subscribers.indexOf(fn);
                    if (idxOfFn !== -1) context.subscribers.splice(idxOfFn, 1);
                };
            } else throw new Error("Invalid event config");
        });
    }

    function addEventGroup(eventGroup) {
        // promise-based event group (i.e. we promise to call one and only one of the events in the pair, and to only call it once.
        var done = false;
        eventGroup.forEach(function (name) {
            add(name).subscribe(checkDone);
        });
        function checkDone() {
            if (done) return false;
            done = true;
        }
    }

    for (var i = 1, l = args.length; i < l; ++i) {
        add(args[i]);
    }

    return rv;
}

function assert(b) {
    if (!b) throw new Error("Assertion failed");
}

function asap(fn) {
    if (global.setImmediate) setImmediate(fn);else setTimeout(fn, 0);
}

var fakeAutoComplete = function fakeAutoComplete() {}; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())
var fake = false; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())

function doFakeAutoComplete(fn) {
    var to = setTimeout(fn, 1000);
    clearTimeout(to);
}

function trycatch(fn, reject, psd) {
    return function () {
        var outerPSD = Promise$1.PSD; // Support Promise-specific data (PSD) in callback calls
        Promise$1.PSD = psd;
        try {
            fn.apply(this, arguments);
        } catch (e) {
            reject(e);
        } finally {
            Promise$1.PSD = outerPSD;
        }
    };
}

function miniTryCatch(fn, onerror) {
    try {
        fn();
    } catch (ex) {
        onerror(ex);
    }
}

function getByKeyPath(obj, keyPath) {
    // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
    if (obj.hasOwnProperty(keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
    if (!keyPath) return obj;
    if (typeof keyPath !== 'string') {
        var rv = [];
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            var val = getByKeyPath(obj, keyPath[i]);
            rv.push(val);
        }
        return rv;
    }
    var period = keyPath.indexOf('.');
    if (period !== -1) {
        var innerObj = obj[keyPath.substr(0, period)];
        return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
    }
    return undefined;
}

function setByKeyPath(obj, keyPath, value) {
    if (!obj || keyPath === undefined) return;
    if (typeof keyPath !== 'string' && 'length' in keyPath) {
        assert(typeof value !== 'string' && 'length' in value);
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            setByKeyPath(obj, keyPath[i], value[i]);
        }
    } else {
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var currentKeyPath = keyPath.substr(0, period);
            var remainingKeyPath = keyPath.substr(period + 1);
            if (remainingKeyPath === "") {
                if (value === undefined) delete obj[currentKeyPath];else obj[currentKeyPath] = value;
            } else {
                var innerObj = obj[currentKeyPath];
                if (!innerObj) innerObj = obj[currentKeyPath] = {};
                setByKeyPath(innerObj, remainingKeyPath, value);
            }
        } else {
            if (value === undefined) delete obj[keyPath];else obj[keyPath] = value;
        }
    }
}

function delByKeyPath(obj, keyPath) {
    if (typeof keyPath === 'string') setByKeyPath(obj, keyPath, undefined);else if ('length' in keyPath) [].map.call(keyPath, function (kp) {
        setByKeyPath(obj, kp, undefined);
    });
}

function shallowClone(obj) {
    var rv = {};
    for (var m in obj) {
        if (obj.hasOwnProperty(m)) rv[m] = obj[m];
    }
    return rv;
}

function deepClone(any) {
    if (!any || (typeof any === 'undefined' ? 'undefined' : babelHelpers_typeof(any)) !== 'object') return any;
    var rv;
    if (isArray(any)) {
        rv = [];
        for (var i = 0, l = any.length; i < l; ++i) {
            rv.push(deepClone(any[i]));
        }
    } else if (any instanceof Date) {
        rv = new Date();
        rv.setTime(any.getTime());
    } else {
        rv = any.constructor ? Object.create(any.constructor.prototype) : {};
        for (var prop in any) {
            if (any.hasOwnProperty(prop)) {
                rv[prop] = deepClone(any[prop]);
            }
        }
    }
    return rv;
}

function getObjectDiff(a, b) {
    // This is a simplified version that will always return keypaths on the root level.
    // If for example a and b differs by: (a.somePropsObject.x != b.somePropsObject.x), we will return that "somePropsObject" is changed
    // and not "somePropsObject.x". This is acceptable and true but could be optimized to support nestled changes if that would give a
    // big optimization benefit.
    var rv = {};
    for (var prop in a) {
        if (a.hasOwnProperty(prop)) {
            if (!b.hasOwnProperty(prop)) rv[prop] = undefined; // Property removed
            else if (a[prop] !== b[prop] && JSON.stringify(a[prop]) != JSON.stringify(b[prop])) rv[prop] = b[prop]; // Property changed
        }
    }for (var prop in b) {
        if (b.hasOwnProperty(prop) && !a.hasOwnProperty(prop)) {
            rv[prop] = b[prop]; // Property added
        }
    }return rv;
}

function parseType(type) {
    if (typeof type === 'function') {
        return new type();
    } else if (isArray(type)) {
        return [parseType(type[0])];
    } else if (type && (typeof type === 'undefined' ? 'undefined' : babelHelpers_typeof(type)) === 'object') {
        var rv = {};
        applyStructure(rv, type);
        return rv;
    } else {
        return type;
    }
}

function applyStructure(obj, structure) {
    keys(structure).forEach(function (member) {
        var value = parseType(structure[member]);
        obj[member] = value;
    });
}

function eventRejectHandler(reject, sentance) {
    return function (event) {
        var errObj = event && event.target.error || new Error();
        if (sentance) {
            var occurredWhen = " occurred when " + sentance.map(function (word) {
                switch (typeof word === 'undefined' ? 'undefined' : babelHelpers_typeof(word)) {
                    case 'function':
                        return word();
                    case 'string':
                        return word;
                    default:
                        return JSON.stringify(word);
                }
            }).join(" ");
            if (errObj.name) {
                errObj.toString = function toString() {
                    return errObj.name + occurredWhen + (errObj.message ? ". " + errObj.message : "");
                    // Code below works for stacked exceptions, BUT! stack is never present in event errors (not in any of the browsers). So it's no use to include it!
                    /*delete this.toString; // Prohibiting endless recursiveness in IE.
                    if (errObj.stack) rv += (errObj.stack ? ". Stack: " + errObj.stack : "");
                    this.toString = toString;
                    return rv;*/
                };
            } else {
                    errObj = errObj + occurredWhen;
                }
        };
        reject(errObj);

        if (event) {
            // Old versions of IndexedDBShim doesnt provide an error event
            // Stop error from propagating to IDBTransaction. Let us handle that manually instead.
            if (event.stopPropagation) // IndexedDBShim doesnt support this
                event.stopPropagation();
            if (event.preventDefault) // IndexedDBShim doesnt support this
                event.preventDefault();
        }

        return false;
    };
}

function stack(error) {
    try {
        throw error;
    } catch (e) {
        return e;
    }
}
function preventDefault(e) {
    e.preventDefault();
}

function globalDatabaseList(cb) {
    var val,
        localStorage = Dexie.dependencies.localStorage;
    if (!localStorage) return cb([]); // Envs without localStorage support
    try {
        val = JSON.parse(localStorage.getItem('Dexie.DatabaseNames') || "[]");
    } catch (e) {
        val = [];
    }
    if (cb(val)) {
        localStorage.setItem('Dexie.DatabaseNames', JSON.stringify(val));
    }
}

//
// IndexSpec struct
//
function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
    /// <param name="name" type="String"></param>
    /// <param name="keyPath" type="String"></param>
    /// <param name="unique" type="Boolean"></param>
    /// <param name="multi" type="Boolean"></param>
    /// <param name="auto" type="Boolean"></param>
    /// <param name="compound" type="Boolean"></param>
    /// <param name="dotted" type="Boolean"></param>
    this.name = name;
    this.keyPath = keyPath;
    this.unique = unique;
    this.multi = multi;
    this.auto = auto;
    this.compound = compound;
    this.dotted = dotted;
    var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && '[' + [].join.call(keyPath, '+') + ']';
    this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
}

//
// TableSchema struct
//
function TableSchema(name, primKey, indexes, instanceTemplate) {
    /// <param name="name" type="String"></param>
    /// <param name="primKey" type="IndexSpec"></param>
    /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
    /// <param name="instanceTemplate" type="Object"></param>
    this.name = name;
    this.primKey = primKey || new IndexSpec();
    this.indexes = indexes || [new IndexSpec()];
    this.instanceTemplate = instanceTemplate;
    this.mappedClass = null;
    this.idxByName = indexes.reduce(function (hashSet, index) {
        hashSet[index.name] = index;
        return hashSet;
    }, {});
}

//
// ModifyError Class (extends Error)
//
function ModifyError(msg, failures, successCount, failedKeys) {
    this.name = "ModifyError";
    this.failures = failures;
    this.failedKeys = failedKeys;
    this.successCount = successCount;
    this.message = failures.join('\n');
}
derive(ModifyError).from(Error);

//
// Static delete() method.
//
Dexie.delete = function (databaseName) {
    var db = new Dexie(databaseName),
        promise = db.delete();
    promise.onblocked = function (fn) {
        db.on("blocked", fn);
        return this;
    };
    return promise;
};

//
// Static exists() method.
//
Dexie.exists = function (name) {
    return new Dexie(name).open().then(function (db) {
        db.close();
        return true;
    }, function () {
        return false;
    });
};

//
// Static method for retrieving a list of all existing databases at current host.
//
Dexie.getDatabaseNames = function (cb) {
    return new Promise$1(function (resolve, reject) {
        var getDatabaseNames = getNativeGetDatabaseNamesFn();
        if (getDatabaseNames) {
            // In case getDatabaseNames() becomes standard, let's prepare to support it:
            var req = getDatabaseNames();
            req.onsuccess = function (event) {
                resolve(slice(event.target.result, 0)); // Converst DOMStringList to Array<String>
            };
            req.onerror = eventRejectHandler(reject);
        } else {
            globalDatabaseList(function (val) {
                resolve(val);
                return false;
            });
        }
    }).then(cb);
};

Dexie.defineClass = function (structure) {
    /// <summary>
    ///     Create a javascript constructor based on given template for which properties to expect in the class.
    ///     Any property that is a constructor function will act as a type. So {name: String} will be equal to {name: new String()}.
    /// </summary>
    /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
    /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>

    // Default constructor able to copy given properties into this object.
    function Class(properties) {
        /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
        /// </param>
        properties ? _extend(this, properties) : fake && applyStructure(this, structure);
    }
    return Class;
};

Dexie.ignoreTransaction = function (scopeFunc) {
    // In case caller is within a transaction but needs to create a separate transaction.
    // Example of usage:
    //
    // Let's say we have a logger function in our app. Other application-logic should be unaware of the
    // logger function and not need to include the 'logentries' table in all transaction it performs.
    // The logging should always be done in a separate transaction and not be dependant on the current
    // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
    //
    //     Dexie.ignoreTransaction(function() {
    //         db.logentries.add(newLogEntry);
    //     });
    //
    // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
    // in current Promise-scope.
    //
    // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
    // API for this because
    //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
    //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
    //  3) setImmediate() is not supported in the ES standard.
    return Promise$1.newPSD(function () {
        Promise$1.PSD.trans = null;
        return scopeFunc();
    });
};
Dexie.spawn = function () {
    if (global.console) console.warn("Dexie.spawn() is deprecated. Use Dexie.ignoreTransaction() instead.");
    return Dexie.ignoreTransaction.apply(this, arguments);
};

Dexie.vip = function (fn) {
    // To be used by subscribers to the on('ready') event.
    // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
    // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
    // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
    // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
    // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
    // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
    // the caller will not resolve until database is opened.
    return Promise$1.newPSD(function () {
        Promise$1.PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
        return fn();
    });
};

// Dexie.currentTransaction property. Only applicable for transactions entered using the new "transact()" method.
Object.defineProperty(Dexie, "currentTransaction", {
    get: function get() {
        /// <returns type="Transaction"></returns>
        return Promise$1.PSD && Promise$1.PSD.trans || null;
    }
});

function safariMultiStoreFix(storeNames) {
    return storeNames.length === 1 ? storeNames[0] : storeNames;
}

// Export our Promise implementation since it can be handy as a standalone Promise implementation
Dexie.Promise = Promise$1;
// Export our derive/extend/override methodology
Dexie.derive = derive;
Dexie.extend = _extend;
Dexie.override = override;
// Export our events() function - can be handy as a toolkit
Dexie.events = events;
Dexie.getByKeyPath = getByKeyPath;
Dexie.setByKeyPath = setByKeyPath;
Dexie.delByKeyPath = delByKeyPath;
Dexie.shallowClone = shallowClone;
Dexie.deepClone = deepClone;
Dexie.addons = [];
Dexie.fakeAutoComplete = fakeAutoComplete;
Dexie.asap = asap;
// Export our static classes
Dexie.ModifyError = ModifyError;
Dexie.MultiModifyError = ModifyError; // Backward compatibility pre 0.9.8
Dexie.IndexSpec = IndexSpec;
Dexie.TableSchema = TableSchema;
//
// Dependencies
//
// These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
//
// In node.js, however, these properties must be set "manually" before instansiating a new Dexie(). For node.js, you need to require indexeddb-js or similar and then set these deps.
//
var idbshim = global.idbModules && global.idbModules.shimIndexedDB ? global.idbModules : {};
Dexie.dependencies = {
    // Required:
    // NOTE: The "_"-prefixed versions are for prioritizing IDB-shim on IOS8 before the native IDB in case the shim was included.
    indexedDB: idbshim.shimIndexedDB || global.indexedDB || global.mozIndexedDB || global.webkitIndexedDB || global.msIndexedDB,
    IDBKeyRange: idbshim.IDBKeyRange || global.IDBKeyRange || global.webkitIDBKeyRange,
    IDBTransaction: idbshim.IDBTransaction || global.IDBTransaction || global.webkitIDBTransaction,
    // Optional:
    Error: global.Error || String,
    SyntaxError: global.SyntaxError || String,
    TypeError: global.TypeError || String,
    DOMError: global.DOMError || String,
    localStorage: (typeof chrome !== "undefined" && chrome !== null ? chrome.storage : void 0) != null ? null : global.localStorage
};

// API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
Dexie.semVer = "1.3.0";
Dexie.version = Dexie.semVer.split('.').map(function (n) {
    return parseInt(n);
}).reduce(function (p, c, i) {
    return p + c / Math.pow(10, i * 2);
});

function getNativeGetDatabaseNamesFn() {
    var indexedDB = Dexie.dependencies.indexedDB;
    var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
    return fn && fn.bind(indexedDB);
}

// Fool IDE to improve autocomplete. Tested with Visual Studio 2013 and 2015.
doFakeAutoComplete(function () {
    Dexie.fakeAutoComplete = fakeAutoComplete = doFakeAutoComplete;
    Dexie.fake = fake = true;
});

var levenshtein = __commonjs(function (module) {
  (function () {
    'use strict';

    /**
     * Extend an Object with another Object's properties.
     *
     * The source objects are specified as additional arguments.
     *
     * @param dst Object the object to extend.
     *
     * @return Object the final object.
     */

    var _extend = function _extend(dst) {
      var sources = Array.prototype.slice.call(arguments, 1);
      for (var i = 0; i < sources.length; ++i) {
        var src = sources[i];
        for (var p in src) {
          if (src.hasOwnProperty(p)) dst[p] = src[p];
        }
      }
      return dst;
    };

    /**
     * Based on the algorithm at http://en.wikipedia.org/wiki/Levenshtein_distance.
     */
    var Levenshtein = {
      /**
       * Calculate levenshtein distance of the two strings.
       *
       * @param str1 String the first string.
       * @param str2 String the second string.
       * @return Integer the levenshtein distance (0 and above).
       */
      get: function get(str1, str2) {
        // base cases
        if (str1 === str2) return 0;
        if (str1.length === 0) return str2.length;
        if (str2.length === 0) return str1.length;

        // two rows
        var prevRow = new Array(str2.length + 1),
            curCol,
            nextCol,
            i,
            j,
            tmp;

        // initialise previous row
        for (i = 0; i < prevRow.length; ++i) {
          prevRow[i] = i;
        }

        // calculate current row distance from previous row
        for (i = 0; i < str1.length; ++i) {
          nextCol = i + 1;

          for (j = 0; j < str2.length; ++j) {
            curCol = nextCol;

            // substution
            nextCol = prevRow[j] + (str1.charAt(i) === str2.charAt(j) ? 0 : 1);
            // insertion
            tmp = curCol + 1;
            if (nextCol > tmp) {
              nextCol = tmp;
            }
            // deletion
            tmp = prevRow[j + 1] + 1;
            if (nextCol > tmp) {
              nextCol = tmp;
            }

            // copy current col value into previous (in preparation for next iteration)
            prevRow[j] = curCol;
          }

          // copy last col value into previous (in preparation for next iteration)
          prevRow[j] = nextCol;
        }

        return nextCol;
      },

      /**
       * Asynchronously calculate levenshtein distance of the two strings.
       *
       * @param str1 String the first string.
       * @param str2 String the second string.
       * @param cb Function callback function with signature: function(Error err, int distance)
       * @param [options] Object additional options.
       * @param [options.progress] Function progress callback with signature: function(percentComplete)
       */
      getAsync: function getAsync(str1, str2, cb, options) {
        options = _extend({}, {
          progress: null
        }, options);

        // base cases
        if (str1 === str2) return cb(null, 0);
        if (str1.length === 0) return cb(null, str2.length);
        if (str2.length === 0) return cb(null, str1.length);

        // two rows
        var prevRow = new Array(str2.length + 1),
            curCol,
            nextCol,
            i,
            j,
            tmp,
            startTime,
            currentTime;

        // initialise previous row
        for (i = 0; i < prevRow.length; ++i) {
          prevRow[i] = i;
        }

        nextCol = 1;
        i = 0;
        j = -1;

        var __calculate = function __calculate() {
          // reset timer
          startTime = new Date().valueOf();
          currentTime = startTime;

          // keep going until one second has elapsed
          while (currentTime - startTime < 1000) {
            // reached end of current row?
            if (str2.length <= ++j) {
              // copy current into previous (in preparation for next iteration)
              prevRow[j] = nextCol;

              // if already done all chars
              if (str1.length <= ++i) {
                return cb(null, nextCol);
              }
              // else if we have more left to do
              else {
                  nextCol = i + 1;
                  j = 0;
                }
            }

            // calculation
            curCol = nextCol;

            // substution
            nextCol = prevRow[j] + (str1.charAt(i) === str2.charAt(j) ? 0 : 1);
            // insertion
            tmp = curCol + 1;
            if (nextCol > tmp) {
              nextCol = tmp;
            }
            // deletion
            tmp = prevRow[j + 1] + 1;
            if (nextCol > tmp) {
              nextCol = tmp;
            }

            // copy current into previous (in preparation for next iteration)
            prevRow[j] = curCol;

            // get current time
            currentTime = new Date().valueOf();
          }

          // send a progress update?
          if (null !== options.progress) {
            try {
              options.progress.call(null, i * 100.0 / str1.length);
            } catch (err) {
              return cb('Progress callback: ' + err.toString());
            }
          }

          // next iteration
          setTimeout(__calculate(), 0);
        };

        __calculate();
      }

    };

    // amd
    if (typeof define !== "undefined" && define !== null && define.amd) {
      define(function () {
        return Levenshtein;
      });
    }
    // commonjs
    else if (typeof module !== "undefined" && module !== null) {
        module.exports = Levenshtein;
      }
      // web worker
      else if (typeof self !== "undefined" && typeof self.postMessage === 'function' && typeof self.importScripts === 'function') {
          self.Levenshtein = Levenshtein;
        }
        // browser main thread
        else if (typeof window !== "undefined" && window !== null) {
            window.Levenshtein = Levenshtein;
          }
  })();
});

var Levenshtein = levenshtein && (typeof levenshtein === 'undefined' ? 'undefined' : babelHelpers_typeof(levenshtein)) === 'object' && 'default' in levenshtein ? levenshtein['default'] : levenshtein;

function ajax(url, data, callback, type, progressCallback) {
  return new Promise(function (resolve, reject) {
    var data_array, data_string, idx, req, value;
    if (data == null) {
      data = {};
    }
    if (callback == null) {
      callback = function callback() {};
    }
    if (type == null) {
      //default to a GET request
      type = 'GET';
    }
    data_array = [];
    for (idx in data) {
      value = data[idx];
      data_array.push("" + idx + "=" + value);
    }
    data_string = data_array.join("&");
    req = new XMLHttpRequest();
    req.onprogress = progressCallback;
    req.open(type, url, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        if (/\.json$/.test(url)) {
          resolve(JSON.parse(req.responseText));
        } else {
          resolve(req.responseText);
        }
      } else {
        reject({
          status: this.status,
          statusText: this.statusText
        });
      }
    };
    req.onerror = function () {
      reject({
        status: this.status,
        statusText: this.statusText
      });
    };

    req.send(data_string);
    return req;
  });
}

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

var require$$1$2 = index$1 && (typeof index$1 === 'undefined' ? 'undefined' : babelHelpers_typeof(index$1)) === 'object' && 'default' in index$1 ? index$1['default'] : index$1;

var polyfill = __commonjs(function (module) {
	'use strict';

	var d = require$$1$2,
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

var asap$1 = __commonjs(function (module) {
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

var require$$0$4 = asap$1 && (typeof asap$1 === "undefined" ? "undefined" : babelHelpers_typeof(asap$1)) === 'object' && 'default' in asap$1 ? asap$1['default'] : asap$1;

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

var require$$1$1 = es6Extensions && (typeof es6Extensions === 'undefined' ? 'undefined' : babelHelpers_typeof(es6Extensions)) === 'object' && 'default' in es6Extensions ? es6Extensions['default'] : es6Extensions;

var runtime = __commonjs(function (module, exports, global) {
  var g = (typeof global === 'undefined' ? 'undefined' : babelHelpers_typeof(global)) === "object" ? global : (typeof window === 'undefined' ? 'undefined' : babelHelpers_typeof(window)) === "object" ? window : this;
  var Promise = g.Promise || require$$1$1;
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

var pi = { conjugate: conjugate, sanitizeTerm: sanitizeTerm, charRex: charRex };

var data = [';;', '<≮', '=≠', '>≯', '``', 'aàáâãäåāăąǎǟǡǻȁȃȧḁạảấầẩẫậắằẳẵặ', 'bḃḅḇ', 'cçćĉċčḉ', 'dďḋḍḏḑḓ', 'eèéêëēĕėęěȅȇȩḕḗḙḛḝẹẻẽếềểễệ', 'fḟ', 'gĝğġģǧǵḡ', 'hĥȟḣḥḧḩḫẖ', 'iìíîïĩīĭįǐȉȋḭḯỉị', 'jĵǰ', 'kķǩḱḳḵ', 'lĺļľḷḹḻḽ', 'mḿṁṃ', 'nñńņňǹṅṇṉṋ', 'oòóôõöōŏőơǒǫǭȍȏȫȭȯȱṍṏṑṓọỏốồổỗộớờởỡợ', 'pṕṗ', 'rŕŗřȑȓṙṛṝṟ', 'sśŝşšșṡṣṥṧṩ', 'tţťțṫṭṯṱẗ', 'uùúûüũūŭůűųưǔǖǘǚǜȕȗṳṵṷṹṻụủứừửữự', 'vṽṿ', 'wŵẁẃẅẇẉẘ', 'xẋẍ', 'yýÿŷȳẏẙỳỵỷỹ', 'zźżžẑẓẕ',
//The below were added manually.
'-–—', '"“”', '\'‘’'];
var asciifyMap = {};
var unifyMap = {};
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var chars = _step.value;

        var asciiChar = chars[0],
            asciiCharUpper = asciiChar.toUpperCase();

        for (var i = chars.length - 1; i >= 1; i--) {
            var char = chars[i];
            asciifyMap[char] = asciiChar;
            asciifyMap[char.toUpperCase()] = asciiCharUpper;
        }
        unifyMap[asciiChar] = chars.slice(1);
        unifyMap[asciiChar] = unifyMap[asciiChar].toUpperCase();
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

function asciify(string, defaultChar) {
    if (defaultChar === undefined) defaultChar = '';
    return string.replace(/[\u007f-\uffff]/g, function (t) {
        return asciifyMap[t] || defaultChar;
    });
}

var start = Date.now();

var db = null;

// Will be populated upon initialization
var settings = {};

var initDexie = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee(dbname, dataFile, glossaryFile) {
    var count, loadGlossaryPromise, dataPromise, data;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            Dexie.Promise.on('error', function (error) {
              console.error("Uncaught error: ", error);
            });
            self.postMessage({ 'progress': 'opening database' });
            db = new Dexie(dbname);
            db.version(1).stores({
              entries: 'term',
              meta: 'key',
              user: 'key',
              glossary: 'id,*term,*origin'
            });

            _context.next = 6;
            return db.on('ready');

          case 6:
            _context.next = 8;
            return db.meta.count();

          case 8:
            count = _context.sent;

            if (!(count == 0)) {
              _context.next = 20;
              break;
            }

            loadGlossaryPromise = loadGlossaryFile(glossaryFile); //Not await on purpose - run in parallel

            self.postMessage({ 'progress': 'fetching data' });
            dataPromise = ajax(dataFile, {}, null, 'GET', sendDownloadProgress);
            _context.next = 15;
            return dataPromise;

          case 15:
            data = _context.sent;
            _context.next = 18;
            return populateDatabase(db, data);

          case 18:
            _context.next = 20;
            return loadGlossaryPromise;

          case 20:
            self.postMessage({ 'progress': 'ready' });

          case 21:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return function initDexie(_x, _x2, _x3) {
    return ref.apply(this, arguments);
  };
}();

function sendDownloadProgress(e) {
  self.postMessage({ progress: 'downloaded ' + Math.ceil(e.loaded / 1000000) + 'MB' });
}

var loadGlossaryFile = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee2(glossaryFile) {
    var data;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return ajax(glossaryFile, {}, null, 'GET');

          case 2:
            data = _context2.sent;
            _context2.next = 5;
            return loadGlossaryData(data);

          case 5:
            return _context2.abrupt('return', { 'status': 'success' });

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return function loadGlossaryFile(_x4) {
    return ref.apply(this, arguments);
  };
}();

function makeGlossaryEntryId(entry) {
  return [entry.term, entry.context, entry.origin].join('-');
}

var loadGlossaryData = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee3(data) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return removeGlossaryEntries({ origin: 'system' });

          case 2:
            _context3.next = 4;
            return db.transaction('rw', db.glossary, function () {
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var _step$value = babelHelpers_slicedToArray(_step.value, 3);

                  var term = _step$value[0];
                  var gloss = _step$value[1];
                  var context = _step$value[2];

                  term = term.toLowerCase();
                  var origin = 'system';
                  var comment = "";
                  var id = makeGlossaryEntryId({ term: term, context: context, origin: origin });
                  db.glossary.put({ id: id, term: term, gloss: gloss, context: context, origin: origin, comment: comment });
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
            });

          case 4:
            self.postMessage('Glossary Data Loaded');
            return _context3.abrupt('return', { 'status': 'success' });

          case 6:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return function loadGlossaryData(_x5) {
    return ref.apply(this, arguments);
  };
}();

var addGlossaryEntry = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee4(entry) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (entry.term) {
              _context4.next = 2;
              break;
            }

            throw new ValueError('Entry has no term: ' + JSON.stringify(entry));

          case 2:
            entry.id = makeGlossaryEntryId(entry);
            _context4.next = 5;
            return db.glossary.put(entry);

          case 5:
            return _context4.abrupt('return', { 'status': 'success' });

          case 6:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));
  return function addGlossaryEntry(_x6) {
    return ref.apply(this, arguments);
  };
}();

var addGlossaryEntries = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee5(_ref) {
    var entries = _ref.entries;
    var origin = _ref.origin;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!origin) {
              origin = 'user';
            }
            _context5.next = 3;
            return db.transaction('rw', db.glossary, function () {
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = entries[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  entry = _step2.value;

                  if (!entry.origin) {
                    entry.origin = origin;
                  }
                  entry.id = makeGlossaryEntryId(entry);
                  db.glossary.put(entry);
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
            });

          case 3:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));
  return function addGlossaryEntries(_x7) {
    return ref.apply(this, arguments);
  };
}();

var removeGlossaryEntries = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee6(_ref2) {
    var origin = _ref2.origin;
    var deletedCount;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            console.log('removing entries');
            deletedCount = 0;
            _context6.next = 4;
            return db.transaction('rw', db.glossary, function () {
              db.glossary.where('origin').equals(origin).each(function (entry) {
                console.log('deleting entry', entry);
                db.glossary.delete(entry.id);
                deletedCount += 1;
              });
            });

          case 4:
            return _context6.abrupt('return', { deletedCount: deletedCount });

          case 5:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));
  return function removeGlossaryEntries(_x8) {
    return ref.apply(this, arguments);
  };
}();

var getGlossaryEntries = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee7(_ref3) {
    var term = _ref3.term;
    var terms = _ref3.terms;
    var origin = _ref3.origin;

    var conjugated, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _term, _result, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _term2, count, clauses, matches, conjugatedMatches;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (term) {
              terms = [term];
            }

            terms = terms.map(function (term) {
              return term.toLowerCase();
            });
            conjugated = [];

            if (!(settings.fromLang == 'pi')) {
              _context7.next = 45;
              break;
            }

            conjugated = [];
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context7.prev = 8;
            for (_iterator3 = terms[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              _term = _step3.value;
              _result = pi.conjugate(_term);

              conjugated = conjugated.concat(_result);
            }
            _context7.next = 16;
            break;

          case 12:
            _context7.prev = 12;
            _context7.t0 = _context7['catch'](8);
            _didIteratorError3 = true;
            _iteratorError3 = _context7.t0;

          case 16:
            _context7.prev = 16;
            _context7.prev = 17;

            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }

          case 19:
            _context7.prev = 19;

            if (!_didIteratorError3) {
              _context7.next = 22;
              break;
            }

            throw _iteratorError3;

          case 22:
            return _context7.finish(19);

          case 23:
            return _context7.finish(16);

          case 24:
            conjugated = new Set(conjugated);
            _iteratorNormalCompletion4 = true;
            _didIteratorError4 = false;
            _iteratorError4 = undefined;
            _context7.prev = 28;
            for (_iterator4 = terms[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              _term2 = _step4.value;

              conjugated.delete(_term2);
            }
            _context7.next = 36;
            break;

          case 32:
            _context7.prev = 32;
            _context7.t1 = _context7['catch'](28);
            _didIteratorError4 = true;
            _iteratorError4 = _context7.t1;

          case 36:
            _context7.prev = 36;
            _context7.prev = 37;

            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }

          case 39:
            _context7.prev = 39;

            if (!_didIteratorError4) {
              _context7.next = 42;
              break;
            }

            throw _iteratorError4;

          case 42:
            return _context7.finish(39);

          case 43:
            return _context7.finish(36);

          case 44:
            conjugated = [].concat(babelHelpers_toConsumableArray(conjugated));

          case 45:
            _context7.next = 47;
            return db.glossary.count();

          case 47:
            count = _context7.sent;

            //console.log(`Glossary has ${count} entries`);
            //console.log(`Searching glossary for ${JSON.stringify({terms, conjugated})}`);
            clauses = db.glossary.where('term').anyOf(terms);

            if (origin) {
              clauses = clauses.where('origin').equals(origin);
            }
            _context7.next = 52;
            return clauses.toArray();

          case 52:
            matches = _context7.sent;
            _context7.next = 55;
            return db.glossary.where('term').anyOf(conjugated).toArray();

          case 55:
            conjugatedMatches = _context7.sent;

            // Exact matches come first, followed by
            out = [].concat(babelHelpers_toConsumableArray(matches), babelHelpers_toConsumableArray(conjugatedMatches));
            //console.log({matches, conjugatedMatches, out});
            return _context7.abrupt('return', [].concat(babelHelpers_toConsumableArray(matches), babelHelpers_toConsumableArray(conjugatedMatches)));

          case 58:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this, [[8, 12, 16, 24], [17,, 19, 23], [28, 32, 36, 44], [37,, 39, 43]]);
  }));
  return function getGlossaryEntries(_x9) {
    return ref.apply(this, arguments);
  };
}();

var getAllGlossaryEntries = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee8(_ref4) {
    var origin = _ref4.origin;
    var result;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return db.glossary.where('origin').equals(origin).toArray();

          case 2:
            result = _context8.sent;
            return _context8.abrupt('return', result);

          case 4:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));
  return function getAllGlossaryEntries(_x10) {
    return ref.apply(this, arguments);
  };
}();

var populateDatabase = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee9(db, data) {
    var offset, chunkSize, chunks, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, terms, termsFolded, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, term, folded;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            offset = 0, chunkSize = Math.floor(1 + data.length / 100), chunks = [];

            while (offset < data.length) {
              chunks.push(data.slice(offset, offset + chunkSize));
              offset += chunkSize;
            }

            _iteratorNormalCompletion5 = true;
            _didIteratorError5 = false;
            _iteratorError5 = undefined;
            _context9.prev = 5;
            _iterator5 = chunks[Symbol.iterator]();

          case 7:
            if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
              _context9.next = 15;
              break;
            }

            chunk = _step5.value;

            self.postMessage({ 'progress': 'initializing: ' + chunk[0].term + '…' });
            _context9.next = 12;
            return db.transaction('rw', db.entries, function () {
              chunk.forEach(function (entry) {
                db.entries.put(entry);
              });
            });

          case 12:
            _iteratorNormalCompletion5 = true;
            _context9.next = 7;
            break;

          case 15:
            _context9.next = 21;
            break;

          case 17:
            _context9.prev = 17;
            _context9.t0 = _context9['catch'](5);
            _didIteratorError5 = true;
            _iteratorError5 = _context9.t0;

          case 21:
            _context9.prev = 21;
            _context9.prev = 22;

            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }

          case 24:
            _context9.prev = 24;

            if (!_didIteratorError5) {
              _context9.next = 27;
              break;
            }

            throw _iteratorError5;

          case 27:
            return _context9.finish(24);

          case 28:
            return _context9.finish(21);

          case 29:
            terms = new Set(data.map(function (entry) {
              return entry.term;
            }));
            termsFolded = new Map();
            _iteratorNormalCompletion6 = true;
            _didIteratorError6 = false;
            _iteratorError6 = undefined;
            _context9.prev = 34;

            for (_iterator6 = terms[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              term = _step6.value;
              folded = asciify(term);

              if (termsFolded.has(folded)) {
                termsFolded.get(folded).push(term);
              } else {
                termsFolded.set(folded, [term]);
              }
            }
            _context9.next = 42;
            break;

          case 38:
            _context9.prev = 38;
            _context9.t1 = _context9['catch'](34);
            _didIteratorError6 = true;
            _iteratorError6 = _context9.t1;

          case 42:
            _context9.prev = 42;
            _context9.prev = 43;

            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }

          case 45:
            _context9.prev = 45;

            if (!_didIteratorError6) {
              _context9.next = 48;
              break;
            }

            throw _iteratorError6;

          case 48:
            return _context9.finish(45);

          case 49:
            return _context9.finish(42);

          case 50:
            _context9.next = 52;
            return db.transaction('rw', db.meta, function () {
              db.meta.put({ key: 'terms', value: terms });
              db.meta.put({ key: 'termsFolded', value: termsFolded });
              db.meta.put({ key: 'ready' });
            });

          case 52:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this, [[5, 17, 21, 29], [22,, 24, 28], [34, 38, 42, 50], [43,, 45, 49]]);
  }));
  return function populateDatabase(_x11, _x12) {
    return ref.apply(this, arguments);
  };
}();

var _cache = {};

var getTerms = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
    var req;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!(_cache._terms === undefined)) {
              _context10.next = 5;
              break;
            }

            _context10.next = 3;
            return db.meta.get('terms');

          case 3:
            req = _context10.sent;

            _cache._terms = req.value;

          case 5:
            return _context10.abrupt('return', _cache._terms);

          case 6:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));
  return function getTerms() {
    return ref.apply(this, arguments);
  };
}();

var getTermsFolded = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
    var _req;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (!(_cache._foldedTerms === undefined)) {
              _context11.next = 5;
              break;
            }

            _context11.next = 3;
            return db.meta.get('termsFolded');

          case 3:
            _req = _context11.sent;

            _cache._foldedTerms = _req.value;

          case 5:
            return _context11.abrupt('return', _cache._foldedTerms);

          case 6:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));
  return function getTermsFolded() {
    return ref.apply(this, arguments);
  };
}();

var getTermBodies = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee12(terms) {
    var results;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            terms = [].concat(babelHelpers_toConsumableArray(terms));
            _context12.next = 3;
            return db.entries.where('term').anyOf(terms).toArray();

          case 3:
            results = _context12.sent;
            return _context12.abrupt('return', results);

          case 5:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));
  return function getTermBodies(_x13) {
    return ref.apply(this, arguments);
  };
}();

var getEntry = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee13(_ref5) {
    var term = _ref5.term;
    var results;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return getTermBodies([term]);

          case 2:
            results = _context13.sent;

            if (!results.length) {
              _context13.next = 5;
              break;
            }

            return _context13.abrupt('return', results[0]);

          case 5:
            return _context13.abrupt('return', null);

          case 6:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));
  return function getEntry(_x14) {
    return ref.apply(this, arguments);
  };
}();

var getAndRankMatches = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee14(_ref6) {
    var term = _ref6.term;
    var terms = _ref6.terms;
    var priorityTerms = _ref6.priorityTerms;
    var indeclinables = _ref6.indeclinables;
    var conjugated = _ref6.conjugated;
    var excludeFuzzy = _ref6.excludeFuzzy;

    var _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _term3, _result2, matchingTerms, matchingTermsIndeclinable, matchingTermsFolded, matchingTermsConjugated, matchingTermsConjugatedFolded, matchingTermsFuzzy, allMatchingTerms, scores, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, score, priorityTermsIndex, fuzzyDistance, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, results, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9;

    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            if (!terms && term) {
              terms = [term];
            }

            if (!(!conjugated && settings.fromLang == 'pi')) {
              _context14.next = 23;
              break;
            }

            conjugated = [];
            _iteratorNormalCompletion7 = true;
            _didIteratorError7 = false;
            _iteratorError7 = undefined;
            _context14.prev = 6;
            for (_iterator7 = terms[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              _term3 = _step7.value;
              _result2 = pi.conjugate(_term3);

              conjugated = conjugated.concat(_result2);
            }
            _context14.next = 14;
            break;

          case 10:
            _context14.prev = 10;
            _context14.t0 = _context14['catch'](6);
            _didIteratorError7 = true;
            _iteratorError7 = _context14.t0;

          case 14:
            _context14.prev = 14;
            _context14.prev = 15;

            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }

          case 17:
            _context14.prev = 17;

            if (!_didIteratorError7) {
              _context14.next = 20;
              break;
            }

            throw _iteratorError7;

          case 20:
            return _context14.finish(17);

          case 21:
            return _context14.finish(14);

          case 22:
            conjugated = [].concat(babelHelpers_toConsumableArray(new Set(conjugated)));

          case 23:

            if (!conjugated) {
              conjugated = [];
            }
            //console.log({priorityTerms});
            if (!priorityTerms) {
              priorityTerms = [];
            }

            _context14.next = 27;
            return getMatchingTerms(terms);

          case 27:
            matchingTerms = _context14.sent;
            matchingTermsIndeclinable = new Set();

            if (!indeclinables) {
              _context14.next = 33;
              break;
            }

            _context14.next = 32;
            return getMatchingTerms(indeclinables);

          case 32:
            matchingTermsIndeclinable = _context14.sent;

          case 33:
            _context14.next = 35;
            return getMatchingTermsFolded(terms);

          case 35:
            matchingTermsFolded = _context14.sent;
            _context14.next = 38;
            return getMatchingTerms(conjugated);

          case 38:
            matchingTermsConjugated = _context14.sent;
            _context14.next = 41;
            return getMatchingTermsFolded(conjugated);

          case 41:
            matchingTermsConjugatedFolded = _context14.sent;
            matchingTermsFuzzy = new Set();

            if (excludeFuzzy) {
              _context14.next = 47;
              break;
            }

            _context14.next = 46;
            return getMatchingTermsFuzzy(terms);

          case 46:
            machingTermsFuzzy = _context14.sent;

          case 47:

            console.log({ matchingTerms: matchingTerms, matchingTermsIndeclinable: matchingTermsIndeclinable, matchingTermsFolded: matchingTermsFolded, matchingTermsConjugated: matchingTermsConjugated, matchingTermsConjugatedFolded: matchingTermsConjugatedFolded, matchingTermsFuzzy: matchingTermsFuzzy });
            allMatchingTerms = new Set([].concat(babelHelpers_toConsumableArray(priorityTerms), babelHelpers_toConsumableArray(matchingTerms), babelHelpers_toConsumableArray(matchingTermsIndeclinable), babelHelpers_toConsumableArray(matchingTermsFolded), babelHelpers_toConsumableArray(matchingTermsConjugated), babelHelpers_toConsumableArray(matchingTermsConjugatedFolded), babelHelpers_toConsumableArray(matchingTermsFuzzy)));
            scores = {};
            _iteratorNormalCompletion8 = true;
            _didIteratorError8 = false;
            _iteratorError8 = undefined;
            _context14.prev = 53;
            _iterator8 = allMatchingTerms[Symbol.iterator]();

          case 55:
            if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
              _context14.next = 90;
              break;
            }

            term = _step8.value;
            score = 0;
            priorityTermsIndex = priorityTerms.indexOf(term);

            if (priorityTermsIndex != -1) {
              score += 5 + 1 / (1 + priorityTermsIndex);
            }
            if (matchingTerms.has(term)) {
              score += 1;
            } else if (matchingTermsFolded.has(term)) {
              score += 0.5;
            }

            if (matchingTermsIndeclinable.has(term)) {
              score += 1;
            }

            if (matchingTermsConjugated.has(term)) {
              score += 1;
            } else if (matchingTermsConjugatedFolded.has(term)) {
              score += 0.5;
            }

            if (!matchingTermsFuzzy.has(term)) {
              _context14.next = 86;
              break;
            }

            fuzzyDistance = 0;
            _iteratorNormalCompletion10 = true;
            _didIteratorError10 = false;
            _iteratorError10 = undefined;
            _context14.prev = 68;

            for (_iterator10 = terms[Symbol.iterator](); !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              originalTerm = _step10.value;

              fuzzyDistance += Levenshtein.get(term, originalTerm);
              fuzzyDistance += Levenshtein.get(asciify(term), asciify(originalTerm));
            }
            _context14.next = 76;
            break;

          case 72:
            _context14.prev = 72;
            _context14.t1 = _context14['catch'](68);
            _didIteratorError10 = true;
            _iteratorError10 = _context14.t1;

          case 76:
            _context14.prev = 76;
            _context14.prev = 77;

            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }

          case 79:
            _context14.prev = 79;

            if (!_didIteratorError10) {
              _context14.next = 82;
              break;
            }

            throw _iteratorError10;

          case 82:
            return _context14.finish(79);

          case 83:
            return _context14.finish(76);

          case 84:
            fuzzyDistance /= 0.0 + terms.length;
            score += 1 / (1 + fuzzyDistance);

          case 86:
            scores[term] = score;

          case 87:
            _iteratorNormalCompletion8 = true;
            _context14.next = 55;
            break;

          case 90:
            _context14.next = 96;
            break;

          case 92:
            _context14.prev = 92;
            _context14.t2 = _context14['catch'](53);
            _didIteratorError8 = true;
            _iteratorError8 = _context14.t2;

          case 96:
            _context14.prev = 96;
            _context14.prev = 97;

            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }

          case 99:
            _context14.prev = 99;

            if (!_didIteratorError8) {
              _context14.next = 102;
              break;
            }

            throw _iteratorError8;

          case 102:
            return _context14.finish(99);

          case 103:
            return _context14.finish(96);

          case 104:
            _context14.next = 106;
            return getTermBodies(allMatchingTerms);

          case 106:
            results = _context14.sent;
            _iteratorNormalCompletion9 = true;
            _didIteratorError9 = false;
            _iteratorError9 = undefined;
            _context14.prev = 110;
            _iterator9 = results[Symbol.iterator]();

          case 112:
            if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
              _context14.next = 121;
              break;
            }

            result = _step9.value;

            if (result.term in scores) {
              _context14.next = 116;
              break;
            }

            throw new Error('No score for term: ', result.term);

          case 116:
            result.score = scores[result.term];
            delete scores[result.term];

          case 118:
            _iteratorNormalCompletion9 = true;
            _context14.next = 112;
            break;

          case 121:
            _context14.next = 127;
            break;

          case 123:
            _context14.prev = 123;
            _context14.t3 = _context14['catch'](110);
            _didIteratorError9 = true;
            _iteratorError9 = _context14.t3;

          case 127:
            _context14.prev = 127;
            _context14.prev = 128;

            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }

          case 130:
            _context14.prev = 130;

            if (!_didIteratorError9) {
              _context14.next = 133;
              break;
            }

            throw _iteratorError9;

          case 133:
            return _context14.finish(130);

          case 134:
            return _context14.finish(127);

          case 135:

            if (Object.keys(scores).length > 0) {
              console.error('Terms matched, but bodies not found: ' + JSON.stringify(Object.keys(scores)));
            }

            results.sort(function (a, b) {
              return b.score - a.score;
            });
            return _context14.abrupt('return', results);

          case 138:
          case 'end':
            return _context14.stop();
        }
      }
    }, _callee14, this, [[6, 10, 14, 22], [15,, 17, 21], [53, 92, 96, 104], [68, 72, 76, 84], [77,, 79, 83], [97,, 99, 103], [110, 123, 127, 135], [128,, 130, 134]]);
  }));
  return function getAndRankMatches(_x15) {
    return ref.apply(this, arguments);
  };
}();

function intersection(a, b) {
  if (b.length > a.length) {
    var _ref7 = [b, a];
    a = _ref7[0];
    b = _ref7[1];
  }
  return new Set([].concat(babelHelpers_toConsumableArray(a)).filter(function (value) {
    return b.has(value);
  }));
}

var getMatchingTerms = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee15(terms) {
    var allTerms;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.next = 2;
            return getTerms();

          case 2:
            allTerms = _context15.sent;
            return _context15.abrupt('return', intersection(terms, allTerms));

          case 4:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee15, this);
  }));
  return function getMatchingTerms(_x16) {
    return ref.apply(this, arguments);
  };
}();

var getMatchingTermsFolded = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee16(terms) {
    var allFoldedTerms, foldedTerms, result, matches, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11;

    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.next = 2;
            return getTermsFolded();

          case 2:
            allFoldedTerms = _context16.sent;
            foldedTerms = terms.map(asciify);
            result = [];
            matches = intersection(foldedTerms, allFoldedTerms);
            // Folded results are arrays of possible original worlds
            // asi = ["āsi", "asi"]
            // Flatten these arrays

            _iteratorNormalCompletion11 = true;
            _didIteratorError11 = false;
            _iteratorError11 = undefined;
            _context16.prev = 9;
            for (_iterator11 = matches[Symbol.iterator](); !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
              match = _step11.value;

              result.push.apply(result, babelHelpers_toConsumableArray(allFoldedTerms.get(match)));
            }
            _context16.next = 17;
            break;

          case 13:
            _context16.prev = 13;
            _context16.t0 = _context16['catch'](9);
            _didIteratorError11 = true;
            _iteratorError11 = _context16.t0;

          case 17:
            _context16.prev = 17;
            _context16.prev = 18;

            if (!_iteratorNormalCompletion11 && _iterator11.return) {
              _iterator11.return();
            }

          case 20:
            _context16.prev = 20;

            if (!_didIteratorError11) {
              _context16.next = 23;
              break;
            }

            throw _iteratorError11;

          case 23:
            return _context16.finish(20);

          case 24:
            return _context16.finish(17);

          case 25:
            return _context16.abrupt('return', new Set(result));

          case 26:
          case 'end':
            return _context16.stop();
        }
      }
    }, _callee16, this, [[9, 13, 17, 25], [18,, 20, 24]]);
  }));
  return function getMatchingTermsFolded(_x17) {
    return ref.apply(this, arguments);
  };
}();

var getMatchingTermsFuzzy = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee17(terms) {
    var results, foldedTerms, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, term, foldedTerm, prefixLength, maxEditDistance, rex, thisTermSuffix, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, _step13$value, otherTerm, originalTerms, otherTermSuffix, editDistance, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, _originalTerm;

    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            results = new Set();
            _context17.next = 3;
            return getTermsFolded();

          case 3:
            foldedTerms = _context17.sent;
            _iteratorNormalCompletion12 = true;
            _didIteratorError12 = false;
            _iteratorError12 = undefined;
            _context17.prev = 7;
            _iterator12 = terms[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
              _context17.next = 72;
              break;
            }

            term = _step12.value;
            foldedTerm = asciify(term);
            prefixLength = 2 + Math.floor(term.length / 5);
            maxEditDistance = term.length < 5 ? 0 : term.length < 10 ? 1 : 2;

            if (!(maxEditDistance == 0)) {
              _context17.next = 16;
              break;
            }

            return _context17.abrupt('continue', 69);

          case 16:
            rex = RegExp('^' + foldedTerm.slice(0, prefixLength));
            thisTermSuffix = foldedTerm.slice(prefixLength);
            _iteratorNormalCompletion13 = true;
            _didIteratorError13 = false;
            _iteratorError13 = undefined;
            _context17.prev = 21;
            _iterator13 = foldedTerms.entries()[Symbol.iterator]();

          case 23:
            if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
              _context17.next = 55;
              break;
            }

            _step13$value = babelHelpers_slicedToArray(_step13.value, 2);
            otherTerm = _step13$value[0];
            originalTerms = _step13$value[1];

            if (!rex.test(otherTerm)) {
              _context17.next = 52;
              break;
            }

            otherTermSuffix = otherTerm.slice(prefixLength);

            if (!(Math.abs(thisTermSuffix.length - otherTermSuffix.length) > maxEditDistance)) {
              _context17.next = 31;
              break;
            }

            return _context17.abrupt('continue', 52);

          case 31:
            editDistance = Levenshtein.get(thisTermSuffix, otherTermSuffix);

            if (!(editDistance <= maxEditDistance)) {
              _context17.next = 52;
              break;
            }

            _iteratorNormalCompletion14 = true;
            _didIteratorError14 = false;
            _iteratorError14 = undefined;
            _context17.prev = 36;

            for (_iterator14 = originalTerms[Symbol.iterator](); !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
              _originalTerm = _step14.value;

              results.add(_originalTerm);
            }
            _context17.next = 44;
            break;

          case 40:
            _context17.prev = 40;
            _context17.t0 = _context17['catch'](36);
            _didIteratorError14 = true;
            _iteratorError14 = _context17.t0;

          case 44:
            _context17.prev = 44;
            _context17.prev = 45;

            if (!_iteratorNormalCompletion14 && _iterator14.return) {
              _iterator14.return();
            }

          case 47:
            _context17.prev = 47;

            if (!_didIteratorError14) {
              _context17.next = 50;
              break;
            }

            throw _iteratorError14;

          case 50:
            return _context17.finish(47);

          case 51:
            return _context17.finish(44);

          case 52:
            _iteratorNormalCompletion13 = true;
            _context17.next = 23;
            break;

          case 55:
            _context17.next = 61;
            break;

          case 57:
            _context17.prev = 57;
            _context17.t1 = _context17['catch'](21);
            _didIteratorError13 = true;
            _iteratorError13 = _context17.t1;

          case 61:
            _context17.prev = 61;
            _context17.prev = 62;

            if (!_iteratorNormalCompletion13 && _iterator13.return) {
              _iterator13.return();
            }

          case 64:
            _context17.prev = 64;

            if (!_didIteratorError13) {
              _context17.next = 67;
              break;
            }

            throw _iteratorError13;

          case 67:
            return _context17.finish(64);

          case 68:
            return _context17.finish(61);

          case 69:
            _iteratorNormalCompletion12 = true;
            _context17.next = 9;
            break;

          case 72:
            _context17.next = 78;
            break;

          case 74:
            _context17.prev = 74;
            _context17.t2 = _context17['catch'](7);
            _didIteratorError12 = true;
            _iteratorError12 = _context17.t2;

          case 78:
            _context17.prev = 78;
            _context17.prev = 79;

            if (!_iteratorNormalCompletion12 && _iterator12.return) {
              _iterator12.return();
            }

          case 81:
            _context17.prev = 81;

            if (!_didIteratorError12) {
              _context17.next = 84;
              break;
            }

            throw _iteratorError12;

          case 84:
            return _context17.finish(81);

          case 85:
            return _context17.finish(78);

          case 86:
            return _context17.abrupt('return', results);

          case 87:
          case 'end':
            return _context17.stop();
        }
      }
    }, _callee17, this, [[7, 74, 78, 86], [21, 57, 61, 69], [36, 40, 44, 52], [45,, 47, 51], [62,, 64, 68], [79,, 81, 85]]);
  }));
  return function getMatchingTermsFuzzy(_x18) {
    return ref.apply(this, arguments);
  };
}();

var messageHandler = function () {
  var ref = babelHelpers_asyncToGenerator(regeneratorRuntime.mark(function _callee18(message) {
    var msgstr, _message$init, fromLang, toLang, dataFile, glossaryFile, dbname, result;

    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            msgstr = JSON.stringify(message);

            if (!(typeof message == "string")) {
              _context18.next = 3;
              break;
            }

            throw new TypeError('Does not understand strings, please use objects: ' + msgstr);

          case 3:
            if (!(Object.keys(message).length > 1)) {
              _context18.next = 5;
              break;
            }

            throw new Error('Message invalid, more than one action: ' + msgstr);

          case 5:
            if (!('init' in message)) {
              _context18.next = 16;
              break;
            }

            _message$init = message.init;
            fromLang = _message$init.fromLang;
            toLang = _message$init.toLang;
            dataFile = _message$init.dataFile;
            glossaryFile = _message$init.glossaryFile;
            dbname = _message$init.dbname;

            Object.assign(settings, { fromLang: fromLang, toLang: toLang, dbname: dbname, dataFile: dataFile });
            _context18.next = 15;
            return initDexie(dbname, dataFile, glossaryFile);

          case 15:
            return _context18.abrupt('return', { status: 'success' });

          case 16:
            result = null;

            if (!('store' in message)) {
              _context18.next = 23;
              break;
            }

            _context18.next = 20;
            return db.user.put(message.store);

          case 20:
            result = { status: 'success' };
            _context18.next = 72;
            break;

          case 23:
            if (!('retrieve' in message)) {
              _context18.next = 29;
              break;
            }

            _context18.next = 26;
            return db.user.get(message.retrieve.key);

          case 26:
            result = _context18.sent;
            _context18.next = 72;
            break;

          case 29:
            if (!('rank' in message)) {
              _context18.next = 35;
              break;
            }

            _context18.next = 32;
            return getAndRankMatches(message.rank);

          case 32:
            result = _context18.sent;
            _context18.next = 72;
            break;

          case 35:
            if (!('getEntry' in message)) {
              _context18.next = 41;
              break;
            }

            _context18.next = 38;
            return getEntry(message.getEntry);

          case 38:
            result = _context18.sent;
            _context18.next = 72;
            break;

          case 41:
            if (!('getGlossaryEntries' in message)) {
              _context18.next = 47;
              break;
            }

            _context18.next = 44;
            return getGlossaryEntries(message.getGlossaryEntries);

          case 44:
            result = _context18.sent;
            _context18.next = 72;
            break;

          case 47:
            if (!('getAllGlossaryEntries' in message)) {
              _context18.next = 53;
              break;
            }

            _context18.next = 50;
            return getAllGlossaryEntries(message.getAllGlossaryEntries);

          case 50:
            result = _context18.sent;
            _context18.next = 72;
            break;

          case 53:
            if (!('addGlossaryEntry' in message)) {
              _context18.next = 59;
              break;
            }

            _context18.next = 56;
            return addGlossaryEntry(message.addGlossaryEntry);

          case 56:
            result = _context18.sent;
            _context18.next = 72;
            break;

          case 59:
            if (!('addGlossaryEntries' in message)) {
              _context18.next = 65;
              break;
            }

            _context18.next = 62;
            return addGlossaryEntries(message.addGlossaryEntries);

          case 62:
            result = _context18.sent;
            _context18.next = 72;
            break;

          case 65:
            if (!('removeGlossaryEntries' in message)) {
              _context18.next = 71;
              break;
            }

            _context18.next = 68;
            return removeGlossaryEntries(message.removeGlossaryEntries);

          case 68:
            result = _context18.sent;
            _context18.next = 72;
            break;

          case 71:
            throw new Error('Message invalid, no action found: ' + JSON.stringify(message));

          case 72:
            return _context18.abrupt('return', result);

          case 73:
          case 'end':
            return _context18.stop();
        }
      }
    }, _callee18, this);
  }));
  return function messageHandler(_x19) {
    return ref.apply(this, arguments);
  };
}();

setMessageHandler(self, messageHandler);
//# sourceMappingURL=lookup-worker-1.2.js.map
