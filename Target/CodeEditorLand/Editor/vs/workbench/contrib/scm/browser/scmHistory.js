import { svgElem } from "../../../../base/browser/dom.js";
import { rot } from "../../../../base/common/numbers.js";
import { deepClone } from "../../../../base/common/objects.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import {
  buttonForeground,
  foreground
} from "../../../../platform/theme/common/colorRegistry.js";
import {
  asCssVariable,
  registerColor,
  transparent
} from "../../../../platform/theme/common/colorUtils.js";
import {
  chartsBlue,
  chartsGreen,
  chartsOrange,
  chartsPurple,
  chartsRed,
  chartsYellow
} from "../../../../platform/theme/common/colors/chartsColors.js";
const SWIMLANE_HEIGHT = 22;
const SWIMLANE_WIDTH = 11;
const CIRCLE_RADIUS = 4;
const SWIMLANE_CURVE_RADIUS = 5;
const historyItemGroupLocal = registerColor(
  "scmGraph.historyItemGroupLocal",
  chartsBlue,
  localize(
    "scmGraphHistoryItemGroupLocal",
    "Local history item group color."
  )
);
const historyItemGroupRemote = registerColor(
  "scmGraph.historyItemGroupRemote",
  chartsPurple,
  localize(
    "scmGraphHistoryItemGroupRemote",
    "Remote history item group color."
  )
);
const historyItemGroupBase = registerColor(
  "scmGraph.historyItemGroupBase",
  chartsOrange,
  localize("scmGraphHistoryItemGroupBase", "Base history item group color.")
);
const historyItemHoverDefaultLabelForeground = registerColor(
  "scmGraph.historyItemHoverDefaultLabelForeground",
  foreground,
  localize(
    "scmGraphHistoryItemHoverDefaultLabelForeground",
    "History item hover default label foreground color."
  )
);
const historyItemHoverDefaultLabelBackground = registerColor(
  "scmGraph.historyItemHoverDefaultLabelBackground",
  transparent(foreground, 0.2),
  localize(
    "scmGraphHistoryItemHoverDefaultLabelBackground",
    "History item hover default label background color."
  )
);
const historyItemHoverLabelForeground = registerColor(
  "scmGraph.historyItemHoverLabelForeground",
  buttonForeground,
  localize(
    "scmGraphHistoryItemHoverLabelForeground",
    "History item hover label foreground color."
  )
);
const historyItemHoverAdditionsForeground = registerColor(
  "scmGraph.historyItemHoverAdditionsForeground",
  "gitDecoration.addedResourceForeground",
  localize(
    "scmGraph.HistoryItemHoverAdditionsForeground",
    "History item hover additions foreground color."
  )
);
const historyItemHoverDeletionsForeground = registerColor(
  "scmGraph.historyItemHoverDeletionsForeground",
  "gitDecoration.deletedResourceForeground",
  localize(
    "scmGraph.HistoryItemHoverDeletionsForeground",
    "History item hover deletions foreground color."
  )
);
const colorRegistry = [
  registerColor(
    "scmGraph.foreground1",
    chartsGreen,
    localize(
      "scmGraphForeground1",
      "Source control graph foreground color (1)."
    )
  ),
  registerColor(
    "scmGraph.foreground2",
    chartsRed,
    localize(
      "scmGraphForeground2",
      "Source control graph foreground color (2)."
    )
  ),
  registerColor(
    "scmGraph.foreground3",
    chartsYellow,
    localize(
      "scmGraphForeground3",
      "Source control graph foreground color (3)."
    )
  )
];
function getLabelColorIdentifier(historyItem, colorMap) {
  for (const label of historyItem.labels ?? []) {
    const colorIndex = colorMap.get(label.title);
    if (colorIndex !== void 0) {
      return colorIndex;
    }
  }
  return void 0;
}
function createPath(colorIdentifier) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", "1px");
  path.setAttribute("stroke-linecap", "round");
  path.style.stroke = asCssVariable(colorIdentifier);
  return path;
}
function drawCircle(index, radius, colorIdentifier) {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", `${SWIMLANE_WIDTH * (index + 1)}`);
  circle.setAttribute("cy", `${SWIMLANE_WIDTH}`);
  circle.setAttribute("r", `${radius}`);
  circle.style.fill = asCssVariable(colorIdentifier);
  return circle;
}
function drawVerticalLine(x1, y1, y2, color) {
  const path = createPath(color);
  path.setAttribute("d", `M ${x1} ${y1} V ${y2}`);
  return path;
}
function findLastIndex(nodes, id) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].id === id) {
      return i;
    }
  }
  return -1;
}
function renderSCMHistoryItemGraph(historyItemViewModel) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("graph");
  const historyItem = historyItemViewModel.historyItem;
  const inputSwimlanes = historyItemViewModel.inputSwimlanes;
  const outputSwimlanes = historyItemViewModel.outputSwimlanes;
  const inputIndex = inputSwimlanes.findIndex(
    (node) => node.id === historyItem.id
  );
  const circleIndex = inputIndex !== -1 ? inputIndex : inputSwimlanes.length;
  const circleColor = circleIndex < outputSwimlanes.length ? outputSwimlanes[circleIndex].color : circleIndex < inputSwimlanes.length ? inputSwimlanes[circleIndex].color : historyItemGroupLocal;
  let outputSwimlaneIndex = 0;
  for (let index = 0; index < inputSwimlanes.length; index++) {
    const color = inputSwimlanes[index].color;
    if (inputSwimlanes[index].id === historyItem.id) {
      if (index !== circleIndex) {
        const d = [];
        const path = createPath(color);
        d.push(`M ${SWIMLANE_WIDTH * (index + 1)} 0`);
        d.push(
          `A ${SWIMLANE_WIDTH} ${SWIMLANE_WIDTH} 0 0 1 ${SWIMLANE_WIDTH * index} ${SWIMLANE_WIDTH}`
        );
        d.push(`H ${SWIMLANE_WIDTH * (circleIndex + 1)}`);
        path.setAttribute("d", d.join(" "));
        svg.append(path);
      } else {
        outputSwimlaneIndex++;
      }
    } else {
      if (outputSwimlaneIndex < outputSwimlanes.length && inputSwimlanes[index].id === outputSwimlanes[outputSwimlaneIndex].id) {
        if (index === outputSwimlaneIndex) {
          const path = drawVerticalLine(
            SWIMLANE_WIDTH * (index + 1),
            0,
            SWIMLANE_HEIGHT,
            color
          );
          svg.append(path);
        } else {
          const d = [];
          const path = createPath(color);
          d.push(`M ${SWIMLANE_WIDTH * (index + 1)} 0`);
          d.push(`V 6`);
          d.push(
            `A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 1 ${SWIMLANE_WIDTH * (index + 1) - SWIMLANE_CURVE_RADIUS} ${SWIMLANE_HEIGHT / 2}`
          );
          d.push(
            `H ${SWIMLANE_WIDTH * (outputSwimlaneIndex + 1) + SWIMLANE_CURVE_RADIUS}`
          );
          d.push(
            `A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 0 ${SWIMLANE_WIDTH * (outputSwimlaneIndex + 1)} ${SWIMLANE_HEIGHT / 2 + SWIMLANE_CURVE_RADIUS}`
          );
          d.push(`V ${SWIMLANE_HEIGHT}`);
          path.setAttribute("d", d.join(" "));
          svg.append(path);
        }
        outputSwimlaneIndex++;
      }
    }
  }
  for (let i = 1; i < historyItem.parentIds.length; i++) {
    const parentOutputIndex = findLastIndex(
      outputSwimlanes,
      historyItem.parentIds[i]
    );
    if (parentOutputIndex === -1) {
      continue;
    }
    const d = [];
    const path = createPath(outputSwimlanes[parentOutputIndex].color);
    d.push(
      `M ${SWIMLANE_WIDTH * parentOutputIndex} ${SWIMLANE_HEIGHT / 2}`
    );
    d.push(
      `A ${SWIMLANE_WIDTH} ${SWIMLANE_WIDTH} 0 0 1 ${SWIMLANE_WIDTH * (parentOutputIndex + 1)} ${SWIMLANE_HEIGHT}`
    );
    d.push(
      `M ${SWIMLANE_WIDTH * parentOutputIndex} ${SWIMLANE_HEIGHT / 2}`
    );
    d.push(`H ${SWIMLANE_WIDTH * (circleIndex + 1)} `);
    path.setAttribute("d", d.join(" "));
    svg.append(path);
  }
  if (inputIndex !== -1) {
    const path = drawVerticalLine(
      SWIMLANE_WIDTH * (circleIndex + 1),
      0,
      SWIMLANE_HEIGHT / 2,
      inputSwimlanes[inputIndex].color
    );
    svg.append(path);
  }
  if (historyItem.parentIds.length > 0) {
    const path = drawVerticalLine(
      SWIMLANE_WIDTH * (circleIndex + 1),
      SWIMLANE_HEIGHT / 2,
      SWIMLANE_HEIGHT,
      circleColor
    );
    svg.append(path);
  }
  if (historyItem.parentIds.length > 1) {
    const circleOuter = drawCircle(
      circleIndex,
      CIRCLE_RADIUS + 1,
      circleColor
    );
    svg.append(circleOuter);
    const circleInner = drawCircle(
      circleIndex,
      CIRCLE_RADIUS - 1,
      circleColor
    );
    svg.append(circleInner);
  } else {
    if (historyItem.labels?.some(
      (l) => ThemeIcon.isThemeIcon(l.icon) && l.icon.id === "target"
    )) {
      const outerCircle = drawCircle(
        circleIndex,
        CIRCLE_RADIUS + 2,
        circleColor
      );
      svg.append(outerCircle);
    }
    const circle = drawCircle(circleIndex, CIRCLE_RADIUS, circleColor);
    svg.append(circle);
  }
  svg.style.height = `${SWIMLANE_HEIGHT}px`;
  svg.style.width = `${SWIMLANE_WIDTH * (Math.max(inputSwimlanes.length, outputSwimlanes.length, 1) + 1)}px`;
  return svg;
}
function renderSCMHistoryGraphPlaceholder(columns) {
  const elements = svgElem("svg", {
    style: {
      height: `${SWIMLANE_HEIGHT}px`,
      width: `${SWIMLANE_WIDTH * (columns.length + 1)}px`
    }
  });
  for (let index = 0; index < columns.length; index++) {
    const path = drawVerticalLine(
      SWIMLANE_WIDTH * (index + 1),
      0,
      SWIMLANE_HEIGHT,
      columns[index].color
    );
    elements.root.append(path);
  }
  return elements.root;
}
function toISCMHistoryItemViewModelArray(historyItems, colorMap = /* @__PURE__ */ new Map()) {
  let colorIndex = -1;
  const viewModels = [];
  for (let index = 0; index < historyItems.length; index++) {
    const historyItem = historyItems[index];
    const outputSwimlanesFromPreviousItem = viewModels.at(-1)?.outputSwimlanes ?? [];
    const inputSwimlanes = outputSwimlanesFromPreviousItem.map(
      (i) => deepClone(i)
    );
    const outputSwimlanes = [];
    let firstParentAdded = false;
    if (historyItem.parentIds.length > 0) {
      for (const node of inputSwimlanes) {
        if (node.id === historyItem.id) {
          if (!firstParentAdded) {
            outputSwimlanes.push({
              id: historyItem.parentIds[0],
              color: getLabelColorIdentifier(
                historyItem,
                colorMap
              ) ?? node.color
            });
            firstParentAdded = true;
          }
          continue;
        }
        outputSwimlanes.push(deepClone(node));
      }
    }
    for (let i = firstParentAdded ? 1 : 0; i < historyItem.parentIds.length; i++) {
      let colorIdentifier;
      if (firstParentAdded) {
        const historyItemParent = historyItems.find(
          (h) => h.id === historyItem.parentIds[i]
        );
        colorIdentifier = historyItemParent ? getLabelColorIdentifier(historyItemParent, colorMap) : void 0;
      } else {
        colorIdentifier = getLabelColorIdentifier(
          historyItem,
          colorMap
        );
      }
      if (!colorIdentifier) {
        colorIndex = rot(colorIndex + 1, colorRegistry.length);
        colorIdentifier = colorRegistry[colorIndex];
      }
      outputSwimlanes.push({
        id: historyItem.parentIds[i],
        color: colorIdentifier
      });
    }
    const labels = (historyItem.labels ?? []).map((label) => {
      let color = colorMap.get(label.title);
      if (!color && colorMap.has("*")) {
        const inputIndex = inputSwimlanes.findIndex(
          (node) => node.id === historyItem.id
        );
        const circleIndex = inputIndex !== -1 ? inputIndex : inputSwimlanes.length;
        color = circleIndex < outputSwimlanes.length ? outputSwimlanes[circleIndex].color : circleIndex < inputSwimlanes.length ? inputSwimlanes[circleIndex].color : historyItemGroupLocal;
      }
      return { ...label, color };
    });
    viewModels.push({
      historyItem: {
        ...historyItem,
        labels
      },
      inputSwimlanes,
      outputSwimlanes
    });
  }
  return viewModels;
}
export {
  SWIMLANE_HEIGHT,
  SWIMLANE_WIDTH,
  colorRegistry,
  historyItemGroupBase,
  historyItemGroupLocal,
  historyItemGroupRemote,
  historyItemHoverAdditionsForeground,
  historyItemHoverDefaultLabelBackground,
  historyItemHoverDefaultLabelForeground,
  historyItemHoverDeletionsForeground,
  historyItemHoverLabelForeground,
  renderSCMHistoryGraphPlaceholder,
  renderSCMHistoryItemGraph,
  toISCMHistoryItemViewModelArray
};
