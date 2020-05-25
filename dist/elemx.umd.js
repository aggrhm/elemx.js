(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.elemx = {}));
}(this, (function (exports) { 'use strict';

    /** MobX - (c) Michel Weststrate 2015 - 2020 - MIT Licensed */
    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var OBFUSCATED_ERROR = "An invariant failed, however the error is obfuscated because this is a production build.";
    var EMPTY_ARRAY = [];
    Object.freeze(EMPTY_ARRAY);
    var EMPTY_OBJECT = {};
    Object.freeze(EMPTY_OBJECT);
    function getNextId() {
        return ++globalState.mobxGuid;
    }
    function fail(message) {
        invariant(false, message);
        throw "X"; // unreachable
    }
    function invariant(check, message) {
        if (!check)
            throw new Error("[mobx] " + (message || OBFUSCATED_ERROR));
    }
    /**
     * Makes sure that the provided function is invoked at most once.
     */
    function once(func) {
        var invoked = false;
        return function () {
            if (invoked)
                return;
            invoked = true;
            return func.apply(this, arguments);
        };
    }
    var noop = function () { };
    function unique(list) {
        var res = [];
        list.forEach(function (item) {
            if (res.indexOf(item) === -1)
                res.push(item);
        });
        return res;
    }
    function isObject(value) {
        return value !== null && typeof value === "object";
    }
    function isPlainObject(value) {
        if (value === null || typeof value !== "object")
            return false;
        var proto = Object.getPrototypeOf(value);
        return proto === Object.prototype || proto === null;
    }
    function addHiddenProp(object, propName, value) {
        Object.defineProperty(object, propName, {
            enumerable: false,
            writable: true,
            configurable: true,
            value: value
        });
    }
    function addHiddenFinalProp(object, propName, value) {
        Object.defineProperty(object, propName, {
            enumerable: false,
            writable: false,
            configurable: true,
            value: value
        });
    }
    function isPropertyConfigurable(object, prop) {
        var descriptor = Object.getOwnPropertyDescriptor(object, prop);
        return !descriptor || (descriptor.configurable !== false && descriptor.writable !== false);
    }
    function assertPropertyConfigurable(object, prop) {
        if (process.env.NODE_ENV !== "production" && !isPropertyConfigurable(object, prop))
            fail("Cannot make property '" + prop.toString() + "' observable, it is not configurable and writable in the target object");
    }
    function createInstanceofPredicate(name, clazz) {
        var propName = "isMobX" + name;
        clazz.prototype[propName] = true;
        return function (x) {
            return isObject(x) && x[propName] === true;
        };
    }
    function isES6Map(thing) {
        return thing instanceof Map;
    }
    function isES6Set(thing) {
        return thing instanceof Set;
    }
    /**
     * Returns the following: own keys, prototype keys & own symbol keys, if they are enumerable.
     */
    function getPlainObjectKeys(object) {
        var enumerables = new Set();
        for (var key in object)
            enumerables.add(key); // *all* enumerables
        Object.getOwnPropertySymbols(object).forEach(function (k) {
            if (Object.getOwnPropertyDescriptor(object, k).enumerable)
                enumerables.add(k);
        }); // *own* symbols
        // Note: this implementation is missing enumerable, inherited, symbolic property names! That would however pretty expensive to add,
        // as there is no efficient iterator that returns *all* properties
        return Array.from(enumerables);
    }
    function stringifyKey(key) {
        if (key && key.toString)
            return key.toString();
        else
            return new String(key).toString();
    }
    function getMapLikeKeys(map) {
        if (isPlainObject(map))
            return Object.keys(map);
        if (Array.isArray(map))
            return map.map(function (_a) {
                var _b = __read(_a, 1), key = _b[0];
                return key;
            });
        if (isES6Map(map) || isObservableMap(map))
            return Array.from(map.keys());
        return fail("Cannot get keys from '" + map + "'");
    }
    function toPrimitive(value) {
        return value === null ? null : typeof value === "object" ? "" + value : value;
    }

    var $mobx = Symbol("mobx administration");
    var Atom = /** @class */ (function () {
        /**
         * Create a new atom. For debugging purposes it is recommended to give it a name.
         * The onBecomeObserved and onBecomeUnobserved callbacks can be used for resource management.
         */
        function Atom(name) {
            if (name === void 0) { name = "Atom@" + getNextId(); }
            this.name = name;
            this.isPendingUnobservation = false; // for effective unobserving. BaseAtom has true, for extra optimization, so its onBecomeUnobserved never gets called, because it's not needed
            this.isBeingObserved = false;
            this.observers = new Set();
            this.diffValue = 0;
            this.lastAccessedBy = 0;
            this.lowestObserverState = IDerivationState.NOT_TRACKING;
        }
        Atom.prototype.onBecomeObserved = function () {
            if (this.onBecomeObservedListeners) {
                this.onBecomeObservedListeners.forEach(function (listener) { return listener(); });
            }
        };
        Atom.prototype.onBecomeUnobserved = function () {
            if (this.onBecomeUnobservedListeners) {
                this.onBecomeUnobservedListeners.forEach(function (listener) { return listener(); });
            }
        };
        /**
         * Invoke this method to notify mobx that your atom has been used somehow.
         * Returns true if there is currently a reactive context.
         */
        Atom.prototype.reportObserved = function () {
            return reportObserved(this);
        };
        /**
         * Invoke this method _after_ this method has changed to signal mobx that all its observers should invalidate.
         */
        Atom.prototype.reportChanged = function () {
            startBatch();
            propagateChanged(this);
            endBatch();
        };
        Atom.prototype.toString = function () {
            return this.name;
        };
        return Atom;
    }());
    var isAtom = createInstanceofPredicate("Atom", Atom);
    function createAtom(name, onBecomeObservedHandler, onBecomeUnobservedHandler) {
        if (onBecomeObservedHandler === void 0) { onBecomeObservedHandler = noop; }
        if (onBecomeUnobservedHandler === void 0) { onBecomeUnobservedHandler = noop; }
        var atom = new Atom(name);
        // default `noop` listener will not initialize the hook Set
        if (onBecomeObservedHandler !== noop) {
            onBecomeObserved(atom, onBecomeObservedHandler);
        }
        if (onBecomeUnobservedHandler !== noop) {
            onBecomeUnobserved(atom, onBecomeUnobservedHandler);
        }
        return atom;
    }

    function identityComparer(a, b) {
        return a === b;
    }
    function structuralComparer(a, b) {
        return deepEqual(a, b);
    }
    function shallowComparer(a, b) {
        return deepEqual(a, b, 1);
    }
    function defaultComparer(a, b) {
        return Object.is(a, b);
    }
    var comparer = {
        identity: identityComparer,
        structural: structuralComparer,
        default: defaultComparer,
        shallow: shallowComparer
    };

    var mobxDidRunLazyInitializersSymbol = Symbol("mobx did run lazy initializers");
    var mobxPendingDecorators = Symbol("mobx pending decorators");
    var enumerableDescriptorCache = {};
    var nonEnumerableDescriptorCache = {};
    function createPropertyInitializerDescriptor(prop, enumerable) {
        var cache = enumerable ? enumerableDescriptorCache : nonEnumerableDescriptorCache;
        return (cache[prop] ||
            (cache[prop] = {
                configurable: true,
                enumerable: enumerable,
                get: function () {
                    initializeInstance(this);
                    return this[prop];
                },
                set: function (value) {
                    initializeInstance(this);
                    this[prop] = value;
                }
            }));
    }
    function initializeInstance(target) {
        var e_1, _a;
        if (target[mobxDidRunLazyInitializersSymbol] === true)
            return;
        var decorators = target[mobxPendingDecorators];
        if (decorators) {
            addHiddenProp(target, mobxDidRunLazyInitializersSymbol, true);
            // Build property key array from both strings and symbols
            var keys = __spread(Object.getOwnPropertySymbols(decorators), Object.keys(decorators));
            try {
                for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                    var key = keys_1_1.value;
                    var d = decorators[key];
                    d.propertyCreator(target, d.prop, d.descriptor, d.decoratorTarget, d.decoratorArguments);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    }
    function createPropDecorator(propertyInitiallyEnumerable, propertyCreator) {
        return function decoratorFactory() {
            var decoratorArguments;
            var decorator = function decorate(target, prop, descriptor, applyImmediately
            // This is a special parameter to signal the direct application of a decorator, allow extendObservable to skip the entire type decoration part,
            // as the instance to apply the decorator to equals the target
            ) {
                if (applyImmediately === true) {
                    propertyCreator(target, prop, descriptor, target, decoratorArguments);
                    return null;
                }
                if (process.env.NODE_ENV !== "production" && !quacksLikeADecorator(arguments))
                    fail("This function is a decorator, but it wasn't invoked like a decorator");
                if (!Object.prototype.hasOwnProperty.call(target, mobxPendingDecorators)) {
                    var inheritedDecorators = target[mobxPendingDecorators];
                    addHiddenProp(target, mobxPendingDecorators, __assign({}, inheritedDecorators));
                }
                target[mobxPendingDecorators][prop] = {
                    prop: prop,
                    propertyCreator: propertyCreator,
                    descriptor: descriptor,
                    decoratorTarget: target,
                    decoratorArguments: decoratorArguments
                };
                return createPropertyInitializerDescriptor(prop, propertyInitiallyEnumerable);
            };
            if (quacksLikeADecorator(arguments)) {
                // @decorator
                decoratorArguments = EMPTY_ARRAY;
                return decorator.apply(null, arguments);
            }
            else {
                // @decorator(args)
                decoratorArguments = Array.prototype.slice.call(arguments);
                return decorator;
            }
        };
    }
    function quacksLikeADecorator(args) {
        return (((args.length === 2 || args.length === 3) &&
            (typeof args[1] === "string" || typeof args[1] === "symbol")) ||
            (args.length === 4 && args[3] === true));
    }

    function deepEnhancer(v, _, name) {
        // it is an observable already, done
        if (isObservable(v))
            return v;
        // something that can be converted and mutated?
        if (Array.isArray(v))
            return observable.array(v, { name: name });
        if (isPlainObject(v))
            return observable.object(v, undefined, { name: name });
        if (isES6Map(v))
            return observable.map(v, { name: name });
        if (isES6Set(v))
            return observable.set(v, { name: name });
        return v;
    }
    function shallowEnhancer(v, _, name) {
        if (v === undefined || v === null)
            return v;
        if (isObservableObject(v) || isObservableArray(v) || isObservableMap(v) || isObservableSet(v))
            return v;
        if (Array.isArray(v))
            return observable.array(v, { name: name, deep: false });
        if (isPlainObject(v))
            return observable.object(v, undefined, { name: name, deep: false });
        if (isES6Map(v))
            return observable.map(v, { name: name, deep: false });
        if (isES6Set(v))
            return observable.set(v, { name: name, deep: false });
        return fail(process.env.NODE_ENV !== "production" &&
            "The shallow modifier / decorator can only used in combination with arrays, objects, maps and sets");
    }
    function referenceEnhancer(newValue) {
        // never turn into an observable
        return newValue;
    }
    function refStructEnhancer(v, oldValue, name) {
        if (process.env.NODE_ENV !== "production" && isObservable(v))
            throw "observable.struct should not be used with observable values";
        if (deepEqual(v, oldValue))
            return oldValue;
        return v;
    }

    function createDecoratorForEnhancer(enhancer) {
        invariant(enhancer);
        var decorator = createPropDecorator(true, function (target, propertyName, descriptor, _decoratorTarget, decoratorArgs) {
            if (process.env.NODE_ENV !== "production") {
                invariant(!descriptor || !descriptor.get, "@observable cannot be used on getter (property \"" + stringifyKey(propertyName) + "\"), use @computed instead.");
            }
            var initialValue = descriptor
                ? descriptor.initializer
                    ? descriptor.initializer.call(target)
                    : descriptor.value
                : undefined;
            asObservableObject(target).addObservableProp(propertyName, initialValue, enhancer);
        });
        var res = 
        // Extra process checks, as this happens during module initialization
        typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production"
            ? function observableDecorator() {
                // This wrapper function is just to detect illegal decorator invocations, deprecate in a next version
                // and simply return the created prop decorator
                if (arguments.length < 2)
                    return fail("Incorrect decorator invocation. @observable decorator doesn't expect any arguments");
                return decorator.apply(null, arguments);
            }
            : decorator;
        res.enhancer = enhancer;
        return res;
    }

    // Predefined bags of create observable options, to avoid allocating temporarily option objects
    // in the majority of cases
    var defaultCreateObservableOptions = {
        deep: true,
        name: undefined,
        defaultDecorator: undefined,
        proxy: true
    };
    Object.freeze(defaultCreateObservableOptions);
    function assertValidOption(key) {
        if (!/^(deep|name|equals|defaultDecorator|proxy)$/.test(key))
            fail("invalid option for (extend)observable: " + key);
    }
    function asCreateObservableOptions(thing) {
        if (thing === null || thing === undefined)
            return defaultCreateObservableOptions;
        if (typeof thing === "string")
            return { name: thing, deep: true, proxy: true };
        if (process.env.NODE_ENV !== "production") {
            if (typeof thing !== "object")
                return fail("expected options object");
            Object.keys(thing).forEach(assertValidOption);
        }
        return thing;
    }
    var deepDecorator = createDecoratorForEnhancer(deepEnhancer);
    var shallowDecorator = createDecoratorForEnhancer(shallowEnhancer);
    var refDecorator = createDecoratorForEnhancer(referenceEnhancer);
    var refStructDecorator = createDecoratorForEnhancer(refStructEnhancer);
    function getEnhancerFromOptions(options) {
        return options.defaultDecorator
            ? options.defaultDecorator.enhancer
            : options.deep === false
                ? referenceEnhancer
                : deepEnhancer;
    }
    /**
     * Turns an object, array or function into a reactive structure.
     * @param v the value which should become observable.
     */
    function createObservable(v, arg2, arg3) {
        // @observable someProp;
        if (typeof arguments[1] === "string" || typeof arguments[1] === "symbol") {
            return deepDecorator.apply(null, arguments);
        }
        // it is an observable already, done
        if (isObservable(v))
            return v;
        // something that can be converted and mutated?
        var res = isPlainObject(v)
            ? observable.object(v, arg2, arg3)
            : Array.isArray(v)
                ? observable.array(v, arg2)
                : isES6Map(v)
                    ? observable.map(v, arg2)
                    : isES6Set(v)
                        ? observable.set(v, arg2)
                        : v;
        // this value could be converted to a new observable data structure, return it
        if (res !== v)
            return res;
        // otherwise, just box it
        fail(process.env.NODE_ENV !== "production" &&
            "The provided value could not be converted into an observable. If you want just create an observable reference to the object use 'observable.box(value)'");
    }
    var observableFactories = {
        box: function (value, options) {
            if (arguments.length > 2)
                incorrectlyUsedAsDecorator("box");
            var o = asCreateObservableOptions(options);
            return new ObservableValue(value, getEnhancerFromOptions(o), o.name, true, o.equals);
        },
        array: function (initialValues, options) {
            if (arguments.length > 2)
                incorrectlyUsedAsDecorator("array");
            var o = asCreateObservableOptions(options);
            return createObservableArray(initialValues, getEnhancerFromOptions(o), o.name);
        },
        map: function (initialValues, options) {
            if (arguments.length > 2)
                incorrectlyUsedAsDecorator("map");
            var o = asCreateObservableOptions(options);
            return new ObservableMap(initialValues, getEnhancerFromOptions(o), o.name);
        },
        set: function (initialValues, options) {
            if (arguments.length > 2)
                incorrectlyUsedAsDecorator("set");
            var o = asCreateObservableOptions(options);
            return new ObservableSet(initialValues, getEnhancerFromOptions(o), o.name);
        },
        object: function (props, decorators, options) {
            if (typeof arguments[1] === "string")
                incorrectlyUsedAsDecorator("object");
            var o = asCreateObservableOptions(options);
            if (o.proxy === false) {
                return extendObservable({}, props, decorators, o);
            }
            else {
                var defaultDecorator = getDefaultDecoratorFromObjectOptions(o);
                var base = extendObservable({}, undefined, undefined, o);
                var proxy = createDynamicObservableObject(base);
                extendObservableObjectWithProperties(proxy, props, decorators, defaultDecorator);
                return proxy;
            }
        },
        ref: refDecorator,
        shallow: shallowDecorator,
        deep: deepDecorator,
        struct: refStructDecorator
    };
    var observable = createObservable;
    // weird trick to keep our typings nicely with our funcs, and still extend the observable function
    Object.keys(observableFactories).forEach(function (name) { return (observable[name] = observableFactories[name]); });
    function incorrectlyUsedAsDecorator(methodName) {
        fail(
        // process.env.NODE_ENV !== "production" &&
        "Expected one or two arguments to observable." + methodName + ". Did you accidentally try to use observable." + methodName + " as decorator?");
    }

    var computedDecorator = createPropDecorator(false, function (instance, propertyName, descriptor, decoratorTarget, decoratorArgs) {
        var get = descriptor.get, set = descriptor.set; // initialValue is the descriptor for get / set props
        // Optimization: faster on decorator target or instance? Assuming target
        // Optimization: find out if declaring on instance isn't just faster. (also makes the property descriptor simpler). But, more memory usage..
        // Forcing instance now, fixes hot reloadig issues on React Native:
        var options = decoratorArgs[0] || {};
        asObservableObject(instance).addComputedProp(instance, propertyName, __assign({ get: get,
            set: set, context: instance }, options));
    });
    var computedStructDecorator = computedDecorator({ equals: comparer.structural });

    var IDerivationState;
    (function (IDerivationState) {
        // before being run or (outside batch and not being observed)
        // at this point derivation is not holding any data about dependency tree
        IDerivationState[IDerivationState["NOT_TRACKING"] = -1] = "NOT_TRACKING";
        // no shallow dependency changed since last computation
        // won't recalculate derivation
        // this is what makes mobx fast
        IDerivationState[IDerivationState["UP_TO_DATE"] = 0] = "UP_TO_DATE";
        // some deep dependency changed, but don't know if shallow dependency changed
        // will require to check first if UP_TO_DATE or POSSIBLY_STALE
        // currently only ComputedValue will propagate POSSIBLY_STALE
        //
        // having this state is second big optimization:
        // don't have to recompute on every dependency change, but only when it's needed
        IDerivationState[IDerivationState["POSSIBLY_STALE"] = 1] = "POSSIBLY_STALE";
        // A shallow dependency has changed since last computation and the derivation
        // will need to recompute when it's needed next.
        IDerivationState[IDerivationState["STALE"] = 2] = "STALE";
    })(IDerivationState || (IDerivationState = {}));
    var TraceMode;
    (function (TraceMode) {
        TraceMode[TraceMode["NONE"] = 0] = "NONE";
        TraceMode[TraceMode["LOG"] = 1] = "LOG";
        TraceMode[TraceMode["BREAK"] = 2] = "BREAK";
    })(TraceMode || (TraceMode = {}));
    var CaughtException = /** @class */ (function () {
        function CaughtException(cause) {
            this.cause = cause;
            // Empty
        }
        return CaughtException;
    }());
    function isCaughtException(e) {
        return e instanceof CaughtException;
    }
    /**
     * Finds out whether any dependency of the derivation has actually changed.
     * If dependenciesState is 1 then it will recalculate dependencies,
     * if any dependency changed it will propagate it by changing dependenciesState to 2.
     *
     * By iterating over the dependencies in the same order that they were reported and
     * stopping on the first change, all the recalculations are only called for ComputedValues
     * that will be tracked by derivation. That is because we assume that if the first x
     * dependencies of the derivation doesn't change then the derivation should run the same way
     * up until accessing x-th dependency.
     */
    function shouldCompute(derivation) {
        switch (derivation.dependenciesState) {
            case IDerivationState.UP_TO_DATE:
                return false;
            case IDerivationState.NOT_TRACKING:
            case IDerivationState.STALE:
                return true;
            case IDerivationState.POSSIBLY_STALE: {
                // state propagation can occur outside of action/reactive context #2195
                var prevAllowStateReads = allowStateReadsStart(true);
                var prevUntracked = untrackedStart(); // no need for those computeds to be reported, they will be picked up in trackDerivedFunction.
                var obs = derivation.observing, l = obs.length;
                for (var i = 0; i < l; i++) {
                    var obj = obs[i];
                    if (isComputedValue(obj)) {
                        if (globalState.disableErrorBoundaries) {
                            obj.get();
                        }
                        else {
                            try {
                                obj.get();
                            }
                            catch (e) {
                                // we are not interested in the value *or* exception at this moment, but if there is one, notify all
                                untrackedEnd(prevUntracked);
                                allowStateReadsEnd(prevAllowStateReads);
                                return true;
                            }
                        }
                        // if ComputedValue `obj` actually changed it will be computed and propagated to its observers.
                        // and `derivation` is an observer of `obj`
                        // invariantShouldCompute(derivation)
                        if (derivation.dependenciesState === IDerivationState.STALE) {
                            untrackedEnd(prevUntracked);
                            allowStateReadsEnd(prevAllowStateReads);
                            return true;
                        }
                    }
                }
                changeDependenciesStateTo0(derivation);
                untrackedEnd(prevUntracked);
                allowStateReadsEnd(prevAllowStateReads);
                return false;
            }
        }
    }
    function checkIfStateModificationsAreAllowed(atom) {
        var hasObservers = atom.observers.size > 0;
        // Should never be possible to change an observed observable from inside computed, see #798
        if (globalState.computationDepth > 0 && hasObservers)
            fail(process.env.NODE_ENV !== "production" &&
                "Computed values are not allowed to cause side effects by changing observables that are already being observed. Tried to modify: " + atom.name);
        // Should not be possible to change observed state outside strict mode, except during initialization, see #563
        if (!globalState.allowStateChanges && (hasObservers || globalState.enforceActions === "strict"))
            fail(process.env.NODE_ENV !== "production" &&
                (globalState.enforceActions
                    ? "Since strict-mode is enabled, changing observed observable values outside actions is not allowed. Please wrap the code in an `action` if this change is intended. Tried to modify: "
                    : "Side effects like changing state are not allowed at this point. Are you trying to modify state from, for example, the render function of a React component? Tried to modify: ") +
                    atom.name);
    }
    function checkIfStateReadsAreAllowed(observable) {
        if (process.env.NODE_ENV !== "production" &&
            !globalState.allowStateReads &&
            globalState.observableRequiresReaction) {
            console.warn("[mobx] Observable " + observable.name + " being read outside a reactive context");
        }
    }
    /**
     * Executes the provided function `f` and tracks which observables are being accessed.
     * The tracking information is stored on the `derivation` object and the derivation is registered
     * as observer of any of the accessed observables.
     */
    function trackDerivedFunction(derivation, f, context) {
        var prevAllowStateReads = allowStateReadsStart(true);
        // pre allocate array allocation + room for variation in deps
        // array will be trimmed by bindDependencies
        changeDependenciesStateTo0(derivation);
        derivation.newObserving = new Array(derivation.observing.length + 100);
        derivation.unboundDepsCount = 0;
        derivation.runId = ++globalState.runId;
        var prevTracking = globalState.trackingDerivation;
        globalState.trackingDerivation = derivation;
        var result;
        if (globalState.disableErrorBoundaries === true) {
            result = f.call(context);
        }
        else {
            try {
                result = f.call(context);
            }
            catch (e) {
                result = new CaughtException(e);
            }
        }
        globalState.trackingDerivation = prevTracking;
        bindDependencies(derivation);
        warnAboutDerivationWithoutDependencies(derivation);
        allowStateReadsEnd(prevAllowStateReads);
        return result;
    }
    function warnAboutDerivationWithoutDependencies(derivation) {
        if (process.env.NODE_ENV === "production")
            return;
        if (derivation.observing.length !== 0)
            return;
        if (globalState.reactionRequiresObservable || derivation.requiresObservable) {
            console.warn("[mobx] Derivation " + derivation.name + " is created/updated without reading any observable value");
        }
    }
    /**
     * diffs newObserving with observing.
     * update observing to be newObserving with unique observables
     * notify observers that become observed/unobserved
     */
    function bindDependencies(derivation) {
        // invariant(derivation.dependenciesState !== IDerivationState.NOT_TRACKING, "INTERNAL ERROR bindDependencies expects derivation.dependenciesState !== -1");
        var prevObserving = derivation.observing;
        var observing = (derivation.observing = derivation.newObserving);
        var lowestNewObservingDerivationState = IDerivationState.UP_TO_DATE;
        // Go through all new observables and check diffValue: (this list can contain duplicates):
        //   0: first occurrence, change to 1 and keep it
        //   1: extra occurrence, drop it
        var i0 = 0, l = derivation.unboundDepsCount;
        for (var i = 0; i < l; i++) {
            var dep = observing[i];
            if (dep.diffValue === 0) {
                dep.diffValue = 1;
                if (i0 !== i)
                    observing[i0] = dep;
                i0++;
            }
            // Upcast is 'safe' here, because if dep is IObservable, `dependenciesState` will be undefined,
            // not hitting the condition
            if (dep.dependenciesState > lowestNewObservingDerivationState) {
                lowestNewObservingDerivationState = dep.dependenciesState;
            }
        }
        observing.length = i0;
        derivation.newObserving = null; // newObserving shouldn't be needed outside tracking (statement moved down to work around FF bug, see #614)
        // Go through all old observables and check diffValue: (it is unique after last bindDependencies)
        //   0: it's not in new observables, unobserve it
        //   1: it keeps being observed, don't want to notify it. change to 0
        l = prevObserving.length;
        while (l--) {
            var dep = prevObserving[l];
            if (dep.diffValue === 0) {
                removeObserver(dep, derivation);
            }
            dep.diffValue = 0;
        }
        // Go through all new observables and check diffValue: (now it should be unique)
        //   0: it was set to 0 in last loop. don't need to do anything.
        //   1: it wasn't observed, let's observe it. set back to 0
        while (i0--) {
            var dep = observing[i0];
            if (dep.diffValue === 1) {
                dep.diffValue = 0;
                addObserver(dep, derivation);
            }
        }
        // Some new observed derivations may become stale during this derivation computation
        // so they have had no chance to propagate staleness (#916)
        if (lowestNewObservingDerivationState !== IDerivationState.UP_TO_DATE) {
            derivation.dependenciesState = lowestNewObservingDerivationState;
            derivation.onBecomeStale();
        }
    }
    function clearObserving(derivation) {
        // invariant(globalState.inBatch > 0, "INTERNAL ERROR clearObserving should be called only inside batch");
        var obs = derivation.observing;
        derivation.observing = [];
        var i = obs.length;
        while (i--)
            removeObserver(obs[i], derivation);
        derivation.dependenciesState = IDerivationState.NOT_TRACKING;
    }
    function untracked(action) {
        var prev = untrackedStart();
        try {
            return action();
        }
        finally {
            untrackedEnd(prev);
        }
    }
    function untrackedStart() {
        var prev = globalState.trackingDerivation;
        globalState.trackingDerivation = null;
        return prev;
    }
    function untrackedEnd(prev) {
        globalState.trackingDerivation = prev;
    }
    function allowStateReadsStart(allowStateReads) {
        var prev = globalState.allowStateReads;
        globalState.allowStateReads = allowStateReads;
        return prev;
    }
    function allowStateReadsEnd(prev) {
        globalState.allowStateReads = prev;
    }
    /**
     * needed to keep `lowestObserverState` correct. when changing from (2 or 1) to 0
     *
     */
    function changeDependenciesStateTo0(derivation) {
        if (derivation.dependenciesState === IDerivationState.UP_TO_DATE)
            return;
        derivation.dependenciesState = IDerivationState.UP_TO_DATE;
        var obs = derivation.observing;
        var i = obs.length;
        while (i--)
            obs[i].lowestObserverState = IDerivationState.UP_TO_DATE;
    }

    // we don't use globalState for these in order to avoid possible issues with multiple
    // mobx versions
    var currentActionId = 0;
    var nextActionId = 1;
    var functionNameDescriptor = Object.getOwnPropertyDescriptor(function () { }, "name");
    var isFunctionNameConfigurable = functionNameDescriptor && functionNameDescriptor.configurable;
    function createAction(actionName, fn, ref) {
        if (process.env.NODE_ENV !== "production") {
            invariant(typeof fn === "function", "`action` can only be invoked on functions");
            if (typeof actionName !== "string" || !actionName)
                fail("actions should have valid names, got: '" + actionName + "'");
        }
        var res = function () {
            return executeAction(actionName, fn, ref || this, arguments);
        };
        res.isMobxAction = true;
        if (process.env.NODE_ENV !== "production") {
            if (isFunctionNameConfigurable) {
                Object.defineProperty(res, "name", { value: actionName });
            }
        }
        return res;
    }
    function executeAction(actionName, fn, scope, args) {
        var runInfo = _startAction(actionName, scope, args);
        try {
            return fn.apply(scope, args);
        }
        catch (err) {
            runInfo.error = err;
            throw err;
        }
        finally {
            _endAction(runInfo);
        }
    }
    function _startAction(actionName, scope, args) {
        var notifySpy = isSpyEnabled() && !!actionName;
        var startTime = 0;
        if (notifySpy && process.env.NODE_ENV !== "production") {
            startTime = Date.now();
            var l = (args && args.length) || 0;
            var flattendArgs = new Array(l);
            if (l > 0)
                for (var i = 0; i < l; i++)
                    flattendArgs[i] = args[i];
            spyReportStart({
                type: "action",
                name: actionName,
                object: scope,
                arguments: flattendArgs
            });
        }
        var prevDerivation = untrackedStart();
        startBatch();
        var prevAllowStateChanges = allowStateChangesStart(true);
        var prevAllowStateReads = allowStateReadsStart(true);
        var runInfo = {
            prevDerivation: prevDerivation,
            prevAllowStateChanges: prevAllowStateChanges,
            prevAllowStateReads: prevAllowStateReads,
            notifySpy: notifySpy,
            startTime: startTime,
            actionId: nextActionId++,
            parentActionId: currentActionId
        };
        currentActionId = runInfo.actionId;
        return runInfo;
    }
    function _endAction(runInfo) {
        if (currentActionId !== runInfo.actionId) {
            fail("invalid action stack. did you forget to finish an action?");
        }
        currentActionId = runInfo.parentActionId;
        if (runInfo.error !== undefined) {
            globalState.suppressReactionErrors = true;
        }
        allowStateChangesEnd(runInfo.prevAllowStateChanges);
        allowStateReadsEnd(runInfo.prevAllowStateReads);
        endBatch();
        untrackedEnd(runInfo.prevDerivation);
        if (runInfo.notifySpy && process.env.NODE_ENV !== "production") {
            spyReportEnd({ time: Date.now() - runInfo.startTime });
        }
        globalState.suppressReactionErrors = false;
    }
    function allowStateChangesStart(allowStateChanges) {
        var prev = globalState.allowStateChanges;
        globalState.allowStateChanges = allowStateChanges;
        return prev;
    }
    function allowStateChangesEnd(prev) {
        globalState.allowStateChanges = prev;
    }

    var ObservableValue = /** @class */ (function (_super) {
        __extends(ObservableValue, _super);
        function ObservableValue(value, enhancer, name, notifySpy, equals) {
            if (name === void 0) { name = "ObservableValue@" + getNextId(); }
            if (notifySpy === void 0) { notifySpy = true; }
            if (equals === void 0) { equals = comparer.default; }
            var _this = _super.call(this, name) || this;
            _this.enhancer = enhancer;
            _this.name = name;
            _this.equals = equals;
            _this.hasUnreportedChange = false;
            _this.value = enhancer(value, undefined, name);
            if (notifySpy && isSpyEnabled() && process.env.NODE_ENV !== "production") {
                // only notify spy if this is a stand-alone observable
                spyReport({ type: "create", name: _this.name, newValue: "" + _this.value });
            }
            return _this;
        }
        ObservableValue.prototype.dehanceValue = function (value) {
            if (this.dehancer !== undefined)
                return this.dehancer(value);
            return value;
        };
        ObservableValue.prototype.set = function (newValue) {
            var oldValue = this.value;
            newValue = this.prepareNewValue(newValue);
            if (newValue !== globalState.UNCHANGED) {
                var notifySpy = isSpyEnabled();
                if (notifySpy && process.env.NODE_ENV !== "production") {
                    spyReportStart({
                        type: "update",
                        name: this.name,
                        newValue: newValue,
                        oldValue: oldValue
                    });
                }
                this.setNewValue(newValue);
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportEnd();
            }
        };
        ObservableValue.prototype.prepareNewValue = function (newValue) {
            checkIfStateModificationsAreAllowed(this);
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    object: this,
                    type: "update",
                    newValue: newValue
                });
                if (!change)
                    return globalState.UNCHANGED;
                newValue = change.newValue;
            }
            // apply modifier
            newValue = this.enhancer(newValue, this.value, this.name);
            return this.equals(this.value, newValue) ? globalState.UNCHANGED : newValue;
        };
        ObservableValue.prototype.setNewValue = function (newValue) {
            var oldValue = this.value;
            this.value = newValue;
            this.reportChanged();
            if (hasListeners(this)) {
                notifyListeners(this, {
                    type: "update",
                    object: this,
                    newValue: newValue,
                    oldValue: oldValue
                });
            }
        };
        ObservableValue.prototype.get = function () {
            this.reportObserved();
            return this.dehanceValue(this.value);
        };
        ObservableValue.prototype.intercept = function (handler) {
            return registerInterceptor(this, handler);
        };
        ObservableValue.prototype.observe = function (listener, fireImmediately) {
            if (fireImmediately)
                listener({
                    object: this,
                    type: "update",
                    newValue: this.value,
                    oldValue: undefined
                });
            return registerListener(this, listener);
        };
        ObservableValue.prototype.toJSON = function () {
            return this.get();
        };
        ObservableValue.prototype.toString = function () {
            return this.name + "[" + this.value + "]";
        };
        ObservableValue.prototype.valueOf = function () {
            return toPrimitive(this.get());
        };
        ObservableValue.prototype[Symbol.toPrimitive] = function () {
            return this.valueOf();
        };
        return ObservableValue;
    }(Atom));
    var isObservableValue = createInstanceofPredicate("ObservableValue", ObservableValue);

    /**
     * A node in the state dependency root that observes other nodes, and can be observed itself.
     *
     * ComputedValue will remember the result of the computation for the duration of the batch, or
     * while being observed.
     *
     * During this time it will recompute only when one of its direct dependencies changed,
     * but only when it is being accessed with `ComputedValue.get()`.
     *
     * Implementation description:
     * 1. First time it's being accessed it will compute and remember result
     *    give back remembered result until 2. happens
     * 2. First time any deep dependency change, propagate POSSIBLY_STALE to all observers, wait for 3.
     * 3. When it's being accessed, recompute if any shallow dependency changed.
     *    if result changed: propagate STALE to all observers, that were POSSIBLY_STALE from the last step.
     *    go to step 2. either way
     *
     * If at any point it's outside batch and it isn't observed: reset everything and go to 1.
     */
    var ComputedValue = /** @class */ (function () {
        /**
         * Create a new computed value based on a function expression.
         *
         * The `name` property is for debug purposes only.
         *
         * The `equals` property specifies the comparer function to use to determine if a newly produced
         * value differs from the previous value. Two comparers are provided in the library; `defaultComparer`
         * compares based on identity comparison (===), and `structualComparer` deeply compares the structure.
         * Structural comparison can be convenient if you always produce a new aggregated object and
         * don't want to notify observers if it is structurally the same.
         * This is useful for working with vectors, mouse coordinates etc.
         */
        function ComputedValue(options) {
            this.dependenciesState = IDerivationState.NOT_TRACKING;
            this.observing = []; // nodes we are looking at. Our value depends on these nodes
            this.newObserving = null; // during tracking it's an array with new observed observers
            this.isBeingObserved = false;
            this.isPendingUnobservation = false;
            this.observers = new Set();
            this.diffValue = 0;
            this.runId = 0;
            this.lastAccessedBy = 0;
            this.lowestObserverState = IDerivationState.UP_TO_DATE;
            this.unboundDepsCount = 0;
            this.__mapid = "#" + getNextId();
            this.value = new CaughtException(null);
            this.isComputing = false; // to check for cycles
            this.isRunningSetter = false;
            this.isTracing = TraceMode.NONE;
            invariant(options.get, "missing option for computed: get");
            this.derivation = options.get;
            this.name = options.name || "ComputedValue@" + getNextId();
            if (options.set)
                this.setter = createAction(this.name + "-setter", options.set);
            this.equals =
                options.equals ||
                    (options.compareStructural || options.struct
                        ? comparer.structural
                        : comparer.default);
            this.scope = options.context;
            this.requiresReaction = !!options.requiresReaction;
            this.keepAlive = !!options.keepAlive;
        }
        ComputedValue.prototype.onBecomeStale = function () {
            propagateMaybeChanged(this);
        };
        ComputedValue.prototype.onBecomeObserved = function () {
            if (this.onBecomeObservedListeners) {
                this.onBecomeObservedListeners.forEach(function (listener) { return listener(); });
            }
        };
        ComputedValue.prototype.onBecomeUnobserved = function () {
            if (this.onBecomeUnobservedListeners) {
                this.onBecomeUnobservedListeners.forEach(function (listener) { return listener(); });
            }
        };
        /**
         * Returns the current value of this computed value.
         * Will evaluate its computation first if needed.
         */
        ComputedValue.prototype.get = function () {
            if (this.isComputing)
                fail("Cycle detected in computation " + this.name + ": " + this.derivation);
            if (globalState.inBatch === 0 && this.observers.size === 0 && !this.keepAlive) {
                if (shouldCompute(this)) {
                    this.warnAboutUntrackedRead();
                    startBatch(); // See perf test 'computed memoization'
                    this.value = this.computeValue(false);
                    endBatch();
                }
            }
            else {
                reportObserved(this);
                if (shouldCompute(this))
                    if (this.trackAndCompute())
                        propagateChangeConfirmed(this);
            }
            var result = this.value;
            if (isCaughtException(result))
                throw result.cause;
            return result;
        };
        ComputedValue.prototype.peek = function () {
            var res = this.computeValue(false);
            if (isCaughtException(res))
                throw res.cause;
            return res;
        };
        ComputedValue.prototype.set = function (value) {
            if (this.setter) {
                invariant(!this.isRunningSetter, "The setter of computed value '" + this.name + "' is trying to update itself. Did you intend to update an _observable_ value, instead of the computed property?");
                this.isRunningSetter = true;
                try {
                    this.setter.call(this.scope, value);
                }
                finally {
                    this.isRunningSetter = false;
                }
            }
            else
                invariant(false, process.env.NODE_ENV !== "production" &&
                    "[ComputedValue '" + this.name + "'] It is not possible to assign a new value to a computed value.");
        };
        ComputedValue.prototype.trackAndCompute = function () {
            if (isSpyEnabled() && process.env.NODE_ENV !== "production") {
                spyReport({
                    object: this.scope,
                    type: "compute",
                    name: this.name
                });
            }
            var oldValue = this.value;
            var wasSuspended = 
            /* see #1208 */ this.dependenciesState === IDerivationState.NOT_TRACKING;
            var newValue = this.computeValue(true);
            var changed = wasSuspended ||
                isCaughtException(oldValue) ||
                isCaughtException(newValue) ||
                !this.equals(oldValue, newValue);
            if (changed) {
                this.value = newValue;
            }
            return changed;
        };
        ComputedValue.prototype.computeValue = function (track) {
            this.isComputing = true;
            globalState.computationDepth++;
            var res;
            if (track) {
                res = trackDerivedFunction(this, this.derivation, this.scope);
            }
            else {
                if (globalState.disableErrorBoundaries === true) {
                    res = this.derivation.call(this.scope);
                }
                else {
                    try {
                        res = this.derivation.call(this.scope);
                    }
                    catch (e) {
                        res = new CaughtException(e);
                    }
                }
            }
            globalState.computationDepth--;
            this.isComputing = false;
            return res;
        };
        ComputedValue.prototype.suspend = function () {
            if (!this.keepAlive) {
                clearObserving(this);
                this.value = undefined; // don't hold on to computed value!
            }
        };
        ComputedValue.prototype.observe = function (listener, fireImmediately) {
            var _this = this;
            var firstTime = true;
            var prevValue = undefined;
            return autorun(function () {
                var newValue = _this.get();
                if (!firstTime || fireImmediately) {
                    var prevU = untrackedStart();
                    listener({
                        type: "update",
                        object: _this,
                        newValue: newValue,
                        oldValue: prevValue
                    });
                    untrackedEnd(prevU);
                }
                firstTime = false;
                prevValue = newValue;
            });
        };
        ComputedValue.prototype.warnAboutUntrackedRead = function () {
            if (process.env.NODE_ENV === "production")
                return;
            if (this.requiresReaction === true) {
                fail("[mobx] Computed value " + this.name + " is read outside a reactive context");
            }
            if (this.isTracing !== TraceMode.NONE) {
                console.log("[mobx.trace] '" + this.name + "' is being read outside a reactive context. Doing a full recompute");
            }
            if (globalState.computedRequiresReaction) {
                console.warn("[mobx] Computed value " + this.name + " is being read outside a reactive context. Doing a full recompute");
            }
        };
        ComputedValue.prototype.toJSON = function () {
            return this.get();
        };
        ComputedValue.prototype.toString = function () {
            return this.name + "[" + this.derivation.toString() + "]";
        };
        ComputedValue.prototype.valueOf = function () {
            return toPrimitive(this.get());
        };
        ComputedValue.prototype[Symbol.toPrimitive] = function () {
            return this.valueOf();
        };
        return ComputedValue;
    }());
    var isComputedValue = createInstanceofPredicate("ComputedValue", ComputedValue);
    var MobXGlobals = /** @class */ (function () {
        function MobXGlobals() {
            /**
             * MobXGlobals version.
             * MobX compatiblity with other versions loaded in memory as long as this version matches.
             * It indicates that the global state still stores similar information
             *
             * N.B: this version is unrelated to the package version of MobX, and is only the version of the
             * internal state storage of MobX, and can be the same across many different package versions
             */
            this.version = 5;
            /**
             * globally unique token to signal unchanged
             */
            this.UNCHANGED = {};
            /**
             * Currently running derivation
             */
            this.trackingDerivation = null;
            /**
             * Are we running a computation currently? (not a reaction)
             */
            this.computationDepth = 0;
            /**
             * Each time a derivation is tracked, it is assigned a unique run-id
             */
            this.runId = 0;
            /**
             * 'guid' for general purpose. Will be persisted amongst resets.
             */
            this.mobxGuid = 0;
            /**
             * Are we in a batch block? (and how many of them)
             */
            this.inBatch = 0;
            /**
             * Observables that don't have observers anymore, and are about to be
             * suspended, unless somebody else accesses it in the same batch
             *
             * @type {IObservable[]}
             */
            this.pendingUnobservations = [];
            /**
             * List of scheduled, not yet executed, reactions.
             */
            this.pendingReactions = [];
            /**
             * Are we currently processing reactions?
             */
            this.isRunningReactions = false;
            /**
             * Is it allowed to change observables at this point?
             * In general, MobX doesn't allow that when running computations and React.render.
             * To ensure that those functions stay pure.
             */
            this.allowStateChanges = true;
            /**
             * Is it allowed to read observables at this point?
             * Used to hold the state needed for `observableRequiresReaction`
             */
            this.allowStateReads = true;
            /**
             * If strict mode is enabled, state changes are by default not allowed
             */
            this.enforceActions = false;
            /**
             * Spy callbacks
             */
            this.spyListeners = [];
            /**
             * Globally attached error handlers that react specifically to errors in reactions
             */
            this.globalReactionErrorHandlers = [];
            /**
             * Warn if computed values are accessed outside a reactive context
             */
            this.computedRequiresReaction = false;
            /**
             * (Experimental)
             * Warn if you try to create to derivation / reactive context without accessing any observable.
             */
            this.reactionRequiresObservable = false;
            /**
             * (Experimental)
             * Warn if observables are accessed outside a reactive context
             */
            this.observableRequiresReaction = false;
            /**
             * Allows overwriting of computed properties, useful in tests but not prod as it can cause
             * memory leaks. See https://github.com/mobxjs/mobx/issues/1867
             */
            this.computedConfigurable = false;
            /*
             * Don't catch and rethrow exceptions. This is useful for inspecting the state of
             * the stack when an exception occurs while debugging.
             */
            this.disableErrorBoundaries = false;
            /*
             * If true, we are already handling an exception in an action. Any errors in reactions should be suppressed, as
             * they are not the cause, see: https://github.com/mobxjs/mobx/issues/1836
             */
            this.suppressReactionErrors = false;
        }
        return MobXGlobals;
    }());
    var mockGlobal = {};
    function getGlobal() {
        if (typeof window !== "undefined") {
            return window;
        }
        if (typeof global !== "undefined") {
            return global;
        }
        if (typeof self !== "undefined") {
            return self;
        }
        return mockGlobal;
    }
    var canMergeGlobalState = true;
    var globalState = (function () {
        var global = getGlobal();
        if (global.__mobxInstanceCount > 0 && !global.__mobxGlobals)
            canMergeGlobalState = false;
        if (global.__mobxGlobals && global.__mobxGlobals.version !== new MobXGlobals().version)
            canMergeGlobalState = false;
        if (!canMergeGlobalState) {
            setTimeout(function () {
                {
                    fail("There are multiple, different versions of MobX active. Make sure MobX is loaded only once or use `configure({ isolateGlobalState: true })`");
                }
            }, 1);
            return new MobXGlobals();
        }
        else if (global.__mobxGlobals) {
            global.__mobxInstanceCount += 1;
            if (!global.__mobxGlobals.UNCHANGED)
                global.__mobxGlobals.UNCHANGED = {}; // make merge backward compatible
            return global.__mobxGlobals;
        }
        else {
            global.__mobxInstanceCount = 1;
            return (global.__mobxGlobals = new MobXGlobals());
        }
    })();
    // function invariantObservers(observable: IObservable) {
    //     const list = observable.observers
    //     const map = observable.observersIndexes
    //     const l = list.length
    //     for (let i = 0; i < l; i++) {
    //         const id = list[i].__mapid
    //         if (i) {
    //             invariant(map[id] === i, "INTERNAL ERROR maps derivation.__mapid to index in list") // for performance
    //         } else {
    //             invariant(!(id in map), "INTERNAL ERROR observer on index 0 shouldn't be held in map.") // for performance
    //         }
    //     }
    //     invariant(
    //         list.length === 0 || Object.keys(map).length === list.length - 1,
    //         "INTERNAL ERROR there is no junk in map"
    //     )
    // }
    function addObserver(observable, node) {
        // invariant(node.dependenciesState !== -1, "INTERNAL ERROR, can add only dependenciesState !== -1");
        // invariant(observable._observers.indexOf(node) === -1, "INTERNAL ERROR add already added node");
        // invariantObservers(observable);
        observable.observers.add(node);
        if (observable.lowestObserverState > node.dependenciesState)
            observable.lowestObserverState = node.dependenciesState;
        // invariantObservers(observable);
        // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR didn't add node");
    }
    function removeObserver(observable, node) {
        // invariant(globalState.inBatch > 0, "INTERNAL ERROR, remove should be called only inside batch");
        // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR remove already removed node");
        // invariantObservers(observable);
        observable.observers.delete(node);
        if (observable.observers.size === 0) {
            // deleting last observer
            queueForUnobservation(observable);
        }
        // invariantObservers(observable);
        // invariant(observable._observers.indexOf(node) === -1, "INTERNAL ERROR remove already removed node2");
    }
    function queueForUnobservation(observable) {
        if (observable.isPendingUnobservation === false) {
            // invariant(observable._observers.length === 0, "INTERNAL ERROR, should only queue for unobservation unobserved observables");
            observable.isPendingUnobservation = true;
            globalState.pendingUnobservations.push(observable);
        }
    }
    /**
     * Batch starts a transaction, at least for purposes of memoizing ComputedValues when nothing else does.
     * During a batch `onBecomeUnobserved` will be called at most once per observable.
     * Avoids unnecessary recalculations.
     */
    function startBatch() {
        globalState.inBatch++;
    }
    function endBatch() {
        if (--globalState.inBatch === 0) {
            runReactions();
            // the batch is actually about to finish, all unobserving should happen here.
            var list = globalState.pendingUnobservations;
            for (var i = 0; i < list.length; i++) {
                var observable = list[i];
                observable.isPendingUnobservation = false;
                if (observable.observers.size === 0) {
                    if (observable.isBeingObserved) {
                        // if this observable had reactive observers, trigger the hooks
                        observable.isBeingObserved = false;
                        observable.onBecomeUnobserved();
                    }
                    if (observable instanceof ComputedValue) {
                        // computed values are automatically teared down when the last observer leaves
                        // this process happens recursively, this computed might be the last observabe of another, etc..
                        observable.suspend();
                    }
                }
            }
            globalState.pendingUnobservations = [];
        }
    }
    function reportObserved(observable) {
        checkIfStateReadsAreAllowed(observable);
        var derivation = globalState.trackingDerivation;
        if (derivation !== null) {
            /**
             * Simple optimization, give each derivation run an unique id (runId)
             * Check if last time this observable was accessed the same runId is used
             * if this is the case, the relation is already known
             */
            if (derivation.runId !== observable.lastAccessedBy) {
                observable.lastAccessedBy = derivation.runId;
                // Tried storing newObserving, or observing, or both as Set, but performance didn't come close...
                derivation.newObserving[derivation.unboundDepsCount++] = observable;
                if (!observable.isBeingObserved) {
                    observable.isBeingObserved = true;
                    observable.onBecomeObserved();
                }
            }
            return true;
        }
        else if (observable.observers.size === 0 && globalState.inBatch > 0) {
            queueForUnobservation(observable);
        }
        return false;
    }
    // function invariantLOS(observable: IObservable, msg: string) {
    //     // it's expensive so better not run it in produciton. but temporarily helpful for testing
    //     const min = getObservers(observable).reduce((a, b) => Math.min(a, b.dependenciesState), 2)
    //     if (min >= observable.lowestObserverState) return // <- the only assumption about `lowestObserverState`
    //     throw new Error(
    //         "lowestObserverState is wrong for " +
    //             msg +
    //             " because " +
    //             min +
    //             " < " +
    //             observable.lowestObserverState
    //     )
    // }
    /**
     * NOTE: current propagation mechanism will in case of self reruning autoruns behave unexpectedly
     * It will propagate changes to observers from previous run
     * It's hard or maybe impossible (with reasonable perf) to get it right with current approach
     * Hopefully self reruning autoruns aren't a feature people should depend on
     * Also most basic use cases should be ok
     */
    // Called by Atom when its value changes
    function propagateChanged(observable) {
        // invariantLOS(observable, "changed start");
        if (observable.lowestObserverState === IDerivationState.STALE)
            return;
        observable.lowestObserverState = IDerivationState.STALE;
        // Ideally we use for..of here, but the downcompiled version is really slow...
        observable.observers.forEach(function (d) {
            if (d.dependenciesState === IDerivationState.UP_TO_DATE) {
                if (d.isTracing !== TraceMode.NONE) {
                    logTraceInfo(d, observable);
                }
                d.onBecomeStale();
            }
            d.dependenciesState = IDerivationState.STALE;
        });
        // invariantLOS(observable, "changed end");
    }
    // Called by ComputedValue when it recalculate and its value changed
    function propagateChangeConfirmed(observable) {
        // invariantLOS(observable, "confirmed start");
        if (observable.lowestObserverState === IDerivationState.STALE)
            return;
        observable.lowestObserverState = IDerivationState.STALE;
        observable.observers.forEach(function (d) {
            if (d.dependenciesState === IDerivationState.POSSIBLY_STALE)
                d.dependenciesState = IDerivationState.STALE;
            else if (d.dependenciesState === IDerivationState.UP_TO_DATE // this happens during computing of `d`, just keep lowestObserverState up to date.
            )
                observable.lowestObserverState = IDerivationState.UP_TO_DATE;
        });
        // invariantLOS(observable, "confirmed end");
    }
    // Used by computed when its dependency changed, but we don't wan't to immediately recompute.
    function propagateMaybeChanged(observable) {
        // invariantLOS(observable, "maybe start");
        if (observable.lowestObserverState !== IDerivationState.UP_TO_DATE)
            return;
        observable.lowestObserverState = IDerivationState.POSSIBLY_STALE;
        observable.observers.forEach(function (d) {
            if (d.dependenciesState === IDerivationState.UP_TO_DATE) {
                d.dependenciesState = IDerivationState.POSSIBLY_STALE;
                if (d.isTracing !== TraceMode.NONE) {
                    logTraceInfo(d, observable);
                }
                d.onBecomeStale();
            }
        });
        // invariantLOS(observable, "maybe end");
    }
    function logTraceInfo(derivation, observable) {
        console.log("[mobx.trace] '" + derivation.name + "' is invalidated due to a change in: '" + observable.name + "'");
        if (derivation.isTracing === TraceMode.BREAK) {
            var lines = [];
            printDepTree(getDependencyTree(derivation), lines, 1);
            // prettier-ignore
            new Function("debugger;\n/*\nTracing '" + derivation.name + "'\n\nYou are entering this break point because derivation '" + derivation.name + "' is being traced and '" + observable.name + "' is now forcing it to update.\nJust follow the stacktrace you should now see in the devtools to see precisely what piece of your code is causing this update\nThe stackframe you are looking for is at least ~6-8 stack-frames up.\n\n" + (derivation instanceof ComputedValue ? derivation.derivation.toString().replace(/[*]\//g, "/") : "") + "\n\nThe dependencies for this derivation are:\n\n" + lines.join("\n") + "\n*/\n    ")();
        }
    }
    function printDepTree(tree, lines, depth) {
        if (lines.length >= 1000) {
            lines.push("(and many more)");
            return;
        }
        lines.push("" + new Array(depth).join("\t") + tree.name); // MWE: not the fastest, but the easiest way :)
        if (tree.dependencies)
            tree.dependencies.forEach(function (child) { return printDepTree(child, lines, depth + 1); });
    }

    var Reaction = /** @class */ (function () {
        function Reaction(name, onInvalidate, errorHandler, requiresObservable) {
            if (name === void 0) { name = "Reaction@" + getNextId(); }
            if (requiresObservable === void 0) { requiresObservable = false; }
            this.name = name;
            this.onInvalidate = onInvalidate;
            this.errorHandler = errorHandler;
            this.requiresObservable = requiresObservable;
            this.observing = []; // nodes we are looking at. Our value depends on these nodes
            this.newObserving = [];
            this.dependenciesState = IDerivationState.NOT_TRACKING;
            this.diffValue = 0;
            this.runId = 0;
            this.unboundDepsCount = 0;
            this.__mapid = "#" + getNextId();
            this.isDisposed = false;
            this._isScheduled = false;
            this._isTrackPending = false;
            this._isRunning = false;
            this.isTracing = TraceMode.NONE;
        }
        Reaction.prototype.onBecomeStale = function () {
            this.schedule();
        };
        Reaction.prototype.schedule = function () {
            if (!this._isScheduled) {
                this._isScheduled = true;
                globalState.pendingReactions.push(this);
                runReactions();
            }
        };
        Reaction.prototype.isScheduled = function () {
            return this._isScheduled;
        };
        /**
         * internal, use schedule() if you intend to kick off a reaction
         */
        Reaction.prototype.runReaction = function () {
            if (!this.isDisposed) {
                startBatch();
                this._isScheduled = false;
                if (shouldCompute(this)) {
                    this._isTrackPending = true;
                    try {
                        this.onInvalidate();
                        if (this._isTrackPending &&
                            isSpyEnabled() &&
                            process.env.NODE_ENV !== "production") {
                            // onInvalidate didn't trigger track right away..
                            spyReport({
                                name: this.name,
                                type: "scheduled-reaction"
                            });
                        }
                    }
                    catch (e) {
                        this.reportExceptionInDerivation(e);
                    }
                }
                endBatch();
            }
        };
        Reaction.prototype.track = function (fn) {
            if (this.isDisposed) {
                return;
                // console.warn("Reaction already disposed") // Note: Not a warning / error in mobx 4 either
            }
            startBatch();
            var notify = isSpyEnabled();
            var startTime;
            if (notify && process.env.NODE_ENV !== "production") {
                startTime = Date.now();
                spyReportStart({
                    name: this.name,
                    type: "reaction"
                });
            }
            this._isRunning = true;
            var result = trackDerivedFunction(this, fn, undefined);
            this._isRunning = false;
            this._isTrackPending = false;
            if (this.isDisposed) {
                // disposed during last run. Clean up everything that was bound after the dispose call.
                clearObserving(this);
            }
            if (isCaughtException(result))
                this.reportExceptionInDerivation(result.cause);
            if (notify && process.env.NODE_ENV !== "production") {
                spyReportEnd({
                    time: Date.now() - startTime
                });
            }
            endBatch();
        };
        Reaction.prototype.reportExceptionInDerivation = function (error) {
            var _this = this;
            if (this.errorHandler) {
                this.errorHandler(error, this);
                return;
            }
            if (globalState.disableErrorBoundaries)
                throw error;
            var message = "[mobx] Encountered an uncaught exception that was thrown by a reaction or observer component, in: '" + this + "'";
            if (globalState.suppressReactionErrors) {
                console.warn("[mobx] (error in reaction '" + this.name + "' suppressed, fix error of causing action below)"); // prettier-ignore
            }
            else {
                console.error(message, error);
                /** If debugging brought you here, please, read the above message :-). Tnx! */
            }
            if (isSpyEnabled()) {
                spyReport({
                    type: "error",
                    name: this.name,
                    message: message,
                    error: "" + error
                });
            }
            globalState.globalReactionErrorHandlers.forEach(function (f) { return f(error, _this); });
        };
        Reaction.prototype.dispose = function () {
            if (!this.isDisposed) {
                this.isDisposed = true;
                if (!this._isRunning) {
                    // if disposed while running, clean up later. Maybe not optimal, but rare case
                    startBatch();
                    clearObserving(this);
                    endBatch();
                }
            }
        };
        Reaction.prototype.getDisposer = function () {
            var r = this.dispose.bind(this);
            r[$mobx] = this;
            return r;
        };
        Reaction.prototype.toString = function () {
            return "Reaction[" + this.name + "]";
        };
        Reaction.prototype.trace = function (enterBreakPoint) {
            if (enterBreakPoint === void 0) { enterBreakPoint = false; }
            trace(this, enterBreakPoint);
        };
        return Reaction;
    }());
    /**
     * Magic number alert!
     * Defines within how many times a reaction is allowed to re-trigger itself
     * until it is assumed that this is gonna be a never ending loop...
     */
    var MAX_REACTION_ITERATIONS = 100;
    var reactionScheduler = function (f) { return f(); };
    function runReactions() {
        // Trampolining, if runReactions are already running, new reactions will be picked up
        if (globalState.inBatch > 0 || globalState.isRunningReactions)
            return;
        reactionScheduler(runReactionsHelper);
    }
    function runReactionsHelper() {
        globalState.isRunningReactions = true;
        var allReactions = globalState.pendingReactions;
        var iterations = 0;
        // While running reactions, new reactions might be triggered.
        // Hence we work with two variables and check whether
        // we converge to no remaining reactions after a while.
        while (allReactions.length > 0) {
            if (++iterations === MAX_REACTION_ITERATIONS) {
                console.error("Reaction doesn't converge to a stable state after " + MAX_REACTION_ITERATIONS + " iterations." +
                    (" Probably there is a cycle in the reactive function: " + allReactions[0]));
                allReactions.splice(0); // clear reactions
            }
            var remainingReactions = allReactions.splice(0);
            for (var i = 0, l = remainingReactions.length; i < l; i++)
                remainingReactions[i].runReaction();
        }
        globalState.isRunningReactions = false;
    }
    var isReaction = createInstanceofPredicate("Reaction", Reaction);

    function isSpyEnabled() {
        return process.env.NODE_ENV !== "production" && !!globalState.spyListeners.length;
    }
    function spyReport(event) {
        if (process.env.NODE_ENV === "production")
            return; // dead code elimination can do the rest
        if (!globalState.spyListeners.length)
            return;
        var listeners = globalState.spyListeners;
        for (var i = 0, l = listeners.length; i < l; i++)
            listeners[i](event);
    }
    function spyReportStart(event) {
        if (process.env.NODE_ENV === "production")
            return;
        var change = __assign(__assign({}, event), { spyReportStart: true });
        spyReport(change);
    }
    var END_EVENT = { spyReportEnd: true };
    function spyReportEnd(change) {
        if (process.env.NODE_ENV === "production")
            return;
        if (change)
            spyReport(__assign(__assign({}, change), { spyReportEnd: true }));
        else
            spyReport(END_EVENT);
    }
    function spy(listener) {
        if (process.env.NODE_ENV === "production") {
            console.warn("[mobx.spy] Is a no-op in production builds");
            return function () { };
        }
        else {
            globalState.spyListeners.push(listener);
            return once(function () {
                globalState.spyListeners = globalState.spyListeners.filter(function (l) { return l !== listener; });
            });
        }
    }

    function dontReassignFields() {
        fail(process.env.NODE_ENV !== "production" && "@action fields are not reassignable");
    }
    function namedActionDecorator(name) {
        return function (target, prop, descriptor) {
            if (descriptor) {
                if (process.env.NODE_ENV !== "production" && descriptor.get !== undefined) {
                    return fail("@action cannot be used with getters");
                }
                // babel / typescript
                // @action method() { }
                if (descriptor.value) {
                    // typescript
                    return {
                        value: createAction(name, descriptor.value),
                        enumerable: false,
                        configurable: true,
                        writable: true // for typescript, this must be writable, otherwise it cannot inherit :/ (see inheritable actions test)
                    };
                }
                // babel only: @action method = () => {}
                var initializer_1 = descriptor.initializer;
                return {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    initializer: function () {
                        // N.B: we can't immediately invoke initializer; this would be wrong
                        return createAction(name, initializer_1.call(this));
                    }
                };
            }
            // bound instance methods
            return actionFieldDecorator(name).apply(this, arguments);
        };
    }
    function actionFieldDecorator(name) {
        // Simple property that writes on first invocation to the current instance
        return function (target, prop, descriptor) {
            Object.defineProperty(target, prop, {
                configurable: true,
                enumerable: false,
                get: function () {
                    return undefined;
                },
                set: function (value) {
                    addHiddenProp(this, prop, action(name, value));
                }
            });
        };
    }
    function boundActionDecorator(target, propertyName, descriptor, applyToInstance) {
        if (applyToInstance === true) {
            defineBoundAction(target, propertyName, descriptor.value);
            return null;
        }
        if (descriptor) {
            // if (descriptor.value)
            // Typescript / Babel: @action.bound method() { }
            // also: babel @action.bound method = () => {}
            return {
                configurable: true,
                enumerable: false,
                get: function () {
                    defineBoundAction(this, propertyName, descriptor.value || descriptor.initializer.call(this));
                    return this[propertyName];
                },
                set: dontReassignFields
            };
        }
        // field decorator Typescript @action.bound method = () => {}
        return {
            enumerable: false,
            configurable: true,
            set: function (v) {
                defineBoundAction(this, propertyName, v);
            },
            get: function () {
                return undefined;
            }
        };
    }

    var action = function action(arg1, arg2, arg3, arg4) {
        // action(fn() {})
        if (arguments.length === 1 && typeof arg1 === "function")
            return createAction(arg1.name || "<unnamed action>", arg1);
        // action("name", fn() {})
        if (arguments.length === 2 && typeof arg2 === "function")
            return createAction(arg1, arg2);
        // @action("name") fn() {}
        if (arguments.length === 1 && typeof arg1 === "string")
            return namedActionDecorator(arg1);
        // @action fn() {}
        if (arg4 === true) {
            // apply to instance immediately
            addHiddenProp(arg1, arg2, createAction(arg1.name || arg2, arg3.value, this));
        }
        else {
            return namedActionDecorator(arg2).apply(null, arguments);
        }
    };
    action.bound = boundActionDecorator;
    function isAction(thing) {
        return typeof thing === "function" && thing.isMobxAction === true;
    }
    function defineBoundAction(target, propertyName, fn) {
        addHiddenProp(target, propertyName, createAction(propertyName, fn.bind(target)));
    }

    /**
     * Creates a named reactive view and keeps it alive, so that the view is always
     * updated if one of the dependencies changes, even when the view is not further used by something else.
     * @param view The reactive view
     * @returns disposer function, which can be used to stop the view from being updated in the future.
     */
    function autorun(view, opts) {
        if (opts === void 0) { opts = EMPTY_OBJECT; }
        if (process.env.NODE_ENV !== "production") {
            invariant(typeof view === "function", "Autorun expects a function as first argument");
            invariant(isAction(view) === false, "Autorun does not accept actions since actions are untrackable");
        }
        var name = (opts && opts.name) || view.name || "Autorun@" + getNextId();
        var runSync = !opts.scheduler && !opts.delay;
        var reaction;
        if (runSync) {
            // normal autorun
            reaction = new Reaction(name, function () {
                this.track(reactionRunner);
            }, opts.onError, opts.requiresObservable);
        }
        else {
            var scheduler_1 = createSchedulerFromOptions(opts);
            // debounced autorun
            var isScheduled_1 = false;
            reaction = new Reaction(name, function () {
                if (!isScheduled_1) {
                    isScheduled_1 = true;
                    scheduler_1(function () {
                        isScheduled_1 = false;
                        if (!reaction.isDisposed)
                            reaction.track(reactionRunner);
                    });
                }
            }, opts.onError, opts.requiresObservable);
        }
        function reactionRunner() {
            view(reaction);
        }
        reaction.schedule();
        return reaction.getDisposer();
    }
    var run = function (f) { return f(); };
    function createSchedulerFromOptions(opts) {
        return opts.scheduler
            ? opts.scheduler
            : opts.delay
                ? function (f) { return setTimeout(f, opts.delay); }
                : run;
    }
    function reaction(expression, effect, opts) {
        if (opts === void 0) { opts = EMPTY_OBJECT; }
        if (process.env.NODE_ENV !== "production") {
            invariant(typeof expression === "function", "First argument to reaction should be a function");
            invariant(typeof opts === "object", "Third argument of reactions should be an object");
        }
        var name = opts.name || "Reaction@" + getNextId();
        var effectAction = action(name, opts.onError ? wrapErrorHandler(opts.onError, effect) : effect);
        var runSync = !opts.scheduler && !opts.delay;
        var scheduler = createSchedulerFromOptions(opts);
        var firstTime = true;
        var isScheduled = false;
        var value;
        var equals = opts.compareStructural
            ? comparer.structural
            : opts.equals || comparer.default;
        var r = new Reaction(name, function () {
            if (firstTime || runSync) {
                reactionRunner();
            }
            else if (!isScheduled) {
                isScheduled = true;
                scheduler(reactionRunner);
            }
        }, opts.onError, opts.requiresObservable);
        function reactionRunner() {
            isScheduled = false; // Q: move into reaction runner?
            if (r.isDisposed)
                return;
            var changed = false;
            r.track(function () {
                var nextValue = expression(r);
                changed = firstTime || !equals(value, nextValue);
                value = nextValue;
            });
            if (firstTime && opts.fireImmediately)
                effectAction(value, r);
            if (!firstTime && changed === true)
                effectAction(value, r);
            if (firstTime)
                firstTime = false;
        }
        r.schedule();
        return r.getDisposer();
    }
    function wrapErrorHandler(errorHandler, baseFn) {
        return function () {
            try {
                return baseFn.apply(this, arguments);
            }
            catch (e) {
                errorHandler.call(this, e);
            }
        };
    }

    function onBecomeObserved(thing, arg2, arg3) {
        return interceptHook("onBecomeObserved", thing, arg2, arg3);
    }
    function onBecomeUnobserved(thing, arg2, arg3) {
        return interceptHook("onBecomeUnobserved", thing, arg2, arg3);
    }
    function interceptHook(hook, thing, arg2, arg3) {
        var atom = typeof arg3 === "function" ? getAtom(thing, arg2) : getAtom(thing);
        var cb = typeof arg3 === "function" ? arg3 : arg2;
        var listenersKey = hook + "Listeners";
        if (atom[listenersKey]) {
            atom[listenersKey].add(cb);
        }
        else {
            atom[listenersKey] = new Set([cb]);
        }
        var orig = atom[hook];
        if (typeof orig !== "function")
            return fail(process.env.NODE_ENV !== "production" && "Not an atom that can be (un)observed");
        return function () {
            var hookListeners = atom[listenersKey];
            if (hookListeners) {
                hookListeners.delete(cb);
                if (hookListeners.size === 0) {
                    delete atom[listenersKey];
                }
            }
        };
    }

    function extendObservable(target, properties, decorators, options) {
        if (process.env.NODE_ENV !== "production") {
            invariant(arguments.length >= 2 && arguments.length <= 4, "'extendObservable' expected 2-4 arguments");
            invariant(typeof target === "object", "'extendObservable' expects an object as first argument");
            invariant(!isObservableMap(target), "'extendObservable' should not be used on maps, use map.merge instead");
        }
        options = asCreateObservableOptions(options);
        var defaultDecorator = getDefaultDecoratorFromObjectOptions(options);
        initializeInstance(target); // Fixes #1740
        asObservableObject(target, options.name, defaultDecorator.enhancer); // make sure object is observable, even without initial props
        if (properties)
            extendObservableObjectWithProperties(target, properties, decorators, defaultDecorator);
        return target;
    }
    function getDefaultDecoratorFromObjectOptions(options) {
        return options.defaultDecorator || (options.deep === false ? refDecorator : deepDecorator);
    }
    function extendObservableObjectWithProperties(target, properties, decorators, defaultDecorator) {
        var e_1, _a, e_2, _b;
        if (process.env.NODE_ENV !== "production") {
            invariant(!isObservable(properties), "Extending an object with another observable (object) is not supported. Please construct an explicit propertymap, using `toJS` if need. See issue #540");
            if (decorators) {
                var keys = getPlainObjectKeys(decorators);
                try {
                    for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                        var key = keys_1_1.value;
                        if (!(key in properties))
                            fail("Trying to declare a decorator for unspecified property '" + stringifyKey(key) + "'");
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        startBatch();
        try {
            var keys = getPlainObjectKeys(properties);
            try {
                for (var keys_2 = __values(keys), keys_2_1 = keys_2.next(); !keys_2_1.done; keys_2_1 = keys_2.next()) {
                    var key = keys_2_1.value;
                    var descriptor = Object.getOwnPropertyDescriptor(properties, key);
                    if (process.env.NODE_ENV !== "production") {
                        if (!isPlainObject(properties))
                            fail("'extendObservabe' only accepts plain objects as second argument");
                        if (isComputed(descriptor.value))
                            fail("Passing a 'computed' as initial property value is no longer supported by extendObservable. Use a getter or decorator instead");
                    }
                    var decorator = decorators && key in decorators
                        ? decorators[key]
                        : descriptor.get
                            ? computedDecorator
                            : defaultDecorator;
                    if (process.env.NODE_ENV !== "production" && typeof decorator !== "function")
                        fail("Not a valid decorator for '" + stringifyKey(key) + "', got: " + decorator);
                    var resultDescriptor = decorator(target, key, descriptor, true);
                    if (resultDescriptor // otherwise, assume already applied, due to `applyToInstance`
                    )
                        Object.defineProperty(target, key, resultDescriptor);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (keys_2_1 && !keys_2_1.done && (_b = keys_2.return)) _b.call(keys_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        finally {
            endBatch();
        }
    }

    function getDependencyTree(thing, property) {
        return nodeToDependencyTree(getAtom(thing, property));
    }
    function nodeToDependencyTree(node) {
        var result = {
            name: node.name
        };
        if (node.observing && node.observing.length > 0)
            result.dependencies = unique(node.observing).map(nodeToDependencyTree);
        return result;
    }

    function _isComputed(value, property) {
        if (value === null || value === undefined)
            return false;
        if (property !== undefined) {
            if (isObservableObject(value) === false)
                return false;
            if (!value[$mobx].values.has(property))
                return false;
            var atom = getAtom(value, property);
            return isComputedValue(atom);
        }
        return isComputedValue(value);
    }
    function isComputed(value) {
        if (arguments.length > 1)
            return fail(process.env.NODE_ENV !== "production" &&
                "isComputed expects only 1 argument. Use isObservableProp to inspect the observability of a property");
        return _isComputed(value);
    }

    function _isObservable(value, property) {
        if (value === null || value === undefined)
            return false;
        if (property !== undefined) {
            if (process.env.NODE_ENV !== "production" &&
                (isObservableMap(value) || isObservableArray(value)))
                return fail("isObservable(object, propertyName) is not supported for arrays and maps. Use map.has or array.length instead.");
            if (isObservableObject(value)) {
                return value[$mobx].values.has(property);
            }
            return false;
        }
        // For first check, see #701
        return (isObservableObject(value) ||
            !!value[$mobx] ||
            isAtom(value) ||
            isReaction(value) ||
            isComputedValue(value));
    }
    function isObservable(value) {
        if (arguments.length !== 1)
            fail(process.env.NODE_ENV !== "production" &&
                "isObservable expects only 1 argument. Use isObservableProp to inspect the observability of a property");
        return _isObservable(value);
    }
    function set(obj, key, value) {
        if (arguments.length === 2 && !isObservableSet(obj)) {
            startBatch();
            var values_1 = key;
            try {
                for (var key_1 in values_1)
                    set(obj, key_1, values_1[key_1]);
            }
            finally {
                endBatch();
            }
            return;
        }
        if (isObservableObject(obj)) {
            var adm = obj[$mobx];
            var existingObservable = adm.values.get(key);
            if (existingObservable) {
                adm.write(key, value);
            }
            else {
                adm.addObservableProp(key, value, adm.defaultEnhancer);
            }
        }
        else if (isObservableMap(obj)) {
            obj.set(key, value);
        }
        else if (isObservableSet(obj)) {
            obj.add(key);
        }
        else if (isObservableArray(obj)) {
            if (typeof key !== "number")
                key = parseInt(key, 10);
            invariant(key >= 0, "Not a valid index: '" + key + "'");
            startBatch();
            if (key >= obj.length)
                obj.length = key + 1;
            obj[key] = value;
            endBatch();
        }
        else {
            return fail(process.env.NODE_ENV !== "production" &&
                "'set()' can only be used on observable objects, arrays and maps");
        }
    }

    function trace() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var enterBreakPoint = false;
        if (typeof args[args.length - 1] === "boolean")
            enterBreakPoint = args.pop();
        var derivation = getAtomFromArgs(args);
        if (!derivation) {
            return fail(process.env.NODE_ENV !== "production" &&
                "'trace(break?)' can only be used inside a tracked computed value or a Reaction. Consider passing in the computed value or reaction explicitly");
        }
        if (derivation.isTracing === TraceMode.NONE) {
            console.log("[mobx.trace] '" + derivation.name + "' tracing enabled");
        }
        derivation.isTracing = enterBreakPoint ? TraceMode.BREAK : TraceMode.LOG;
    }
    function getAtomFromArgs(args) {
        switch (args.length) {
            case 0:
                return globalState.trackingDerivation;
            case 1:
                return getAtom(args[0]);
            case 2:
                return getAtom(args[0], args[1]);
        }
    }

    /**
     * During a transaction no views are updated until the end of the transaction.
     * The transaction will be run synchronously nonetheless.
     *
     * @param action a function that updates some reactive state
     * @returns any value that was returned by the 'action' parameter.
     */
    function transaction(action, thisArg) {
        if (thisArg === void 0) { thisArg = undefined; }
        startBatch();
        try {
            return action.apply(thisArg);
        }
        finally {
            endBatch();
        }
    }

    function getAdm(target) {
        return target[$mobx];
    }
    function isPropertyKey(val) {
        return typeof val === "string" || typeof val === "number" || typeof val === "symbol";
    }
    // Optimization: we don't need the intermediate objects and could have a completely custom administration for DynamicObjects,
    // and skip either the internal values map, or the base object with its property descriptors!
    var objectProxyTraps = {
        has: function (target, name) {
            if (name === $mobx || name === "constructor" || name === mobxDidRunLazyInitializersSymbol)
                return true;
            var adm = getAdm(target);
            // MWE: should `in` operator be reactive? If not, below code path will be faster / more memory efficient
            // TODO: check performance stats!
            // if (adm.values.get(name as string)) return true
            if (isPropertyKey(name))
                return adm.has(name);
            return name in target;
        },
        get: function (target, name) {
            if (name === $mobx || name === "constructor" || name === mobxDidRunLazyInitializersSymbol)
                return target[name];
            var adm = getAdm(target);
            var observable = adm.values.get(name);
            if (observable instanceof Atom) {
                var result = observable.get();
                if (result === undefined) {
                    // This fixes #1796, because deleting a prop that has an
                    // undefined value won't retrigger a observer (no visible effect),
                    // the autorun wouldn't subscribe to future key changes (see also next comment)
                    adm.has(name);
                }
                return result;
            }
            // make sure we start listening to future keys
            // note that we only do this here for optimization
            if (isPropertyKey(name))
                adm.has(name);
            return target[name];
        },
        set: function (target, name, value) {
            if (!isPropertyKey(name))
                return false;
            set(target, name, value);
            return true;
        },
        deleteProperty: function (target, name) {
            if (!isPropertyKey(name))
                return false;
            var adm = getAdm(target);
            adm.remove(name);
            return true;
        },
        ownKeys: function (target) {
            var adm = getAdm(target);
            adm.keysAtom.reportObserved();
            return Reflect.ownKeys(target);
        },
        preventExtensions: function (target) {
            fail("Dynamic observable objects cannot be frozen");
            return false;
        }
    };
    function createDynamicObservableObject(base) {
        var proxy = new Proxy(base, objectProxyTraps);
        base[$mobx].proxy = proxy;
        return proxy;
    }

    function hasInterceptors(interceptable) {
        return interceptable.interceptors !== undefined && interceptable.interceptors.length > 0;
    }
    function registerInterceptor(interceptable, handler) {
        var interceptors = interceptable.interceptors || (interceptable.interceptors = []);
        interceptors.push(handler);
        return once(function () {
            var idx = interceptors.indexOf(handler);
            if (idx !== -1)
                interceptors.splice(idx, 1);
        });
    }
    function interceptChange(interceptable, change) {
        var prevU = untrackedStart();
        try {
            // Interceptor can modify the array, copy it to avoid concurrent modification, see #1950
            var interceptors = __spread((interceptable.interceptors || []));
            for (var i = 0, l = interceptors.length; i < l; i++) {
                change = interceptors[i](change);
                invariant(!change || change.type, "Intercept handlers should return nothing or a change object");
                if (!change)
                    break;
            }
            return change;
        }
        finally {
            untrackedEnd(prevU);
        }
    }

    function hasListeners(listenable) {
        return listenable.changeListeners !== undefined && listenable.changeListeners.length > 0;
    }
    function registerListener(listenable, handler) {
        var listeners = listenable.changeListeners || (listenable.changeListeners = []);
        listeners.push(handler);
        return once(function () {
            var idx = listeners.indexOf(handler);
            if (idx !== -1)
                listeners.splice(idx, 1);
        });
    }
    function notifyListeners(listenable, change) {
        var prevU = untrackedStart();
        var listeners = listenable.changeListeners;
        if (!listeners)
            return;
        listeners = listeners.slice();
        for (var i = 0, l = listeners.length; i < l; i++) {
            listeners[i](change);
        }
        untrackedEnd(prevU);
    }

    var MAX_SPLICE_SIZE = 10000; // See e.g. https://github.com/mobxjs/mobx/issues/859
    var arrayTraps = {
        get: function (target, name) {
            if (name === $mobx)
                return target[$mobx];
            if (name === "length")
                return target[$mobx].getArrayLength();
            if (typeof name === "number") {
                return arrayExtensions.get.call(target, name);
            }
            if (typeof name === "string" && !isNaN(name)) {
                return arrayExtensions.get.call(target, parseInt(name));
            }
            if (arrayExtensions.hasOwnProperty(name)) {
                return arrayExtensions[name];
            }
            return target[name];
        },
        set: function (target, name, value) {
            if (name === "length") {
                target[$mobx].setArrayLength(value);
            }
            if (typeof name === "number") {
                arrayExtensions.set.call(target, name, value);
            }
            if (typeof name === "symbol" || isNaN(name)) {
                target[name] = value;
            }
            else {
                // numeric string
                arrayExtensions.set.call(target, parseInt(name), value);
            }
            return true;
        },
        preventExtensions: function (target) {
            fail("Observable arrays cannot be frozen");
            return false;
        }
    };
    function createObservableArray(initialValues, enhancer, name, owned) {
        if (name === void 0) { name = "ObservableArray@" + getNextId(); }
        if (owned === void 0) { owned = false; }
        var adm = new ObservableArrayAdministration(name, enhancer, owned);
        addHiddenFinalProp(adm.values, $mobx, adm);
        var proxy = new Proxy(adm.values, arrayTraps);
        adm.proxy = proxy;
        if (initialValues && initialValues.length) {
            var prev = allowStateChangesStart(true);
            adm.spliceWithArray(0, 0, initialValues);
            allowStateChangesEnd(prev);
        }
        return proxy;
    }
    var ObservableArrayAdministration = /** @class */ (function () {
        function ObservableArrayAdministration(name, enhancer, owned) {
            this.owned = owned;
            this.values = [];
            this.proxy = undefined;
            this.lastKnownLength = 0;
            this.atom = new Atom(name || "ObservableArray@" + getNextId());
            this.enhancer = function (newV, oldV) { return enhancer(newV, oldV, name + "[..]"); };
        }
        ObservableArrayAdministration.prototype.dehanceValue = function (value) {
            if (this.dehancer !== undefined)
                return this.dehancer(value);
            return value;
        };
        ObservableArrayAdministration.prototype.dehanceValues = function (values) {
            if (this.dehancer !== undefined && values.length > 0)
                return values.map(this.dehancer);
            return values;
        };
        ObservableArrayAdministration.prototype.intercept = function (handler) {
            return registerInterceptor(this, handler);
        };
        ObservableArrayAdministration.prototype.observe = function (listener, fireImmediately) {
            if (fireImmediately === void 0) { fireImmediately = false; }
            if (fireImmediately) {
                listener({
                    object: this.proxy,
                    type: "splice",
                    index: 0,
                    added: this.values.slice(),
                    addedCount: this.values.length,
                    removed: [],
                    removedCount: 0
                });
            }
            return registerListener(this, listener);
        };
        ObservableArrayAdministration.prototype.getArrayLength = function () {
            this.atom.reportObserved();
            return this.values.length;
        };
        ObservableArrayAdministration.prototype.setArrayLength = function (newLength) {
            if (typeof newLength !== "number" || newLength < 0)
                throw new Error("[mobx.array] Out of range: " + newLength);
            var currentLength = this.values.length;
            if (newLength === currentLength)
                return;
            else if (newLength > currentLength) {
                var newItems = new Array(newLength - currentLength);
                for (var i = 0; i < newLength - currentLength; i++)
                    newItems[i] = undefined; // No Array.fill everywhere...
                this.spliceWithArray(currentLength, 0, newItems);
            }
            else
                this.spliceWithArray(newLength, currentLength - newLength);
        };
        ObservableArrayAdministration.prototype.updateArrayLength = function (oldLength, delta) {
            if (oldLength !== this.lastKnownLength)
                throw new Error("[mobx] Modification exception: the internal structure of an observable array was changed.");
            this.lastKnownLength += delta;
        };
        ObservableArrayAdministration.prototype.spliceWithArray = function (index, deleteCount, newItems) {
            var _this = this;
            checkIfStateModificationsAreAllowed(this.atom);
            var length = this.values.length;
            if (index === undefined)
                index = 0;
            else if (index > length)
                index = length;
            else if (index < 0)
                index = Math.max(0, length + index);
            if (arguments.length === 1)
                deleteCount = length - index;
            else if (deleteCount === undefined || deleteCount === null)
                deleteCount = 0;
            else
                deleteCount = Math.max(0, Math.min(deleteCount, length - index));
            if (newItems === undefined)
                newItems = EMPTY_ARRAY;
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    object: this.proxy,
                    type: "splice",
                    index: index,
                    removedCount: deleteCount,
                    added: newItems
                });
                if (!change)
                    return EMPTY_ARRAY;
                deleteCount = change.removedCount;
                newItems = change.added;
            }
            newItems = newItems.length === 0 ? newItems : newItems.map(function (v) { return _this.enhancer(v, undefined); });
            if (process.env.NODE_ENV !== "production") {
                var lengthDelta = newItems.length - deleteCount;
                this.updateArrayLength(length, lengthDelta); // checks if internal array wasn't modified
            }
            var res = this.spliceItemsIntoValues(index, deleteCount, newItems);
            if (deleteCount !== 0 || newItems.length !== 0)
                this.notifyArraySplice(index, newItems, res);
            return this.dehanceValues(res);
        };
        ObservableArrayAdministration.prototype.spliceItemsIntoValues = function (index, deleteCount, newItems) {
            var _a;
            if (newItems.length < MAX_SPLICE_SIZE) {
                return (_a = this.values).splice.apply(_a, __spread([index, deleteCount], newItems));
            }
            else {
                var res = this.values.slice(index, index + deleteCount);
                this.values = this.values
                    .slice(0, index)
                    .concat(newItems, this.values.slice(index + deleteCount));
                return res;
            }
        };
        ObservableArrayAdministration.prototype.notifyArrayChildUpdate = function (index, newValue, oldValue) {
            var notifySpy = !this.owned && isSpyEnabled();
            var notify = hasListeners(this);
            var change = notify || notifySpy
                ? {
                    object: this.proxy,
                    type: "update",
                    index: index,
                    newValue: newValue,
                    oldValue: oldValue
                }
                : null;
            // The reason why this is on right hand side here (and not above), is this way the uglifier will drop it, but it won't
            // cause any runtime overhead in development mode without NODE_ENV set, unless spying is enabled
            if (notifySpy && process.env.NODE_ENV !== "production")
                spyReportStart(__assign(__assign({}, change), { name: this.atom.name }));
            this.atom.reportChanged();
            if (notify)
                notifyListeners(this, change);
            if (notifySpy && process.env.NODE_ENV !== "production")
                spyReportEnd();
        };
        ObservableArrayAdministration.prototype.notifyArraySplice = function (index, added, removed) {
            var notifySpy = !this.owned && isSpyEnabled();
            var notify = hasListeners(this);
            var change = notify || notifySpy
                ? {
                    object: this.proxy,
                    type: "splice",
                    index: index,
                    removed: removed,
                    added: added,
                    removedCount: removed.length,
                    addedCount: added.length
                }
                : null;
            if (notifySpy && process.env.NODE_ENV !== "production")
                spyReportStart(__assign(__assign({}, change), { name: this.atom.name }));
            this.atom.reportChanged();
            // conform: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/observe
            if (notify)
                notifyListeners(this, change);
            if (notifySpy && process.env.NODE_ENV !== "production")
                spyReportEnd();
        };
        return ObservableArrayAdministration;
    }());
    var arrayExtensions = {
        intercept: function (handler) {
            return this[$mobx].intercept(handler);
        },
        observe: function (listener, fireImmediately) {
            if (fireImmediately === void 0) { fireImmediately = false; }
            var adm = this[$mobx];
            return adm.observe(listener, fireImmediately);
        },
        clear: function () {
            return this.splice(0);
        },
        replace: function (newItems) {
            var adm = this[$mobx];
            return adm.spliceWithArray(0, adm.values.length, newItems);
        },
        /**
         * Converts this array back to a (shallow) javascript structure.
         * For a deep clone use mobx.toJS
         */
        toJS: function () {
            return this.slice();
        },
        toJSON: function () {
            // Used by JSON.stringify
            return this.toJS();
        },
        /*
         * functions that do alter the internal structure of the array, (based on lib.es6.d.ts)
         * since these functions alter the inner structure of the array, the have side effects.
         * Because the have side effects, they should not be used in computed function,
         * and for that reason the do not call dependencyState.notifyObserved
         */
        splice: function (index, deleteCount) {
            var newItems = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                newItems[_i - 2] = arguments[_i];
            }
            var adm = this[$mobx];
            switch (arguments.length) {
                case 0:
                    return [];
                case 1:
                    return adm.spliceWithArray(index);
                case 2:
                    return adm.spliceWithArray(index, deleteCount);
            }
            return adm.spliceWithArray(index, deleteCount, newItems);
        },
        spliceWithArray: function (index, deleteCount, newItems) {
            var adm = this[$mobx];
            return adm.spliceWithArray(index, deleteCount, newItems);
        },
        push: function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            var adm = this[$mobx];
            adm.spliceWithArray(adm.values.length, 0, items);
            return adm.values.length;
        },
        pop: function () {
            return this.splice(Math.max(this[$mobx].values.length - 1, 0), 1)[0];
        },
        shift: function () {
            return this.splice(0, 1)[0];
        },
        unshift: function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            var adm = this[$mobx];
            adm.spliceWithArray(0, 0, items);
            return adm.values.length;
        },
        reverse: function () {
            // reverse by default mutates in place before returning the result
            // which makes it both a 'derivation' and a 'mutation'.
            // so we deviate from the default and just make it an dervitation
            if (process.env.NODE_ENV !== "production") {
                console.warn("[mobx] `observableArray.reverse()` will not update the array in place. Use `observableArray.slice().reverse()` to suppress this warning and perform the operation on a copy, or `observableArray.replace(observableArray.slice().reverse())` to reverse & update in place");
            }
            var clone = this.slice();
            return clone.reverse.apply(clone, arguments);
        },
        sort: function (compareFn) {
            // sort by default mutates in place before returning the result
            // which goes against all good practices. Let's not change the array in place!
            if (process.env.NODE_ENV !== "production") {
                console.warn("[mobx] `observableArray.sort()` will not update the array in place. Use `observableArray.slice().sort()` to suppress this warning and perform the operation on a copy, or `observableArray.replace(observableArray.slice().sort())` to sort & update in place");
            }
            var clone = this.slice();
            return clone.sort.apply(clone, arguments);
        },
        remove: function (value) {
            var adm = this[$mobx];
            var idx = adm.dehanceValues(adm.values).indexOf(value);
            if (idx > -1) {
                this.splice(idx, 1);
                return true;
            }
            return false;
        },
        get: function (index) {
            var adm = this[$mobx];
            if (adm) {
                if (index < adm.values.length) {
                    adm.atom.reportObserved();
                    return adm.dehanceValue(adm.values[index]);
                }
                console.warn("[mobx.array] Attempt to read an array index (" + index + ") that is out of bounds (" + adm.values.length + "). Please check length first. Out of bound indices will not be tracked by MobX");
            }
            return undefined;
        },
        set: function (index, newValue) {
            var adm = this[$mobx];
            var values = adm.values;
            if (index < values.length) {
                // update at index in range
                checkIfStateModificationsAreAllowed(adm.atom);
                var oldValue = values[index];
                if (hasInterceptors(adm)) {
                    var change = interceptChange(adm, {
                        type: "update",
                        object: adm.proxy,
                        index: index,
                        newValue: newValue
                    });
                    if (!change)
                        return;
                    newValue = change.newValue;
                }
                newValue = adm.enhancer(newValue, oldValue);
                var changed = newValue !== oldValue;
                if (changed) {
                    values[index] = newValue;
                    adm.notifyArrayChildUpdate(index, newValue, oldValue);
                }
            }
            else if (index === values.length) {
                // add a new item
                adm.spliceWithArray(index, 0, [newValue]);
            }
            else {
                // out of bounds
                throw new Error("[mobx.array] Index out of bounds, " + index + " is larger than " + values.length);
            }
        }
    };
    [
        "concat",
        "every",
        "filter",
        "forEach",
        "indexOf",
        "join",
        "lastIndexOf",
        "map",
        "reduce",
        "reduceRight",
        "slice",
        "some",
        "toString",
        "toLocaleString"
    ].forEach(function (funcName) {
        arrayExtensions[funcName] = function () {
            var adm = this[$mobx];
            adm.atom.reportObserved();
            var res = adm.dehanceValues(adm.values);
            return res[funcName].apply(res, arguments);
        };
    });
    var isObservableArrayAdministration = createInstanceofPredicate("ObservableArrayAdministration", ObservableArrayAdministration);
    function isObservableArray(thing) {
        return isObject(thing) && isObservableArrayAdministration(thing[$mobx]);
    }

    var _a;
    var ObservableMapMarker = {};
    // just extend Map? See also https://gist.github.com/nestharus/13b4d74f2ef4a2f4357dbd3fc23c1e54
    // But: https://github.com/mobxjs/mobx/issues/1556
    var ObservableMap = /** @class */ (function () {
        function ObservableMap(initialData, enhancer, name) {
            if (enhancer === void 0) { enhancer = deepEnhancer; }
            if (name === void 0) { name = "ObservableMap@" + getNextId(); }
            this.enhancer = enhancer;
            this.name = name;
            this[_a] = ObservableMapMarker;
            this._keysAtom = createAtom(this.name + ".keys()");
            this[Symbol.toStringTag] = "Map";
            if (typeof Map !== "function") {
                throw new Error("mobx.map requires Map polyfill for the current browser. Check babel-polyfill or core-js/es6/map.js");
            }
            this._data = new Map();
            this._hasMap = new Map();
            this.merge(initialData);
        }
        ObservableMap.prototype._has = function (key) {
            return this._data.has(key);
        };
        ObservableMap.prototype.has = function (key) {
            var _this = this;
            if (!globalState.trackingDerivation)
                return this._has(key);
            var entry = this._hasMap.get(key);
            if (!entry) {
                // todo: replace with atom (breaking change)
                var newEntry = (entry = new ObservableValue(this._has(key), referenceEnhancer, this.name + "." + stringifyKey(key) + "?", false));
                this._hasMap.set(key, newEntry);
                onBecomeUnobserved(newEntry, function () { return _this._hasMap.delete(key); });
            }
            return entry.get();
        };
        ObservableMap.prototype.set = function (key, value) {
            var hasKey = this._has(key);
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    type: hasKey ? "update" : "add",
                    object: this,
                    newValue: value,
                    name: key
                });
                if (!change)
                    return this;
                value = change.newValue;
            }
            if (hasKey) {
                this._updateValue(key, value);
            }
            else {
                this._addValue(key, value);
            }
            return this;
        };
        ObservableMap.prototype.delete = function (key) {
            var _this = this;
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    type: "delete",
                    object: this,
                    name: key
                });
                if (!change)
                    return false;
            }
            if (this._has(key)) {
                var notifySpy = isSpyEnabled();
                var notify = hasListeners(this);
                var change = notify || notifySpy
                    ? {
                        type: "delete",
                        object: this,
                        oldValue: this._data.get(key).value,
                        name: key
                    }
                    : null;
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportStart(__assign(__assign({}, change), { name: this.name, key: key }));
                transaction(function () {
                    _this._keysAtom.reportChanged();
                    _this._updateHasMapEntry(key, false);
                    var observable = _this._data.get(key);
                    observable.setNewValue(undefined);
                    _this._data.delete(key);
                });
                if (notify)
                    notifyListeners(this, change);
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportEnd();
                return true;
            }
            return false;
        };
        ObservableMap.prototype._updateHasMapEntry = function (key, value) {
            var entry = this._hasMap.get(key);
            if (entry) {
                entry.setNewValue(value);
            }
        };
        ObservableMap.prototype._updateValue = function (key, newValue) {
            var observable = this._data.get(key);
            newValue = observable.prepareNewValue(newValue);
            if (newValue !== globalState.UNCHANGED) {
                var notifySpy = isSpyEnabled();
                var notify = hasListeners(this);
                var change = notify || notifySpy
                    ? {
                        type: "update",
                        object: this,
                        oldValue: observable.value,
                        name: key,
                        newValue: newValue
                    }
                    : null;
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportStart(__assign(__assign({}, change), { name: this.name, key: key }));
                observable.setNewValue(newValue);
                if (notify)
                    notifyListeners(this, change);
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportEnd();
            }
        };
        ObservableMap.prototype._addValue = function (key, newValue) {
            var _this = this;
            checkIfStateModificationsAreAllowed(this._keysAtom);
            transaction(function () {
                var observable = new ObservableValue(newValue, _this.enhancer, _this.name + "." + stringifyKey(key), false);
                _this._data.set(key, observable);
                newValue = observable.value; // value might have been changed
                _this._updateHasMapEntry(key, true);
                _this._keysAtom.reportChanged();
            });
            var notifySpy = isSpyEnabled();
            var notify = hasListeners(this);
            var change = notify || notifySpy
                ? {
                    type: "add",
                    object: this,
                    name: key,
                    newValue: newValue
                }
                : null;
            if (notifySpy && process.env.NODE_ENV !== "production")
                spyReportStart(__assign(__assign({}, change), { name: this.name, key: key }));
            if (notify)
                notifyListeners(this, change);
            if (notifySpy && process.env.NODE_ENV !== "production")
                spyReportEnd();
        };
        ObservableMap.prototype.get = function (key) {
            if (this.has(key))
                return this.dehanceValue(this._data.get(key).get());
            return this.dehanceValue(undefined);
        };
        ObservableMap.prototype.dehanceValue = function (value) {
            if (this.dehancer !== undefined) {
                return this.dehancer(value);
            }
            return value;
        };
        ObservableMap.prototype.keys = function () {
            this._keysAtom.reportObserved();
            return this._data.keys();
        };
        ObservableMap.prototype.values = function () {
            var self = this;
            var nextIndex = 0;
            var keys = Array.from(this.keys());
            return makeIterable({
                next: function () {
                    return nextIndex < keys.length
                        ? { value: self.get(keys[nextIndex++]), done: false }
                        : { done: true };
                }
            });
        };
        ObservableMap.prototype.entries = function () {
            var self = this;
            var nextIndex = 0;
            var keys = Array.from(this.keys());
            return makeIterable({
                next: function () {
                    if (nextIndex < keys.length) {
                        var key = keys[nextIndex++];
                        return {
                            value: [key, self.get(key)],
                            done: false
                        };
                    }
                    return { done: true };
                }
            });
        };
        ObservableMap.prototype[(_a = $mobx, Symbol.iterator)] = function () {
            return this.entries();
        };
        ObservableMap.prototype.forEach = function (callback, thisArg) {
            var e_1, _b;
            try {
                for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var _e = __read(_d.value, 2), key = _e[0], value = _e[1];
                    callback.call(thisArg, value, key, this);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /** Merge another object into this object, returns this. */
        ObservableMap.prototype.merge = function (other) {
            var _this = this;
            if (isObservableMap(other)) {
                other = other.toJS();
            }
            transaction(function () {
                if (isPlainObject(other))
                    getPlainObjectKeys(other).forEach(function (key) { return _this.set(key, other[key]); });
                else if (Array.isArray(other))
                    other.forEach(function (_b) {
                        var _c = __read(_b, 2), key = _c[0], value = _c[1];
                        return _this.set(key, value);
                    });
                else if (isES6Map(other)) {
                    if (other.constructor !== Map)
                        fail("Cannot initialize from classes that inherit from Map: " + other.constructor.name); // prettier-ignore
                    other.forEach(function (value, key) { return _this.set(key, value); });
                }
                else if (other !== null && other !== undefined)
                    fail("Cannot initialize map from " + other);
            });
            return this;
        };
        ObservableMap.prototype.clear = function () {
            var _this = this;
            transaction(function () {
                untracked(function () {
                    var e_2, _b;
                    try {
                        for (var _c = __values(_this.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var key = _d.value;
                            _this.delete(key);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                });
            });
        };
        ObservableMap.prototype.replace = function (values) {
            var _this = this;
            transaction(function () {
                // grab all the keys that are present in the new map but not present in the current map
                // and delete them from the map, then merge the new map
                // this will cause reactions only on changed values
                var newKeys = getMapLikeKeys(values);
                var oldKeys = Array.from(_this.keys());
                var missingKeys = oldKeys.filter(function (k) { return newKeys.indexOf(k) === -1; });
                missingKeys.forEach(function (k) { return _this.delete(k); });
                _this.merge(values);
            });
            return this;
        };
        Object.defineProperty(ObservableMap.prototype, "size", {
            get: function () {
                this._keysAtom.reportObserved();
                return this._data.size;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Returns a plain object that represents this map.
         * Note that all the keys being stringified.
         * If there are duplicating keys after converting them to strings, behaviour is undetermined.
         */
        ObservableMap.prototype.toPOJO = function () {
            var e_3, _b;
            var res = {};
            try {
                for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var _e = __read(_d.value, 2), key = _e[0], value = _e[1];
                    // We lie about symbol key types due to https://github.com/Microsoft/TypeScript/issues/1863
                    res[typeof key === "symbol" ? key : stringifyKey(key)] = value;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return res;
        };
        /**
         * Returns a shallow non observable object clone of this map.
         * Note that the values migth still be observable. For a deep clone use mobx.toJS.
         */
        ObservableMap.prototype.toJS = function () {
            return new Map(this);
        };
        ObservableMap.prototype.toJSON = function () {
            // Used by JSON.stringify
            return this.toPOJO();
        };
        ObservableMap.prototype.toString = function () {
            var _this = this;
            return (this.name +
                "[{ " +
                Array.from(this.keys())
                    .map(function (key) { return stringifyKey(key) + ": " + ("" + _this.get(key)); })
                    .join(", ") +
                " }]");
        };
        /**
         * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
         * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
         * for callback details
         */
        ObservableMap.prototype.observe = function (listener, fireImmediately) {
            process.env.NODE_ENV !== "production" &&
                invariant(fireImmediately !== true, "`observe` doesn't support fireImmediately=true in combination with maps.");
            return registerListener(this, listener);
        };
        ObservableMap.prototype.intercept = function (handler) {
            return registerInterceptor(this, handler);
        };
        return ObservableMap;
    }());
    /* 'var' fixes small-build issue */
    var isObservableMap = createInstanceofPredicate("ObservableMap", ObservableMap);

    var _a$1;
    var ObservableSetMarker = {};
    var ObservableSet = /** @class */ (function () {
        function ObservableSet(initialData, enhancer, name) {
            if (enhancer === void 0) { enhancer = deepEnhancer; }
            if (name === void 0) { name = "ObservableSet@" + getNextId(); }
            this.name = name;
            this[_a$1] = ObservableSetMarker;
            this._data = new Set();
            this._atom = createAtom(this.name);
            this[Symbol.toStringTag] = "Set";
            if (typeof Set !== "function") {
                throw new Error("mobx.set requires Set polyfill for the current browser. Check babel-polyfill or core-js/es6/set.js");
            }
            this.enhancer = function (newV, oldV) { return enhancer(newV, oldV, name); };
            if (initialData) {
                this.replace(initialData);
            }
        }
        ObservableSet.prototype.dehanceValue = function (value) {
            if (this.dehancer !== undefined) {
                return this.dehancer(value);
            }
            return value;
        };
        ObservableSet.prototype.clear = function () {
            var _this = this;
            transaction(function () {
                untracked(function () {
                    var e_1, _b;
                    try {
                        for (var _c = __values(_this._data.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var value = _d.value;
                            _this.delete(value);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                });
            });
        };
        ObservableSet.prototype.forEach = function (callbackFn, thisArg) {
            var e_2, _b;
            try {
                for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var value = _d.value;
                    callbackFn.call(thisArg, value, value, this);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        Object.defineProperty(ObservableSet.prototype, "size", {
            get: function () {
                this._atom.reportObserved();
                return this._data.size;
            },
            enumerable: true,
            configurable: true
        });
        ObservableSet.prototype.add = function (value) {
            var _this = this;
            checkIfStateModificationsAreAllowed(this._atom);
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    type: "add",
                    object: this,
                    newValue: value
                });
                if (!change)
                    return this;
                // TODO: ideally, value = change.value would be done here, so that values can be
                // changed by interceptor. Same applies for other Set and Map api's.
            }
            if (!this.has(value)) {
                transaction(function () {
                    _this._data.add(_this.enhancer(value, undefined));
                    _this._atom.reportChanged();
                });
                var notifySpy = isSpyEnabled();
                var notify = hasListeners(this);
                var change = notify || notifySpy
                    ? {
                        type: "add",
                        object: this,
                        newValue: value
                    }
                    : null;
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportStart(change);
                if (notify)
                    notifyListeners(this, change);
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportEnd();
            }
            return this;
        };
        ObservableSet.prototype.delete = function (value) {
            var _this = this;
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    type: "delete",
                    object: this,
                    oldValue: value
                });
                if (!change)
                    return false;
            }
            if (this.has(value)) {
                var notifySpy = isSpyEnabled();
                var notify = hasListeners(this);
                var change = notify || notifySpy
                    ? {
                        type: "delete",
                        object: this,
                        oldValue: value
                    }
                    : null;
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportStart(__assign(__assign({}, change), { name: this.name }));
                transaction(function () {
                    _this._atom.reportChanged();
                    _this._data.delete(value);
                });
                if (notify)
                    notifyListeners(this, change);
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportEnd();
                return true;
            }
            return false;
        };
        ObservableSet.prototype.has = function (value) {
            this._atom.reportObserved();
            return this._data.has(this.dehanceValue(value));
        };
        ObservableSet.prototype.entries = function () {
            var nextIndex = 0;
            var keys = Array.from(this.keys());
            var values = Array.from(this.values());
            return makeIterable({
                next: function () {
                    var index = nextIndex;
                    nextIndex += 1;
                    return index < values.length
                        ? { value: [keys[index], values[index]], done: false }
                        : { done: true };
                }
            });
        };
        ObservableSet.prototype.keys = function () {
            return this.values();
        };
        ObservableSet.prototype.values = function () {
            this._atom.reportObserved();
            var self = this;
            var nextIndex = 0;
            var observableValues = Array.from(this._data.values());
            return makeIterable({
                next: function () {
                    return nextIndex < observableValues.length
                        ? { value: self.dehanceValue(observableValues[nextIndex++]), done: false }
                        : { done: true };
                }
            });
        };
        ObservableSet.prototype.replace = function (other) {
            var _this = this;
            if (isObservableSet(other)) {
                other = other.toJS();
            }
            transaction(function () {
                if (Array.isArray(other)) {
                    _this.clear();
                    other.forEach(function (value) { return _this.add(value); });
                }
                else if (isES6Set(other)) {
                    _this.clear();
                    other.forEach(function (value) { return _this.add(value); });
                }
                else if (other !== null && other !== undefined) {
                    fail("Cannot initialize set from " + other);
                }
            });
            return this;
        };
        ObservableSet.prototype.observe = function (listener, fireImmediately) {
            // TODO 'fireImmediately' can be true?
            process.env.NODE_ENV !== "production" &&
                invariant(fireImmediately !== true, "`observe` doesn't support fireImmediately=true in combination with sets.");
            return registerListener(this, listener);
        };
        ObservableSet.prototype.intercept = function (handler) {
            return registerInterceptor(this, handler);
        };
        ObservableSet.prototype.toJS = function () {
            return new Set(this);
        };
        ObservableSet.prototype.toString = function () {
            return this.name + "[ " + Array.from(this).join(", ") + " ]";
        };
        ObservableSet.prototype[(_a$1 = $mobx, Symbol.iterator)] = function () {
            return this.values();
        };
        return ObservableSet;
    }());
    var isObservableSet = createInstanceofPredicate("ObservableSet", ObservableSet);

    var ObservableObjectAdministration = /** @class */ (function () {
        function ObservableObjectAdministration(target, values, name, defaultEnhancer) {
            if (values === void 0) { values = new Map(); }
            this.target = target;
            this.values = values;
            this.name = name;
            this.defaultEnhancer = defaultEnhancer;
            this.keysAtom = new Atom(name + ".keys");
        }
        ObservableObjectAdministration.prototype.read = function (key) {
            return this.values.get(key).get();
        };
        ObservableObjectAdministration.prototype.write = function (key, newValue) {
            var instance = this.target;
            var observable = this.values.get(key);
            if (observable instanceof ComputedValue) {
                observable.set(newValue);
                return;
            }
            // intercept
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    type: "update",
                    object: this.proxy || instance,
                    name: key,
                    newValue: newValue
                });
                if (!change)
                    return;
                newValue = change.newValue;
            }
            newValue = observable.prepareNewValue(newValue);
            // notify spy & observers
            if (newValue !== globalState.UNCHANGED) {
                var notify = hasListeners(this);
                var notifySpy = isSpyEnabled();
                var change = notify || notifySpy
                    ? {
                        type: "update",
                        object: this.proxy || instance,
                        oldValue: observable.value,
                        name: key,
                        newValue: newValue
                    }
                    : null;
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportStart(__assign(__assign({}, change), { name: this.name, key: key }));
                observable.setNewValue(newValue);
                if (notify)
                    notifyListeners(this, change);
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportEnd();
            }
        };
        ObservableObjectAdministration.prototype.has = function (key) {
            var map = this.pendingKeys || (this.pendingKeys = new Map());
            var entry = map.get(key);
            if (entry)
                return entry.get();
            else {
                var exists = !!this.values.get(key);
                // Possible optimization: Don't have a separate map for non existing keys,
                // but store them in the values map instead, using a special symbol to denote "not existing"
                entry = new ObservableValue(exists, referenceEnhancer, this.name + "." + stringifyKey(key) + "?", false);
                map.set(key, entry);
                return entry.get(); // read to subscribe
            }
        };
        ObservableObjectAdministration.prototype.addObservableProp = function (propName, newValue, enhancer) {
            if (enhancer === void 0) { enhancer = this.defaultEnhancer; }
            var target = this.target;
            assertPropertyConfigurable(target, propName);
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    object: this.proxy || target,
                    name: propName,
                    type: "add",
                    newValue: newValue
                });
                if (!change)
                    return;
                newValue = change.newValue;
            }
            var observable = new ObservableValue(newValue, enhancer, this.name + "." + stringifyKey(propName), false);
            this.values.set(propName, observable);
            newValue = observable.value; // observableValue might have changed it
            Object.defineProperty(target, propName, generateObservablePropConfig(propName));
            this.notifyPropertyAddition(propName, newValue);
        };
        ObservableObjectAdministration.prototype.addComputedProp = function (propertyOwner, // where is the property declared?
        propName, options) {
            var target = this.target;
            options.name = options.name || this.name + "." + stringifyKey(propName);
            this.values.set(propName, new ComputedValue(options));
            if (propertyOwner === target || isPropertyConfigurable(propertyOwner, propName))
                Object.defineProperty(propertyOwner, propName, generateComputedPropConfig(propName));
        };
        ObservableObjectAdministration.prototype.remove = function (key) {
            if (!this.values.has(key))
                return;
            var target = this.target;
            if (hasInterceptors(this)) {
                var change = interceptChange(this, {
                    object: this.proxy || target,
                    name: key,
                    type: "remove"
                });
                if (!change)
                    return;
            }
            try {
                startBatch();
                var notify = hasListeners(this);
                var notifySpy = isSpyEnabled();
                var oldObservable = this.values.get(key);
                var oldValue = oldObservable && oldObservable.get();
                oldObservable && oldObservable.set(undefined);
                // notify key and keyset listeners
                this.keysAtom.reportChanged();
                this.values.delete(key);
                if (this.pendingKeys) {
                    var entry = this.pendingKeys.get(key);
                    if (entry)
                        entry.set(false);
                }
                // delete the prop
                delete this.target[key];
                var change = notify || notifySpy
                    ? {
                        type: "remove",
                        object: this.proxy || target,
                        oldValue: oldValue,
                        name: key
                    }
                    : null;
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportStart(__assign(__assign({}, change), { name: this.name, key: key }));
                if (notify)
                    notifyListeners(this, change);
                if (notifySpy && process.env.NODE_ENV !== "production")
                    spyReportEnd();
            }
            finally {
                endBatch();
            }
        };
        ObservableObjectAdministration.prototype.illegalAccess = function (owner, propName) {
            /**
             * This happens if a property is accessed through the prototype chain, but the property was
             * declared directly as own property on the prototype.
             *
             * E.g.:
             * class A {
             * }
             * extendObservable(A.prototype, { x: 1 })
             *
             * classB extens A {
             * }
             * console.log(new B().x)
             *
             * It is unclear whether the property should be considered 'static' or inherited.
             * Either use `console.log(A.x)`
             * or: decorate(A, { x: observable })
             *
             * When using decorate, the property will always be redeclared as own property on the actual instance
             */
            console.warn("Property '" + propName + "' of '" + owner + "' was accessed through the prototype chain. Use 'decorate' instead to declare the prop or access it statically through it's owner");
        };
        /**
         * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
         * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
         * for callback details
         */
        ObservableObjectAdministration.prototype.observe = function (callback, fireImmediately) {
            process.env.NODE_ENV !== "production" &&
                invariant(fireImmediately !== true, "`observe` doesn't support the fire immediately property for observable objects.");
            return registerListener(this, callback);
        };
        ObservableObjectAdministration.prototype.intercept = function (handler) {
            return registerInterceptor(this, handler);
        };
        ObservableObjectAdministration.prototype.notifyPropertyAddition = function (key, newValue) {
            var notify = hasListeners(this);
            var notifySpy = isSpyEnabled();
            var change = notify || notifySpy
                ? {
                    type: "add",
                    object: this.proxy || this.target,
                    name: key,
                    newValue: newValue
                }
                : null;
            if (notifySpy && process.env.NODE_ENV !== "production")
                spyReportStart(__assign(__assign({}, change), { name: this.name, key: key }));
            if (notify)
                notifyListeners(this, change);
            if (notifySpy && process.env.NODE_ENV !== "production")
                spyReportEnd();
            if (this.pendingKeys) {
                var entry = this.pendingKeys.get(key);
                if (entry)
                    entry.set(true);
            }
            this.keysAtom.reportChanged();
        };
        ObservableObjectAdministration.prototype.getKeys = function () {
            var e_1, _a;
            this.keysAtom.reportObserved();
            // return Reflect.ownKeys(this.values) as any
            var res = [];
            try {
                for (var _b = __values(this.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                    if (value instanceof ObservableValue)
                        res.push(key);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return res;
        };
        return ObservableObjectAdministration;
    }());
    function asObservableObject(target, name, defaultEnhancer) {
        if (name === void 0) { name = ""; }
        if (defaultEnhancer === void 0) { defaultEnhancer = deepEnhancer; }
        if (Object.prototype.hasOwnProperty.call(target, $mobx))
            return target[$mobx];
        process.env.NODE_ENV !== "production" &&
            invariant(Object.isExtensible(target), "Cannot make the designated object observable; it is not extensible");
        if (!isPlainObject(target))
            name = (target.constructor.name || "ObservableObject") + "@" + getNextId();
        if (!name)
            name = "ObservableObject@" + getNextId();
        var adm = new ObservableObjectAdministration(target, new Map(), stringifyKey(name), defaultEnhancer);
        addHiddenProp(target, $mobx, adm);
        return adm;
    }
    var observablePropertyConfigs = Object.create(null);
    var computedPropertyConfigs = Object.create(null);
    function generateObservablePropConfig(propName) {
        return (observablePropertyConfigs[propName] ||
            (observablePropertyConfigs[propName] = {
                configurable: true,
                enumerable: true,
                get: function () {
                    return this[$mobx].read(propName);
                },
                set: function (v) {
                    this[$mobx].write(propName, v);
                }
            }));
    }
    function getAdministrationForComputedPropOwner(owner) {
        var adm = owner[$mobx];
        if (!adm) {
            // because computed props are declared on proty,
            // the current instance might not have been initialized yet
            initializeInstance(owner);
            return owner[$mobx];
        }
        return adm;
    }
    function generateComputedPropConfig(propName) {
        return (computedPropertyConfigs[propName] ||
            (computedPropertyConfigs[propName] = {
                configurable: globalState.computedConfigurable,
                enumerable: false,
                get: function () {
                    return getAdministrationForComputedPropOwner(this).read(propName);
                },
                set: function (v) {
                    getAdministrationForComputedPropOwner(this).write(propName, v);
                }
            }));
    }
    var isObservableObjectAdministration = createInstanceofPredicate("ObservableObjectAdministration", ObservableObjectAdministration);
    function isObservableObject(thing) {
        if (isObject(thing)) {
            // Initializers run lazily when transpiling to babel, so make sure they are run...
            initializeInstance(thing);
            return isObservableObjectAdministration(thing[$mobx]);
        }
        return false;
    }

    function getAtom(thing, property) {
        if (typeof thing === "object" && thing !== null) {
            if (isObservableArray(thing)) {
                if (property !== undefined)
                    fail(process.env.NODE_ENV !== "production" &&
                        "It is not possible to get index atoms from arrays");
                return thing[$mobx].atom;
            }
            if (isObservableSet(thing)) {
                return thing[$mobx];
            }
            if (isObservableMap(thing)) {
                var anyThing = thing;
                if (property === undefined)
                    return anyThing._keysAtom;
                var observable = anyThing._data.get(property) || anyThing._hasMap.get(property);
                if (!observable)
                    fail(process.env.NODE_ENV !== "production" &&
                        "the entry '" + property + "' does not exist in the observable map '" + getDebugName(thing) + "'");
                return observable;
            }
            // Initializers run lazily when transpiling to babel, so make sure they are run...
            initializeInstance(thing);
            if (property && !thing[$mobx])
                thing[property]; // See #1072
            if (isObservableObject(thing)) {
                if (!property)
                    return fail(process.env.NODE_ENV !== "production" && "please specify a property");
                var observable = thing[$mobx].values.get(property);
                if (!observable)
                    fail(process.env.NODE_ENV !== "production" &&
                        "no observable property '" + property + "' found on the observable object '" + getDebugName(thing) + "'");
                return observable;
            }
            if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) {
                return thing;
            }
        }
        else if (typeof thing === "function") {
            if (isReaction(thing[$mobx])) {
                // disposer function
                return thing[$mobx];
            }
        }
        return fail(process.env.NODE_ENV !== "production" && "Cannot obtain atom from " + thing);
    }
    function getAdministration(thing, property) {
        if (!thing)
            fail("Expecting some object");
        if (property !== undefined)
            return getAdministration(getAtom(thing, property));
        if (isAtom(thing) || isComputedValue(thing) || isReaction(thing))
            return thing;
        if (isObservableMap(thing) || isObservableSet(thing))
            return thing;
        // Initializers run lazily when transpiling to babel, so make sure they are run...
        initializeInstance(thing);
        if (thing[$mobx])
            return thing[$mobx];
        fail(process.env.NODE_ENV !== "production" && "Cannot obtain administration from " + thing);
    }
    function getDebugName(thing, property) {
        var named;
        if (property !== undefined)
            named = getAtom(thing, property);
        else if (isObservableObject(thing) || isObservableMap(thing) || isObservableSet(thing))
            named = getAdministration(thing);
        else
            named = getAtom(thing); // valid for arrays as well
        return named.name;
    }

    var toString = Object.prototype.toString;
    function deepEqual(a, b, depth) {
        if (depth === void 0) { depth = -1; }
        return eq(a, b, depth);
    }
    // Copied from https://github.com/jashkenas/underscore/blob/5c237a7c682fb68fd5378203f0bf22dce1624854/underscore.js#L1186-L1289
    // Internal recursive comparison function for `isEqual`.
    function eq(a, b, depth, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b)
            return a !== 0 || 1 / a === 1 / b;
        // `null` or `undefined` only equal to itself (strict comparison).
        if (a == null || b == null)
            return false;
        // `NaN`s are equivalent, but non-reflexive.
        if (a !== a)
            return b !== b;
        // Exhaust primitive checks
        var type = typeof a;
        if (type !== "function" && type !== "object" && typeof b != "object")
            return false;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b))
            return false;
        switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case "[object RegExp]":
            // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case "[object String]":
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return "" + a === "" + b;
            case "[object Number]":
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN.
                if (+a !== +a)
                    return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case "[object Date]":
            case "[object Boolean]":
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
            case "[object Symbol]":
                return (typeof Symbol !== "undefined" && Symbol.valueOf.call(a) === Symbol.valueOf.call(b));
            case "[object Map]":
            case "[object Set]":
                // Maps and Sets are unwrapped to arrays of entry-pairs, adding an incidental level.
                // Hide this extra level by increasing the depth.
                if (depth >= 0) {
                    depth++;
                }
                break;
        }
        // Unwrap any wrapped objects.
        a = unwrap(a);
        b = unwrap(b);
        var areArrays = className === "[object Array]";
        if (!areArrays) {
            if (typeof a != "object" || typeof b != "object")
                return false;
            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor &&
                !(typeof aCtor === "function" &&
                    aCtor instanceof aCtor &&
                    typeof bCtor === "function" &&
                    bCtor instanceof bCtor) &&
                ("constructor" in a && "constructor" in b)) {
                return false;
            }
        }
        if (depth === 0) {
            return false;
        }
        else if (depth < 0) {
            depth = -1;
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a)
                return bStack[length] === b;
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length)
                return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!eq(a[length], b[length], depth - 1, aStack, bStack))
                    return false;
            }
        }
        else {
            // Deep compare objects.
            var keys = Object.keys(a);
            var key = void 0;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (Object.keys(b).length !== length)
                return false;
            while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(has$1(b, key) && eq(a[key], b[key], depth - 1, aStack, bStack)))
                    return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    }
    function unwrap(a) {
        if (isObservableArray(a))
            return a.slice();
        if (isES6Map(a) || isObservableMap(a))
            return Array.from(a.entries());
        if (isES6Set(a) || isObservableSet(a))
            return Array.from(a.entries());
        return a;
    }
    function has$1(a, key) {
        return Object.prototype.hasOwnProperty.call(a, key);
    }

    function makeIterable(iterator) {
        iterator[Symbol.iterator] = getSelf;
        return iterator;
    }
    function getSelf() {
        return this;
    }

    /*
    The only reason for this file to exist is pure horror:
    Without it rollup can make the bundling fail at any point in time; when it rolls up the files in the wrong order
    it will cause undefined errors (for example because super classes or local variables not being hoisted).
    With this file that will still happen,
    but at least in this file we can magically reorder the imports with trial and error until the build succeeds again.
    */

    /**
     * (c) Michel Weststrate 2015 - 2018
     * MIT Licensed
     *
     * Welcome to the mobx sources! To get an global overview of how MobX internally works,
     * this is a good place to start:
     * https://medium.com/@mweststrate/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254#.xvbh6qd74
     *
     * Source folders:
     * ===============
     *
     * - api/     Most of the public static methods exposed by the module can be found here.
     * - core/    Implementation of the MobX algorithm; atoms, derivations, reactions, dependency trees, optimizations. Cool stuff can be found here.
     * - types/   All the magic that is need to have observable objects, arrays and values is in this folder. Including the modifiers like `asFlat`.
     * - utils/   Utility stuff.
     *
     */
    if (typeof Proxy === "undefined" || typeof Symbol === "undefined") {
        throw new Error("[mobx] MobX 5+ requires Proxy and Symbol objects. If your environment doesn't support Symbol or Proxy objects, please downgrade to MobX 4. For React Native Android, consider upgrading JSCore.");
    }
    try {
        // define process.env if needed
        // if this is not a production build in the first place
        // (in which case the expression below would be substituted with 'production')
        process.env.NODE_ENV;
    }
    catch (e) {
        var g = getGlobal();
        if (typeof process === "undefined")
            g.process = {};
        g.process.env = {};
    }
    (function () {
        function testCodeMinification() { }
        if (testCodeMinification.name !== "testCodeMinification" &&
            process.env.NODE_ENV !== "production" &&
            typeof process !== 'undefined' && process.env.IGNORE_MOBX_MINIFY_WARNING !== "true") {
            // trick so it doesn't get replaced
            var varName = ["process", "env", "NODE_ENV"].join(".");
            console.warn("[mobx] you are running a minified build, but '" + varName + "' was not set to 'production' in your bundler. This results in an unnecessarily large and slow bundle");
        }
    })();
    if (typeof __MOBX_DEVTOOLS_GLOBAL_HOOK__ === "object") {
        // See: https://github.com/andykog/mobx-devtools/
        __MOBX_DEVTOOLS_GLOBAL_HOOK__.injectMobx({
            spy: spy,
            extras: {
                getDebugName: getDebugName
            },
            $mobx: $mobx
        });
    }

    function evalInScope(script, scope, opts) {
      opts = opts ? opts : {};
      let _this = (scope && scope.this) ? scope.this : scope;
      let fargnames = ['context'];
      let fargs = [scope];
      let fn = `"use strict"; return ${script}`;

      if ('set' in opts) {
        fargnames.push('newval');
        fargs.push(opts.set);
        fn = `"use strict"; ${script} = newval`;
      } else if (opts.event) {
        fargnames.push('ev');
        fargs.push(opts.event);
        fn = `
      "use strict";
      if (typeof(${script}) == 'function') {
        ${script}(ev);
      } else {
        ${script};
      }
    `;
      }

      let fbargs = fargnames;
      fbargs.push(fn);
      if (opts.debug) ;
      const scopedEval = Function(...fbargs).bind(_this)(...fargs);
      return scopedEval;
    }

    function buildTemplate({html, css}) {
      var template = document.createElement('template');
      html = html.trim(); // Never return a text node of whitespace as the result
      html = html.replace(/{{(.*)}}/g, (m, inner)=>{
        return `<span @text="${inner.trim()}"></span>`
      });
      if (css) {
        let style = `<style>${css}</style>\n`;
        html = style + html;
      }
      template.innerHTML = html;
      return template;
    }

    function insertTemplateMarkers(node, id) {
      let sm = document.createComment(id);
      let em = document.createComment("/" + id);
      node.parentNode.insertBefore(sm, node);
      node.parentNode.insertBefore(em, node);
      node.remove();
      return [sm, em];
    }

    function clearTemplateMarkers(markers) {
      while(true) {
        let sib = markers[0].nextSibling;
        if (!sib || (sib.nodeType == 8 && sib.textContent == `/${markers[0].textContent}`)) break;
        removeElementDisposables(sib);
        sib.remove();
        //console.log("Removing " + sib.nodeName);
      }
    }

    function appendChildToTemplateMarkers(markers, child) {
      markers[0].parentNode.insertBefore(child, markers[1]);
    }

    function addElementDisposable(element, disposable) {
      element._disposables = element._disposables || [];
      if (typeof(disposable) == 'function') {
        disposable = {dispose: disposable};
      }
      element._disposables.push(disposable);
    }

    function removeElementDisposables(element) {
      setTimeout(()=>{
        //console.log(`Looking at ${element.nodeName}`);
        if (element._disposables) {
          debugLog(`Disposing ${element._disposables.length} disposables for ${element.nodeName}`);
          element._disposables.forEach((b)=> { b.dispose(); });
          element._disposables = [];
        }
        // iterate children
        element.childNodes.forEach((c)=>{
          removeElementDisposables(c);
        });
        // remove from shadow dom
        if (element.isReactiveElement && element.shadowRoot) {
          //console.log("Disposing for shadow dom also.");
          element.shadowRoot.childNodes.forEach((c)=>{
            removeElementDisposables(c);
          });
        }
      }, 10);
    }

    var DEBUG = false;

    function debugLog(str) {
    }

    var utils = {
      DEBUG,
      debugLog,
      evalInScope,
      buildTemplate
    };

    class BindingManager {
      constructor() {
        this.bindings = {};
      }

      registerBinding(binding) {
        debugLog("Registering binding " + binding.name);
        this.bindings['@' + binding.name] = binding;
      }

      applyBindings(customElement) {
        debugLog("STARTING:: Binding " + customElement.nodeName + " to dom");

        this.applyBindingsToInnerElement(customElement);
        debugLog("FINISHED:: Binding " + customElement.nodeName + " to dom");
      }

      applyBindingsToInnerElement(element, customElement, context) {
        //console.log("Applying bindings to " + element.nodeName);
        
        // find parent custom element
        if (!customElement) {
          customElement = element.getRootNode().host;
        }
        element.reactiveContextElement = customElement;
        context = context || element.reactiveContext || (element.parentElement && element.parentElement.reactiveContext) || customElement;
        element.reactiveContext = context;

        // apply to children
        let updateChildren = true;
            
        {
          if (!element.attributes) return;
          if (element.onBinding) element.onBinding(context);

          for (let i=0; i < element.attributes.length; i++) {
            let attr = element.attributes[i];
            let bres = null;
            if (attr.nodeName[0] == ":") {
              bres = this.processParamBinding(element, customElement, context, attr);
            } else if (attr.nodeName[0] == "@") {
              bres =this.processDirectiveBinding(element, customElement, context, attr);
            }
            if (bres && !bres.updateChildren) {
              updateChildren = false;
            }
          }
        }
        // apply to children
        if (updateChildren) {
          let els = element.childNodes;
          // iterate children
          Array.from(els).forEach((iel)=>{
            this.applyBindingsToInnerElement(iel, customElement, context);
          });
          // iterate shadow root children
          if (element.isReactiveElement && element.shadowRoot) {
            let schilds = element.shadowRoot.childNodes;
            Array.from(schilds).forEach((iel)=>{
              this.applyBindingsToInnerElement(iel, element, element);
            });
          }
        }
      }

      processDirectiveBinding(element, customElement, context, attr) {
        let ret = {updateChildren: true};
        debugLog("Processing @binding " + attr.nodeName + " in " + element.nodeName);
        // check binding
        let binding = this.bindings[attr.nodeName];
        if (binding) {
          if (binding.managesChildren) ret.updateChildren = false;
          //console.log("Setting up auto run for " + binding.name);
          let rawValue = attr.nodeValue;
          if (binding.init) binding.init({element, rawValue, customElement, context});
          if (binding.update) {
            let disposer = autorun((reaction)=>{
              let evalValue = null;
              let rawValue = attr.nodeValue;
              if (binding.evaluateValue != false) {
                evalValue = evalInScope(rawValue, context);
              }
              debugLog(`${element.nodeName} ${attr.nodeName} value is ${evalValue}`);
              binding.update({element, rawValue, evalValue, customElement, context});
            });
            addElementDisposable(element, disposer);
          }
        } else {
          // check for event
          if (attr.nodeName.substring(1,4) == "on-") {
            element.addEventListener(attr.nodeName.substring(4), (ev)=>{
              let rawValue = attr.nodeValue;
              let data = ev;
              if (ev.detail) { data = ev.detail; }
              evalInScope(rawValue, context, {event: data});
            });
          }
        }
        return ret;
      }

      processParamBinding(element, customElement, context, attr) {
        let ret = {updateChildren: true};
        debugLog("Processing :binding " + attr.nodeName + " in " + element.nodeName);
        // check input key
        let field = attr.nodeName.substring(1);
        let disposer = autorun((reaction)=>{
          debugLog(`${element.nodeName} Handling param attribute ${field}`);
          element[field] = evalInScope(attr.nodeValue, context);
        });
        addElementDisposable(element, disposer);
        return ret;
      }

    }

    let bindingManager = new BindingManager();

    class ReactiveElement extends HTMLElement {
      constructor() {
        super();
        debugLog("Start constructor for " + this.nodeName);
        this.isReactiveElement = true;
        this.init();

        this.attachShadow({mode: 'open'});
        //let tc = document.getElementById("tpl-" + this.nodeName.toLowerCase()).content;
        //this.shadowRoot.appendChild(tc.cloneNode(true));
        debugLog("End constructor for " + this.nodeName);
      }

      init() {

      }
      
      connectedCallback() {
        debugLog("Building shadow root for " + this.nodeName);
        let content = buildTemplate({html: this.templateHTML(), css: this.templateCSS()}).content;
        this.shadowRoot.appendChild(content);
        if (!this.hasReactiveParent()) {
          debugLog("APPLYING ROOT LEVEL BINDING FOR " + this.nodeName);
          bindingManager.applyBindings(this);
          this.isReactiveRoot = true;
        }
        this.onMount();
      }

      disconnectedCallback() {
        // remove bindings
        if (this.isReactiveRoot) {
          removeElementDisposables(this);
        }
      }
      
      onMount() {
      
      }

      templateHTML() {
        return "";
      }

      templateCSS() {
        return "";
      }

      emitEvent(name, data) {
        let ev = new CustomEvent(name, {detail: data});
        this.dispatchEvent(ev);
      }

      hasReactiveParent() {
        let host = this.getRootNode().host;
        if (host && host.isReactiveElement) return true;
        let p = this.parentElement;
        while (true) {
          if (!p) break;
          if (p.isReactiveElement) return true;
          p = p.parentElement;
        }
        return false;
      }
      
    }

    var bnd_sync = {
      name: 'sync',
      init: ({element, rawValue, customElement})=> {
        let bind_event = element.getAttribute("@sync-event") || "change";
        element.addEventListener(bind_event, (ev)=> {
          //console.log("Change occurred. binding updating = " + ev.target.isBindingUpdating);
          if (ev.target._isBindingUpdating == true) return;
          let val = ev.target.value;
          if ('checked' in element) val = element.checked;
          evalInScope(rawValue, customElement, {set: val});
        });
      },
      update: ({element, rawValue, evalValue})=> {
        element._isBindingUpdating = true;
        if ('checked' in element) {
          element.checked = evalValue;
        } else {
          element.value = evalValue;
        }
        element._isBindingUpdating = false;
      }
    };

    var bnd_click = {
      name: 'click',
      init: ({element, rawValue, customElement})=>{
        element.addEventListener('click', (ev)=>{
          evalInScope(rawValue, customElement);
        });
      },
      evaluateValue: false
    };

    /**
     * @each - Iterate element for each item in list. To be used
     * with <template> elements.
     *
     * Example:
     *
     * <template @each="this.todos" @as="todo">
     *    ...
     * </template>
     *
     */

    var bnd_each = {
      name: 'each',
      init : ({element, rawValue, customElement, context})=> {
        let repeatedContent = element.content;
        let repeatedID = Math.floor(Math.random() * 1e9);
        let cas = element.getAttribute('@as');
        let markers = insertTemplateMarkers(element, repeatedID);

        // setup autorun, needed here because element is going away
        let disposer = reaction(
          ()=> {
            let array = evalInScope(rawValue, context);
            return array.slice();
          },
          (array, reaction)=>{
            clearTemplateMarkers(markers);
            debugLog("Iterating " + array.length + " items");
            array.forEach((item)=>{
              let newNode = repeatedContent.cloneNode(true);
              
              let newContext = {};
              newContext[cas] = item;
              newContext.this = context;

              let children = Array.from(newNode.childNodes);
              /*
              children.forEach( (n)=> {
                n.smartContext = newContext;
              });
              window.children = children;
              */
              appendChildToTemplateMarkers(markers, newNode);

              children.forEach( (n)=> {
                bindingManager.applyBindingsToInnerElement(n, customElement, newContext);
              });
            });
          },
          {
            fireImmediately: true
          }
        ); // end autorun
        addElementDisposable(markers[0], disposer);

      },
      managesChildren: true
    };

    var bnd_text = {
      name: 'text',
      evaluateValue: true,
      update: ({element, evalValue, customElement})=> {
        element.innerText = evalValue;
      }
    };

    var bnd_html = {
      name: 'html',
      evaluateValue: true,
      update: ({element, evalValue, customElement})=> {
        element.innerHTML = evalValue;
      }
    };

    var bnd_on_return = {
      name: 'on-return',
      init: ({element, rawValue, customElement})=>{
        element.addEventListener('keypress', (ev)=>{
          if (ev.keyCode == 13) {
            evalInScope(rawValue, customElement);
          }
        });
      },
      evaluateValue: false
    };

    /**
     * @class - Add or remove element classes
     *
     * Example:
     *
     * <div @class="{open: this.isOpen, highlighted: this.isHighlighted}">
     *    ...
     * </div>
     *
     */

    var bnd_class = {
      name: 'class',
      evaluateValue: true,
      update: ({element, evalValue, customElement})=> {
        //console.log("Got " + ret);
        for (let [key, val] of Object.entries(evalValue)) {
          val ? element.classList.add(key) : element.classList.remove(key);
        }
      }
    };

    /**
     * @if - Conditionally show or hide elements. To be used
     * with <template> elements.
     *
     * Example:
     *
     * <template @if="this.isVisible">
     *    ...
     * </template>
     *
     */

    var bnd_if = {
      name: 'if',
      init : ({element, rawValue, customElement, context})=> {
        let repeatedContent = element.content;
        let repeatedID = Math.floor(Math.random() * 1e9);
        let markers = insertTemplateMarkers(element, repeatedID);

        // setup autorun, needed here because element is going away
        reaction(
          ()=> {
            let cond = evalInScope(rawValue, context);
            return cond;
          },
          (cond, reaction)=>{
            clearTemplateMarkers(markers);
            if (cond) {
              let newNode = repeatedContent.cloneNode(true);
              
              let children = Array.from(newNode.childNodes);
              /*
              children.forEach( (n)=> {
                n.smartContext = newContext;
              });
              window.children = children;
              */
              appendChildToTemplateMarkers(markers, newNode);

              children.forEach( (n)=> {
                bindingManager.applyBindingsToInnerElement(n, customElement, context);
              });
            }      },
          {
            fireImmediately: true
          }
        ); // end autorun

      },
      managesChildren: true
    };

    bindingManager.registerBinding(bnd_text);
    bindingManager.registerBinding(bnd_html);
    bindingManager.registerBinding(bnd_click);
    bindingManager.registerBinding(bnd_sync);
    bindingManager.registerBinding(bnd_each);
    bindingManager.registerBinding(bnd_on_return);
    bindingManager.registerBinding(bnd_class);
    bindingManager.registerBinding(bnd_if);

    exports.ReactiveElement = ReactiveElement;
    exports.bindings = bindingManager;
    exports.utils = utils;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
