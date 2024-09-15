var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { deepClone } from "../../../../base/common/objects.js";
import { buttonForeground, chartsBlue, chartsPurple, foreground } from "../../../../platform/theme/common/colorRegistry.js";
import { asCssVariable, ColorIdentifier, registerColor, transparent } from "../../../../platform/theme/common/colorUtils.js";
import { ISCMHistoryItem, ISCMHistoryItemGraphNode, ISCMHistoryItemRef, ISCMHistoryItemViewModel } from "../common/history.js";
import { rot } from "../../../../base/common/numbers.js";
import { svgElem } from "../../../../base/browser/dom.js";
const SWIMLANE_HEIGHT = 22;
const SWIMLANE_WIDTH = 11;
const SWIMLANE_CURVE_RADIUS = 5;
const CIRCLE_RADIUS = 4;
const CIRCLE_STROKE_WIDTH = 2;
const historyItemRefColor = registerColor("scmGraph.historyItemRefColor", chartsBlue, localize("scmGraphHistoryItemRefColor", "History item reference color."));
const historyItemRemoteRefColor = registerColor("scmGraph.historyItemRemoteRefColor", chartsPurple, localize("scmGraphHistoryItemRemoteRefColor", "History item remote reference color."));
const historyItemBaseRefColor = registerColor("scmGraph.historyItemBaseRefColor", "#EA5C00", localize("scmGraphHistoryItemBaseRefColor", "History item base reference color."));
const historyItemHoverDefaultLabelForeground = registerColor("scmGraph.historyItemHoverDefaultLabelForeground", foreground, localize("scmGraphHistoryItemHoverDefaultLabelForeground", "History item hover default label foreground color."));
const historyItemHoverDefaultLabelBackground = registerColor("scmGraph.historyItemHoverDefaultLabelBackground", transparent(foreground, 0.2), localize("scmGraphHistoryItemHoverDefaultLabelBackground", "History item hover default label background color."));
const historyItemHoverLabelForeground = registerColor("scmGraph.historyItemHoverLabelForeground", buttonForeground, localize("scmGraphHistoryItemHoverLabelForeground", "History item hover label foreground color."));
const historyItemHoverAdditionsForeground = registerColor("scmGraph.historyItemHoverAdditionsForeground", "gitDecoration.addedResourceForeground", localize("scmGraph.HistoryItemHoverAdditionsForeground", "History item hover additions foreground color."));
const historyItemHoverDeletionsForeground = registerColor("scmGraph.historyItemHoverDeletionsForeground", "gitDecoration.deletedResourceForeground", localize("scmGraph.HistoryItemHoverDeletionsForeground", "History item hover deletions foreground color."));
const colorRegistry = [
  registerColor("scmGraph.foreground1", "#FFB000", localize("scmGraphForeground1", "Source control graph foreground color (1).")),
  registerColor("scmGraph.foreground2", "#DC267F", localize("scmGraphForeground2", "Source control graph foreground color (2).")),
  registerColor("scmGraph.foreground3", "#994F00", localize("scmGraphForeground3", "Source control graph foreground color (3).")),
  registerColor("scmGraph.foreground4", "#40B0A6", localize("scmGraphForeground4", "Source control graph foreground color (4).")),
  registerColor("scmGraph.foreground5", "#B66DFF", localize("scmGraphForeground5", "Source control graph foreground color (5)."))
];
function getLabelColorIdentifier(historyItem, colorMap) {
  for (const ref of historyItem.references ?? []) {
    const colorIdentifier = colorMap.get(ref.id);
    if (colorIdentifier !== void 0) {
      return colorIdentifier;
    }
  }
  return void 0;
}
__name(getLabelColorIdentifier, "getLabelColorIdentifier");
function createPath(colorIdentifier) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", "1px");
  path.setAttribute("stroke-linecap", "round");
  path.style.stroke = asCssVariable(colorIdentifier);
  return path;
}
__name(createPath, "createPath");
function drawCircle(index, radius, strokeWidth, colorIdentifier) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", `${SWIMLANE_WIDTH * (index + 1)}`);
  circle.setAttribute("cy", `${SWIMLANE_WIDTH}`);
  circle.setAttribute("r", `${radius}`);
  circle.style.strokeWidth = `${strokeWidth}px`;
  if (colorIdentifier) {
    circle.style.fill = asCssVariable(colorIdentifier);
  }
  return circle;
}
__name(drawCircle, "drawCircle");
function drawVerticalLine(x1, y1, y2, color) {
  const path = createPath(color);
  path.setAttribute("d", `M ${x1} ${y1} V ${y2}`);
  return path;
}
__name(drawVerticalLine, "drawVerticalLine");
function findLastIndex(nodes, id) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].id === id) {
      return i;
    }
  }
  return -1;
}
__name(findLastIndex, "findLastIndex");
function renderSCMHistoryItemGraph(historyItemViewModel) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("graph");
  const historyItem = historyItemViewModel.historyItem;
  const inputSwimlanes = historyItemViewModel.inputSwimlanes;
  const outputSwimlanes = historyItemViewModel.outputSwimlanes;
  const inputIndex = inputSwimlanes.findIndex((node) => node.id === historyItem.id);
  const circleIndex = inputIndex !== -1 ? inputIndex : inputSwimlanes.length;
  const circleColor = circleIndex < outputSwimlanes.length ? outputSwimlanes[circleIndex].color : circleIndex < inputSwimlanes.length ? inputSwimlanes[circleIndex].color : historyItemRefColor;
  let outputSwimlaneIndex = 0;
  for (let index = 0; index < inputSwimlanes.length; index++) {
    const color = inputSwimlanes[index].color;
    if (inputSwimlanes[index].id === historyItem.id) {
      if (index !== circleIndex) {
        const d = [];
        const path = createPath(color);
        d.push(`M ${SWIMLANE_WIDTH * (index + 1)} 0`);
        d.push(`A ${SWIMLANE_WIDTH} ${SWIMLANE_WIDTH} 0 0 1 ${SWIMLANE_WIDTH * index} ${SWIMLANE_WIDTH}`);
        d.push(`H ${SWIMLANE_WIDTH * (circleIndex + 1)}`);
        path.setAttribute("d", d.join(" "));
        svg.append(path);
      } else {
        outputSwimlaneIndex++;
      }
    } else {
      if (outputSwimlaneIndex < outputSwimlanes.length && inputSwimlanes[index].id === outputSwimlanes[outputSwimlaneIndex].id) {
        if (index === outputSwimlaneIndex) {
          const path = drawVerticalLine(SWIMLANE_WIDTH * (index + 1), 0, SWIMLANE_HEIGHT, color);
          svg.append(path);
        } else {
          const d = [];
          const path = createPath(color);
          d.push(`M ${SWIMLANE_WIDTH * (index + 1)} 0`);
          d.push(`V 6`);
          d.push(`A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 1 ${SWIMLANE_WIDTH * (index + 1) - SWIMLANE_CURVE_RADIUS} ${SWIMLANE_HEIGHT / 2}`);
          d.push(`H ${SWIMLANE_WIDTH * (outputSwimlaneIndex + 1) + SWIMLANE_CURVE_RADIUS}`);
          d.push(`A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 0 ${SWIMLANE_WIDTH * (outputSwimlaneIndex + 1)} ${SWIMLANE_HEIGHT / 2 + SWIMLANE_CURVE_RADIUS}`);
          d.push(`V ${SWIMLANE_HEIGHT}`);
          path.setAttribute("d", d.join(" "));
          svg.append(path);
        }
        outputSwimlaneIndex++;
      }
    }
  }
  for (let i = 1; i < historyItem.parentIds.length; i++) {
    const parentOutputIndex = findLastIndex(outputSwimlanes, historyItem.parentIds[i]);
    if (parentOutputIndex === -1) {
      continue;
    }
    const d = [];
    const path = createPath(outputSwimlanes[parentOutputIndex].color);
    d.push(`M ${SWIMLANE_WIDTH * parentOutputIndex} ${SWIMLANE_HEIGHT / 2}`);
    d.push(`A ${SWIMLANE_WIDTH} ${SWIMLANE_WIDTH} 0 0 1 ${SWIMLANE_WIDTH * (parentOutputIndex + 1)} ${SWIMLANE_HEIGHT}`);
    d.push(`M ${SWIMLANE_WIDTH * parentOutputIndex} ${SWIMLANE_HEIGHT / 2}`);
    d.push(`H ${SWIMLANE_WIDTH * (circleIndex + 1)} `);
    path.setAttribute("d", d.join(" "));
    svg.append(path);
  }
  if (inputIndex !== -1) {
    const path = drawVerticalLine(SWIMLANE_WIDTH * (circleIndex + 1), 0, SWIMLANE_HEIGHT / 2, inputSwimlanes[inputIndex].color);
    svg.append(path);
  }
  if (historyItem.parentIds.length > 0) {
    const path = drawVerticalLine(SWIMLANE_WIDTH * (circleIndex + 1), SWIMLANE_HEIGHT / 2, SWIMLANE_HEIGHT, circleColor);
    svg.append(path);
  }
  if (historyItemViewModel.isCurrent) {
    const outerCircle = drawCircle(circleIndex, CIRCLE_RADIUS + 3, CIRCLE_STROKE_WIDTH, circleColor);
    svg.append(outerCircle);
    const innerCircle = drawCircle(circleIndex, CIRCLE_STROKE_WIDTH, CIRCLE_RADIUS);
    svg.append(innerCircle);
  } else {
    if (historyItem.parentIds.length > 1) {
      const circleOuter = drawCircle(circleIndex, CIRCLE_RADIUS + 2, CIRCLE_STROKE_WIDTH, circleColor);
      svg.append(circleOuter);
      const circleInner = drawCircle(circleIndex, CIRCLE_RADIUS - 1, CIRCLE_STROKE_WIDTH, circleColor);
      svg.append(circleInner);
    } else {
      const circle = drawCircle(circleIndex, CIRCLE_RADIUS + 1, CIRCLE_STROKE_WIDTH, circleColor);
      svg.append(circle);
    }
  }
  svg.style.height = `${SWIMLANE_HEIGHT}px`;
  svg.style.width = `${SWIMLANE_WIDTH * (Math.max(inputSwimlanes.length, outputSwimlanes.length, 1) + 1)}px`;
  return svg;
}
__name(renderSCMHistoryItemGraph, "renderSCMHistoryItemGraph");
function renderSCMHistoryGraphPlaceholder(columns) {
  const elements = svgElem("svg", {
    style: { height: `${SWIMLANE_HEIGHT}px`, width: `${SWIMLANE_WIDTH * (columns.length + 1)}px` }
  });
  for (let index = 0; index < columns.length; index++) {
    const path = drawVerticalLine(SWIMLANE_WIDTH * (index + 1), 0, SWIMLANE_HEIGHT, columns[index].color);
    elements.root.append(path);
  }
  return elements.root;
}
__name(renderSCMHistoryGraphPlaceholder, "renderSCMHistoryGraphPlaceholder");
function toISCMHistoryItemViewModelArray(historyItems, colorMap = /* @__PURE__ */ new Map(), currentHistoryItemRef) {
  let colorIndex = -1;
  const viewModels = [];
  for (let index = 0; index < historyItems.length; index++) {
    const historyItem = historyItems[index];
    const isCurrent = historyItem.id === currentHistoryItemRef?.revision;
    const outputSwimlanesFromPreviousItem = viewModels.at(-1)?.outputSwimlanes ?? [];
    const inputSwimlanes = outputSwimlanesFromPreviousItem.map((i) => deepClone(i));
    const outputSwimlanes = [];
    let firstParentAdded = false;
    if (historyItem.parentIds.length > 0) {
      for (const node of inputSwimlanes) {
        if (node.id === historyItem.id) {
          if (!firstParentAdded) {
            outputSwimlanes.push({
              id: historyItem.parentIds[0],
              color: getLabelColorIdentifier(historyItem, colorMap) ?? node.color
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
      if (!firstParentAdded) {
        colorIdentifier = getLabelColorIdentifier(historyItem, colorMap);
      } else {
        const historyItemParent = historyItems.find((h) => h.id === historyItem.parentIds[i]);
        colorIdentifier = historyItemParent ? getLabelColorIdentifier(historyItemParent, colorMap) : void 0;
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
    const references = (historyItem.references ?? []).map((ref) => {
      let color = colorMap.get(ref.id);
      if (colorMap.has(ref.id) && color === void 0) {
        const inputIndex = inputSwimlanes.findIndex((node) => node.id === historyItem.id);
        const circleIndex = inputIndex !== -1 ? inputIndex : inputSwimlanes.length;
        color = circleIndex < outputSwimlanes.length ? outputSwimlanes[circleIndex].color : circleIndex < inputSwimlanes.length ? inputSwimlanes[circleIndex].color : historyItemRefColor;
      }
      return { ...ref, color };
    });
    viewModels.push({
      historyItem: {
        ...historyItem,
        references
      },
      isCurrent,
      inputSwimlanes,
      outputSwimlanes
    });
  }
  return viewModels;
}
__name(toISCMHistoryItemViewModelArray, "toISCMHistoryItemViewModelArray");
export {
  SWIMLANE_HEIGHT,
  SWIMLANE_WIDTH,
  colorRegistry,
  historyItemBaseRefColor,
  historyItemHoverAdditionsForeground,
  historyItemHoverDefaultLabelBackground,
  historyItemHoverDefaultLabelForeground,
  historyItemHoverDeletionsForeground,
  historyItemHoverLabelForeground,
  historyItemRefColor,
  historyItemRemoteRefColor,
  renderSCMHistoryGraphPlaceholder,
  renderSCMHistoryItemGraph,
  toISCMHistoryItemViewModelArray
};
//# sourceMappingURL=scmHistory.js.map
