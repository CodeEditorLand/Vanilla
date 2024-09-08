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
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { isUndefined } from "../../../../base/common/types.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  ACCOUNTS_ACTIVITY_ID,
  GLOBAL_ACTIVITY_ID
} from "../../../common/activity.js";
import {
  IViewDescriptorService
} from "../../../common/views.js";
import { IActivityService } from "../common/activity.js";
let ViewContainerActivityByView = class extends Disposable {
  constructor(viewId, viewDescriptorService, activityService) {
    super();
    this.viewId = viewId;
    this.viewDescriptorService = viewDescriptorService;
    this.activityService = activityService;
    this._register(Event.filter(this.viewDescriptorService.onDidChangeContainer, (e) => e.views.some((view) => view.id === viewId))(() => this.update()));
    this._register(Event.filter(this.viewDescriptorService.onDidChangeLocation, (e) => e.views.some((view) => view.id === viewId))(() => this.update()));
  }
  activity = void 0;
  activityDisposable = Disposable.None;
  setActivity(activity) {
    this.activity = activity;
    this.update();
  }
  clearActivity() {
    this.activity = void 0;
    this.update();
  }
  update() {
    this.activityDisposable.dispose();
    const container = this.viewDescriptorService.getViewContainerByViewId(
      this.viewId
    );
    if (container && this.activity) {
      this.activityDisposable = this.activityService.showViewContainerActivity(
        container.id,
        this.activity
      );
    }
  }
  dispose() {
    this.activityDisposable.dispose();
    super.dispose();
  }
};
ViewContainerActivityByView = __decorateClass([
  __decorateParam(1, IViewDescriptorService),
  __decorateParam(2, IActivityService)
], ViewContainerActivityByView);
let ActivityService = class extends Disposable {
  constructor(viewDescriptorService, instantiationService) {
    super();
    this.viewDescriptorService = viewDescriptorService;
    this.instantiationService = instantiationService;
  }
  _serviceBrand;
  viewActivities = /* @__PURE__ */ new Map();
  _onDidChangeActivity = this._register(
    new Emitter()
  );
  onDidChangeActivity = this._onDidChangeActivity.event;
  viewContainerActivities = /* @__PURE__ */ new Map();
  globalActivities = /* @__PURE__ */ new Map();
  showViewContainerActivity(viewContainerId, activity) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(viewContainerId);
    if (viewContainer) {
      let activities = this.viewContainerActivities.get(viewContainerId);
      if (!activities) {
        activities = [];
        this.viewContainerActivities.set(viewContainerId, activities);
      }
      for (let i = 0; i <= activities.length; i++) {
        if (i === activities.length || isUndefined(activity.priority)) {
          activities.push(activity);
          break;
        } else if (isUndefined(activities[i].priority) || activities[i].priority <= activity.priority) {
          activities.splice(i, 0, activity);
          break;
        }
      }
      this._onDidChangeActivity.fire(viewContainer);
      return toDisposable(() => {
        activities.splice(activities.indexOf(activity), 1);
        if (activities.length === 0) {
          this.viewContainerActivities.delete(viewContainerId);
        }
        this._onDidChangeActivity.fire(viewContainer);
      });
    }
    return Disposable.None;
  }
  getViewContainerActivities(viewContainerId) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(viewContainerId);
    if (viewContainer) {
      return this.viewContainerActivities.get(viewContainerId) ?? [];
    }
    return [];
  }
  showViewActivity(viewId, activity) {
    let maybeItem = this.viewActivities.get(viewId);
    if (maybeItem) {
      maybeItem.id++;
    } else {
      maybeItem = {
        id: 1,
        activity: this.instantiationService.createInstance(
          ViewContainerActivityByView,
          viewId
        )
      };
      this.viewActivities.set(viewId, maybeItem);
    }
    const id = maybeItem.id;
    maybeItem.activity.setActivity(activity);
    const item = maybeItem;
    return toDisposable(() => {
      if (item.id === id) {
        item.activity.dispose();
        this.viewActivities.delete(viewId);
      }
    });
  }
  showAccountsActivity(activity) {
    return this.showActivity(ACCOUNTS_ACTIVITY_ID, activity);
  }
  showGlobalActivity(activity) {
    return this.showActivity(GLOBAL_ACTIVITY_ID, activity);
  }
  getActivity(id) {
    return this.globalActivities.get(id) ?? [];
  }
  showActivity(id, activity) {
    let activities = this.globalActivities.get(id);
    if (!activities) {
      activities = [];
      this.globalActivities.set(id, activities);
    }
    activities.push(activity);
    this._onDidChangeActivity.fire(id);
    return toDisposable(() => {
      activities.splice(activities.indexOf(activity), 1);
      if (activities.length === 0) {
        this.globalActivities.delete(id);
      }
      this._onDidChangeActivity.fire(id);
    });
  }
};
ActivityService = __decorateClass([
  __decorateParam(0, IViewDescriptorService),
  __decorateParam(1, IInstantiationService)
], ActivityService);
registerSingleton(IActivityService, ActivityService, InstantiationType.Delayed);
export {
  ActivityService
};
