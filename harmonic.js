//traceur runtime
(function(global) {
    'use strict';
    if (global.$traceurRuntime) {
        return;
    }
    var $Object = Object;
    var $TypeError = TypeError;
    var $create = $Object.create;
    var $defineProperties = $Object.defineProperties;
    var $defineProperty = $Object.defineProperty;
    var $freeze = $Object.freeze;
    var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
    var $getOwnPropertyNames = $Object.getOwnPropertyNames;
    var $getPrototypeOf = $Object.getPrototypeOf;
    var $hasOwnProperty = $Object.prototype.hasOwnProperty;
    var $toString = $Object.prototype.toString;
    function nonEnum(value) {
        return {
            configurable: true,
            enumerable: false,
            value: value,
            writable: true
        };
    }
    var types = {
        void: function voidType() {},
        any: function any() {},
        string: function string() {},
        number: function number() {},
        boolean: function boolean() {}
    };
    var method = nonEnum;
    var counter = 0;
    function newUniqueString() {
        return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
    }
    var symbolInternalProperty = newUniqueString();
    var symbolDescriptionProperty = newUniqueString();
    var symbolDataProperty = newUniqueString();
    var symbolValues = $create(null);
    function isSymbol(symbol) {
        return typeof symbol === 'object' && symbol instanceof SymbolValue;
    }
    function typeOf(v) {
        if (isSymbol(v))
            return 'symbol';
        return typeof v;
    }
    function Symbol(description) {
        var value = new SymbolValue(description);
        if (!(this instanceof Symbol))
            return value;
        throw new TypeError('Symbol cannot be new\'ed');
    }
    $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
    $defineProperty(Symbol.prototype, 'toString', method(function() {
        var symbolValue = this[symbolDataProperty];
        if (!getOption('symbols'))
            return symbolValue[symbolInternalProperty];
        if (!symbolValue)
            throw TypeError('Conversion from symbol to string');
        var desc = symbolValue[symbolDescriptionProperty];
        if (desc === undefined)
            desc = '';
        return 'Symbol(' + desc + ')';
    }));
    $defineProperty(Symbol.prototype, 'valueOf', method(function() {
        var symbolValue = this[symbolDataProperty];
        if (!symbolValue)
            throw TypeError('Conversion from symbol to string');
        if (!getOption('symbols'))
            return symbolValue[symbolInternalProperty];
        return symbolValue;
    }));
    function SymbolValue(description) {
        var key = newUniqueString();
        $defineProperty(this, symbolDataProperty, {
            value: this
        });
        $defineProperty(this, symbolInternalProperty, {
            value: key
        });
        $defineProperty(this, symbolDescriptionProperty, {
            value: description
        });
        $freeze(this);
        symbolValues[key] = this;
    }
    $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
    $defineProperty(SymbolValue.prototype, 'toString', {
        value: Symbol.prototype.toString,
        enumerable: false
    });
    $defineProperty(SymbolValue.prototype, 'valueOf', {
        value: Symbol.prototype.valueOf,
        enumerable: false
    });
    $freeze(SymbolValue.prototype);
    Symbol.iterator = Symbol();
    function toProperty(name) {
        if (isSymbol(name))
            return name[symbolInternalProperty];
        return name;
    }
    function getOwnPropertyNames(object) {
        var rv = [];
        var names = $getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            if (!symbolValues[name])
                rv.push(name);
        }
        return rv;
    }
    function getOwnPropertyDescriptor(object, name) {
        return $getOwnPropertyDescriptor(object, toProperty(name));
    }
    function getOwnPropertySymbols(object) {
        var rv = [];
        var names = $getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
            var symbol = symbolValues[names[i]];
            if (symbol)
                rv.push(symbol);
        }
        return rv;
    }
    function hasOwnProperty(name) {
        return $hasOwnProperty.call(this, toProperty(name));
    }
    function getOption(name) {
        return global.traceur && global.traceur.options[name];
    }
    function setProperty(object, name, value) {
        var sym,
            desc;
        if (isSymbol(name)) {
            sym = name;
            name = name[symbolInternalProperty];
        }
        object[name] = value;
        if (sym && (desc = $getOwnPropertyDescriptor(object, name)))
            $defineProperty(object, name, {
                enumerable: false
            });
        return value;
    }
    function defineProperty(object, name, descriptor) {
        if (isSymbol(name)) {
            if (descriptor.enumerable) {
                descriptor = $create(descriptor, {
                    enumerable: {
                        value: false
                    }
                });
            }
            name = name[symbolInternalProperty];
        }
        $defineProperty(object, name, descriptor);
        return object;
    }
    function polyfillObject(Object) {
        $defineProperty(Object, 'defineProperty', {
            value: defineProperty
        });
        $defineProperty(Object, 'getOwnPropertyNames', {
            value: getOwnPropertyNames
        });
        $defineProperty(Object, 'getOwnPropertyDescriptor', {
            value: getOwnPropertyDescriptor
        });
        $defineProperty(Object.prototype, 'hasOwnProperty', {
            value: hasOwnProperty
        });
        Object.getOwnPropertySymbols = getOwnPropertySymbols;
        function is(left, right) {
            if (left === right)
                return left !== 0 || 1 / left === 1 / right;
            return left !== left && right !== right;
        }
        $defineProperty(Object, 'is', method(is));
        function assign(target, source) {
            var props = $getOwnPropertyNames(source);
            var p,
                length = props.length;
            for (p = 0; p < length; p++) {
                target[props[p]] = source[props[p]];
            }
            return target;
        }
        $defineProperty(Object, 'assign', method(assign));
        function mixin(target, source) {
            var props = $getOwnPropertyNames(source);
            var p,
                descriptor,
                length = props.length;
            for (p = 0; p < length; p++) {
                descriptor = $getOwnPropertyDescriptor(source, props[p]);
                $defineProperty(target, props[p], descriptor);
            }
            return target;
        }
        $defineProperty(Object, 'mixin', method(mixin));
    }
    function exportStar(object) {
        for (var i = 1; i < arguments.length; i++) {
            var names = $getOwnPropertyNames(arguments[i]);
            for (var j = 0; j < names.length; j++) {
                (function(mod, name) {
                    $defineProperty(object, name, {
                        get: function() {
                            return mod[name];
                        },
                        enumerable: true
                    });
                })(arguments[i], names[j]);
            }
        }
        return object;
    }
    function toObject(value) {
        if (value == null)
            throw $TypeError();
        return $Object(value);
    }
    function spread() {
        var rv = [],
            k = 0;
        for (var i = 0; i < arguments.length; i++) {
            var valueToSpread = toObject(arguments[i]);
            for (var j = 0; j < valueToSpread.length; j++) {
                rv[k++] = valueToSpread[j];
            }
        }
        return rv;
    }
    function getPropertyDescriptor(object, name) {
        while (object !== null) {
            var result = $getOwnPropertyDescriptor(object, name);
            if (result)
                return result;
            object = $getPrototypeOf(object);
        }
        return undefined;
    }
    function superDescriptor(homeObject, name) {
        var proto = $getPrototypeOf(homeObject);
        if (!proto)
            throw $TypeError('super is null');
        return getPropertyDescriptor(proto, name);
    }
    function superCall(self, homeObject, name, args) {
        var descriptor = superDescriptor(homeObject, name);
        if (descriptor) {
            if ('value' in descriptor)
                return descriptor.value.apply(self, args);
            if (descriptor.get)
                return descriptor.get.call(self).apply(self, args);
        }
        throw $TypeError("super has no method '" + name + "'.");
    }
    function superGet(self, homeObject, name) {
        var descriptor = superDescriptor(homeObject, name);
        if (descriptor) {
            if (descriptor.get)
                return descriptor.get.call(self);else if ('value' in descriptor)return descriptor.value
            ;
        }
        return undefined;
    }
    function superSet(self, homeObject, name, value) {
        var descriptor = superDescriptor(homeObject, name);
        if (descriptor && descriptor.set) {
            descriptor.set.call(self, value);
            return;
        }
        throw $TypeError("super has no setter '" + name + "'.");
    }
    function getDescriptors(object) {
        var descriptors = {},
            name,
            names = $getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            descriptors[name] = $getOwnPropertyDescriptor(object, name);
        }
        return descriptors;
    }
    function createClass(ctor, object, staticObject, superClass) {
        $defineProperty(object, 'constructor', {
            value: ctor,
            configurable: true,
            enumerable: false,
            writable: true
        });
        if (arguments.length > 3) {
            if (typeof superClass === 'function')
                ctor.__proto__ = superClass;
            ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
        } else {
            ctor.prototype = object;
        }
        $defineProperty(ctor, 'prototype', {
            configurable: false,
            writable: false
        });
        return $defineProperties(ctor, getDescriptors(staticObject));
    }
    function getProtoParent(superClass) {
        if (typeof superClass === 'function') {
            var prototype = superClass.prototype;
            if ($Object(prototype) === prototype || prototype === null)
                return superClass.prototype;
        }
        if (superClass === null)
            return null;
        throw new TypeError();
    }
    function defaultSuperCall(self, homeObject, args) {
        if ($getPrototypeOf(homeObject) !== null)
            superCall(self, homeObject, 'constructor', args);
    }
    var ST_NEWBORN = 0;
    var ST_EXECUTING = 1;
    var ST_SUSPENDED = 2;
    var ST_CLOSED = 3;
    var END_STATE = -3;
    function addIterator(object) {
        return defineProperty(object, Symbol.iterator, nonEnum(function() {
            return this;
        }));
    }
    function GeneratorContext() {
        this.state = 0;
        this.GState = ST_NEWBORN;
        this.storedException = undefined;
        this.finallyFallThrough = undefined;
        this.sent = undefined;
        this.returnValue = undefined;
        this.tryStack_ = [];
    }
    GeneratorContext.prototype = {
        pushTry: function(catchState, finallyState) {
            if (finallyState !== null) {
                var finallyFallThrough = null;
                for (var i = this.tryStack_.length - 1; i >= 0; i--) {
                    if (this.tryStack_[i].catch !== undefined) {
                        finallyFallThrough = this.tryStack_[i].catch;
                        break;
                    }
                }
                if (finallyFallThrough === null)
                    finallyFallThrough = -3;
                this.tryStack_.push({
                    finally: finallyState,
                    finallyFallThrough: finallyFallThrough
                });
            }
            if (catchState !== null) {
                this.tryStack_.push({
                    catch: catchState
                });
            }
        },
        popTry: function() {
            this.tryStack_.pop();
        }
    };
    function getNextOrThrow(ctx, moveNext, action) {
        return function(x) {
            switch (ctx.GState) {
                case ST_EXECUTING:
                    throw new Error(("\"" + action + "\" on executing generator"));
                case ST_CLOSED:
                    throw new Error(("\"" + action + "\" on closed generator"));
                case ST_NEWBORN:
                    if (action === 'throw') {
                        ctx.GState = ST_CLOSED;
                        throw x;
                    }
                    if (x !== undefined)
                        throw $TypeError('Sent value to newborn generator');
                case ST_SUSPENDED:
                    ctx.GState = ST_EXECUTING;
                    ctx.action = action;
                    ctx.sent = x;
                    var value = moveNext(ctx);
                    var done = value === ctx;
                    if (done)
                        value = ctx.returnValue;
                    ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
                    return {
                        value: value,
                        done: done
                    };
            }
        };
    }
    function generatorWrap(innerFunction, self) {
        var moveNext = getMoveNext(innerFunction, self);
        var ctx = new GeneratorContext();
        return addIterator({
            next: getNextOrThrow(ctx, moveNext, 'next'),
            throw: getNextOrThrow(ctx, moveNext, 'throw')
        });
    }
    function AsyncFunctionContext() {
        GeneratorContext.call(this);
        this.err = undefined;
        var ctx = this;
        ctx.result = new Promise(function(resolve, reject) {
            ctx.resolve = resolve;
            ctx.reject = reject;
        });
    }
    AsyncFunctionContext.prototype = Object.create(GeneratorContext.prototype);
    function asyncWrap(innerFunction, self) {
        var moveNext = getMoveNext(innerFunction, self);
        var ctx = new AsyncFunctionContext();
        ctx.createCallback = function(newState) {
            return function(value) {
                ctx.state = newState;
                ctx.value = value;
                moveNext(ctx);
            };
        };
        ctx.createErrback = function(newState) {
            return function(err) {
                ctx.state = newState;
                ctx.err = err;
                moveNext(ctx);
            };
        };
        moveNext(ctx);
        return ctx.result;
    }
    function getMoveNext(innerFunction, self) {
        return function(ctx) {
            while (true) {
                try {
                    return innerFunction.call(self, ctx);
                } catch (ex) {
                    ctx.storedException = ex;
                    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
                    if (!last) {
                        ctx.GState = ST_CLOSED;
                        ctx.state = END_STATE;
                        throw ex;
                    }
                    ctx.state = last.catch !== undefined ? last.catch : last.finally;
                    if (last.finallyFallThrough !== undefined)
                        ctx.finallyFallThrough = last.finallyFallThrough;
                }
            }
        };
    }
    function setupGlobals(global) {
        global.Symbol = Symbol;
        polyfillObject(global.Object);
    }
    setupGlobals(global);
    global.$traceurRuntime = {
        asyncWrap: asyncWrap,
        createClass: createClass,
        defaultSuperCall: defaultSuperCall,
        exportStar: exportStar,
        generatorWrap: generatorWrap,
        setProperty: setProperty,
        setupGlobals: setupGlobals,
        spread: spread,
        superCall: superCall,
        superGet: superGet,
        superSet: superSet,
        toObject: toObject,
        toProperty: toProperty,
        type: types,
        typeof: typeOf
    };
})(typeof global !== 'undefined' ? global : this);
(function() {
    function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
        var out = [];
        if (opt_scheme) {
            out.push(opt_scheme, ':');
        }
        if (opt_domain) {
            out.push('//');
            if (opt_userInfo) {
                out.push(opt_userInfo, '@');
            }
            out.push(opt_domain);
            if (opt_port) {
                out.push(':', opt_port);
            }
        }
        if (opt_path) {
            out.push(opt_path);
        }
        if (opt_queryData) {
            out.push('?', opt_queryData);
        }
        if (opt_fragment) {
            out.push('#', opt_fragment);
        }
        return out.join('');
    }
    ;
    var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
    var ComponentIndex = {
        SCHEME: 1,
        USER_INFO: 2,
        DOMAIN: 3,
        PORT: 4,
        PATH: 5,
        QUERY_DATA: 6,
        FRAGMENT: 7
    };
    function split(uri) {
        return (uri.match(splitRe));
    }
    function removeDotSegments(path) {
        if (path === '/')
            return '/';
        var leadingSlash = path[0] === '/' ? '/' : '';
        var trailingSlash = path.slice(-1) === '/' ? '/' : '';
        var segments = path.split('/');
        var out = [];
        var up = 0;
        for (var pos = 0; pos < segments.length; pos++) {
            var segment = segments[pos];
            switch (segment) {
                case '':
                case '.':
                    break;
                case '..':
                    if (out.length)
                        out.pop();
                    else
                        up++;
                    break;
                default:
                    out.push(segment);
            }
        }
        if (!leadingSlash) {
            while (up-- > 0) {
                out.unshift('..');
            }
            if (out.length === 0)
                out.push('.');
        }
        return leadingSlash + out.join('/') + trailingSlash;
    }
    function joinAndCanonicalizePath(parts) {
        var path = parts[ComponentIndex.PATH] || '';
        path = removeDotSegments(path.replace(/\/\//.g, '/'));
        parts[ComponentIndex.PATH] = path;
        return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
    }
    function canonicalizeUrl(url) {
        var parts = split(url);
        return joinAndCanonicalizePath(parts);
    }
    function resolveUrl(base, url) {
        var parts = split(url);
        var baseParts = split(base);
        if (parts[ComponentIndex.SCHEME]) {
            return joinAndCanonicalizePath(parts);
        } else {
            parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
        }
        for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
            if (!parts[i]) {
                parts[i] = baseParts[i];
            }
        }
        if (parts[ComponentIndex.PATH][0] == '/') {
            return joinAndCanonicalizePath(parts);
        }
        var path = baseParts[ComponentIndex.PATH];
        var index = path.lastIndexOf('/');
        path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
        parts[ComponentIndex.PATH] = path;
        return joinAndCanonicalizePath(parts);
    }
    function isAbsolute(name) {
        if (!name)
            return false;
        if (name[0] === '/')
            return true;
        var parts = split(name);
        if (parts[ComponentIndex.SCHEME])
            return true;
        return false;
    }
    $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
    $traceurRuntime.isAbsolute = isAbsolute;
    $traceurRuntime.removeDotSegments = removeDotSegments;
    $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
    'use strict';
    var $__2 = $traceurRuntime,
        canonicalizeUrl = $__2.canonicalizeUrl,
        resolveUrl = $__2.resolveUrl,
        isAbsolute = $__2.isAbsolute;
    var moduleInstantiators = Object.create(null);
    var baseURL;
    if (global.location && global.location.href)
        baseURL = resolveUrl(global.location.href, './');
    else
        baseURL = '';
    var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
        this.url = url;
        this.value_ = uncoatedModule;
    };
    ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
    var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
        $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
        this.func = func;
    };
    var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
    ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {
        getUncoatedModule: function() {
            if (this.value_)
                return this.value_;
            return this.value_ = this.func.call(global);
        }
    }, {}, UncoatedModuleEntry);
    function getUncoatedModuleInstantiator(name) {
        if (!name)
            return;
        var url = ModuleStore.normalize(name);
        return moduleInstantiators[url];
    }
    ;
    var moduleInstances = Object.create(null);
    var liveModuleSentinel = {};
    function Module(uncoatedModule) {
        var isLive = arguments[1];
        var coatedModule = Object.create(null);
        Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
            var getter,
                value;
            if (isLive === liveModuleSentinel) {
                var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
                if (descr.get)
                    getter = descr.get;
            }
            if (!getter) {
                value = uncoatedModule[name];
                getter = function() {
                    return value;
                };
            }
            Object.defineProperty(coatedModule, name, {
                get: getter,
                enumerable: true
            });
        }));
        Object.preventExtensions(coatedModule);
        return coatedModule;
    }
    var ModuleStore = {
        normalize: function(name, refererName, refererAddress) {
            if (typeof name !== "string")
                throw new TypeError("module name must be a string, not " + typeof name);
            if (isAbsolute(name))
                return canonicalizeUrl(name);
            if (/[^\.]\/\.\.\//.test(name)) {
                throw new Error('module name embeds /../: ' + name);
            }
            if (name[0] === '.' && refererName)
                return resolveUrl(refererName, name);
            return canonicalizeUrl(name);
        },
        get: function(normalizedName) {
            var m = getUncoatedModuleInstantiator(normalizedName);
            if (!m)
                return undefined;
            var moduleInstance = moduleInstances[m.url];
            if (moduleInstance)
                return moduleInstance;
            moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
            return moduleInstances[m.url] = moduleInstance;
        },
        set: function(normalizedName, module) {
            normalizedName = String(normalizedName);
            moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
                return module;
            }));
            moduleInstances[normalizedName] = module;
        },
        get baseURL() {
            return baseURL;
        },
        set baseURL(v) {
            baseURL = String(v);
        },
        registerModule: function(name, func) {
            var normalizedName = ModuleStore.normalize(name);
            if (moduleInstantiators[normalizedName])
                throw new Error('duplicate module named ' + normalizedName);
            moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
        },
        bundleStore: Object.create(null),
        register: function(name, deps, func) {
            if (!deps || !deps.length) {
                this.registerModule(name, func);
            } else {
                this.bundleStore[name] = {
                    deps: deps,
                    execute: func
                };
            }
        },
        getAnonymousModule: function(func) {
            return new Module(func.call(global), liveModuleSentinel);
        },
        getForTesting: function(name) {
            var $__0 = this;
            if (!this.testingPrefix_) {
                Object.keys(moduleInstances).some((function(key) {
                    var m = /(traceur@[^\/]*\/)/.exec(key);
                    if (m) {
                        $__0.testingPrefix_ = m[1];
                        return true;
                    }
                }));
            }
            return this.get(this.testingPrefix_ + name);
        }
    };
    ModuleStore.set('@traceur/src/runtime/ModuleStore', new Module({
        ModuleStore: ModuleStore
    }));
    var setupGlobals = $traceurRuntime.setupGlobals;
    $traceurRuntime.setupGlobals = function(global) {
        setupGlobals(global);
    };
    $traceurRuntime.ModuleStore = ModuleStore;
    global.System = {
        register: ModuleStore.register.bind(ModuleStore),
        get: ModuleStore.get,
        set: ModuleStore.set,
        normalize: ModuleStore.normalize
    };
    $traceurRuntime.getModuleImpl = function(name) {
        var instantiator = getUncoatedModuleInstantiator(name);
        return instantiator && instantiator.getUncoatedModule();
    };
})(typeof global !== 'undefined' ? global : this);
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/utils", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/utils";
    var toObject = $traceurRuntime.toObject;
    function toUint32(x) {
        return x | 0;
    }
    return {
        get toObject() {
            return toObject;
        },
        get toUint32() {
            return toUint32;
        }
    };
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/ArrayIterator", [], function() {
    "use strict";
    var $__4;
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/ArrayIterator";
    var $__5 = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/utils"),
        toObject = $__5.toObject,
        toUint32 = $__5.toUint32;
    var ARRAY_ITERATOR_KIND_KEYS = 1;
    var ARRAY_ITERATOR_KIND_VALUES = 2;
    var ARRAY_ITERATOR_KIND_ENTRIES = 3;
    var ArrayIterator = function ArrayIterator() {};
    ($traceurRuntime.createClass)(ArrayIterator, ($__4 = {}, Object.defineProperty($__4, "next", {
        value: function() {
            var iterator = toObject(this);
            var array = iterator.iteratorObject_;
            if (!array) {
                throw new TypeError('Object is not an ArrayIterator');
            }
            var index = iterator.arrayIteratorNextIndex_;
            var itemKind = iterator.arrayIterationKind_;
            var length = toUint32(array.length);
            if (index >= length) {
                iterator.arrayIteratorNextIndex_ = Infinity;
                return createIteratorResultObject(undefined, true);
            }
            iterator.arrayIteratorNextIndex_ = index + 1;
            if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
                return createIteratorResultObject(array[index], false);
            if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
                return createIteratorResultObject([index, array[index]], false);
            return createIteratorResultObject(index, false);
        },
        configurable: true,
        enumerable: true,
        writable: true
    }), Object.defineProperty($__4, Symbol.iterator, {
        value: function() {
            return this;
        },
        configurable: true,
        enumerable: true,
        writable: true
    }), $__4), {});
    function createArrayIterator(array, kind) {
        var object = toObject(array);
        var iterator = new ArrayIterator;
        iterator.iteratorObject_ = object;
        iterator.arrayIteratorNextIndex_ = 0;
        iterator.arrayIterationKind_ = kind;
        return iterator;
    }
    function createIteratorResultObject(value, done) {
        return {
            value: value,
            done: done
        };
    }
    function entries() {
        return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
    }
    function keys() {
        return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
    }
    function values() {
        return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
    }
    return {
        get entries() {
            return entries;
        },
        get keys() {
            return keys;
        },
        get values() {
            return values;
        }
    };
});
System.register("traceur-runtime@0.0.25/node_modules/rsvp/lib/rsvp/asap", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/node_modules/rsvp/lib/rsvp/asap";
    var $__default = function asap(callback, arg) {
        var length = queue.push([callback, arg]);
        if (length === 1) {
            scheduleFlush();
        }
    };
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    function useNextTick() {
        return function() {
            process.nextTick(flush);
        };
    }
    function useMutationObserver() {
        var iterations = 0;
        var observer = new BrowserMutationObserver(flush);
        var node = document.createTextNode('');
        observer.observe(node, {
            characterData: true
        });
        return function() {
            node.data = (iterations = ++iterations % 2);
        };
    }
    function useSetTimeout() {
        return function() {
            setTimeout(flush, 1);
        };
    }
    var queue = [];
    function flush() {
        for (var i = 0; i < queue.length; i++) {
            var tuple = queue[i];
            var callback = tuple[0],
                arg = tuple[1];
            callback(arg);
        }
        queue = [];
    }
    var scheduleFlush;
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
        scheduleFlush = useMutationObserver();
    } else {
        scheduleFlush = useSetTimeout();
    }
    return {
        get default() {
            return $__default;
        }
    };
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/Promise", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/Promise";
    var async = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/node_modules/rsvp/lib/rsvp/asap").default;
    function isPromise(x) {
        return x && typeof x === 'object' && x.status_ !== undefined;
    }
    function chain(promise) {
        var onResolve = arguments[1] !== (void0) ? arguments[1] : (function(x) {
                return x;
            });
        var onReject = arguments[2] !== (void0) ? arguments[2] : (function(e) {
                throw e;
            });
        var deferred = getDeferred(promise.constructor);
        switch (promise.status_) {
            case undefined:
                throw TypeError;
            case 'pending':
                promise.onResolve_.push([deferred, onResolve]);
                promise.onReject_.push([deferred, onReject]);
                break;
            case 'resolved':
                promiseReact(deferred, onResolve, promise.value_);
                break;
            case 'rejected':
                promiseReact(deferred, onReject, promise.value_);
                break;
        }
        return deferred.promise;
    }
    function getDeferred(C) {
        var result = {};
        result.promise = new C((function(resolve, reject) {
            result.resolve = resolve;
            result.reject = reject;
        }));
        return result;
    }
    var Promise = function Promise(resolver) {
        var $__6 = this;
        this.status_ = 'pending';
        this.onResolve_ = [];
        this.onReject_ = [];
        resolver((function(x) {
            promiseResolve($__6, x);
        }), (function(r) {
            promiseReject($__6, r);
        }));
    };
    ($traceurRuntime.createClass)(Promise, {
        catch: function(onReject) {
            return this.then(undefined, onReject);
        },
        then: function() {
            var onResolve = arguments[0] !== (void0) ? arguments[0] : (function(x) {
                    return x;
                });
            var onReject = arguments[1];
            var $__6 = this;
            var constructor = this.constructor;
            return chain(this, (function(x) {
                x = promiseCoerce(constructor, x);
                return x === $__6 ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
            }), onReject);
        }
    }, {
        resolve: function(x) {
            return new this((function(resolve, reject) {
                resolve(x);
            }));
        },
        reject: function(r) {
            return new this((function(resolve, reject) {
                reject(r);
            }));
        },
        cast: function(x) {
            if (x instanceof this)
                return x;
            if (isPromise(x)) {
                var result = getDeferred(this);
                chain(x, result.resolve, result.reject);
                return result.promise;
            }
            return this.resolve(x);
        },
        all: function(values) {
            var deferred = getDeferred(this);
            var count = 0;
            var resolutions = [];
            try {
                for (var i = 0; i < values.length; i++) {
                    ++count;
                    this.cast(values[i]).then(function(i, x) {
                        resolutions[i] = x;
                        if (--count === 0)
                            deferred.resolve(resolutions);
                    }.bind(undefined, i), (function(r) {
                        if (count > 0)
                            count = 0;
                        deferred.reject(r);
                    }));
                }
                if (count === 0)
                    deferred.resolve(resolutions);
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        race: function(values) {
            var deferred = getDeferred(this);
            try {
                for (var i = 0; i < values.length; i++) {
                    this.cast(values[i]).then((function(x) {
                        deferred.resolve(x);
                    }), (function(r) {
                        deferred.reject(r);
                    }));
                }
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        }
    });
    function promiseResolve(promise, x) {
        promiseDone(promise, 'resolved', x, promise.onResolve_);
    }
    function promiseReject(promise, r) {
        promiseDone(promise, 'rejected', r, promise.onReject_);
    }
    function promiseDone(promise, status, value, reactions) {
        if (promise.status_ !== 'pending')
            return;
        for (var i = 0; i < reactions.length; i++) {
            promiseReact(reactions[i][0], reactions[i][1], value);
        }
        promise.status_ = status;
        promise.value_ = value;
        promise.onResolve_ = promise.onReject_ = undefined;
    }
    function promiseReact(deferred, handler, x) {
        async((function() {
            try {
                var y = handler(x);
                if (y === deferred.promise)
                    throw new TypeError;else if (isPromise(y))chain(y, deferred.resolve, deferred.reject)
                    ;
                else
                    deferred.resolve(y);
            } catch (e) {
                deferred.reject(e);
            }
        }));
    }
    var thenableSymbol = '@@thenable';
    function promiseCoerce(constructor, x) {
        if (isPromise(x)) {
            return x;
        } else if (x && typeof x.then === 'function') {
            var p = x[thenableSymbol];
            if (p) {
                return p;
            } else {
                var deferred = getDeferred(constructor);
                x[thenableSymbol] = deferred.promise;
                try {
                    x.then(deferred.resolve, deferred.reject);
                } catch (e) {
                    deferred.reject(e);
                }
                return deferred.promise;
            }
        } else {
            return x;
        }
    }
    return {
        get Promise() {
            return Promise;
        }
    };
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/String", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/String";
    var $toString = Object.prototype.toString;
    var $indexOf = String.prototype.indexOf;
    var $lastIndexOf = String.prototype.lastIndexOf;
    function startsWith(search) {
        var string = String(this);
        if (this == null || $toString.call(search) == '[object RegExp]') {
            throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        var pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
            pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        return $indexOf.call(string, searchString, pos) == start;
    }
    function endsWith(search) {
        var string = String(this);
        if (this == null || $toString.call(search) == '[object RegExp]') {
            throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var pos = stringLength;
        if (arguments.length > 1) {
            var position = arguments[1];
            if (position !== undefined) {
                pos = position ? Number(position) : 0;
                if (isNaN(pos)) {
                    pos = 0;
                }
            }
        }
        var end = Math.min(Math.max(pos, 0), stringLength);
        var start = end - searchLength;
        if (start < 0) {
            return false;
        }
        return $lastIndexOf.call(string, searchString, start) == start;
    }
    function contains(search) {
        if (this == null) {
            throw TypeError();
        }
        var string = String(this);
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        var pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
            pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        return $indexOf.call(string, searchString, pos) != -1;
    }
    function repeat(count) {
        if (this == null) {
            throw TypeError();
        }
        var string = String(this);
        var n = count ? Number(count) : 0;
        if (isNaN(n)) {
            n = 0;
        }
        if (n < 0 || n == Infinity) {
            throw RangeError();
        }
        if (n == 0) {
            return '';
        }
        var result = '';
        while (n--) {
            result += string;
        }
        return result;
    }
    function codePointAt(position) {
        if (this == null) {
            throw TypeError();
        }
        var string = String(this);
        var size = string.length;
        var index = position ? Number(position) : 0;
        if (isNaN(index)) {
            index = 0;
        }
        if (index < 0 || index >= size) {
            return undefined;
        }
        var first = string.charCodeAt(index);
        var second;
        if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
            second = string.charCodeAt(index + 1);
            if (second >= 0xDC00 && second <= 0xDFFF) {
                return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
        }
        return first;
    }
    function raw(callsite) {
        var raw = callsite.raw;
        var len = raw.length >>> 0;
        if (len === 0)
            return '';
        var s = '';
        var i = 0;
        while (true) {
            s += raw[i];
            if (i + 1 === len)
                return s;
            s += arguments[++i];
        }
    }
    function fromCodePoint() {
        var codeUnits = [];
        var floor = Math.floor;
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
            return '';
        }
        while (++index < length) {
            var codePoint = Number(arguments[index]);
            if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
                throw RangeError('Invalid code point: ' + codePoint);
            }
            if (codePoint <= 0xFFFF) {
                codeUnits.push(codePoint);
            } else {
                codePoint -= 0x10000;
                highSurrogate = (codePoint >> 10) + 0xD800;
                lowSurrogate = (codePoint % 0x400) + 0xDC00;
                codeUnits.push(highSurrogate, lowSurrogate);
            }
        }
        return String.fromCharCode.apply(null, codeUnits);
    }
    return {
        get startsWith() {
            return startsWith;
        },
        get endsWith() {
            return endsWith;
        },
        get contains() {
            return contains;
        },
        get repeat() {
            return repeat;
        },
        get codePointAt() {
            return codePointAt;
        },
        get raw() {
            return raw;
        },
        get fromCodePoint() {
            return fromCodePoint;
        }
    };
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/polyfills", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/polyfills";
    var Promise = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/Promise").Promise;
    var $__9 = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/String"),
        codePointAt = $__9.codePointAt,
        contains = $__9.contains,
        endsWith = $__9.endsWith,
        fromCodePoint = $__9.fromCodePoint,
        repeat = $__9.repeat,
        raw = $__9.raw,
        startsWith = $__9.startsWith;
    var $__9 = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/ArrayIterator"),
        entries = $__9.entries,
        keys = $__9.keys,
        values = $__9.values;
    function maybeDefineMethod(object, name, value) {
        if (!(name in object)) {
            Object.defineProperty(object, name, {
                value: value,
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
    }
    function maybeAddFunctions(object, functions) {
        for (var i = 0; i < functions.length; i += 2) {
            var name = functions[i];
            var value = functions[i + 1];
            maybeDefineMethod(object, name, value);
        }
    }
    function polyfillPromise(global) {
        if (!global.Promise)
            global.Promise = Promise;
    }
    function polyfillString(String) {
        maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
        maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    }
    function polyfillArray(Array, Symbol) {
        maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values]);
        if (Symbol && Symbol.iterator) {
            Object.defineProperty(Array.prototype, Symbol.iterator, {
                value: values,
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
    }
    function polyfill(global) {
        polyfillPromise(global);
        polyfillString(global.String);
        polyfillArray(global.Array, global.Symbol);
    }
    polyfill(this);
    var setupGlobals = $traceurRuntime.setupGlobals;
    $traceurRuntime.setupGlobals = function(global) {
        setupGlobals(global);
        polyfill(global);
    };
    return {};
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfill-import", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfill-import";
    var $__11 = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/polyfills");
    return {};
});
System.get("traceur-runtime@0.0.25/src/runtime/polyfill-import" + '');

//harmonic code
"use strict";
var Harmonic = function Harmonic(name) {
  this.name = name;
};
($traceurRuntime.createClass)(Harmonic, {
  getConfig: function() {
    return {
      "name": "ES6 Rocks",
      "title": "ES6 Rocks",
      "domain": "http://es6rocks.com",
      "subtitle": "Powered by Harmonic",
      "author": "ES6 Rocks",
      "description": "A website dedicated to teach all about ES6",
      "bio": "Thats me",
      "template": "default",
      "preprocessor": "stylus",
      "posts_permalink": ":language/:year/:month/:title",
      "pages_permalink": "pages/:title",
      "header_tokens": ["<!--", "-->"],
      "index_posts": 10,
      "i18n": {
        "default": "en",
        "languages": ["en", "pt-br"]
      }
    };
  },
  getPosts: function() {
    return {
      "en": [{
        "layout": "post",
        "title": "What's next for JavaScript",
        "date": "2014-08-29T03:04:03.666Z",
        "comments": "true",
        "published": "true",
        "keywords": "talks",
        "description": "A talk by Dr. Axel Rauschmayer about what's next for JavaScript",
        "categories": ["talks"],
        "content": "<p>If you&#39;re interested in ES6 you must follow <a href=\"https://twitter.com/rauschma\">Dr. Axel Rauschmayer</a>.<br>He maintains the awesome <a href=\"http://www.2ality.com/\">2ality</a> blog and writes a lot of good stuff around ES6.<br>In those slides, he cover a lot of new ES6 features and show us what we can expect for the future.  </p>\n<script async class=\"speakerdeck-embed\" data-id=\"4126347010d6013231af66d414c0f9a8\" data-ratio=\"1.33333333333333\" src=\"//speakerdeck.com/assets/embed.js\"></script>",
        "file": "./src/posts/what-is-next-for-javascript.md",
        "filename": "what-is-next-for-javascript",
        "link": "2014/08/what-is-next-for-javascript",
        "lang": "en",
        "default_lang": false
      }, {
        "layout": "post",
        "title": "What you need to know about block scope - let",
        "date": "2014-08-28T01:58:23.465Z",
        "comments": "true",
        "published": "true",
        "keywords": "",
        "description": "An introduction to block scope on ES6",
        "categories": ["scope", " articles", " basics"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>Variables declaration in any programming language are something pretty basic.<br>Regardless the language, understanding how variable scope works is essential to write any kind of program.<br>In Python, for example, as well as in most languages​​, there are two scopes: Local and Global.<br>Variables defined at the top of the file, without identation, are global scope variables.<br>Variables declared inside the function body are considered as local scope.<br>So far, everything is very similar. In JavaScript, the behavior is quite similar.<br>Let&#39;s see one example in both languages:  </p>\n<pre><code class=\"lang-python\"># Python\nx = 1 # global scope\ny = 3\n\ndef sum(a, b):\n    s = a + b # local scope\n    return s\n</code></pre>\n<pre><code class=\"lang-javascript\">// JavaScript\nvar x = 1;  // global scope\nvar y = 3;\n\nfunction sum(a, b) {\n    var s = a + b;  // local scope\n    return s;\n}\n</code></pre>\n<p>In most C-based languages(JavaScript, PHP), variables are created at the spot where they were declared.<br>However, in JavaScrpt this is different, and can become complicated.<br>When you declare a variable in the body of a function, it is moved to the top or to the global scope. This behavior is called <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var#var_hoisting\"><em>hoisting</em></a>.<br>Unlike Python and other languages, in JavaScript, a variable declared in a for loop leaks its value.<br>See the example below:  </p>\n<pre><code class=\"lang-javascript\">// JavaScript\nfor (var i = 0; i &lt;= 2; i += 1) {\n    console.log(i); // current i\n}\nconsole.log(i); // last i\n</code></pre>\n<p>In this case, even outside of the for loop block, the variable i is still there, with the last value stored.<br>This is a pretty common issue where a program can be easily broken by lack of attention.<br>Another important factor in JavaScript is that the omission of <em>var</em> to declare a variable causes it to be allocated in the global scope, and this can cause many problems.  </p>\n<h2 id=\"let-declaration\">let declaration</h2>\n<p>The <em>let</em> arrives in ES6 as a substitute for <em>var</em>. Yes, the idea is that var will be discontinued in a distant future,  because today it would be impossible completely stop supporting it without breaking the whole internet.<br>The <em>let</em> works as expected, setting the variable in the place where it was declared.<br>Example:  </p>\n<pre><code class=\"lang-javascript\">let foo = true;\nif  (foo) {\n    let bar = &#39;baz&#39;;\n    console.log(bar); // outputs &#39;baz&#39;\n}\n\ntry {\n    console.log(bar);\n} catch (e) {\n    console.log(&quot;bar doesn&#39;t exist&quot;);\n}\n</code></pre>\n<p>As you might imagine, <em>let</em> solves the problem with the variable in the for loop.<br>See:  </p>\n<pre><code class=\"lang-javascript\">// JavaScript\nfor (let i = 0; i &lt;= 2; i += 1) {\n    console.log(i); // current i\n}\ntry {\n    console.log(i);\n} catch (e) {\n    console.log(&quot;i doesn&#39;t exist&quot;);\n}\n</code></pre>\n<h2 id=\"support-today\">Support today</h2>\n<p>You can use <em>let</em> today*<br>Check out the awesome Kangax ES6 table &gt; <a href=\"http://kangax.github.io/compat-table/es6/#\">http://kangax.github.io/compat-table/es6/#</a>.<br><em>let</em> is currently supported by the modern browsers (even IE11) in theirs last versions and <a href=\"https://github.com/google/traceur-compiler\">Traceur</a> as well.<br>You can try ES6 <em>let</em> on Firefox devtools:  </p>\n<p><img src=\"/img/let.gif\" alt=\"let on firefox nightly\">  </p>\n<ul>\n<li><strong>NOTE</strong>: As well pointed by Michał Gołębiowski on the comments below, browsers implementations are not fully according with the spec, so you may find some bugs.<br>For real world applications, you&#39;ll need to use a traspiler (at least, for a while until mid 2015).  </li>\n</ul>\n<h2 id=\"conclusion\">Conclusion</h2>\n<p>Although simple, declaring variables in JavaScript can cause headache for beginners in the language.<br>With <em>let</em>, to declare variables is much more intuitive and consistent with a C-based language.<br>The use of <em>var</em> should be discontinued, and only the <em>let</em> must exist in the future.<br>There&#39;s no <em>hoisting</em> behavior for variables declared with <em>let</em>.  </p>\n",
        "file": "./src/posts/what-you-need-to-know-about-block-scope-let.md",
        "filename": "what-you-need-to-know-about-block-scope-let",
        "link": "2014/08/what-you-need-to-know-about-block-scope-let",
        "lang": "en",
        "default_lang": false
      }, {
        "layout": "post",
        "title": "A new syntax for modules in ES6",
        "date": "2014-07-11T07:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6, modules",
        "description": "Post about module syntax",
        "categories": ["modules"],
        "authorName": "Jean Carlo Emer",
        "authorLink": "http://twitter.com/jcemer",
        "authorDescription": "Internet craftsman, computer scientist and speaker. I am a full-stack web developer for some time and only write code that solves real problems.",
        "authorPicture": "https://avatars2.githubusercontent.com/u/353504?s=460",
        "content": "<p>TC39 - ECMAScript group is finishing the sixth version of ECMAScript specification. The <a href=\"http://www.2ality.com/2014/06/es6-schedule.html\">group schedule</a> points to next June as the release date. By now, no significant differences may appear. It is time to deepen your knowledge into the subject.<br><!-- more -->\nThis post will not cover the importance of writing modular code. ES6 modules are already well displayed by websites like <a href=\"http://jsmodules.io\">JavaScript Modules</a>, by far the best reference. The objective here is to clarify and justify the necessities of releasing a new syntax to write modules.</p>\n",
        "file": "./src/posts/a-new-syntax-for-modules-in-es6.md",
        "filename": "a-new-syntax-for-modules-in-es6",
        "link": "2014/07/a-new-syntax-for-modules-in-es6",
        "lang": "en",
        "default_lang": false
      }, {
        "layout": "post",
        "title": "ES6 interview with David Herman",
        "date": "2014-07-04T01:08:30.242Z",
        "comments": "true",
        "published": "true",
        "keywords": "ES6",
        "description": "Interview with David Herman about ES6",
        "categories": ["ES6", " Interview"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>We did a nice interview with <a href=\"https://twitter.com/littlecalculist\">David Herman</a> about his thoughts about ES6.\nDavid is the principal researcher and founder of Mozilla Research, where he works to expand the foundations of the Open Web. He participates in a number of Web platform projects, including: <a href=\"http://taskjs.org/\">task.js</a>, <a href=\"http://sweetjs.org/\">sweet.js</a>, <a href=\"http://asmjs.org/\">asm.js</a>, <a href=\"http://www.rust-lang.org/\">Rust</a>, <a href=\"https://github.com/mozilla/servo/\">Servo</a> and Parallel JS.</p>\n",
        "file": "./src/posts/es6-interview-with-david-herman.md",
        "filename": "es6-interview-with-david-herman",
        "link": "2014/07/es6-interview-with-david-herman",
        "lang": "en",
        "default_lang": false
      }, {
        "layout": "post",
        "title": "Practical Workflows for ES6 Modules, Fluent 2014",
        "date": "2014-05-27T07:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6, modules",
        "description": "Post about modules",
        "categories": ["modules", " talks"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p><a href=\"https://twitter.com/guybedford\">Guy Bedford</a> gave an awesome talk about a practical workflows with ES6 modules last month at Fluent Conf.<br>Also, he write up an article about it. If you are interested on this subject, you must read the full article.  </p>\n",
        "file": "./src/posts/practical-workflows-es6-modules.md",
        "filename": "practical-workflows-es6-modules",
        "link": "2014/05/practical-workflows-es6-modules",
        "lang": "en",
        "default_lang": false
      }, {
        "layout": "post",
        "title": "ECMAScript 6 - A Better JavaScript for the Ambient Computing Era",
        "date": "2014-05-27T06:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6, talks",
        "description": "talk about es6",
        "categories": ["talks"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>Allen Wirfs-Brock (<a href=\"https://twitter.com/awbjs\">awbjs</a> on Twitter) is a TC39 member. Actually, he is the &quot;Project Editor of the ECMAScript Language Specification&quot;.</p>\n",
        "file": "./src/posts/ecmascript-6-a-better-javascript-for-the-ambient-computing-era.md",
        "filename": "ecmascript-6-a-better-javascript-for-the-ambient-computing-era",
        "link": "2014/05/ecmascript-6-a-better-javascript-for-the-ambient-computing-era",
        "lang": "en",
        "default_lang": false
      }, {
        "layout": "post",
        "title": "ECMAScript 6 - The future is here",
        "date": "2014-05-27T05:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6, talks",
        "description": "talk about es6",
        "categories": ["talks"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>A talk by <a href=\"https://twitter.com/sebarmeli\">Sebastiano Armeli</a> showing some of the ES6 features like scoping, generators, collections, modules and proxies.</p>\n",
        "file": "./src/posts/ecmascript-6-the-future-is-here.md",
        "filename": "ecmascript-6-the-future-is-here",
        "link": "2014/05/ecmascript-6-the-future-is-here",
        "lang": "en",
        "default_lang": false
      }, {
        "layout": "post",
        "title": "Hello World",
        "date": "2014-05-17T08:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6",
        "description": "Hello world post",
        "categories": ["JavaScript", " ES6"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>Hello everybody, welcome to ES6Rocks!<br>The mission here is to discuss about <a href=\"http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts\">JavaScript&#39;s next version</a> , aka Harmony or ES.next.  </p>\n",
        "file": "./src/posts/hello-world.md",
        "filename": "hello-world",
        "link": "2014/05/hello-world",
        "lang": "en",
        "default_lang": false
      }],
      "pt-br": [{
        "layout": "post",
        "title": "O que podemos esperar do novo JavaScript",
        "date": "2014-08-29T03:04:03.666Z",
        "comments": "true",
        "published": "true",
        "keywords": "talks",
        "description": "Slides da palestra do Dr. Axel Rauschmayer sobre o que podemos esperar da nova versão do JavaScript",
        "categories": ["talks"],
        "content": "<p>Se você está interessado em ES6, você deve seguir o <a href=\"https://twitter.com/rauschma\">Dr. Axel Rauschmayer</a>.<br>Ele mantêm o incrível blog <a href=\"http://www.2ality.com/\">2ality</a> e escreve uma série de coisas legais sobre ES6.<br>Nessa sua talk ele fala sobre várias novas features da ES6 e mostra o que podemos esperar do futuro.  </p>\n<script async class=\"speakerdeck-embed\" data-id=\"4126347010d6013231af66d414c0f9a8\" data-ratio=\"1.33333333333333\" src=\"//speakerdeck.com/assets/embed.js\"></script>",
        "file": "./src/posts/what-is-next-for-javascript.md",
        "filename": "what-is-next-for-javascript",
        "link": "pt-br/2014/08/what-is-next-for-javascript",
        "lang": "pt-br",
        "default_lang": true
      }, {
        "layout": "post",
        "title": "O que você precisa saber sobre block scope - let",
        "date": "2014-08-28T01:58:23.465Z",
        "comments": "true",
        "published": "true",
        "keywords": "",
        "description": "Uma introdução a block scope na ES6",
        "categories": ["scope", " articles", " basics"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>Declaração de variáveis em qualquer linguagem de programação é algo básico.<br>Independente da linguagem, entender o funcionamento do escopo de variáveis é imprescindível para escrever qualquer programa.<br>Em Python, por exemplo, assim como na maioria das linguagens, existem 2 escopos: Local e Global.<br>Variáveis definidas na raíz do arquivo, sem identação são variáveis de escopo Global.<br>Variáveis que são declaradas dentro do corpo de uma função são consideradas de escopo local.<br>Até aqui, tudo é muito parecido. No JavaScript o comportamente é bem semelhante.<br>Vejamos um exemplo nas 2 linguagens:  </p>\n<pre><code class=\"lang-python\"># Python\nx = 1 # global scope\ny = 3\n\ndef sum(a, b):\n    s = a + b # local scope\n    return s\n</code></pre>\n<pre><code class=\"lang-javascript\">// JavaScript\nvar x = 1;  // global scope\nvar y = 3;\n\nfunction sum(a, b) {\n    var s = a + b;  // local scope\n    return s;\n}\n</code></pre>\n<p>Na maioria das linguagens baseadas em C (JavaScript, PHP), as variáveis são criadas no local onde foram declaradas.<br>Entretanto, no JavaScript isso é diferente, e pode se tornar complicado.<br>Ao declarar uma variável no corpo de uma função, a mesma é movida para o topo ou para o escopo global. Esse comportamento é chamado de <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var#var_hoisting\"><em>hoisting</em></a>.<br>Diferentemente de Python e outras linguagens, no JavaScript, uma variável declarada em um for loop acaba vazando o seu valor.<br>Veja no exemplo abaixo:  </p>\n<pre><code class=\"lang-javascript\">// JavaScript\nfor (var i = 0; i &lt;= 2; i += 1) {\n    console.log(i); // current i\n}\nconsole.log(i); // last i\n</code></pre>\n<p>Neste caso, mesmo fora do bloco do for loop, a variável i ainda existe e com o último valor recebido no laço.<br>Este é um problema bem comum onde um programa pode ser facilmente quebrado por falta de atenção.  </p>\n<p>Outro fator importante no JavaScript é que a omissão de <em>var</em> para declarar uma variável faz com que a mesma seja alocada no escopo global, e isso pode causar inúmeros problemas.  </p>\n<h2 id=\"declara-o-let\">Declaração let</h2>\n<p>O <em>let</em> chega na ES6 como um substituto do <em>var</em>. Sim, a ideia é que var seja descontinuado em um futuro distante, pois hoje seria impossível não suporta-lo sem quebrar 100% da internet.<br>O <em>let</em> funciona como o esperado, definindo a variável no local onde ela foi declarada.<br>Exemplo:  </p>\n<pre><code class=\"lang-javascript\">let foo = true;\nif  (foo) {\n    let bar = &#39;baz&#39;;\n    console.log(bar); // outputs &#39;baz&#39;\n}\n\ntry {\n    console.log(bar);\n} catch (e) {\n    console.log(&quot;bar doesn&#39;t exist&quot;);\n}\n</code></pre>\n<p>Como você já deve imaginar, com <em>let</em> é possível resolver o problema com a variável no for loop.<br>Veja:  </p>\n<pre><code class=\"lang-javascript\">// JavaScript\nfor (let i = 0; i &lt;= 2; i += 1) {\n    console.log(i); // current i\n}\ntry {\n    console.log(i);\n} catch (e) {\n    console.log(&quot;i doesn&#39;t exist&quot;);\n}\n</code></pre>\n<h2 id=\"suporte-atual\">Suporte atual</h2>\n<p>Você pode usar <em>let</em> hoje*<br>Olhe a excelente tabela ES6 feita pelo Kangax &gt; <a href=\"http://kangax.github.io/compat-table/es6/#\">http://kangax.github.io/compat-table/es6/#</a>.<br><em>let</em> é atualmente suporttado pelos browsers modernos(até no IE11) em suas últimas versões e no <a href=\"https://github.com/google/traceur-compiler\">Traceur</a>.<br>Você pode brincar com ES6 <em>let</em> no Firefox devtools:  </p>\n<p><img src=\"/img/let.gif\" alt=\"let on firefox nightly\">  </p>\n<ul>\n<li><strong>NOTA</strong>: Como bem apontado pelo Michał Gołębiowski nos comentários (post em inglês <a href=\"http://es6rocks.com/2014/08/what-you-need-to-know-about-block-scope-let/#comment-1576757325\">http://es6rocks.com/2014/08/what-you-need-to-know-about-block-scope-let/#comment-1576757325</a>), as implementações atuais dos browsers não estão totalmente de acordo com a especificação, então é possível encontrar alguns bugs.<br>Para aplicações do mundo real, você precisará utilizar um transpiler(pelo menos por enquanto, até o meio de 2015).  </li>\n</ul>\n<h2 id=\"conclus-o\">Conclusão</h2>\n<p>Apesar de simples, declarar variáveis no JavaScript pode causar dor de cabeça em iniciantes na linguagem.<br>Com o <em>let</em>, declarar variáveis fica muito mais intuítivo e coerente com uma linguagem baseada em C.<br>O uso do <em>var</em> deve ser descontinuado, e apenas o <em>let</em> deve existir no futuro.<br>Não existe o comportamento de <em>hoisting</em> para variáveis declaradas com <em>let</em>.  </p>\n<h2 id=\"outras-refer-ncias\">Outras referências</h2>\n<p><a href=\"https://people.mozilla.org/~jorendorff/es6-draft.html#sec-let-and-const-declarations\">https://people.mozilla.org/~jorendorff/es6-draft.html#sec-let-and-const-declarations</a><br><a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let\">https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let</a><br><a href=\"http://odetocode.com/blogs/scott/archive/2014/07/31/the-features-of-es6-part-1-let.aspx\">http://odetocode.com/blogs/scott/archive/2014/07/31/the-features-of-es6-part-1-let.aspx</a>  </p>\n",
        "file": "./src/posts/what-you-need-to-know-about-block-scope-let.md",
        "filename": "what-you-need-to-know-about-block-scope-let",
        "link": "pt-br/2014/08/what-you-need-to-know-about-block-scope-let",
        "lang": "pt-br",
        "default_lang": true
      }, {
        "layout": "post",
        "title": "Uma nova sintaxe para módulos na ES6",
        "date": "2014-07-11T07:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6, modules",
        "description": "Post about module syntax",
        "categories": ["modules"],
        "authorName": "Jean Carlo Emer",
        "authorLink": "http://twitter.com/jcemer",
        "authorDescription": "Internet craftsman, computer scientist and speaker. I am a full-stack web developer for some time and only write code that solves real problems.",
        "authorPicture": "https://avatars2.githubusercontent.com/u/353504?s=460",
        "content": "<p>O grupo TC39 - ECMAScript já está finalizando a sexta versão da especificação do ECMAScript. A <a href=\"http://www.2ality.com/2014/06/es6-schedule.html\">agenda do grupo</a> aponta o mês de junho do próximo ano como sendo a data de lançamento. A partir de agora, poucas mudanças significativas devem surgir. Já é tempo de se aprofundar no estudo.</p>\n<p>Este artigo não pretende abordar a importância da escrita de código modularizado. Já escrevi sobre o assunto no artigo <a href=\"http://tableless.com.br/modularizacao-em-javascript\">Modularização em JavaScript</a>. Sites como <a href=\"http://jsmodules.io\">JavaScript Modules</a> entre outros já são uma ótima referência sobre como escrever módulos ES6. A intenção aqui é esclarecer e justificar a necessidade de uma nova sintaxe para escrita de módulos.</p>\n",
        "file": "./src/posts/a-new-syntax-for-modules-in-es6.md",
        "filename": "a-new-syntax-for-modules-in-es6",
        "link": "pt-br/2014/07/a-new-syntax-for-modules-in-es6",
        "lang": "pt-br",
        "default_lang": true
      }, {
        "layout": "post",
        "title": "Entrevista sobre ES6 com o David Herman",
        "date": "2014-07-04T01:08:30.242Z",
        "comments": "true",
        "published": "true",
        "keywords": "ES6",
        "description": "Entrevista feita com David Herman sobre ES6",
        "categories": ["ES6", " Interview"],
        "content": "<p>Fizemos uma entrevista bem legal com o <a href=\"https://twitter.com/littlecalculist\">David Herman</a> sobre ES6.<br>Para quem não conhece, o David é o principal pesquisador e fundador da Mozilla Research, onde ele trabalha para expandir as fundações da Open Web. Ele está envolvido com diversos projetos de plataformas Web, incluindo <a href=\"http://taskjs.org/\">task.js</a>, <a href=\"http://sweetjs.org/\">sweet.js</a>, <a href=\"http://asmjs.org/\">asm.js</a>, <a href=\"http://www.rust-lang.org/\">Rust</a>, <a href=\"https://github.com/mozilla/servo/\">Servo</a> e Parallel JS.  </p>\n",
        "file": "./src/posts/es6-interview-with-david-herman.md",
        "filename": "es6-interview-with-david-herman",
        "link": "pt-br/2014/07/es6-interview-with-david-herman",
        "lang": "pt-br",
        "default_lang": true
      }, {
        "layout": "post",
        "title": "Workflows para os módulos da ES6, Fluent 2014",
        "date": "2014-05-27T07:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6, modules",
        "description": "Post sobre módulos",
        "categories": ["modules", " talks"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>O <a href=\"https://twitter.com/guybedford\">Guy Bedford</a> deu um palestra incrível sobre workflows com módulos ES6 no último mês na Fluent Conf.\nEle também escreveu um artigo sonre isso. Se você está interessado neste assunto, você deve ler o artigo por completo.</p>\n",
        "file": "./src/posts/practical-workflows-es6-modules.md",
        "filename": "practical-workflows-es6-modules",
        "link": "pt-br/2014/05/practical-workflows-es6-modules",
        "lang": "pt-br",
        "default_lang": true
      }, {
        "layout": "post",
        "title": "ECMAScript 6 - Um melhor JavaScript para a Ambient Computing Era",
        "date": "2014-05-27T06:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6, talks",
        "description": "talk about es6",
        "categories": ["talks"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>Allen Wirfs-Brock (<a href=\"https://twitter.com/awbjs\">awbjs</a> no Twitter) é um membro do comitê TC39. Na verdade, ele é o &quot;Project Editor of the ECMAScript Language Specification&quot;, ou seja, editor chefe da ECMA.  </p>\n",
        "file": "./src/posts/ecmascript-6-a-better-javascript-for-the-ambient-computing-era.md",
        "filename": "ecmascript-6-a-better-javascript-for-the-ambient-computing-era",
        "link": "pt-br/2014/05/ecmascript-6-a-better-javascript-for-the-ambient-computing-era",
        "lang": "pt-br",
        "default_lang": true
      }, {
        "layout": "post",
        "title": "ECMAScript 6 - O futuro está aqui",
        "date": "2014-05-27T05:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6, talks",
        "description": "talk about es6",
        "categories": ["talks"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>Uma palestra do <a href=\"https://twitter.com/sebarmeli\">Sebastiano Armeli</a> mostrando algumas features da ES6 como scoping, generators, collections, modules and proxies.  </p>\n",
        "file": "./src/posts/ecmascript-6-the-future-is-here.md",
        "filename": "ecmascript-6-the-future-is-here",
        "link": "pt-br/2014/05/ecmascript-6-the-future-is-here",
        "lang": "pt-br",
        "default_lang": true
      }, {
        "layout": "post",
        "title": "Hello World",
        "date": "2014-05-17T08:18:47.847Z",
        "comments": "true",
        "published": "true",
        "keywords": "JavaScript, ES6",
        "description": "Hello world post",
        "categories": ["JavaScript", " ES6"],
        "authorName": "Jaydson",
        "authorLink": "http://twitter.com/jaydson",
        "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
        "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
        "content": "<p>Olá pessoal, bem-vindos ao ES6Rocks!\nNossa missão aqui é discutir sobre a <a href=\"http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts\">a nova versão do JavaScript</a>, mais conhecida como Harmony ou ES.next.</p>\n",
        "file": "./src/posts/hello-world.md",
        "filename": "hello-world",
        "link": "pt-br/2014/05/hello-world",
        "lang": "pt-br",
        "default_lang": true
      }]
    };
  }
}, {});