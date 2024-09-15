var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedExternalError } from "../../../base/common/errors.js";
import {
  toDisposable
} from "../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { checkProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import {
  MainContext
} from "./extHost.protocol.js";
import * as typeConvert from "./extHostTypeConverters.js";
import * as extHostTypes from "./extHostTypes.js";
class ExtHostChatVariables {
  static {
    __name(this, "ExtHostChatVariables");
  }
  static _idPool = 0;
  _resolver = /* @__PURE__ */ new Map();
  _proxy;
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadChatVariables);
  }
  async $resolveVariable(handle, requestId, messageText, token) {
    const item = this._resolver.get(handle);
    if (!item) {
      return void 0;
    }
    try {
      if (item.resolver.resolve2) {
        checkProposedApiEnabled(
          item.extension,
          "chatParticipantAdditions"
        );
        const stream = new ChatVariableResolverResponseStream(
          requestId,
          this._proxy
        );
        const value = await item.resolver.resolve2(
          item.data.name,
          { prompt: messageText },
          stream.apiObject,
          token
        );
        if (value && value[0]) {
          return value[0].value;
        }
      } else {
        const value = await item.resolver.resolve(
          item.data.name,
          { prompt: messageText },
          token
        );
        if (value && value[0]) {
          return value[0].value;
        }
      }
    } catch (err) {
      onUnexpectedExternalError(err);
    }
    return void 0;
  }
  registerVariableResolver(extension, id, name, userDescription, modelDescription, isSlow, resolver, fullName, themeIconId) {
    const handle = ExtHostChatVariables._idPool++;
    const icon = themeIconId ? ThemeIcon.fromId(themeIconId) : void 0;
    this._resolver.set(handle, {
      extension,
      data: {
        id,
        name,
        description: userDescription,
        modelDescription,
        icon
      },
      resolver
    });
    this._proxy.$registerVariable(handle, {
      id,
      name,
      description: userDescription,
      modelDescription,
      isSlow,
      fullName,
      icon
    });
    return toDisposable(() => {
      this._resolver.delete(handle);
      this._proxy.$unregisterVariable(handle);
    });
  }
}
class ChatVariableResolverResponseStream {
  constructor(_requestId, _proxy) {
    this._requestId = _requestId;
    this._proxy = _proxy;
  }
  static {
    __name(this, "ChatVariableResolverResponseStream");
  }
  _isClosed = false;
  _apiObject;
  close() {
    this._isClosed = true;
  }
  get apiObject() {
    if (!this._apiObject) {
      let throwIfDone2 = function(source) {
        if (that._isClosed) {
          const err = new Error("Response stream has been closed");
          Error.captureStackTrace(err, source);
          throw err;
        }
      };
      var throwIfDone = throwIfDone2;
      __name(throwIfDone2, "throwIfDone");
      const that = this;
      const _report = /* @__PURE__ */ __name((progress) => {
        this._proxy.$handleProgressChunk(this._requestId, progress);
      }, "_report");
      this._apiObject = {
        progress(value) {
          throwIfDone2(this.progress);
          const part = new extHostTypes.ChatResponseProgressPart(
            value
          );
          const dto = typeConvert.ChatResponseProgressPart.from(part);
          _report(dto);
          return this;
        },
        reference(value) {
          throwIfDone2(this.reference);
          const part = new extHostTypes.ChatResponseReferencePart(
            value
          );
          const dto = typeConvert.ChatResponseReferencePart.from(part);
          _report(dto);
          return this;
        },
        push(part) {
          throwIfDone2(this.push);
          if (part instanceof extHostTypes.ChatResponseReferencePart) {
            _report(
              typeConvert.ChatResponseReferencePart.from(part)
            );
          } else if (part instanceof extHostTypes.ChatResponseProgressPart) {
            _report(
              typeConvert.ChatResponseProgressPart.from(part)
            );
          }
          return this;
        }
      };
    }
    return this._apiObject;
  }
}
export {
  ExtHostChatVariables
};
//# sourceMappingURL=extHostChatVariables.js.map
