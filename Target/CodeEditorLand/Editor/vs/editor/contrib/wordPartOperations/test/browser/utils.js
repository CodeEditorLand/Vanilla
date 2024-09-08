class StaticServiceAccessor {
  services = /* @__PURE__ */ new Map();
  withService(id, service) {
    this.services.set(id, service);
    return this;
  }
  get(id) {
    const value = this.services.get(id);
    if (!value) {
      throw new Error("Service does not exist");
    }
    return value;
  }
}
export {
  StaticServiceAccessor
};
