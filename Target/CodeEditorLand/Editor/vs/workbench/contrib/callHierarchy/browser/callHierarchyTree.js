import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import {
  createMatches
} from "../../../../base/common/filters.js";
import { compare } from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Range } from "../../../../editor/common/core/range.js";
import {
  SymbolKinds,
  SymbolTag
} from "../../../../editor/common/languages.js";
import { localize } from "../../../../nls.js";
import {
  CallHierarchyDirection,
  CallHierarchyModel
} from "../common/callHierarchy.js";
class Call {
  constructor(item, locations, model, parent) {
    this.item = item;
    this.locations = locations;
    this.model = model;
    this.parent = parent;
  }
  static compare(a, b) {
    let res = compare(a.item.uri.toString(), b.item.uri.toString());
    if (res === 0) {
      res = Range.compareRangesUsingStarts(a.item.range, b.item.range);
    }
    return res;
  }
}
class DataSource {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  hasChildren() {
    return true;
  }
  async getChildren(element) {
    if (element instanceof CallHierarchyModel) {
      return element.roots.map(
        (root) => new Call(root, void 0, element, void 0)
      );
    }
    const { model, item } = element;
    if (this.getDirection() === CallHierarchyDirection.CallsFrom) {
      return (await model.resolveOutgoingCalls(item, CancellationToken.None)).map((call) => {
        return new Call(
          call.to,
          call.fromRanges.map((range) => ({ range, uri: item.uri })),
          model,
          element
        );
      });
    } else {
      return (await model.resolveIncomingCalls(item, CancellationToken.None)).map((call) => {
        return new Call(
          call.from,
          call.fromRanges.map((range) => ({
            range,
            uri: call.from.uri
          })),
          model,
          element
        );
      });
    }
  }
}
class Sorter {
  compare(element, otherElement) {
    return Call.compare(element, otherElement);
  }
}
class IdentityProvider {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  getId(element) {
    let res = this.getDirection() + JSON.stringify(element.item.uri) + JSON.stringify(element.item.range);
    if (element.parent) {
      res += this.getId(element.parent);
    }
    return res;
  }
}
class CallRenderingTemplate {
  constructor(icon, label) {
    this.icon = icon;
    this.label = label;
  }
}
class CallRenderer {
  static id = "CallRenderer";
  templateId = CallRenderer.id;
  renderTemplate(container) {
    container.classList.add("callhierarchy-element");
    const icon = document.createElement("div");
    container.appendChild(icon);
    const label = new IconLabel(container, { supportHighlights: true });
    return new CallRenderingTemplate(icon, label);
  }
  renderElement(node, _index, template) {
    const { element, filterData } = node;
    const deprecated = element.item.tags?.includes(SymbolTag.Deprecated);
    template.icon.className = "";
    template.icon.classList.add(
      "inline",
      ...ThemeIcon.asClassNameArray(
        SymbolKinds.toIcon(element.item.kind)
      )
    );
    template.label.setLabel(element.item.name, element.item.detail, {
      labelEscapeNewLines: true,
      matches: createMatches(filterData),
      strikethrough: deprecated
    });
  }
  disposeTemplate(template) {
    template.label.dispose();
  }
}
class VirtualDelegate {
  getHeight(_element) {
    return 22;
  }
  getTemplateId(_element) {
    return CallRenderer.id;
  }
}
class AccessibilityProvider {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  getWidgetAriaLabel() {
    return localize("tree.aria", "Call Hierarchy");
  }
  getAriaLabel(element) {
    if (this.getDirection() === CallHierarchyDirection.CallsFrom) {
      return localize("from", "calls from {0}", element.item.name);
    } else {
      return localize("to", "callers of {0}", element.item.name);
    }
  }
}
export {
  AccessibilityProvider,
  Call,
  CallRenderer,
  DataSource,
  IdentityProvider,
  Sorter,
  VirtualDelegate
};
