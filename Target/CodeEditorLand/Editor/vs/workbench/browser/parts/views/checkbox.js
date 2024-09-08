import * as DOM from "../../../../base/browser/dom.js";
import { Toggle } from "../../../../base/browser/ui/toggle/toggle.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { defaultToggleStyles } from "../../../../platform/theme/browser/defaultStyles.js";
class CheckboxStateHandler extends Disposable {
  _onDidChangeCheckboxState = this._register(
    new Emitter()
  );
  onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
  setCheckboxState(node) {
    this._onDidChangeCheckboxState.fire([node]);
  }
}
class TreeItemCheckbox extends Disposable {
  constructor(container, checkboxStateHandler, hoverDelegate, hoverService) {
    super();
    this.checkboxStateHandler = checkboxStateHandler;
    this.hoverDelegate = hoverDelegate;
    this.hoverService = hoverService;
    this.checkboxContainer = container;
  }
  toggle;
  checkboxContainer;
  isDisposed = false;
  hover;
  static checkboxClass = "custom-view-tree-node-item-checkbox";
  _onDidChangeState = new Emitter();
  onDidChangeState = this._onDidChangeState.event;
  render(node) {
    if (node.checkbox) {
      if (this.toggle) {
        this.toggle.checked = node.checkbox.isChecked;
        this.toggle.setIcon(
          this.toggle.checked ? Codicon.check : void 0
        );
      } else {
        this.createCheckbox(node);
      }
    }
  }
  createCheckbox(node) {
    if (node.checkbox) {
      this.toggle = new Toggle({
        isChecked: node.checkbox.isChecked,
        title: "",
        icon: node.checkbox.isChecked ? Codicon.check : void 0,
        ...defaultToggleStyles
      });
      this.setHover(node.checkbox);
      this.setAccessibilityInformation(node.checkbox);
      this.toggle.domNode.classList.add(TreeItemCheckbox.checkboxClass);
      this.toggle.domNode.tabIndex = 1;
      DOM.append(this.checkboxContainer, this.toggle.domNode);
      this.registerListener(node);
    }
  }
  registerListener(node) {
    if (this.toggle) {
      this._register({ dispose: () => this.removeCheckbox() });
      this._register(this.toggle);
      this._register(
        this.toggle.onChange(() => {
          this.setCheckbox(node);
        })
      );
    }
  }
  setHover(checkbox) {
    if (this.toggle) {
      if (this.hover) {
        this.hover.update(checkbox.tooltip);
      } else {
        this.hover = this._register(
          this.hoverService.setupManagedHover(
            this.hoverDelegate,
            this.toggle.domNode,
            this.checkboxHoverContent(checkbox)
          )
        );
      }
    }
  }
  setCheckbox(node) {
    if (this.toggle && node.checkbox) {
      node.checkbox.isChecked = this.toggle.checked;
      this.toggle.setIcon(
        this.toggle.checked ? Codicon.check : void 0
      );
      this.setHover(node.checkbox);
      this.setAccessibilityInformation(node.checkbox);
      this.checkboxStateHandler.setCheckboxState(node);
    }
  }
  checkboxHoverContent(checkbox) {
    return checkbox.tooltip ? checkbox.tooltip : checkbox.isChecked ? localize("checked", "Checked") : localize("unchecked", "Unchecked");
  }
  setAccessibilityInformation(checkbox) {
    if (this.toggle && checkbox.accessibilityInformation) {
      this.toggle.domNode.ariaLabel = checkbox.accessibilityInformation.label;
      if (checkbox.accessibilityInformation.role) {
        this.toggle.domNode.role = checkbox.accessibilityInformation.role;
      }
    }
  }
  removeCheckbox() {
    const children = this.checkboxContainer.children;
    for (const child of children) {
      child.remove();
    }
  }
}
export {
  CheckboxStateHandler,
  TreeItemCheckbox
};
