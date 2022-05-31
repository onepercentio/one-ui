// @ts-nocheck
// object.watch
if (!Object.prototype.watch)
  Object.prototype.watch = function (propsToWatchFor, handler) {
    propsToWatchFor.forEach((prop) => {
      var oldval = this[prop],
        newval = oldval,
        getter = function () {
          return newval;
        },
        setter = function (val) {
          if (this._watchTimer) clearTimeout(this._watchTimer);
          this._watchTimer = setTimeout(() => {
            handler.call();
            clearTimeout(this._watchTimer);
            delete this._watchTimer;
          }, 0);
          oldval = newval;
          newval = val;
          return true;
        };
      if (delete this[prop]) {
        // can't watch constants
        if (Object.defineProperty)
          // ECMAScript 5
          Object.defineProperty(this, prop, {
            get: getter,
            set: setter,
          });
        else if (
          Object.prototype.__defineGetter__ &&
          Object.prototype.__defineSetter__
        ) {
          // legacy
          Object.prototype.__defineGetter__.call(this, prop, getter);
          Object.prototype.__defineSetter__.call(this, prop, setter);
        }
      }
    });
    function _unwatch(prop) {
      var val = this[prop];
      delete this[prop]; // remove accessors
      this[prop] = val;
    }
    this.unwatch = function () {
      propsToWatchFor.forEach((prop) => {
        _unwatch(prop);
      });
    };
  };
