// @ts-nocheck
// object.watch
if (!Object.prototype.watch) {
  Object.prototype.watch = function (propsToWatchFor, handler) {
    (this._handlers || (this._handlers = [])).push(handler)
    propsToWatchFor.forEach((prop) => {
      var oldval = this[prop],
        newval = oldval,
        getter = function () {
          return newval;
        },
        setter = function (val) {
          if (this._watchTimer) clearTimeout(this._watchTimer);
          this._watchTimer = setTimeout(() => {
            for (let handler of this._handlers)
              handler.call();
            clearTimeout(this._watchTimer);
            delete this._watchTimer;
          }, 0);
          oldval = newval;
          newval = val;
          return true;
        };
      try {

        if (delete this[prop]) {
          // can't watch constants
          if (Object.defineProperty) {
            // ECMAScript 5          
            Object.defineProperty(this, prop, {
              get: getter,
              set: setter,
            });
          }
          else if (
            Object.prototype.__defineGetter__ &&
            Object.prototype.__defineSetter__
          ) {
            // legacy
            Object.prototype.__defineGetter__.call(this, prop, getter);
            Object.prototype.__defineSetter__.call(this, prop, setter);
          }
        }
      } catch (e) { }
    });

    return () => {
      this._handlers.splice(this._handlers.indexOf(handler), 1);
    };
  };
  Object.defineProperty(Object.prototype, 'watch', {
    enumerable: false,
    configurable: true
  });
}