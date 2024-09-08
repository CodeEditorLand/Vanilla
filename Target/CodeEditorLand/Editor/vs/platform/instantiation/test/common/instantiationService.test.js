var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import assert from "assert";
import { Emitter } from "../../../../base/common/event.js";
import { dispose } from "../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { SyncDescriptor } from "../../common/descriptors.js";
import {
  IInstantiationService,
  createDecorator
} from "../../common/instantiation.js";
import { InstantiationService } from "../../common/instantiationService.js";
import { ServiceCollection } from "../../common/serviceCollection.js";
const IService1 = createDecorator("service1");
class Service1 {
  c = 1;
}
const IService2 = createDecorator("service2");
class Service2 {
  d = true;
}
const IService3 = createDecorator("service3");
class Service3 {
  s = "farboo";
}
const IDependentService = createDecorator("dependentService");
let DependentService = class {
  constructor(service) {
    assert.strictEqual(service.c, 1);
  }
  name = "farboo";
};
DependentService = __decorateClass([
  __decorateParam(0, IService1)
], DependentService);
let Service1Consumer = class {
  constructor(service1) {
    assert.ok(service1);
    assert.strictEqual(service1.c, 1);
  }
};
Service1Consumer = __decorateClass([
  __decorateParam(0, IService1)
], Service1Consumer);
let Target2Dep = class {
  constructor(service1, service2) {
    assert.ok(service1 instanceof Service1);
    assert.ok(service2 instanceof Service2);
  }
};
Target2Dep = __decorateClass([
  __decorateParam(0, IService1),
  __decorateParam(1, IService2)
], Target2Dep);
let TargetWithStaticParam = class {
  constructor(v, service1) {
    assert.ok(v);
    assert.ok(service1);
    assert.strictEqual(service1.c, 1);
  }
};
TargetWithStaticParam = __decorateClass([
  __decorateParam(1, IService1)
], TargetWithStaticParam);
let DependentServiceTarget = class {
  constructor(d) {
    assert.ok(d);
    assert.strictEqual(d.name, "farboo");
  }
};
DependentServiceTarget = __decorateClass([
  __decorateParam(0, IDependentService)
], DependentServiceTarget);
let DependentServiceTarget2 = class {
  constructor(d, s) {
    assert.ok(d);
    assert.strictEqual(d.name, "farboo");
    assert.ok(s);
    assert.strictEqual(s.c, 1);
  }
};
DependentServiceTarget2 = __decorateClass([
  __decorateParam(0, IDependentService),
  __decorateParam(1, IService1)
], DependentServiceTarget2);
let ServiceLoop1 = class {
  c = 1;
  constructor(s) {
  }
};
ServiceLoop1 = __decorateClass([
  __decorateParam(0, IService2)
], ServiceLoop1);
let ServiceLoop2 = class {
  d = true;
  constructor(s) {
  }
};
ServiceLoop2 = __decorateClass([
  __decorateParam(0, IService1)
], ServiceLoop2);
suite("Instantiation Service", () => {
  test("service collection, cannot overwrite", () => {
    const collection = new ServiceCollection();
    let result = collection.set(IService1, null);
    assert.strictEqual(result, void 0);
    result = collection.set(IService1, new Service1());
    assert.strictEqual(result, null);
  });
  test("service collection, add/has", () => {
    const collection = new ServiceCollection();
    collection.set(IService1, null);
    assert.ok(collection.has(IService1));
    collection.set(IService2, null);
    assert.ok(collection.has(IService1));
    assert.ok(collection.has(IService2));
  });
  test("@Param - simple clase", () => {
    const collection = new ServiceCollection();
    const service = new InstantiationService(collection);
    collection.set(IService1, new Service1());
    collection.set(IService2, new Service2());
    collection.set(IService3, new Service3());
    service.createInstance(Service1Consumer);
  });
  test("@Param - fixed args", () => {
    const collection = new ServiceCollection();
    const service = new InstantiationService(collection);
    collection.set(IService1, new Service1());
    collection.set(IService2, new Service2());
    collection.set(IService3, new Service3());
    service.createInstance(TargetWithStaticParam, true);
  });
  test("service collection is live", () => {
    const collection = new ServiceCollection();
    collection.set(IService1, new Service1());
    const service = new InstantiationService(collection);
    service.createInstance(Service1Consumer);
    collection.set(IService2, new Service2());
    service.createInstance(Target2Dep);
    service.invokeFunction((a) => {
      assert.ok(a.get(IService1));
      assert.ok(a.get(IService2));
    });
  });
  test("SyncDesc - no dependencies", () => {
    const collection = new ServiceCollection();
    const service = new InstantiationService(collection);
    collection.set(IService1, new SyncDescriptor(Service1));
    service.invokeFunction((accessor) => {
      const service1 = accessor.get(IService1);
      assert.ok(service1);
      assert.strictEqual(service1.c, 1);
      const service2 = accessor.get(IService1);
      assert.ok(service1 === service2);
    });
  });
  test("SyncDesc - service with service dependency", () => {
    const collection = new ServiceCollection();
    const service = new InstantiationService(collection);
    collection.set(IService1, new SyncDescriptor(Service1));
    collection.set(
      IDependentService,
      new SyncDescriptor(DependentService)
    );
    service.invokeFunction((accessor) => {
      const d = accessor.get(IDependentService);
      assert.ok(d);
      assert.strictEqual(d.name, "farboo");
    });
  });
  test("SyncDesc - target depends on service future", () => {
    const collection = new ServiceCollection();
    const service = new InstantiationService(collection);
    collection.set(IService1, new SyncDescriptor(Service1));
    collection.set(
      IDependentService,
      new SyncDescriptor(DependentService)
    );
    const d = service.createInstance(DependentServiceTarget);
    assert.ok(d instanceof DependentServiceTarget);
    const d2 = service.createInstance(DependentServiceTarget2);
    assert.ok(d2 instanceof DependentServiceTarget2);
  });
  test("SyncDesc - explode on loop", () => {
    const collection = new ServiceCollection();
    const service = new InstantiationService(collection);
    collection.set(IService1, new SyncDescriptor(ServiceLoop1));
    collection.set(IService2, new SyncDescriptor(ServiceLoop2));
    assert.throws(() => {
      service.invokeFunction((accessor) => {
        accessor.get(IService1);
      });
    });
    assert.throws(() => {
      service.invokeFunction((accessor) => {
        accessor.get(IService2);
      });
    });
    try {
      service.invokeFunction((accessor) => {
        accessor.get(IService1);
      });
    } catch (err) {
      assert.ok(err.name);
      assert.ok(err.message);
    }
  });
  test("Invoke - get services", () => {
    const collection = new ServiceCollection();
    const service = new InstantiationService(collection);
    collection.set(IService1, new Service1());
    collection.set(IService2, new Service2());
    function test2(accessor) {
      assert.ok(accessor.get(IService1) instanceof Service1);
      assert.strictEqual(accessor.get(IService1).c, 1);
      return true;
    }
    assert.strictEqual(service.invokeFunction(test2), true);
  });
  test("Invoke - get service, optional", () => {
    const collection = new ServiceCollection([IService1, new Service1()]);
    const service = new InstantiationService(collection);
    function test2(accessor) {
      assert.ok(accessor.get(IService1) instanceof Service1);
      assert.throws(() => accessor.get(IService2));
      return true;
    }
    assert.strictEqual(service.invokeFunction(test2), true);
  });
  test("Invoke - keeping accessor NOT allowed", () => {
    const collection = new ServiceCollection();
    const service = new InstantiationService(collection);
    collection.set(IService1, new Service1());
    collection.set(IService2, new Service2());
    let cached;
    function test2(accessor) {
      assert.ok(accessor.get(IService1) instanceof Service1);
      assert.strictEqual(accessor.get(IService1).c, 1);
      cached = accessor;
      return true;
    }
    assert.strictEqual(service.invokeFunction(test2), true);
    assert.throws(() => cached.get(IService2));
  });
  test("Invoke - throw error", () => {
    const collection = new ServiceCollection();
    const service = new InstantiationService(collection);
    collection.set(IService1, new Service1());
    collection.set(IService2, new Service2());
    function test2(accessor) {
      throw new Error();
    }
    assert.throws(() => service.invokeFunction(test2));
  });
  test("Create child", () => {
    let serviceInstanceCount = 0;
    const CtorCounter = class {
      c = 1;
      constructor() {
        serviceInstanceCount += 1;
      }
    };
    let service = new InstantiationService(
      new ServiceCollection([IService1, new SyncDescriptor(CtorCounter)])
    );
    service.createInstance(Service1Consumer);
    let child = service.createChild(
      new ServiceCollection([IService2, new Service2()])
    );
    child.createInstance(Service1Consumer);
    assert.strictEqual(serviceInstanceCount, 1);
    serviceInstanceCount = 0;
    service = new InstantiationService(
      new ServiceCollection([IService1, new SyncDescriptor(CtorCounter)])
    );
    child = service.createChild(
      new ServiceCollection([IService2, new Service2()])
    );
    service.createInstance(Service1Consumer);
    child.createInstance(Service1Consumer);
    assert.strictEqual(serviceInstanceCount, 1);
  });
  test("Remote window / integration tests is broken #105562", () => {
    const Service12 = createDecorator("service1");
    let Service1Impl = class {
      constructor(insta2) {
        const c = insta2.invokeFunction((accessor) => accessor.get(Service22));
        assert.ok(c);
      }
    };
    Service1Impl = __decorateClass([
      __decorateParam(0, IInstantiationService)
    ], Service1Impl);
    const Service22 = createDecorator("service2");
    class Service2Impl {
      constructor() {
      }
    }
    const Service21 = createDecorator("service21");
    let Service21Impl = class {
      constructor(service2, service1) {
        this.service2 = service2;
        this.service1 = service1;
      }
    };
    Service21Impl = __decorateClass([
      __decorateParam(0, Service22),
      __decorateParam(1, Service12)
    ], Service21Impl);
    const insta = new InstantiationService(
      new ServiceCollection(
        [Service12, new SyncDescriptor(Service1Impl)],
        [Service22, new SyncDescriptor(Service2Impl)],
        [Service21, new SyncDescriptor(Service21Impl)]
      )
    );
    const obj = insta.invokeFunction((accessor) => accessor.get(Service21));
    assert.ok(obj);
  });
  test("Sync/Async dependency loop", async () => {
    const A = createDecorator("A");
    const B = createDecorator("B");
    let BConsumer = class {
      constructor(b) {
        this.b = b;
      }
      doIt() {
        return this.b.b();
      }
    };
    BConsumer = __decorateClass([
      __decorateParam(0, B)
    ], BConsumer);
    let AService = class {
      _serviceBrand;
      prop;
      constructor(insta) {
        this.prop = insta.createInstance(BConsumer);
      }
      doIt() {
        return this.prop.doIt();
      }
    };
    AService = __decorateClass([
      __decorateParam(0, IInstantiationService)
    ], AService);
    let BService = class {
      _serviceBrand;
      constructor(a) {
        assert.ok(a);
      }
      b() {
        return true;
      }
    };
    BService = __decorateClass([
      __decorateParam(0, A)
    ], BService);
    {
      const insta1 = new InstantiationService(
        new ServiceCollection(
          [A, new SyncDescriptor(AService)],
          [B, new SyncDescriptor(BService)]
        ),
        true,
        void 0,
        true
      );
      try {
        insta1.invokeFunction((accessor) => accessor.get(A));
        assert.ok(false);
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes("RECURSIVELY"));
      }
    }
    {
      const insta2 = new InstantiationService(
        new ServiceCollection(
          [A, new SyncDescriptor(AService, void 0, true)],
          [B, new SyncDescriptor(BService, void 0)]
        ),
        true,
        void 0,
        true
      );
      const a = insta2.invokeFunction((accessor) => accessor.get(A));
      a.doIt();
      const cycle = insta2._globalGraph?.findCycleSlow();
      assert.strictEqual(cycle, "A -> B -> A");
    }
  });
  test("Delayed and events", function() {
    const A = createDecorator("A");
    let created = false;
    class AImpl {
      _serviceBrand;
      _doIt = 0;
      _onDidDoIt = new Emitter();
      onDidDoIt = this._onDidDoIt.event;
      constructor() {
        created = true;
      }
      doIt() {
        this._doIt += 1;
        this._onDidDoIt.fire(this);
      }
    }
    const insta = new InstantiationService(
      new ServiceCollection([
        A,
        new SyncDescriptor(AImpl, void 0, true)
      ]),
      true,
      void 0,
      true
    );
    let Consumer = class {
      constructor(a) {
        this.a = a;
      }
    };
    Consumer = __decorateClass([
      __decorateParam(0, A)
    ], Consumer);
    const c = insta.createInstance(Consumer);
    let eventCount = 0;
    const listener = (e) => {
      assert.ok(e instanceof AImpl);
      eventCount++;
    };
    const d1 = c.a.onDidDoIt(listener);
    const d2 = c.a.onDidDoIt(listener);
    assert.strictEqual(created, false);
    assert.strictEqual(eventCount, 0);
    d2.dispose();
    c.a.doIt();
    assert.strictEqual(created, true);
    assert.strictEqual(eventCount, 1);
    const d3 = c.a.onDidDoIt(listener);
    c.a.doIt();
    assert.strictEqual(eventCount, 3);
    dispose([d1, d3]);
  });
  test("Capture event before init, use after init", function() {
    const A = createDecorator("A");
    let created = false;
    class AImpl {
      _serviceBrand;
      _doIt = 0;
      _onDidDoIt = new Emitter();
      onDidDoIt = this._onDidDoIt.event;
      constructor() {
        created = true;
      }
      doIt() {
        this._doIt += 1;
        this._onDidDoIt.fire(this);
      }
      noop() {
      }
    }
    const insta = new InstantiationService(
      new ServiceCollection([
        A,
        new SyncDescriptor(AImpl, void 0, true)
      ]),
      true,
      void 0,
      true
    );
    let Consumer = class {
      constructor(a) {
        this.a = a;
      }
    };
    Consumer = __decorateClass([
      __decorateParam(0, A)
    ], Consumer);
    const c = insta.createInstance(Consumer);
    let eventCount = 0;
    const listener = (e) => {
      assert.ok(e instanceof AImpl);
      eventCount++;
    };
    const event = c.a.onDidDoIt;
    assert.strictEqual(created, false);
    c.a.noop();
    assert.strictEqual(created, true);
    const d1 = event(listener);
    c.a.doIt();
    assert.strictEqual(eventCount, 1);
    dispose(d1);
  });
  test("Dispose early event listener", function() {
    const A = createDecorator("A");
    let created = false;
    class AImpl {
      _serviceBrand;
      _doIt = 0;
      _onDidDoIt = new Emitter();
      onDidDoIt = this._onDidDoIt.event;
      constructor() {
        created = true;
      }
      doIt() {
        this._doIt += 1;
        this._onDidDoIt.fire(this);
      }
    }
    const insta = new InstantiationService(
      new ServiceCollection([
        A,
        new SyncDescriptor(AImpl, void 0, true)
      ]),
      true,
      void 0,
      true
    );
    let Consumer = class {
      constructor(a) {
        this.a = a;
      }
    };
    Consumer = __decorateClass([
      __decorateParam(0, A)
    ], Consumer);
    const c = insta.createInstance(Consumer);
    let eventCount = 0;
    const listener = (e) => {
      assert.ok(e instanceof AImpl);
      eventCount++;
    };
    const d1 = c.a.onDidDoIt(listener);
    assert.strictEqual(created, false);
    assert.strictEqual(eventCount, 0);
    c.a.doIt();
    assert.strictEqual(created, true);
    assert.strictEqual(eventCount, 1);
    dispose(d1);
    c.a.doIt();
    assert.strictEqual(eventCount, 1);
  });
  test("Dispose services it created", () => {
    let disposedA = false;
    let disposedB = false;
    const A = createDecorator("A");
    class AImpl {
      _serviceBrand;
      value = 1;
      dispose() {
        disposedA = true;
      }
    }
    const B = createDecorator("B");
    class BImpl {
      _serviceBrand;
      value = 1;
      dispose() {
        disposedB = true;
      }
    }
    const insta = new InstantiationService(
      new ServiceCollection(
        [A, new SyncDescriptor(AImpl, void 0, true)],
        [B, new BImpl()]
      ),
      true,
      void 0,
      true
    );
    let Consumer = class {
      constructor(a, b) {
        this.a = a;
        this.b = b;
        assert.strictEqual(a.value, b.value);
      }
    };
    Consumer = __decorateClass([
      __decorateParam(0, A),
      __decorateParam(1, B)
    ], Consumer);
    const c = insta.createInstance(Consumer);
    insta.dispose();
    assert.ok(c);
    assert.strictEqual(disposedA, true);
    assert.strictEqual(disposedB, false);
  });
  test("Disposed service cannot be used anymore", () => {
    const B = createDecorator("B");
    class BImpl {
      _serviceBrand;
      value = 1;
    }
    const insta = new InstantiationService(
      new ServiceCollection([B, new BImpl()]),
      true,
      void 0,
      true
    );
    let Consumer = class {
      constructor(b) {
        this.b = b;
        assert.strictEqual(b.value, 1);
      }
    };
    Consumer = __decorateClass([
      __decorateParam(0, B)
    ], Consumer);
    const c = insta.createInstance(Consumer);
    assert.ok(c);
    insta.dispose();
    assert.throws(() => insta.createInstance(Consumer));
    assert.throws(() => insta.invokeFunction((accessor) => {
    }));
    assert.throws(() => insta.createChild(new ServiceCollection()));
  });
  test("Child does not dispose parent", () => {
    const B = createDecorator("B");
    class BImpl {
      _serviceBrand;
      value = 1;
    }
    const insta1 = new InstantiationService(
      new ServiceCollection([B, new BImpl()]),
      true,
      void 0,
      true
    );
    const insta2 = insta1.createChild(new ServiceCollection());
    let Consumer = class {
      constructor(b) {
        this.b = b;
        assert.strictEqual(b.value, 1);
      }
    };
    Consumer = __decorateClass([
      __decorateParam(0, B)
    ], Consumer);
    assert.ok(insta1.createInstance(Consumer));
    assert.ok(insta2.createInstance(Consumer));
    insta2.dispose();
    assert.ok(insta1.createInstance(Consumer));
    assert.throws(() => insta2.createInstance(Consumer));
  });
  test("Parent does dispose children", () => {
    const B = createDecorator("B");
    class BImpl {
      _serviceBrand;
      value = 1;
    }
    const insta1 = new InstantiationService(
      new ServiceCollection([B, new BImpl()]),
      true,
      void 0,
      true
    );
    const insta2 = insta1.createChild(new ServiceCollection());
    let Consumer = class {
      constructor(b) {
        this.b = b;
        assert.strictEqual(b.value, 1);
      }
    };
    Consumer = __decorateClass([
      __decorateParam(0, B)
    ], Consumer);
    assert.ok(insta1.createInstance(Consumer));
    assert.ok(insta2.createInstance(Consumer));
    insta1.dispose();
    assert.throws(() => insta2.createInstance(Consumer));
    assert.throws(() => insta1.createInstance(Consumer));
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
