import { Iterable } from "../../../../base/common/iterator.js";
import {
  makeEmptyCounts,
  maxPriority,
  statePriority
} from "./testingStates.js";
import { TestResultState } from "./testTypes.js";
const isDurationAccessor = (accessor) => "getOwnDuration" in accessor;
const getComputedState = (accessor, node, force = false) => {
  let computed = accessor.getCurrentComputedState(node);
  if (computed === void 0 || force) {
    computed = accessor.getOwnState(node) ?? TestResultState.Unset;
    let childrenCount = 0;
    const stateMap = makeEmptyCounts();
    for (const child of accessor.getChildren(node)) {
      const childComputed = getComputedState(accessor, child);
      childrenCount++;
      stateMap[childComputed]++;
      computed = childComputed === TestResultState.Skipped && computed === TestResultState.Unset ? TestResultState.Skipped : maxPriority(computed, childComputed);
    }
    if (childrenCount > LARGE_NODE_THRESHOLD) {
      largeNodeChildrenStates.set(node, stateMap);
    }
    accessor.setComputedState(node, computed);
  }
  return computed;
};
const getComputedDuration = (accessor, node, force = false) => {
  let computed = accessor.getCurrentComputedDuration(node);
  if (computed === void 0 || force) {
    const own = accessor.getOwnDuration(node);
    if (own !== void 0) {
      computed = own;
    } else {
      computed = void 0;
      for (const child of accessor.getChildren(node)) {
        const d = getComputedDuration(accessor, child);
        if (d !== void 0) {
          computed = (computed || 0) + d;
        }
      }
    }
    accessor.setComputedDuration(node, computed);
  }
  return computed;
};
const LARGE_NODE_THRESHOLD = 64;
const largeNodeChildrenStates = /* @__PURE__ */ new WeakMap();
const refreshComputedState = (accessor, node, explicitNewComputedState, refreshDuration = true) => {
  const oldState = accessor.getCurrentComputedState(node);
  const oldPriority = statePriority[oldState];
  const newState = explicitNewComputedState ?? getComputedState(accessor, node, true);
  const newPriority = statePriority[newState];
  const toUpdate = /* @__PURE__ */ new Set();
  if (newPriority !== oldPriority) {
    accessor.setComputedState(node, newState);
    toUpdate.add(node);
    let moveFromState = oldState;
    let moveToState = newState;
    for (const parent of accessor.getParents(node)) {
      const lnm = largeNodeChildrenStates.get(parent);
      if (lnm) {
        lnm[moveFromState]--;
        lnm[moveToState]++;
      }
      const prev = accessor.getCurrentComputedState(parent);
      if (newPriority > oldPriority) {
        if (prev !== void 0 && statePriority[prev] >= newPriority) {
          break;
        }
        if (lnm && lnm[moveToState] > 1) {
          break;
        }
        accessor.setComputedState(parent, newState);
        toUpdate.add(parent);
      } else {
        if (prev === void 0 || statePriority[prev] > oldPriority) {
          break;
        }
        if (lnm && lnm[moveFromState] > 0) {
          break;
        }
        moveToState = getComputedState(accessor, parent, true);
        accessor.setComputedState(parent, moveToState);
        toUpdate.add(parent);
      }
      moveFromState = prev;
    }
  }
  if (isDurationAccessor(accessor) && refreshDuration) {
    for (const parent of Iterable.concat(
      Iterable.single(node),
      accessor.getParents(node)
    )) {
      const oldDuration = accessor.getCurrentComputedDuration(parent);
      const newDuration = getComputedDuration(accessor, parent, true);
      if (oldDuration === newDuration) {
        break;
      }
      accessor.setComputedDuration(parent, newDuration);
      toUpdate.add(parent);
    }
  }
  return toUpdate;
};
export {
  refreshComputedState
};
