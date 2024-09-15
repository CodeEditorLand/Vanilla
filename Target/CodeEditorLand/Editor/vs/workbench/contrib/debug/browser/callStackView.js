var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { AriaRole } from "../../../../base/browser/ui/aria/aria.js";
import { HighlightedLabel } from "../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { ITreeCompressionDelegate } from "../../../../base/browser/ui/tree/asyncDataTree.js";
import { ICompressedTreeNode } from "../../../../base/browser/ui/tree/compressedObjectTreeModel.js";
import { ICompressibleTreeRenderer } from "../../../../base/browser/ui/tree/objectTree.js";
import { IAsyncDataSource, ITreeContextMenuEvent, ITreeNode } from "../../../../base/browser/ui/tree/tree.js";
import { Action, IAction } from "../../../../base/common/actions.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Event } from "../../../../base/common/event.js";
import { createMatches, FuzzyScore, IMatch } from "../../../../base/common/filters.js";
import { DisposableStore, dispose, IDisposable } from "../../../../base/common/lifecycle.js";
import { posix } from "../../../../base/common/path.js";
import { commonSuffixLength } from "../../../../base/common/strings.js";
import { localize } from "../../../../nls.js";
import { ICommandActionTitle, Icon } from "../../../../platform/action/common/action.js";
import { createAndFillInActionBarActions, createAndFillInContextMenuActions, MenuEntryActionViewItem, SubmenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId, MenuItemAction, MenuRegistry, registerAction2, SubmenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, ContextKeyExpression, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchCompressibleAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { asCssVariable, textLinkForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { ViewAction, ViewPane } from "../../../browser/parts/views/viewPane.js";
import { IViewletViewOptions } from "../../../browser/parts/views/viewsViewlet.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { renderViewTree } from "./baseDebugView.js";
import { CONTINUE_ID, CONTINUE_LABEL, DISCONNECT_ID, DISCONNECT_LABEL, PAUSE_ID, PAUSE_LABEL, RESTART_LABEL, RESTART_SESSION_ID, STEP_INTO_ID, STEP_INTO_LABEL, STEP_OUT_ID, STEP_OUT_LABEL, STEP_OVER_ID, STEP_OVER_LABEL, STOP_ID, STOP_LABEL } from "./debugCommands.js";
import * as icons from "./debugIcons.js";
import { createDisconnectMenuItemAction } from "./debugToolBar.js";
import { CALLSTACK_VIEW_ID, CONTEXT_CALLSTACK_ITEM_STOPPED, CONTEXT_CALLSTACK_ITEM_TYPE, CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD, CONTEXT_CALLSTACK_SESSION_IS_ATTACH, CONTEXT_DEBUG_STATE, CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG, CONTEXT_STACK_FRAME_SUPPORTS_RESTART, getStateLabel, IDebugModel, IDebugService, IDebugSession, IRawStoppedDetails, isFrameDeemphasized, IStackFrame, IThread, State } from "../common/debug.js";
import { StackFrame, Thread, ThreadAndSessionIds } from "../common/debugModel.js";
import { isSessionAttach } from "../common/debugUtils.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
const $ = dom.$;
function assignSessionContext(element, context) {
  context.sessionId = element.getId();
  return context;
}
__name(assignSessionContext, "assignSessionContext");
function assignThreadContext(element, context) {
  context.threadId = element.getId();
  assignSessionContext(element.session, context);
  return context;
}
__name(assignThreadContext, "assignThreadContext");
function assignStackFrameContext(element, context) {
  context.frameId = element.getId();
  context.frameName = element.name;
  context.frameLocation = { range: element.range, source: element.source.raw };
  assignThreadContext(element.thread, context);
  return context;
}
__name(assignStackFrameContext, "assignStackFrameContext");
function getContext(element) {
  if (element instanceof StackFrame) {
    return assignStackFrameContext(element, {});
  } else if (element instanceof Thread) {
    return assignThreadContext(element, {});
  } else if (isDebugSession(element)) {
    return assignSessionContext(element, {});
  } else {
    return void 0;
  }
}
__name(getContext, "getContext");
function getContextForContributedActions(element) {
  if (element instanceof StackFrame) {
    if (element.source.inMemory) {
      return element.source.raw.path || element.source.reference || element.source.name;
    }
    return element.source.uri.toString();
  }
  if (element instanceof Thread) {
    return element.threadId;
  }
  if (isDebugSession(element)) {
    return element.getId();
  }
  return "";
}
__name(getContextForContributedActions, "getContextForContributedActions");
function getSpecificSourceName(stackFrame) {
  let callStack = stackFrame.thread.getStaleCallStack();
  callStack = callStack.length > 0 ? callStack : stackFrame.thread.getCallStack();
  const otherSources = callStack.map((sf) => sf.source).filter((s) => s !== stackFrame.source);
  let suffixLength = 0;
  otherSources.forEach((s) => {
    if (s.name === stackFrame.source.name) {
      suffixLength = Math.max(suffixLength, commonSuffixLength(stackFrame.source.uri.path, s.uri.path));
    }
  });
  if (suffixLength === 0) {
    return stackFrame.source.name;
  }
  const from = Math.max(0, stackFrame.source.uri.path.lastIndexOf(posix.sep, stackFrame.source.uri.path.length - suffixLength - 1));
  return (from > 0 ? "..." : "") + stackFrame.source.uri.path.substring(from);
}
__name(getSpecificSourceName, "getSpecificSourceName");
async function expandTo(session, tree) {
  if (session.parentSession) {
    await expandTo(session.parentSession, tree);
  }
  await tree.expand(session);
}
__name(expandTo, "expandTo");
let CallStackView = class extends ViewPane {
  constructor(options, contextMenuService, debugService, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, telemetryService, hoverService, menuService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
    this.options = options;
    this.debugService = debugService;
    this.menuService = menuService;
    this.onCallStackChangeScheduler = this._register(new RunOnceScheduler(async () => {
      const sessions = this.debugService.getModel().getSessions();
      if (sessions.length === 0) {
        this.autoExpandedSessions.clear();
      }
      const thread = sessions.length === 1 && sessions[0].getAllThreads().length === 1 ? sessions[0].getAllThreads()[0] : void 0;
      const stoppedDetails = sessions.length === 1 ? sessions[0].getStoppedDetails() : void 0;
      if (stoppedDetails && (thread || typeof stoppedDetails.threadId !== "number")) {
        this.stateMessageLabel.textContent = stoppedDescription(stoppedDetails);
        this.stateMessageLabelHover.update(stoppedText(stoppedDetails));
        this.stateMessageLabel.classList.toggle("exception", stoppedDetails.reason === "exception");
        this.stateMessage.hidden = false;
      } else if (sessions.length === 1 && sessions[0].state === State.Running) {
        this.stateMessageLabel.textContent = localize({ key: "running", comment: ["indicates state"] }, "Running");
        this.stateMessageLabelHover.update(sessions[0].getLabel());
        this.stateMessageLabel.classList.remove("exception");
        this.stateMessage.hidden = false;
      } else {
        this.stateMessage.hidden = true;
      }
      this.updateActions();
      this.needsRefresh = false;
      this.dataSource.deemphasizedStackFramesToShow = [];
      await this.tree.updateChildren();
      try {
        const toExpand = /* @__PURE__ */ new Set();
        sessions.forEach((s) => {
          if (s.parentSession && !this.autoExpandedSessions.has(s.parentSession)) {
            toExpand.add(s.parentSession);
          }
        });
        for (const session of toExpand) {
          await expandTo(session, this.tree);
          this.autoExpandedSessions.add(session);
        }
      } catch (e) {
      }
      if (this.selectionNeedsUpdate) {
        this.selectionNeedsUpdate = false;
        await this.updateTreeSelection();
      }
    }, 50));
  }
  static {
    __name(this, "CallStackView");
  }
  stateMessage;
  stateMessageLabel;
  stateMessageLabelHover;
  onCallStackChangeScheduler;
  needsRefresh = false;
  ignoreSelectionChangedEvent = false;
  ignoreFocusStackFrameEvent = false;
  dataSource;
  tree;
  autoExpandedSessions = /* @__PURE__ */ new Set();
  selectionNeedsUpdate = false;
  renderHeaderTitle(container) {
    super.renderHeaderTitle(container, this.options.title);
    this.stateMessage = dom.append(container, $("span.call-stack-state-message"));
    this.stateMessage.hidden = true;
    this.stateMessageLabel = dom.append(this.stateMessage, $("span.label"));
    this.stateMessageLabelHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.stateMessage, ""));
  }
  renderBody(container) {
    super.renderBody(container);
    this.element.classList.add("debug-pane");
    container.classList.add("debug-call-stack");
    const treeContainer = renderViewTree(container);
    this.dataSource = new CallStackDataSource(this.debugService);
    this.tree = this.instantiationService.createInstance(WorkbenchCompressibleAsyncDataTree, "CallStackView", treeContainer, new CallStackDelegate(), new CallStackCompressionDelegate(this.debugService), [
      this.instantiationService.createInstance(SessionsRenderer),
      this.instantiationService.createInstance(ThreadsRenderer),
      this.instantiationService.createInstance(StackFramesRenderer),
      this.instantiationService.createInstance(ErrorsRenderer),
      new LoadMoreRenderer(),
      new ShowMoreRenderer()
    ], this.dataSource, {
      accessibilityProvider: new CallStackAccessibilityProvider(),
      compressionEnabled: true,
      autoExpandSingleChildren: true,
      identityProvider: {
        getId: /* @__PURE__ */ __name((element) => {
          if (typeof element === "string") {
            return element;
          }
          if (element instanceof Array) {
            return `showMore ${element[0].getId()}`;
          }
          return element.getId();
        }, "getId")
      },
      keyboardNavigationLabelProvider: {
        getKeyboardNavigationLabel: /* @__PURE__ */ __name((e) => {
          if (isDebugSession(e)) {
            return e.getLabel();
          }
          if (e instanceof Thread) {
            return `${e.name} ${e.stateLabel}`;
          }
          if (e instanceof StackFrame || typeof e === "string") {
            return e;
          }
          if (e instanceof ThreadAndSessionIds) {
            return LoadMoreRenderer.LABEL;
          }
          return localize("showMoreStackFrames2", "Show More Stack Frames");
        }, "getKeyboardNavigationLabel"),
        getCompressedNodeKeyboardNavigationLabel: /* @__PURE__ */ __name((e) => {
          const firstItem = e[0];
          if (isDebugSession(firstItem)) {
            return firstItem.getLabel();
          }
          return "";
        }, "getCompressedNodeKeyboardNavigationLabel")
      },
      expandOnlyOnTwistieClick: true,
      overrideStyles: this.getLocationBasedColors().listOverrideStyles
    });
    this.tree.setInput(this.debugService.getModel());
    this._register(this.tree);
    this._register(this.tree.onDidOpen(async (e) => {
      if (this.ignoreSelectionChangedEvent) {
        return;
      }
      const focusStackFrame = /* @__PURE__ */ __name((stackFrame, thread, session, options = {}) => {
        this.ignoreFocusStackFrameEvent = true;
        try {
          this.debugService.focusStackFrame(stackFrame, thread, session, { ...options, ...{ explicit: true } });
        } finally {
          this.ignoreFocusStackFrameEvent = false;
        }
      }, "focusStackFrame");
      const element = e.element;
      if (element instanceof StackFrame) {
        const opts = {
          preserveFocus: e.editorOptions.preserveFocus,
          sideBySide: e.sideBySide,
          pinned: e.editorOptions.pinned
        };
        focusStackFrame(element, element.thread, element.thread.session, opts);
      }
      if (element instanceof Thread) {
        focusStackFrame(void 0, element, element.session);
      }
      if (isDebugSession(element)) {
        focusStackFrame(void 0, void 0, element);
      }
      if (element instanceof ThreadAndSessionIds) {
        const session = this.debugService.getModel().getSession(element.sessionId);
        const thread = session && session.getThread(element.threadId);
        if (thread) {
          const totalFrames = thread.stoppedDetails?.totalFrames;
          const remainingFramesCount = typeof totalFrames === "number" ? totalFrames - thread.getCallStack().length : void 0;
          await thread.fetchCallStack(remainingFramesCount);
          await this.tree.updateChildren();
        }
      }
      if (element instanceof Array) {
        this.dataSource.deemphasizedStackFramesToShow.push(...element);
        this.tree.updateChildren();
      }
    }));
    this._register(this.debugService.getModel().onDidChangeCallStack(() => {
      if (!this.isBodyVisible()) {
        this.needsRefresh = true;
        return;
      }
      if (!this.onCallStackChangeScheduler.isScheduled()) {
        this.onCallStackChangeScheduler.schedule();
      }
    }));
    const onFocusChange = Event.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getViewModel().onDidFocusSession);
    this._register(onFocusChange(async () => {
      if (this.ignoreFocusStackFrameEvent) {
        return;
      }
      if (!this.isBodyVisible()) {
        this.needsRefresh = true;
        this.selectionNeedsUpdate = true;
        return;
      }
      if (this.onCallStackChangeScheduler.isScheduled()) {
        this.selectionNeedsUpdate = true;
        return;
      }
      await this.updateTreeSelection();
    }));
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    if (this.debugService.state === State.Stopped) {
      this.onCallStackChangeScheduler.schedule(0);
    }
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible && this.needsRefresh) {
        this.onCallStackChangeScheduler.schedule();
      }
    }));
    this._register(this.debugService.onDidNewSession((s) => {
      const sessionListeners = [];
      sessionListeners.push(s.onDidChangeName(() => {
        if (this.tree.hasNode(s)) {
          this.tree.rerender(s);
        }
      }));
      sessionListeners.push(s.onDidEndAdapter(() => dispose(sessionListeners)));
      if (s.parentSession) {
        this.autoExpandedSessions.delete(s.parentSession);
      }
    }));
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.tree.layout(height, width);
  }
  focus() {
    super.focus();
    this.tree.domFocus();
  }
  collapseAll() {
    this.tree.collapseAll();
  }
  async updateTreeSelection() {
    if (!this.tree || !this.tree.getInput()) {
      return;
    }
    const updateSelectionAndReveal = /* @__PURE__ */ __name((element) => {
      this.ignoreSelectionChangedEvent = true;
      try {
        this.tree.setSelection([element]);
        if (this.tree.getRelativeTop(element) === null) {
          this.tree.reveal(element, 0.5);
        } else {
          this.tree.reveal(element);
        }
      } catch (e) {
      } finally {
        this.ignoreSelectionChangedEvent = false;
      }
    }, "updateSelectionAndReveal");
    const thread = this.debugService.getViewModel().focusedThread;
    const session = this.debugService.getViewModel().focusedSession;
    const stackFrame = this.debugService.getViewModel().focusedStackFrame;
    if (!thread) {
      if (!session) {
        this.tree.setSelection([]);
      } else {
        updateSelectionAndReveal(session);
      }
    } else {
      try {
        await expandTo(thread.session, this.tree);
      } catch (e) {
      }
      try {
        await this.tree.expand(thread);
      } catch (e) {
      }
      const toReveal = stackFrame || session;
      if (toReveal) {
        updateSelectionAndReveal(toReveal);
      }
    }
  }
  onContextMenu(e) {
    const element = e.element;
    let overlay = [];
    if (isDebugSession(element)) {
      overlay = getSessionContextOverlay(element);
    } else if (element instanceof Thread) {
      overlay = getThreadContextOverlay(element);
    } else if (element instanceof StackFrame) {
      overlay = getStackFrameContextOverlay(element);
    }
    const primary = [];
    const secondary = [];
    const result = { primary, secondary };
    const contextKeyService = this.contextKeyService.createOverlay(overlay);
    const menu = this.menuService.getMenuActions(MenuId.DebugCallStackContext, contextKeyService, { arg: getContextForContributedActions(element), shouldForwardArgs: true });
    createAndFillInContextMenuActions(menu, result, "inline");
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => result.secondary, "getActions"),
      getActionsContext: /* @__PURE__ */ __name(() => getContext(element), "getActionsContext")
    });
  }
};
CallStackView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IDebugService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IMenuService)
], CallStackView);
function getSessionContextOverlay(session) {
  return [
    [CONTEXT_CALLSTACK_ITEM_TYPE.key, "session"],
    [CONTEXT_CALLSTACK_SESSION_IS_ATTACH.key, isSessionAttach(session)],
    [CONTEXT_CALLSTACK_ITEM_STOPPED.key, session.state === State.Stopped],
    [CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD.key, session.getAllThreads().length === 1]
  ];
}
__name(getSessionContextOverlay, "getSessionContextOverlay");
let SessionsRenderer = class {
  constructor(instantiationService, contextKeyService, hoverService, menuService) {
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this.menuService = menuService;
  }
  static {
    __name(this, "SessionsRenderer");
  }
  static ID = "session";
  get templateId() {
    return SessionsRenderer.ID;
  }
  renderTemplate(container) {
    const session = dom.append(container, $(".session"));
    dom.append(session, $(ThemeIcon.asCSSSelector(icons.callstackViewSession)));
    const name = dom.append(session, $(".name"));
    const stateLabel = dom.append(session, $("span.state.label.monaco-count-badge.long"));
    const templateDisposable = new DisposableStore();
    const label = templateDisposable.add(new HighlightedLabel(name));
    const stopActionViewItemDisposables = templateDisposable.add(new DisposableStore());
    const actionBar = templateDisposable.add(new ActionBar(session, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if ((action.id === STOP_ID || action.id === DISCONNECT_ID) && action instanceof MenuItemAction) {
          stopActionViewItemDisposables.clear();
          const item = this.instantiationService.invokeFunction((accessor) => createDisconnectMenuItemAction(action, stopActionViewItemDisposables, accessor, { ...options, menuAsChild: false }));
          if (item) {
            return item;
          }
        }
        if (action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options.hoverDelegate });
        } else if (action instanceof SubmenuItemAction) {
          return this.instantiationService.createInstance(SubmenuEntryActionViewItem, action, { hoverDelegate: options.hoverDelegate });
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
    const elementDisposable = templateDisposable.add(new DisposableStore());
    return { session, name, stateLabel, label, actionBar, elementDisposable, templateDisposable };
  }
  renderElement(element, _, data) {
    this.doRenderElement(element.element, createMatches(element.filterData), data);
  }
  renderCompressedElements(node, _index, templateData) {
    const lastElement = node.element.elements[node.element.elements.length - 1];
    const matches = createMatches(node.filterData);
    this.doRenderElement(lastElement, matches, templateData);
  }
  doRenderElement(session, matches, data) {
    const sessionHover = data.elementDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.session, localize({ key: "session", comment: ["Session is a noun"] }, "Session")));
    data.label.set(session.getLabel(), matches);
    const stoppedDetails = session.getStoppedDetails();
    const thread = session.getAllThreads().find((t) => t.stopped);
    const contextKeyService = this.contextKeyService.createOverlay(getSessionContextOverlay(session));
    const menu = data.elementDisposable.add(this.menuService.createMenu(MenuId.DebugCallStackContext, contextKeyService));
    const setupActionBar = /* @__PURE__ */ __name(() => {
      data.actionBar.clear();
      const primary = [];
      const secondary = [];
      const result = { primary, secondary };
      createAndFillInActionBarActions(menu, { arg: getContextForContributedActions(session), shouldForwardArgs: true }, result, "inline");
      data.actionBar.push(primary, { icon: true, label: false });
      data.actionBar.context = getContext(session);
    }, "setupActionBar");
    data.elementDisposable.add(menu.onDidChange(() => setupActionBar()));
    setupActionBar();
    data.stateLabel.style.display = "";
    if (stoppedDetails) {
      data.stateLabel.textContent = stoppedDescription(stoppedDetails);
      sessionHover.update(`${session.getLabel()}: ${stoppedText(stoppedDetails)}`);
      data.stateLabel.classList.toggle("exception", stoppedDetails.reason === "exception");
    } else if (thread && thread.stoppedDetails) {
      data.stateLabel.textContent = stoppedDescription(thread.stoppedDetails);
      sessionHover.update(`${session.getLabel()}: ${stoppedText(thread.stoppedDetails)}`);
      data.stateLabel.classList.toggle("exception", thread.stoppedDetails.reason === "exception");
    } else {
      data.stateLabel.textContent = localize({ key: "running", comment: ["indicates state"] }, "Running");
      data.stateLabel.classList.remove("exception");
    }
  }
  disposeTemplate(templateData) {
    templateData.templateDisposable.dispose();
  }
  disposeElement(_element, _, templateData) {
    templateData.elementDisposable.clear();
  }
  disposeCompressedElements(node, index, templateData, height) {
    templateData.elementDisposable.clear();
  }
};
SessionsRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, IMenuService)
], SessionsRenderer);
function getThreadContextOverlay(thread) {
  return [
    [CONTEXT_CALLSTACK_ITEM_TYPE.key, "thread"],
    [CONTEXT_CALLSTACK_ITEM_STOPPED.key, thread.stopped]
  ];
}
__name(getThreadContextOverlay, "getThreadContextOverlay");
let ThreadsRenderer = class {
  constructor(contextKeyService, hoverService, menuService) {
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this.menuService = menuService;
  }
  static {
    __name(this, "ThreadsRenderer");
  }
  static ID = "thread";
  get templateId() {
    return ThreadsRenderer.ID;
  }
  renderTemplate(container) {
    const thread = dom.append(container, $(".thread"));
    const name = dom.append(thread, $(".name"));
    const stateLabel = dom.append(thread, $("span.state.label.monaco-count-badge.long"));
    const templateDisposable = new DisposableStore();
    const label = templateDisposable.add(new HighlightedLabel(name));
    const actionBar = templateDisposable.add(new ActionBar(thread));
    const elementDisposable = templateDisposable.add(new DisposableStore());
    return { thread, name, stateLabel, label, actionBar, elementDisposable, templateDisposable };
  }
  renderElement(element, _index, data) {
    const thread = element.element;
    data.elementDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.thread, thread.name));
    data.label.set(thread.name, createMatches(element.filterData));
    data.stateLabel.textContent = thread.stateLabel;
    data.stateLabel.classList.toggle("exception", thread.stoppedDetails?.reason === "exception");
    const contextKeyService = this.contextKeyService.createOverlay(getThreadContextOverlay(thread));
    const menu = data.elementDisposable.add(this.menuService.createMenu(MenuId.DebugCallStackContext, contextKeyService));
    const setupActionBar = /* @__PURE__ */ __name(() => {
      data.actionBar.clear();
      const primary = [];
      const secondary = [];
      const result = { primary, secondary };
      createAndFillInActionBarActions(menu, { arg: getContextForContributedActions(thread), shouldForwardArgs: true }, result, "inline");
      data.actionBar.push(primary, { icon: true, label: false });
      data.actionBar.context = getContext(thread);
    }, "setupActionBar");
    data.elementDisposable.add(menu.onDidChange(() => setupActionBar()));
    setupActionBar();
  }
  renderCompressedElements(_node, _index, _templateData, _height) {
    throw new Error("Method not implemented.");
  }
  disposeElement(_element, _index, templateData) {
    templateData.elementDisposable.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposable.dispose();
  }
};
ThreadsRenderer = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IHoverService),
  __decorateParam(2, IMenuService)
], ThreadsRenderer);
function getStackFrameContextOverlay(stackFrame) {
  return [
    [CONTEXT_CALLSTACK_ITEM_TYPE.key, "stackFrame"],
    [CONTEXT_STACK_FRAME_SUPPORTS_RESTART.key, stackFrame.canRestart]
  ];
}
__name(getStackFrameContextOverlay, "getStackFrameContextOverlay");
let StackFramesRenderer = class {
  constructor(hoverService, labelService, notificationService) {
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.notificationService = notificationService;
  }
  static {
    __name(this, "StackFramesRenderer");
  }
  static ID = "stackFrame";
  get templateId() {
    return StackFramesRenderer.ID;
  }
  renderTemplate(container) {
    const stackFrame = dom.append(container, $(".stack-frame"));
    const labelDiv = dom.append(stackFrame, $("span.label.expression"));
    const file = dom.append(stackFrame, $(".file"));
    const fileName = dom.append(file, $("span.file-name"));
    const wrapper = dom.append(file, $("span.line-number-wrapper"));
    const lineNumber = dom.append(wrapper, $("span.line-number.monaco-count-badge"));
    const templateDisposable = new DisposableStore();
    const label = templateDisposable.add(new HighlightedLabel(labelDiv));
    const actionBar = templateDisposable.add(new ActionBar(stackFrame));
    return { file, fileName, label, lineNumber, stackFrame, actionBar, templateDisposable };
  }
  renderElement(element, index, data) {
    const stackFrame = element.element;
    data.stackFrame.classList.toggle("disabled", !stackFrame.source || !stackFrame.source.available || isFrameDeemphasized(stackFrame));
    data.stackFrame.classList.toggle("label", stackFrame.presentationHint === "label");
    const hasActions = !!stackFrame.thread.session.capabilities.supportsRestartFrame && stackFrame.presentationHint !== "label" && stackFrame.presentationHint !== "subtle" && stackFrame.canRestart;
    data.stackFrame.classList.toggle("has-actions", hasActions);
    let title = stackFrame.source.inMemory ? stackFrame.source.uri.path : this.labelService.getUriLabel(stackFrame.source.uri);
    if (stackFrame.source.raw.origin) {
      title += `
${stackFrame.source.raw.origin}`;
    }
    data.templateDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.file, title));
    data.label.set(stackFrame.name, createMatches(element.filterData), stackFrame.name);
    data.fileName.textContent = getSpecificSourceName(stackFrame);
    if (stackFrame.range.startLineNumber !== void 0) {
      data.lineNumber.textContent = `${stackFrame.range.startLineNumber}`;
      if (stackFrame.range.startColumn) {
        data.lineNumber.textContent += `:${stackFrame.range.startColumn}`;
      }
      data.lineNumber.classList.remove("unavailable");
    } else {
      data.lineNumber.classList.add("unavailable");
    }
    data.actionBar.clear();
    if (hasActions) {
      const action = new Action("debug.callStack.restartFrame", localize("restartFrame", "Restart Frame"), ThemeIcon.asClassName(icons.debugRestartFrame), true, async () => {
        try {
          await stackFrame.restart();
        } catch (e) {
          this.notificationService.error(e);
        }
      });
      data.actionBar.push(action, { icon: true, label: false });
    }
  }
  renderCompressedElements(node, index, templateData, height) {
    throw new Error("Method not implemented.");
  }
  disposeTemplate(templateData) {
    templateData.actionBar.dispose();
  }
};
StackFramesRenderer = __decorateClass([
  __decorateParam(0, IHoverService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, INotificationService)
], StackFramesRenderer);
let ErrorsRenderer = class {
  constructor(hoverService) {
    this.hoverService = hoverService;
  }
  static {
    __name(this, "ErrorsRenderer");
  }
  static ID = "error";
  get templateId() {
    return ErrorsRenderer.ID;
  }
  renderTemplate(container) {
    const label = dom.append(container, $(".error"));
    return { label, templateDisposable: new DisposableStore() };
  }
  renderElement(element, index, data) {
    const error = element.element;
    data.label.textContent = error;
    data.templateDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), data.label, error));
  }
  renderCompressedElements(node, index, templateData, height) {
    throw new Error("Method not implemented.");
  }
  disposeTemplate(templateData) {
  }
};
ErrorsRenderer = __decorateClass([
  __decorateParam(0, IHoverService)
], ErrorsRenderer);
class LoadMoreRenderer {
  static {
    __name(this, "LoadMoreRenderer");
  }
  static ID = "loadMore";
  static LABEL = localize("loadAllStackFrames", "Load More Stack Frames");
  constructor() {
  }
  get templateId() {
    return LoadMoreRenderer.ID;
  }
  renderTemplate(container) {
    const label = dom.append(container, $(".load-all"));
    label.style.color = asCssVariable(textLinkForeground);
    return { label };
  }
  renderElement(element, index, data) {
    data.label.textContent = LoadMoreRenderer.LABEL;
  }
  renderCompressedElements(node, index, templateData, height) {
    throw new Error("Method not implemented.");
  }
  disposeTemplate(templateData) {
  }
}
class ShowMoreRenderer {
  static {
    __name(this, "ShowMoreRenderer");
  }
  static ID = "showMore";
  constructor() {
  }
  get templateId() {
    return ShowMoreRenderer.ID;
  }
  renderTemplate(container) {
    const label = dom.append(container, $(".show-more"));
    label.style.color = asCssVariable(textLinkForeground);
    return { label };
  }
  renderElement(element, index, data) {
    const stackFrames = element.element;
    if (stackFrames.every((sf) => !!(sf.source && sf.source.origin && sf.source.origin === stackFrames[0].source.origin))) {
      data.label.textContent = localize("showMoreAndOrigin", "Show {0} More: {1}", stackFrames.length, stackFrames[0].source.origin);
    } else {
      data.label.textContent = localize("showMoreStackFrames", "Show {0} More Stack Frames", stackFrames.length);
    }
  }
  renderCompressedElements(node, index, templateData, height) {
    throw new Error("Method not implemented.");
  }
  disposeTemplate(templateData) {
  }
}
class CallStackDelegate {
  static {
    __name(this, "CallStackDelegate");
  }
  getHeight(element) {
    if (element instanceof StackFrame && element.presentationHint === "label") {
      return 16;
    }
    if (element instanceof ThreadAndSessionIds || element instanceof Array) {
      return 16;
    }
    return 22;
  }
  getTemplateId(element) {
    if (isDebugSession(element)) {
      return SessionsRenderer.ID;
    }
    if (element instanceof Thread) {
      return ThreadsRenderer.ID;
    }
    if (element instanceof StackFrame) {
      return StackFramesRenderer.ID;
    }
    if (typeof element === "string") {
      return ErrorsRenderer.ID;
    }
    if (element instanceof ThreadAndSessionIds) {
      return LoadMoreRenderer.ID;
    }
    return ShowMoreRenderer.ID;
  }
}
function stoppedText(stoppedDetails) {
  return stoppedDetails.text ?? stoppedDescription(stoppedDetails);
}
__name(stoppedText, "stoppedText");
function stoppedDescription(stoppedDetails) {
  return stoppedDetails.description || (stoppedDetails.reason ? localize({ key: "pausedOn", comment: ["indicates reason for program being paused"] }, "Paused on {0}", stoppedDetails.reason) : localize("paused", "Paused"));
}
__name(stoppedDescription, "stoppedDescription");
function isDebugModel(obj) {
  return typeof obj.getSessions === "function";
}
__name(isDebugModel, "isDebugModel");
function isDebugSession(obj) {
  return obj && typeof obj.getAllThreads === "function";
}
__name(isDebugSession, "isDebugSession");
class CallStackDataSource {
  constructor(debugService) {
    this.debugService = debugService;
  }
  static {
    __name(this, "CallStackDataSource");
  }
  deemphasizedStackFramesToShow = [];
  hasChildren(element) {
    if (isDebugSession(element)) {
      const threads = element.getAllThreads();
      return threads.length > 1 || threads.length === 1 && threads[0].stopped || !!this.debugService.getModel().getSessions().find((s) => s.parentSession === element);
    }
    return isDebugModel(element) || element instanceof Thread && element.stopped;
  }
  async getChildren(element) {
    if (isDebugModel(element)) {
      const sessions = element.getSessions();
      if (sessions.length === 0) {
        return Promise.resolve([]);
      }
      if (sessions.length > 1 || this.debugService.getViewModel().isMultiSessionView()) {
        return Promise.resolve(sessions.filter((s) => !s.parentSession));
      }
      const threads = sessions[0].getAllThreads();
      return threads.length === 1 ? this.getThreadChildren(threads[0]) : Promise.resolve(threads);
    } else if (isDebugSession(element)) {
      const childSessions = this.debugService.getModel().getSessions().filter((s) => s.parentSession === element);
      const threads = element.getAllThreads();
      if (threads.length === 1) {
        const children = await this.getThreadChildren(threads[0]);
        return children.concat(childSessions);
      }
      return Promise.resolve(threads.concat(childSessions));
    } else {
      return this.getThreadChildren(element);
    }
  }
  getThreadChildren(thread) {
    return this.getThreadCallstack(thread).then((children) => {
      const result = [];
      children.forEach((child, index) => {
        if (child instanceof StackFrame && child.source && isFrameDeemphasized(child)) {
          if (this.deemphasizedStackFramesToShow.indexOf(child) === -1) {
            if (result.length) {
              const last = result[result.length - 1];
              if (last instanceof Array) {
                last.push(child);
                return;
              }
            }
            const nextChild = index < children.length - 1 ? children[index + 1] : void 0;
            if (nextChild instanceof StackFrame && nextChild.source && isFrameDeemphasized(nextChild)) {
              result.push([child]);
              return;
            }
          }
        }
        result.push(child);
      });
      return result;
    });
  }
  async getThreadCallstack(thread) {
    let callStack = thread.getCallStack();
    if (!callStack || !callStack.length) {
      await thread.fetchCallStack();
      callStack = thread.getCallStack();
    }
    if (callStack.length === 1 && thread.session.capabilities.supportsDelayedStackTraceLoading && thread.stoppedDetails && thread.stoppedDetails.totalFrames && thread.stoppedDetails.totalFrames > 1) {
      callStack = callStack.concat(thread.getStaleCallStack().slice(1));
    }
    if (thread.stoppedDetails && thread.stoppedDetails.framesErrorMessage) {
      callStack = callStack.concat([thread.stoppedDetails.framesErrorMessage]);
    }
    if (!thread.reachedEndOfCallStack && thread.stoppedDetails) {
      callStack = callStack.concat([new ThreadAndSessionIds(thread.session.getId(), thread.threadId)]);
    }
    return callStack;
  }
}
class CallStackAccessibilityProvider {
  static {
    __name(this, "CallStackAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize({ comment: ["Debug is a noun in this context, not a verb."], key: "callStackAriaLabel" }, "Debug Call Stack");
  }
  getWidgetRole() {
    return "treegrid";
  }
  getRole(_element) {
    return "row";
  }
  getAriaLabel(element) {
    if (element instanceof Thread) {
      return localize({ key: "threadAriaLabel", comment: ['Placeholders stand for the thread name and the thread state.For example "Thread 1" and "Stopped'] }, "Thread {0} {1}", element.name, element.stateLabel);
    }
    if (element instanceof StackFrame) {
      return localize("stackFrameAriaLabel", "Stack Frame {0}, line {1}, {2}", element.name, element.range.startLineNumber, getSpecificSourceName(element));
    }
    if (isDebugSession(element)) {
      const thread = element.getAllThreads().find((t) => t.stopped);
      const state = thread ? thread.stateLabel : localize({ key: "running", comment: ["indicates state"] }, "Running");
      return localize({ key: "sessionLabel", comment: ['Placeholders stand for the session name and the session state. For example "Launch Program" and "Running"'] }, "Session {0} {1}", element.getLabel(), state);
    }
    if (typeof element === "string") {
      return element;
    }
    if (element instanceof Array) {
      return localize("showMoreStackFrames", "Show {0} More Stack Frames", element.length);
    }
    return LoadMoreRenderer.LABEL;
  }
}
class CallStackCompressionDelegate {
  constructor(debugService) {
    this.debugService = debugService;
  }
  static {
    __name(this, "CallStackCompressionDelegate");
  }
  isIncompressible(stat) {
    if (isDebugSession(stat)) {
      if (stat.compact) {
        return false;
      }
      const sessions = this.debugService.getModel().getSessions();
      if (sessions.some((s) => s.parentSession === stat && s.compact)) {
        return false;
      }
      return true;
    }
    return true;
  }
}
registerAction2(class Collapse extends ViewAction {
  static {
    __name(this, "Collapse");
  }
  constructor() {
    super({
      id: "callStack.collapse",
      viewId: CALLSTACK_VIEW_ID,
      title: localize("collapse", "Collapse All"),
      f1: false,
      icon: Codicon.collapseAll,
      precondition: CONTEXT_DEBUG_STATE.isEqualTo(getStateLabel(State.Stopped)),
      menu: {
        id: MenuId.ViewTitle,
        order: 10,
        group: "navigation",
        when: ContextKeyExpr.equals("view", CALLSTACK_VIEW_ID)
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});
function registerCallStackInlineMenuItem(id, title, icon, when, order, precondition) {
  MenuRegistry.appendMenuItem(MenuId.DebugCallStackContext, {
    group: "inline",
    order,
    when,
    command: { id, title, icon, precondition }
  });
}
__name(registerCallStackInlineMenuItem, "registerCallStackInlineMenuItem");
const threadOrSessionWithOneThread = ContextKeyExpr.or(CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("thread"), ContextKeyExpr.and(CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session"), CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD));
registerCallStackInlineMenuItem(PAUSE_ID, PAUSE_LABEL, icons.debugPause, ContextKeyExpr.and(threadOrSessionWithOneThread, CONTEXT_CALLSTACK_ITEM_STOPPED.toNegated()), 10, CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.toNegated());
registerCallStackInlineMenuItem(CONTINUE_ID, CONTINUE_LABEL, icons.debugContinue, ContextKeyExpr.and(threadOrSessionWithOneThread, CONTEXT_CALLSTACK_ITEM_STOPPED), 10);
registerCallStackInlineMenuItem(STEP_OVER_ID, STEP_OVER_LABEL, icons.debugStepOver, threadOrSessionWithOneThread, 20, CONTEXT_CALLSTACK_ITEM_STOPPED);
registerCallStackInlineMenuItem(STEP_INTO_ID, STEP_INTO_LABEL, icons.debugStepInto, threadOrSessionWithOneThread, 30, CONTEXT_CALLSTACK_ITEM_STOPPED);
registerCallStackInlineMenuItem(STEP_OUT_ID, STEP_OUT_LABEL, icons.debugStepOut, threadOrSessionWithOneThread, 40, CONTEXT_CALLSTACK_ITEM_STOPPED);
registerCallStackInlineMenuItem(RESTART_SESSION_ID, RESTART_LABEL, icons.debugRestart, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session"), 50);
registerCallStackInlineMenuItem(STOP_ID, STOP_LABEL, icons.debugStop, ContextKeyExpr.and(CONTEXT_CALLSTACK_SESSION_IS_ATTACH.toNegated(), CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session")), 60);
registerCallStackInlineMenuItem(DISCONNECT_ID, DISCONNECT_LABEL, icons.debugDisconnect, ContextKeyExpr.and(CONTEXT_CALLSTACK_SESSION_IS_ATTACH, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session")), 60);
export {
  CallStackView,
  getContext,
  getContextForContributedActions,
  getSpecificSourceName
};
//# sourceMappingURL=callStackView.js.map
