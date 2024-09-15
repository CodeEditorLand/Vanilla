var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function flakySuite(title, fn) {
  return suite(title, function() {
    this.retries(3);
    this.timeout(1e3 * 20);
    fn.call(this);
  });
}
__name(flakySuite, "flakySuite");
export {
  flakySuite
};
//# sourceMappingURL=testUtils.js.map
