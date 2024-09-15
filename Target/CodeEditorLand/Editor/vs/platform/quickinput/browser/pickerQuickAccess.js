var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Disposable, DisposableStore, IDisposable, MutableDisposable } from "../../../base/common/lifecycle.js";
import { IKeyMods, IQuickPickDidAcceptEvent, IQuickPickSeparator, IQuickPick, IQuickPickItem, IQuickInputButton } from "../common/quickInput.js";
import { IQuickAccessProvider, IQuickAccessProviderRunOptions } from "../common/quickAccess.js";
import { isFunction } from "../../../base/common/types.js";
var TriggerAction = /* @__PURE__ */ ((TriggerAction2) => {
  TriggerAction2[TriggerAction2["NO_ACTION"] = 0] = "NO_ACTION";
  TriggerAction2[TriggerAction2["CLOSE_PICKER"] = 1] = "CLOSE_PICKER";
  TriggerAction2[TriggerAction2["REFRESH_PICKER"] = 2] = "REFRESH_PICKER";
  TriggerAction2[TriggerAction2["REMOVE_ITEM"] = 3] = "REMOVE_ITEM";
  return TriggerAction2;
})(TriggerAction || {});
function isPicksWithActive(obj) {
  const candidate = obj;
  return Array.isArray(candidate.items);
}
__name(isPicksWithActive, "isPicksWithActive");
function isFastAndSlowPicks(obj) {
  const candidate = obj;
  return !!candidate.picks && candidate.additionalPicks instanceof Promise;
}
__name(isFastAndSlowPicks, "isFastAndSlowPicks");
class PickerQuickAccessProvider extends Disposable {
  constructor(prefix, options) {
    super();
    this.prefix = prefix;
    this.options = options;
  }
  static {
    __name(this, "PickerQuickAccessProvider");
  }
  provide(picker, token, runOptions) {
    const disposables = new DisposableStore();
    picker.canAcceptInBackground = !!this.options?.canAcceptInBackground;
    picker.matchOnLabel = picker.matchOnDescription = picker.matchOnDetail = picker.sortByLabel = false;
    let picksCts = void 0;
    const picksDisposable = disposables.add(new MutableDisposable());
    const updatePickerItems = /* @__PURE__ */ __name(async () => {
      const picksDisposables = picksDisposable.value = new DisposableStore();
      picksCts?.dispose(true);
      picker.busy = false;
      picksCts = new CancellationTokenSource(token);
      const picksToken = picksCts.token;
      let picksFilter = picker.value.substring(this.prefix.length);
      if (!this.options?.shouldSkipTrimPickFilter) {
        picksFilter = picksFilter.trim();
      }
      const providedPicks = this._getPicks(picksFilter, picksDisposables, picksToken, runOptions);
      const applyPicks = /* @__PURE__ */ __name((picks, skipEmpty) => {
        let items;
        let activeItem = void 0;
        if (isPicksWithActive(picks)) {
          items = picks.items;
          activeItem = picks.active;
        } else {
          items = picks;
        }
        if (items.length === 0) {
          if (skipEmpty) {
            return false;
          }
          if ((picksFilter.length > 0 || picker.hideInput) && this.options?.noResultsPick) {
            if (isFunction(this.options.noResultsPick)) {
              items = [this.options.noResultsPick(picksFilter)];
            } else {
              items = [this.options.noResultsPick];
            }
          }
        }
        picker.items = items;
        if (activeItem) {
          picker.activeItems = [activeItem];
        }
        return true;
      }, "applyPicks");
      const applyFastAndSlowPicks = /* @__PURE__ */ __name(async (fastAndSlowPicks) => {
        let fastPicksApplied = false;
        let slowPicksApplied = false;
        await Promise.all([
          // Fast Picks: if `mergeDelay` is configured, in order to reduce
          // amount of flicker, we race against the slow picks over some delay
          // and then set the fast picks.
          // If the slow picks are faster, we reduce the flicker by only
          // setting the items once.
          (async () => {
            if (typeof fastAndSlowPicks.mergeDelay === "number") {
              await timeout(fastAndSlowPicks.mergeDelay);
              if (picksToken.isCancellationRequested) {
                return;
              }
            }
            if (!slowPicksApplied) {
              fastPicksApplied = applyPicks(
                fastAndSlowPicks.picks,
                true
                /* skip over empty to reduce flicker */
              );
            }
          })(),
          // Slow Picks: we await the slow picks and then set them at
          // once together with the fast picks, but only if we actually
          // have additional results.
          (async () => {
            picker.busy = true;
            try {
              const awaitedAdditionalPicks = await fastAndSlowPicks.additionalPicks;
              if (picksToken.isCancellationRequested) {
                return;
              }
              let picks;
              let activePick = void 0;
              if (isPicksWithActive(fastAndSlowPicks.picks)) {
                picks = fastAndSlowPicks.picks.items;
                activePick = fastAndSlowPicks.picks.active;
              } else {
                picks = fastAndSlowPicks.picks;
              }
              let additionalPicks;
              let additionalActivePick = void 0;
              if (isPicksWithActive(awaitedAdditionalPicks)) {
                additionalPicks = awaitedAdditionalPicks.items;
                additionalActivePick = awaitedAdditionalPicks.active;
              } else {
                additionalPicks = awaitedAdditionalPicks;
              }
              if (additionalPicks.length > 0 || !fastPicksApplied) {
                let fallbackActivePick = void 0;
                if (!activePick && !additionalActivePick) {
                  const fallbackActivePickCandidate = picker.activeItems[0];
                  if (fallbackActivePickCandidate && picks.indexOf(fallbackActivePickCandidate) !== -1) {
                    fallbackActivePick = fallbackActivePickCandidate;
                  }
                }
                applyPicks({
                  items: [...picks, ...additionalPicks],
                  active: activePick || additionalActivePick || fallbackActivePick
                });
              }
            } finally {
              if (!picksToken.isCancellationRequested) {
                picker.busy = false;
              }
              slowPicksApplied = true;
            }
          })()
        ]);
      }, "applyFastAndSlowPicks");
      if (providedPicks === null) {
      } else if (isFastAndSlowPicks(providedPicks)) {
        await applyFastAndSlowPicks(providedPicks);
      } else if (!(providedPicks instanceof Promise)) {
        applyPicks(providedPicks);
      } else {
        picker.busy = true;
        try {
          const awaitedPicks = await providedPicks;
          if (picksToken.isCancellationRequested) {
            return;
          }
          if (isFastAndSlowPicks(awaitedPicks)) {
            await applyFastAndSlowPicks(awaitedPicks);
          } else {
            applyPicks(awaitedPicks);
          }
        } finally {
          if (!picksToken.isCancellationRequested) {
            picker.busy = false;
          }
        }
      }
    }, "updatePickerItems");
    disposables.add(picker.onDidChangeValue(() => updatePickerItems()));
    updatePickerItems();
    disposables.add(picker.onDidAccept((event) => {
      if (runOptions?.handleAccept) {
        if (!event.inBackground) {
          picker.hide();
        }
        runOptions.handleAccept?.(picker.activeItems[0]);
        return;
      }
      const [item] = picker.selectedItems;
      if (typeof item?.accept === "function") {
        if (!event.inBackground) {
          picker.hide();
        }
        item.accept(picker.keyMods, event);
      }
    }));
    const buttonTrigger = /* @__PURE__ */ __name(async (button, item) => {
      if (typeof item.trigger !== "function") {
        return;
      }
      const buttonIndex = item.buttons?.indexOf(button) ?? -1;
      if (buttonIndex >= 0) {
        const result = item.trigger(buttonIndex, picker.keyMods);
        const action = typeof result === "number" ? result : await result;
        if (token.isCancellationRequested) {
          return;
        }
        switch (action) {
          case 0 /* NO_ACTION */:
            break;
          case 1 /* CLOSE_PICKER */:
            picker.hide();
            break;
          case 2 /* REFRESH_PICKER */:
            updatePickerItems();
            break;
          case 3 /* REMOVE_ITEM */: {
            const index = picker.items.indexOf(item);
            if (index !== -1) {
              const items = picker.items.slice();
              const removed = items.splice(index, 1);
              const activeItems = picker.activeItems.filter((activeItem) => activeItem !== removed[0]);
              const keepScrollPositionBefore = picker.keepScrollPosition;
              picker.keepScrollPosition = true;
              picker.items = items;
              if (activeItems) {
                picker.activeItems = activeItems;
              }
              picker.keepScrollPosition = keepScrollPositionBefore;
            }
            break;
          }
        }
      }
    }, "buttonTrigger");
    disposables.add(picker.onDidTriggerItemButton(({ button, item }) => buttonTrigger(button, item)));
    disposables.add(picker.onDidTriggerSeparatorButton(({ button, separator }) => buttonTrigger(button, separator)));
    return disposables;
  }
}
export {
  PickerQuickAccessProvider,
  TriggerAction
};
//# sourceMappingURL=pickerQuickAccess.js.map
