import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IActivityService = createDecorator("activityService");
class BaseBadge {
  constructor(descriptorFn) {
    this.descriptorFn = descriptorFn;
    this.descriptorFn = descriptorFn;
  }
  getDescription() {
    return this.descriptorFn(null);
  }
}
class NumberBadge extends BaseBadge {
  constructor(number, descriptorFn) {
    super(descriptorFn);
    this.number = number;
    this.number = number;
  }
  getDescription() {
    return this.descriptorFn(this.number);
  }
}
class IconBadge extends BaseBadge {
  constructor(icon, descriptorFn) {
    super(descriptorFn);
    this.icon = icon;
  }
}
class ProgressBadge extends BaseBadge {
}
export {
  IActivityService,
  IconBadge,
  NumberBadge,
  ProgressBadge
};
