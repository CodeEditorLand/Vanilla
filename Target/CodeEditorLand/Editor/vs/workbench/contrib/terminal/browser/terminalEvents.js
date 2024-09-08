import {
  DynamicListEventMultiplexer,
  Event,
  EventMultiplexer
} from "../../../../base/common/event.js";
import {
  DisposableMap,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
function createInstanceCapabilityEventMultiplexer(currentInstances, onAddInstance, onRemoveInstance, capabilityId, getEvent) {
  const store = new DisposableStore();
  const multiplexer = store.add(
    new EventMultiplexer()
  );
  const capabilityListeners = store.add(
    new DisposableMap()
  );
  function addCapability(instance, capability) {
    const listener = multiplexer.add(
      Event.map(getEvent(capability), (data) => ({ instance, data }))
    );
    capabilityListeners.set(capability, listener);
  }
  for (const instance of currentInstances) {
    const capability = instance.capabilities.get(capabilityId);
    if (capability) {
      addCapability(instance, capability);
    }
  }
  const addCapabilityMultiplexer = store.add(
    new DynamicListEventMultiplexer(
      currentInstances,
      onAddInstance,
      onRemoveInstance,
      (instance) => Event.map(
        instance.capabilities.onDidAddCapability,
        (changeEvent) => ({ instance, changeEvent })
      )
    )
  );
  store.add(
    addCapabilityMultiplexer.event((e) => {
      if (e.changeEvent.id === capabilityId) {
        addCapability(e.instance, e.changeEvent.capability);
      }
    })
  );
  const removeCapabilityMultiplexer = store.add(
    new DynamicListEventMultiplexer(
      currentInstances,
      onAddInstance,
      onRemoveInstance,
      (instance) => instance.capabilities.onDidRemoveCapability
    )
  );
  store.add(
    removeCapabilityMultiplexer.event((e) => {
      if (e.id === capabilityId) {
        capabilityListeners.deleteAndDispose(e.capability);
      }
    })
  );
  return {
    dispose: () => store.dispose(),
    event: multiplexer.event
  };
}
export {
  createInstanceCapabilityEventMultiplexer
};
