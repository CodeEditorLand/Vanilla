var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function extHostNamedCustomer(id) {
  return (ctor) => {
    ExtHostCustomersRegistryImpl.INSTANCE.registerNamedCustomer(
      id,
      ctor
    );
  };
}
__name(extHostNamedCustomer, "extHostNamedCustomer");
function extHostCustomer(ctor) {
  ExtHostCustomersRegistryImpl.INSTANCE.registerCustomer(
    ctor
  );
}
__name(extHostCustomer, "extHostCustomer");
var ExtHostCustomersRegistry;
((ExtHostCustomersRegistry2) => {
  function getNamedCustomers() {
    return ExtHostCustomersRegistryImpl.INSTANCE.getNamedCustomers();
  }
  ExtHostCustomersRegistry2.getNamedCustomers = getNamedCustomers;
  __name(getNamedCustomers, "getNamedCustomers");
  function getCustomers() {
    return ExtHostCustomersRegistryImpl.INSTANCE.getCustomers();
  }
  ExtHostCustomersRegistry2.getCustomers = getCustomers;
  __name(getCustomers, "getCustomers");
})(ExtHostCustomersRegistry || (ExtHostCustomersRegistry = {}));
class ExtHostCustomersRegistryImpl {
  static {
    __name(this, "ExtHostCustomersRegistryImpl");
  }
  static INSTANCE = new ExtHostCustomersRegistryImpl();
  _namedCustomers;
  _customers;
  constructor() {
    this._namedCustomers = [];
    this._customers = [];
  }
  registerNamedCustomer(id, ctor) {
    const entry = [id, ctor];
    this._namedCustomers.push(entry);
  }
  getNamedCustomers() {
    return this._namedCustomers;
  }
  registerCustomer(ctor) {
    this._customers.push(ctor);
  }
  getCustomers() {
    return this._customers;
  }
}
export {
  ExtHostCustomersRegistry,
  extHostCustomer,
  extHostNamedCustomer
};
//# sourceMappingURL=extHostCustomers.js.map
