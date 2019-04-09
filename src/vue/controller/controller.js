export default class Controller {
  constructor (options) {
    this.comonenntData = options.initData || {};
    this.transition = options.transition;
  }

  begin () {
    this.comonenntData.a = "hello a";
  }

  setTransitionCallback (transition) {
    this.transition = transition;
  }

  triggerEvent (eventName, data) {
    let method = "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    if (typeof this[method] === "function") {
      this[method].call(this, data);
    }
  }
}
