var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as sinon from "sinon";
import { DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { SyncDescriptor } from "../../common/descriptors.js";
import { ServiceIdentifier } from "../../common/instantiation.js";
import { InstantiationService, Trace } from "../../common/instantiationService.js";
import { ServiceCollection } from "../../common/serviceCollection.js";
const isSinonSpyLike = /* @__PURE__ */ __name((fn) => fn && "callCount" in fn, "isSinonSpyLike");
class TestInstantiationService extends InstantiationService {
  constructor(_serviceCollection = new ServiceCollection(), strict = false, parent, _properDispose) {
    super(_serviceCollection, strict, parent);
    this._serviceCollection = _serviceCollection;
    this._properDispose = _properDispose;
    this._servciesMap = /* @__PURE__ */ new Map();
  }
  static {
    __name(this, "TestInstantiationService");
  }
  _servciesMap;
  get(service) {
    return super._getOrCreateServiceInstance(service, Trace.traceCreation(false, TestInstantiationService));
  }
  set(service, instance) {
    return this._serviceCollection.set(service, instance);
  }
  mock(service) {
    return this._create(service, { mock: true });
  }
  stub(serviceIdentifier, arg2, arg3, arg4) {
    const service = typeof arg2 !== "string" ? arg2 : void 0;
    const serviceMock = { id: serviceIdentifier, service };
    const property = typeof arg2 === "string" ? arg2 : arg3;
    const value = typeof arg2 === "string" ? arg3 : arg4;
    const stubObject = this._create(serviceMock, { stub: true }, service && !property);
    if (property) {
      if (stubObject[property]) {
        if (stubObject[property].hasOwnProperty("restore")) {
          stubObject[property].restore();
        }
        if (typeof value === "function") {
          const spy = isSinonSpyLike(value) ? value : sinon.spy(value);
          stubObject[property] = spy;
          return spy;
        } else {
          const stub = value ? sinon.stub().returns(value) : sinon.stub();
          stubObject[property] = stub;
          return stub;
        }
      } else {
        stubObject[property] = value;
      }
    }
    return stubObject;
  }
  stubPromise(arg1, arg2, arg3, arg4) {
    arg3 = typeof arg2 === "string" ? Promise.resolve(arg3) : arg3;
    arg4 = typeof arg2 !== "string" && typeof arg3 === "string" ? Promise.resolve(arg4) : arg4;
    return this.stub(arg1, arg2, arg3, arg4);
  }
  spy(service, fnProperty) {
    const spy = sinon.spy();
    this.stub(service, fnProperty, spy);
    return spy;
  }
  _create(arg1, options, reset = false) {
    if (this.isServiceMock(arg1)) {
      const service = this._getOrCreateService(arg1, options, reset);
      this._serviceCollection.set(arg1.id, service);
      return service;
    }
    return options.mock ? sinon.mock(arg1) : this._createStub(arg1);
  }
  _getOrCreateService(serviceMock, opts, reset) {
    const service = this._serviceCollection.get(serviceMock.id);
    if (!reset && service) {
      if (opts.mock && service["sinonOptions"] && !!service["sinonOptions"].mock) {
        return service;
      }
      if (opts.stub && service["sinonOptions"] && !!service["sinonOptions"].stub) {
        return service;
      }
    }
    return this._createService(serviceMock, opts);
  }
  _createService(serviceMock, opts) {
    serviceMock.service = serviceMock.service ? serviceMock.service : this._servciesMap.get(serviceMock.id);
    const service = opts.mock ? sinon.mock(serviceMock.service) : this._createStub(serviceMock.service);
    service["sinonOptions"] = opts;
    return service;
  }
  _createStub(arg) {
    return typeof arg === "object" ? arg : sinon.createStubInstance(arg);
  }
  isServiceMock(arg1) {
    return typeof arg1 === "object" && arg1.hasOwnProperty("id");
  }
  createChild(services) {
    return new TestInstantiationService(services, false, this);
  }
  dispose() {
    sinon.restore();
    if (this._properDispose) {
      super.dispose();
    }
  }
}
function createServices(disposables, services) {
  const serviceIdentifiers = [];
  const serviceCollection = new ServiceCollection();
  const define = /* @__PURE__ */ __name((id, ctorOrInstance) => {
    if (!serviceCollection.has(id)) {
      if (typeof ctorOrInstance === "function") {
        serviceCollection.set(id, new SyncDescriptor(ctorOrInstance));
      } else {
        serviceCollection.set(id, ctorOrInstance);
      }
    }
    serviceIdentifiers.push(id);
  }, "define");
  for (const [id, ctor] of services) {
    define(id, ctor);
  }
  const instantiationService = disposables.add(new TestInstantiationService(serviceCollection, true));
  disposables.add(toDisposable(() => {
    for (const id of serviceIdentifiers) {
      const instanceOrDescriptor = serviceCollection.get(id);
      if (typeof instanceOrDescriptor.dispose === "function") {
        instanceOrDescriptor.dispose();
      }
    }
  }));
  return instantiationService;
}
__name(createServices, "createServices");
export {
  TestInstantiationService,
  createServices
};
//# sourceMappingURL=instantiationServiceMock.js.map
