class UserActivityRegistry {
  todo = [];
  add = (ctor) => {
    this.todo.push(ctor);
  };
  take(userActivityService, instantiation) {
    this.add = (ctor) => instantiation.createInstance(ctor, userActivityService);
    this.todo.forEach(this.add);
    this.todo = [];
  }
}
const userActivityRegistry = new UserActivityRegistry();
export {
  userActivityRegistry
};
