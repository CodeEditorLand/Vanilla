class SyncDescriptor {
  ctor;
  staticArguments;
  supportsDelayedInstantiation;
  constructor(ctor, staticArguments = [], supportsDelayedInstantiation = false) {
    this.ctor = ctor;
    this.staticArguments = staticArguments;
    this.supportsDelayedInstantiation = supportsDelayedInstantiation;
  }
}
export {
  SyncDescriptor
};
