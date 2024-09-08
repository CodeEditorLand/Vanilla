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
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IInstantiationService,
  createDecorator
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  UntitledTextEditorModel
} from "./untitledTextEditorModel.js";
const IUntitledTextEditorService = createDecorator("untitledTextEditorService");
let UntitledTextEditorService = class extends Disposable {
  constructor(instantiationService, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
  }
  static UNTITLED_WITHOUT_ASSOCIATED_RESOURCE_REGEX = /Untitled-\d+/;
  _onDidChangeDirty = this._register(
    new Emitter()
  );
  onDidChangeDirty = this._onDidChangeDirty.event;
  _onDidChangeEncoding = this._register(
    new Emitter()
  );
  onDidChangeEncoding = this._onDidChangeEncoding.event;
  _onDidCreate = this._register(
    new Emitter()
  );
  onDidCreate = this._onDidCreate.event;
  _onWillDispose = this._register(
    new Emitter()
  );
  onWillDispose = this._onWillDispose.event;
  _onDidChangeLabel = this._register(
    new Emitter()
  );
  onDidChangeLabel = this._onDidChangeLabel.event;
  mapResourceToModel = new ResourceMap();
  get(resource) {
    return this.mapResourceToModel.get(resource);
  }
  getValue(resource) {
    return this.get(resource)?.textEditorModel?.getValue();
  }
  async resolve(options) {
    const model = this.doCreateOrGet(options);
    await model.resolve();
    return model;
  }
  create(options) {
    return this.doCreateOrGet(options);
  }
  doCreateOrGet(options = /* @__PURE__ */ Object.create(null)) {
    const massagedOptions = this.massageOptions(options);
    if (massagedOptions.untitledResource && this.mapResourceToModel.has(massagedOptions.untitledResource)) {
      return this.mapResourceToModel.get(
        massagedOptions.untitledResource
      );
    }
    return this.doCreate(massagedOptions);
  }
  massageOptions(options) {
    const massagedOptions = /* @__PURE__ */ Object.create(null);
    if (options.associatedResource) {
      massagedOptions.untitledResource = URI.from({
        scheme: Schemas.untitled,
        authority: options.associatedResource.authority,
        fragment: options.associatedResource.fragment,
        path: options.associatedResource.path,
        query: options.associatedResource.query
      });
      massagedOptions.associatedResource = options.associatedResource;
    } else if (options.untitledResource?.scheme === Schemas.untitled) {
      massagedOptions.untitledResource = options.untitledResource;
    }
    if (options.languageId) {
      massagedOptions.languageId = options.languageId;
    } else if (!massagedOptions.associatedResource) {
      const configuration = this.configurationService.getValue();
      if (configuration.files?.defaultLanguage) {
        massagedOptions.languageId = configuration.files.defaultLanguage;
      }
    }
    massagedOptions.encoding = options.encoding;
    massagedOptions.initialValue = options.initialValue;
    return massagedOptions;
  }
  doCreate(options) {
    let untitledResource = options.untitledResource;
    if (!untitledResource) {
      let counter = 1;
      do {
        untitledResource = URI.from({
          scheme: Schemas.untitled,
          path: `Untitled-${counter}`
        });
        counter++;
      } while (this.mapResourceToModel.has(untitledResource));
    }
    const model = this._register(
      this.instantiationService.createInstance(
        UntitledTextEditorModel,
        untitledResource,
        !!options.associatedResource,
        options.initialValue,
        options.languageId,
        options.encoding
      )
    );
    this.registerModel(model);
    return model;
  }
  registerModel(model) {
    const modelListeners = new DisposableStore();
    modelListeners.add(
      model.onDidChangeDirty(() => this._onDidChangeDirty.fire(model))
    );
    modelListeners.add(
      model.onDidChangeName(() => this._onDidChangeLabel.fire(model))
    );
    modelListeners.add(
      model.onDidChangeEncoding(
        () => this._onDidChangeEncoding.fire(model)
      )
    );
    modelListeners.add(
      model.onWillDispose(() => this._onWillDispose.fire(model))
    );
    Event.once(model.onWillDispose)(() => {
      this.mapResourceToModel.delete(model.resource);
      modelListeners.dispose();
    });
    this.mapResourceToModel.set(model.resource, model);
    this._onDidCreate.fire(model);
    if (model.isDirty()) {
      this._onDidChangeDirty.fire(model);
    }
  }
  isUntitledWithAssociatedResource(resource) {
    return resource.scheme === Schemas.untitled && resource.path.length > 1 && !UntitledTextEditorService.UNTITLED_WITHOUT_ASSOCIATED_RESOURCE_REGEX.test(
      resource.path
    );
  }
  canDispose(model) {
    if (model.isDisposed()) {
      return true;
    }
    return this.doCanDispose(model);
  }
  async doCanDispose(model) {
    if (model.isDirty()) {
      await Event.toPromise(model.onDidChangeDirty);
      return this.canDispose(model);
    }
    return true;
  }
};
UntitledTextEditorService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService)
], UntitledTextEditorService);
registerSingleton(
  IUntitledTextEditorService,
  UntitledTextEditorService,
  InstantiationType.Delayed
);
export {
  IUntitledTextEditorService,
  UntitledTextEditorService
};
