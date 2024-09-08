function flakySuite(title, fn) {
  return suite(title, function() {
    this.retries(3);
    this.timeout(1e3 * 20);
    fn.call(this);
  });
}
export {
  flakySuite
};
