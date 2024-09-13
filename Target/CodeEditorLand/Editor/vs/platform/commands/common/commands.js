import { Emitter } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import {
  toDisposable
} from "../../../base/common/lifecycle.js";
import { LinkedList } from "../../../base/common/linkedList.js";
import {
  validateConstraints
} from "../../../base/common/types.js";
import {
  createDecorator
} from "../../instantiation/common/instantiation.js";
const ICommandService = createDecorator("commandService");
const CommandsRegistry = new class {
  _commands = /* @__PURE__ */ new Map();
  _onDidRegisterCommand = new Emitter();
  onDidRegisterCommand = this._onDidRegisterCommand.event;
  registerCommand(idOrCommand, handler) {
    if (!idOrCommand) {
      throw new Error(`invalid command`);
    }
    if (typeof idOrCommand === "string") {
      if (!handler) {
        throw new Error(`invalid command`);
      }
      return this.registerCommand({ id: idOrCommand, handler });
    }
    if (idOrCommand.metadata && Array.isArray(idOrCommand.metadata.args)) {
      const constraints = [];
      for (const arg of idOrCommand.metadata.args) {
        constraints.push(arg.constraint);
      }
      const actualHandler = idOrCommand.handler;
      idOrCommand.handler = (accessor, ...args) => {
        validateConstraints(args, constraints);
        return actualHandler(accessor, ...args);
      };
    }
    const { id } = idOrCommand;
    let commands = this._commands.get(id);
    if (!commands) {
      commands = new LinkedList();
      this._commands.set(id, commands);
    }
    const removeFn = commands.unshift(idOrCommand);
    const ret = toDisposable(() => {
      removeFn();
      const command = this._commands.get(id);
      if (command?.isEmpty()) {
        this._commands.delete(id);
      }
    });
    this._onDidRegisterCommand.fire(id);
    return ret;
  }
  registerCommandAlias(oldId, newId) {
    return CommandsRegistry.registerCommand(
      oldId,
      (accessor, ...args) => accessor.get(ICommandService).executeCommand(newId, ...args)
    );
  }
  getCommand(id) {
    const list = this._commands.get(id);
    if (!list || list.isEmpty()) {
      return void 0;
    }
    return Iterable.first(list);
  }
  getCommands() {
    const result = /* @__PURE__ */ new Map();
    for (const key of this._commands.keys()) {
      const command = this.getCommand(key);
      if (command) {
        result.set(key, command);
      }
    }
    return result;
  }
}();
CommandsRegistry.registerCommand("noop", () => {
});
export {
  CommandsRegistry,
  ICommandService
};
//# sourceMappingURL=commands.js.map
