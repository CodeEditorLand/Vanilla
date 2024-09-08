import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import {
  createMatches
} from "../../../../base/common/filters.js";
import { compare } from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Range } from "../../../../editor/common/core/range.js";
import { SymbolKinds, SymbolTag } from "../../../../editor/common/languages.js";
import { localize } from "../../../../nls.js";
import {
  TypeHierarchyDirection,
  TypeHierarchyModel
} from "../common/typeHierarchy.js";
class Type {
  constructor(item, model, parent) {
    this.item = item;
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
    if (element instanceof TypeHierarchyModel) {
      return element.roots.map(
        (root) => new Type(root, element, void 0)
      );
    }
    const { model, item } = element;
    if (this.getDirection() === TypeHierarchyDirection.Supertypes) {
      return (await model.provideSupertypes(item, CancellationToken.None)).map((item2) => {
        return new Type(item2, model, element);
      });
    } else {
      return (await model.provideSubtypes(item, CancellationToken.None)).map((item2) => {
        return new Type(item2, model, element);
      });
    }
  }
}
class Sorter {
  compare(element, otherElement) {
    return Type.compare(element, otherElement);
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
class TypeRenderingTemplate {
  constructor(icon, label) {
    this.icon = icon;
    this.label = label;
  }
}
class TypeRenderer {
  static id = "TypeRenderer";
  templateId = TypeRenderer.id;
  renderTemplate(container) {
    container.classList.add("typehierarchy-element");
    const icon = document.createElement("div");
    container.appendChild(icon);
    const label = new IconLabel(container, { supportHighlights: true });
    return new TypeRenderingTemplate(icon, label);
  }
  renderElement(node, _index, template) {
    const { element, filterData } = node;
    const deprecated = element.item.tags?.includes(SymbolTag.Deprecated);
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
    return TypeRenderer.id;
  }
}
class AccessibilityProvider {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  getWidgetAriaLabel() {
    return localize("tree.aria", "Type Hierarchy");
  }
  getAriaLabel(element) {
    if (this.getDirection() === TypeHierarchyDirection.Supertypes) {
      return localize(
        "supertypes",
        "supertypes of {0}",
        element.item.name
      );
    } else {
      return localize("subtypes", "subtypes of {0}", element.item.name);
    }
  }
}
export {
  AccessibilityProvider,
  DataSource,
  IdentityProvider,
  Sorter,
  Type,
  TypeRenderer,
  VirtualDelegate
};
