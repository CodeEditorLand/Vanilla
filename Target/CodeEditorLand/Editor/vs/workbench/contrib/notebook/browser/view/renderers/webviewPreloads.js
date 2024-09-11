var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function webviewPreloads(ctx) {
  const userAgent = navigator.userAgent;
  const isChrome = userAgent.indexOf("Chrome") >= 0;
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  function promiseWithResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }
  __name(promiseWithResolvers, "promiseWithResolvers");
  let currentOptions = ctx.options;
  const isWorkspaceTrusted = ctx.isWorkspaceTrusted;
  let currentRenderOptions = ctx.renderOptions;
  const settingChange = createEmitter();
  const acquireVsCodeApi = globalThis.acquireVsCodeApi;
  const vscode = acquireVsCodeApi();
  delete globalThis.acquireVsCodeApi;
  const tokenizationStyle = new CSSStyleSheet();
  tokenizationStyle.replaceSync(ctx.style.tokenizationCss);
  const runWhenIdle = typeof requestIdleCallback !== "function" || typeof cancelIdleCallback !== "function" ? (runner) => {
    setTimeout(() => {
      if (disposed) {
        return;
      }
      const end = Date.now() + 15;
      runner(Object.freeze({
        didTimeout: true,
        timeRemaining() {
          return Math.max(0, end - Date.now());
        }
      }));
    });
    let disposed = false;
    return {
      dispose() {
        if (disposed) {
          return;
        }
        disposed = true;
      }
    };
  } : (runner, timeout) => {
    const handle = requestIdleCallback(runner, typeof timeout === "number" ? { timeout } : void 0);
    let disposed = false;
    return {
      dispose() {
        if (disposed) {
          return;
        }
        disposed = true;
        cancelIdleCallback(handle);
      }
    };
  };
  function getOutputContainer(event) {
    for (const node of event.composedPath()) {
      if (node instanceof HTMLElement && node.classList.contains("output")) {
        return {
          id: node.id
        };
      }
    }
    return;
  }
  __name(getOutputContainer, "getOutputContainer");
  let lastFocusedOutput = void 0;
  const handleOutputFocusOut = /* @__PURE__ */ __name((event) => {
    const outputFocus = event && getOutputContainer(event);
    if (!outputFocus) {
      return;
    }
    lastFocusedOutput = void 0;
    setTimeout(() => {
      if (lastFocusedOutput?.id === outputFocus.id) {
        return;
      }
      postNotebookMessage("outputBlur", outputFocus);
    }, 0);
  }, "handleOutputFocusOut");
  const checkOutputInputFocus = /* @__PURE__ */ __name((e) => {
    lastFocusedOutput = getOutputContainer(e);
    const activeElement = window.document.activeElement;
    if (!activeElement) {
      return;
    }
    const id = lastFocusedOutput?.id;
    if (id && (isEditableElement(activeElement) || activeElement.tagName === "SELECT")) {
      postNotebookMessage("outputInputFocus", { inputFocused: true, id });
      activeElement.addEventListener("blur", () => {
        postNotebookMessage("outputInputFocus", { inputFocused: false, id });
      }, { once: true });
    }
  }, "checkOutputInputFocus");
  const handleInnerClick = /* @__PURE__ */ __name((event) => {
    if (!event || !event.view || !event.view.document) {
      return;
    }
    const outputFocus = lastFocusedOutput = getOutputContainer(event);
    for (const node of event.composedPath()) {
      if (node instanceof HTMLAnchorElement && node.href) {
        if (node.href.startsWith("blob:")) {
          if (outputFocus) {
            postNotebookMessage("outputFocus", outputFocus);
          }
          handleBlobUrlClick(node.href, node.download);
        } else if (node.href.startsWith("data:")) {
          if (outputFocus) {
            postNotebookMessage("outputFocus", outputFocus);
          }
          handleDataUrl(node.href, node.download);
        } else if (node.getAttribute("href")?.trim().startsWith("#")) {
          if (!node.hash) {
            postNotebookMessage("scroll-to-reveal", { scrollTop: 0 });
            return;
          }
          const targetId = node.hash.substring(1);
          let scrollTarget = event.view.document.getElementById(targetId);
          if (!scrollTarget) {
            for (const preview of event.view.document.querySelectorAll(".preview")) {
              scrollTarget = preview.shadowRoot?.getElementById(targetId);
              if (scrollTarget) {
                break;
              }
            }
          }
          if (scrollTarget) {
            const scrollTop = scrollTarget.getBoundingClientRect().top + event.view.scrollY;
            postNotebookMessage("scroll-to-reveal", { scrollTop });
            return;
          }
        } else {
          const href = node.getAttribute("href");
          if (href) {
            if (href.startsWith("command:") && outputFocus) {
              postNotebookMessage("outputFocus", outputFocus);
            }
            postNotebookMessage("clicked-link", { href });
          }
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
    if (outputFocus) {
      postNotebookMessage("outputFocus", outputFocus);
    }
  }, "handleInnerClick");
  const blurOutput = /* @__PURE__ */ __name(() => {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    selection.removeAllRanges();
  }, "blurOutput");
  const selectOutputContents = /* @__PURE__ */ __name((cellOrOutputId) => {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    const cellOutputContainer = window.document.getElementById(cellOrOutputId);
    if (!cellOutputContainer) {
      return;
    }
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNode(cellOutputContainer);
    selection.addRange(range);
  }, "selectOutputContents");
  const selectInputContents = /* @__PURE__ */ __name((cellOrOutputId) => {
    const cellOutputContainer = window.document.getElementById(cellOrOutputId);
    if (!cellOutputContainer) {
      return;
    }
    const activeElement = window.document.activeElement;
    if (activeElement && isEditableElement(activeElement)) {
      activeElement.select();
    }
  }, "selectInputContents");
  const onPageUpDownSelectionHandler = /* @__PURE__ */ __name((e) => {
    if (!lastFocusedOutput?.id || !e.shiftKey) {
      return;
    }
    if (e.shiftKey && (e.code === "ArrowUp" || e.code === "ArrowDown")) {
      e.stopPropagation();
      return;
    }
    if (!(e.code === "PageUp" || e.code === "PageDown") && !(e.metaKey && (e.code === "ArrowDown" || e.code === "ArrowUp"))) {
      return;
    }
    const outputContainer = window.document.getElementById(lastFocusedOutput.id);
    const selection = window.getSelection();
    if (!outputContainer || !selection?.anchorNode) {
      return;
    }
    const activeElement = window.document.activeElement;
    if (activeElement && isEditableElement(activeElement)) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    const { anchorNode, anchorOffset } = selection;
    const range = document.createRange();
    if (e.code === "PageDown" || e.code === "ArrowDown") {
      range.setStart(anchorNode, anchorOffset);
      range.setEnd(outputContainer, 1);
    } else {
      range.setStart(outputContainer, 0);
      range.setEnd(anchorNode, anchorOffset);
    }
    selection.removeAllRanges();
    selection.addRange(range);
  }, "onPageUpDownSelectionHandler");
  const disableNativeSelectAll = /* @__PURE__ */ __name((e) => {
    if (!lastFocusedOutput?.id) {
      return;
    }
    const activeElement = window.document.activeElement;
    if (activeElement && isEditableElement(activeElement)) {
      return;
    }
    if (e.key === "a" && e.ctrlKey || e.metaKey && e.key === "a") {
      e.preventDefault();
      return;
    }
  }, "disableNativeSelectAll");
  const handleDataUrl = /* @__PURE__ */ __name(async (data, downloadName) => {
    postNotebookMessage("clicked-data-url", {
      data,
      downloadName
    });
  }, "handleDataUrl");
  const handleBlobUrlClick = /* @__PURE__ */ __name(async (url, downloadName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        handleDataUrl(reader.result, downloadName);
      });
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e.message);
    }
  }, "handleBlobUrlClick");
  window.document.body.addEventListener("click", handleInnerClick);
  window.document.body.addEventListener("focusin", checkOutputInputFocus);
  window.document.body.addEventListener("focusout", handleOutputFocusOut);
  window.document.body.addEventListener("keydown", onPageUpDownSelectionHandler);
  window.document.body.addEventListener("keydown", disableNativeSelectAll);
  function createKernelContext() {
    return Object.freeze({
      onDidReceiveKernelMessage: onDidReceiveKernelMessage.event,
      postKernelMessage: /* @__PURE__ */ __name((data) => postNotebookMessage("customKernelMessage", { message: data }), "postKernelMessage")
    });
  }
  __name(createKernelContext, "createKernelContext");
  async function runKernelPreload(url) {
    try {
      return await activateModuleKernelPreload(url);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  __name(runKernelPreload, "runKernelPreload");
  async function activateModuleKernelPreload(url) {
    const module = await __import(url);
    if (!module.activate) {
      console.error(`Notebook preload '${url}' was expected to be a module but it does not export an 'activate' function`);
      return;
    }
    return module.activate(createKernelContext());
  }
  __name(activateModuleKernelPreload, "activateModuleKernelPreload");
  const dimensionUpdater = new class {
    pending = /* @__PURE__ */ new Map();
    updateHeight(id, height, options) {
      if (!this.pending.size) {
        setTimeout(() => {
          this.updateImmediately();
        }, 0);
      }
      const update = this.pending.get(id);
      if (update && update.isOutput) {
        this.pending.set(id, {
          id,
          height,
          init: update.init,
          isOutput: update.isOutput
        });
      } else {
        this.pending.set(id, {
          id,
          height,
          ...options
        });
      }
    }
    updateImmediately() {
      if (!this.pending.size) {
        return;
      }
      postNotebookMessage("dimension", {
        updates: Array.from(this.pending.values())
      });
      this.pending.clear();
    }
  }();
  function elementHasContent(height) {
    return height > 2.1;
  }
  __name(elementHasContent, "elementHasContent");
  const resizeObserver = new class {
    _observer;
    _observedElements = /* @__PURE__ */ new WeakMap();
    _outputResizeTimer;
    constructor() {
      this._observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (!window.document.body.contains(entry.target)) {
            continue;
          }
          const observedElementInfo = this._observedElements.get(entry.target);
          if (!observedElementInfo) {
            continue;
          }
          this.postResizeMessage(observedElementInfo.cellId);
          if (entry.target.id !== observedElementInfo.id) {
            continue;
          }
          if (!entry.contentRect) {
            continue;
          }
          if (!observedElementInfo.output) {
            this.updateHeight(observedElementInfo, entry.target.offsetHeight);
            continue;
          }
          const hasContent = elementHasContent(entry.contentRect.height);
          const shouldUpdatePadding = hasContent && observedElementInfo.lastKnownPadding === 0 || !hasContent && observedElementInfo.lastKnownPadding !== 0;
          if (shouldUpdatePadding) {
            window.requestAnimationFrame(() => {
              if (hasContent) {
                entry.target.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}px`;
              } else {
                entry.target.style.padding = `0px`;
              }
              this.updateHeight(observedElementInfo, hasContent ? entry.target.offsetHeight : 0);
            });
          } else {
            this.updateHeight(observedElementInfo, hasContent ? entry.target.offsetHeight : 0);
          }
        }
      });
    }
    updateHeight(observedElementInfo, offsetHeight) {
      if (observedElementInfo.lastKnownHeight !== offsetHeight) {
        observedElementInfo.lastKnownHeight = offsetHeight;
        dimensionUpdater.updateHeight(observedElementInfo.id, offsetHeight, {
          isOutput: observedElementInfo.output
        });
      }
    }
    observe(container, id, output, cellId) {
      if (this._observedElements.has(container)) {
        return;
      }
      this._observedElements.set(container, { id, output, lastKnownPadding: ctx.style.outputNodePadding, lastKnownHeight: -1, cellId });
      this._observer.observe(container);
    }
    postResizeMessage(cellId) {
      clearTimeout(this._outputResizeTimer);
      this._outputResizeTimer = setTimeout(() => {
        postNotebookMessage("outputResized", {
          cellId
        });
      }, 250);
    }
  }();
  let previousDelta;
  let scrollTimeout;
  let scrolledElement;
  let lastTimeScrolled;
  function flagRecentlyScrolled(node, deltaY) {
    scrolledElement = node;
    if (deltaY === void 0) {
      lastTimeScrolled = Date.now();
      previousDelta = void 0;
      node.setAttribute("recentlyScrolled", "true");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrolledElement?.removeAttribute("recentlyScrolled");
      }, 300);
      return true;
    }
    if (node.hasAttribute("recentlyScrolled")) {
      if (lastTimeScrolled && Date.now() - lastTimeScrolled > 400) {
        if (!!previousDelta && deltaY < 0 && deltaY < previousDelta - 8) {
          clearTimeout(scrollTimeout);
          scrolledElement?.removeAttribute("recentlyScrolled");
          return false;
        } else if (!!previousDelta && deltaY > 0 && deltaY > previousDelta + 8) {
          clearTimeout(scrollTimeout);
          scrolledElement?.removeAttribute("recentlyScrolled");
          return false;
        }
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          scrolledElement?.removeAttribute("recentlyScrolled");
        }, 50);
      } else {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          scrolledElement?.removeAttribute("recentlyScrolled");
        }, 300);
      }
      previousDelta = deltaY;
      return true;
    }
    return false;
  }
  __name(flagRecentlyScrolled, "flagRecentlyScrolled");
  function eventTargetShouldHandleScroll(event) {
    for (let node = event.target; node; node = node.parentNode) {
      if (!(node instanceof Element) || node.id === "container" || node.classList.contains("cell_container") || node.classList.contains("markup") || node.classList.contains("output_container")) {
        return false;
      }
      if (event.deltaY < 0 && node.scrollTop > 0) {
        flagRecentlyScrolled(node);
        return true;
      }
      if (event.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight) {
        if (node.scrollHeight - node.scrollTop - node.clientHeight < 2) {
          continue;
        }
        if (window.getComputedStyle(node).overflowY === "hidden" || window.getComputedStyle(node).overflowY === "visible") {
          continue;
        }
        flagRecentlyScrolled(node);
        return true;
      }
      if (flagRecentlyScrolled(node, event.deltaY)) {
        return true;
      }
    }
    return false;
  }
  __name(eventTargetShouldHandleScroll, "eventTargetShouldHandleScroll");
  const handleWheel = /* @__PURE__ */ __name((event) => {
    if (event.defaultPrevented || eventTargetShouldHandleScroll(event)) {
      return;
    }
    postNotebookMessage("did-scroll-wheel", {
      payload: {
        deltaMode: event.deltaMode,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        // Refs https://github.com/microsoft/vscode/issues/146403#issuecomment-1854538928
        wheelDelta: event.wheelDelta && isChrome ? event.wheelDelta / window.devicePixelRatio : event.wheelDelta,
        wheelDeltaX: event.wheelDeltaX && isChrome ? event.wheelDeltaX / window.devicePixelRatio : event.wheelDeltaX,
        wheelDeltaY: event.wheelDeltaY && isChrome ? event.wheelDeltaY / window.devicePixelRatio : event.wheelDeltaY,
        detail: event.detail,
        shiftKey: event.shiftKey,
        type: event.type
      }
    });
  }, "handleWheel");
  function focusFirstFocusableOrContainerInOutput(cellOrOutputId, alternateId) {
    const cellOutputContainer = window.document.getElementById(cellOrOutputId) ?? (alternateId ? window.document.getElementById(alternateId) : void 0);
    if (cellOutputContainer) {
      if (cellOutputContainer.contains(window.document.activeElement)) {
        return;
      }
      const id = cellOutputContainer.id;
      let focusableElement = cellOutputContainer.querySelector('[tabindex="0"], [href], button, input, option, select, textarea');
      if (!focusableElement) {
        focusableElement = cellOutputContainer;
        focusableElement.tabIndex = -1;
        postNotebookMessage("outputInputFocus", { inputFocused: false, id });
      } else {
        const inputFocused = isEditableElement(focusableElement);
        postNotebookMessage("outputInputFocus", { inputFocused, id });
      }
      lastFocusedOutput = cellOutputContainer;
      postNotebookMessage("outputFocus", { id: cellOutputContainer.id });
      focusableElement.focus();
    }
  }
  __name(focusFirstFocusableOrContainerInOutput, "focusFirstFocusableOrContainerInOutput");
  function createFocusSink(cellId, focusNext) {
    const element = document.createElement("div");
    element.id = `focus-sink-${cellId}`;
    element.tabIndex = 0;
    element.addEventListener("focus", () => {
      postNotebookMessage("focus-editor", {
        cellId,
        focusNext
      });
    });
    return element;
  }
  __name(createFocusSink, "createFocusSink");
  function _internalHighlightRange(range, tagName = "mark", attributes = {}) {
    function _textNodesInRange(range2) {
      if (!range2.startContainer.ownerDocument) {
        return [];
      }
      if (range2.startContainer.nodeType === Node.TEXT_NODE && range2.startOffset > 0) {
        const startContainer = range2.startContainer;
        const endOffset = range2.endOffset;
        const createdNode = startContainer.splitText(range2.startOffset);
        if (range2.endContainer === startContainer) {
          range2.setEnd(createdNode, endOffset - range2.startOffset);
        }
        range2.setStart(createdNode, 0);
      }
      if (range2.endContainer.nodeType === Node.TEXT_NODE && range2.endOffset < range2.endContainer.length) {
        range2.endContainer.splitText(range2.endOffset);
      }
      const walker = range2.startContainer.ownerDocument.createTreeWalker(
        range2.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        (node) => range2.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      );
      walker.currentNode = range2.startContainer;
      const nodes2 = [];
      if (walker.currentNode.nodeType === Node.TEXT_NODE) {
        nodes2.push(walker.currentNode);
      }
      while (walker.nextNode() && range2.comparePoint(walker.currentNode, 0) !== 1) {
        if (walker.currentNode.nodeType === Node.TEXT_NODE) {
          nodes2.push(walker.currentNode);
        }
      }
      return nodes2;
    }
    __name(_textNodesInRange, "_textNodesInRange");
    function wrapNodeInHighlight(node, tagName2, attributes2) {
      const highlightElement = node.ownerDocument.createElement(tagName2);
      Object.keys(attributes2).forEach((key) => {
        highlightElement.setAttribute(key, attributes2[key]);
      });
      const tempRange = node.ownerDocument.createRange();
      tempRange.selectNode(node);
      tempRange.surroundContents(highlightElement);
      return highlightElement;
    }
    __name(wrapNodeInHighlight, "wrapNodeInHighlight");
    if (range.collapsed) {
      return {
        remove: /* @__PURE__ */ __name(() => {
        }, "remove"),
        update: /* @__PURE__ */ __name(() => {
        }, "update")
      };
    }
    const nodes = _textNodesInRange(range);
    const highlightElements = [];
    for (const nodeIdx in nodes) {
      const highlightElement = wrapNodeInHighlight(nodes[nodeIdx], tagName, attributes);
      highlightElements.push(highlightElement);
    }
    function _removeHighlight(highlightElement) {
      if (highlightElement.childNodes.length === 1) {
        highlightElement.parentNode?.replaceChild(highlightElement.firstChild, highlightElement);
      } else {
        while (highlightElement.firstChild) {
          highlightElement.parentNode?.insertBefore(highlightElement.firstChild, highlightElement);
        }
        highlightElement.remove();
      }
    }
    __name(_removeHighlight, "_removeHighlight");
    function _removeHighlights() {
      for (const highlightIdx in highlightElements) {
        _removeHighlight(highlightElements[highlightIdx]);
      }
    }
    __name(_removeHighlights, "_removeHighlights");
    function _updateHighlight(highlightElement, attributes2 = {}) {
      Object.keys(attributes2).forEach((key) => {
        highlightElement.setAttribute(key, attributes2[key]);
      });
    }
    __name(_updateHighlight, "_updateHighlight");
    function updateHighlights(attributes2) {
      for (const highlightIdx in highlightElements) {
        _updateHighlight(highlightElements[highlightIdx], attributes2);
      }
    }
    __name(updateHighlights, "updateHighlights");
    return {
      remove: _removeHighlights,
      update: updateHighlights
    };
  }
  __name(_internalHighlightRange, "_internalHighlightRange");
  function selectRange(_range) {
    const sel = window.getSelection();
    if (sel) {
      try {
        sel.removeAllRanges();
        const r = document.createRange();
        r.setStart(_range.startContainer, _range.startOffset);
        r.setEnd(_range.endContainer, _range.endOffset);
        sel.addRange(r);
      } catch (e) {
        console.log(e);
      }
    }
  }
  __name(selectRange, "selectRange");
  function highlightRange(range, useCustom, tagName = "mark", attributes = {}) {
    if (useCustom) {
      const ret = _internalHighlightRange(range, tagName, attributes);
      return {
        range,
        dispose: ret.remove,
        update: /* @__PURE__ */ __name((color, className) => {
          if (className === void 0) {
            ret.update({
              "style": `background-color: ${color}`
            });
          } else {
            ret.update({
              "class": className
            });
          }
        }, "update")
      };
    } else {
      window.document.execCommand("hiliteColor", false, matchColor);
      const cloneRange = window.getSelection().getRangeAt(0).cloneRange();
      const _range = {
        collapsed: cloneRange.collapsed,
        commonAncestorContainer: cloneRange.commonAncestorContainer,
        endContainer: cloneRange.endContainer,
        endOffset: cloneRange.endOffset,
        startContainer: cloneRange.startContainer,
        startOffset: cloneRange.startOffset
      };
      return {
        range: _range,
        dispose: /* @__PURE__ */ __name(() => {
          selectRange(_range);
          try {
            document.designMode = "On";
            window.document.execCommand("removeFormat", false, void 0);
            document.designMode = "Off";
            window.getSelection()?.removeAllRanges();
          } catch (e) {
            console.log(e);
          }
        }, "dispose"),
        update: /* @__PURE__ */ __name((color, className) => {
          selectRange(_range);
          try {
            document.designMode = "On";
            window.document.execCommand("removeFormat", false, void 0);
            window.document.execCommand("hiliteColor", false, color);
            document.designMode = "Off";
            window.getSelection()?.removeAllRanges();
          } catch (e) {
            console.log(e);
          }
        }, "update")
      };
    }
  }
  __name(highlightRange, "highlightRange");
  function createEmitter(listenerChange = () => void 0) {
    const listeners = /* @__PURE__ */ new Set();
    return {
      fire(data) {
        for (const listener of [...listeners]) {
          listener.fn.call(listener.thisArg, data);
        }
      },
      event(fn, thisArg, disposables) {
        const listenerObj = { fn, thisArg };
        const disposable = {
          dispose: /* @__PURE__ */ __name(() => {
            listeners.delete(listenerObj);
            listenerChange(listeners);
          }, "dispose")
        };
        listeners.add(listenerObj);
        listenerChange(listeners);
        if (disposables instanceof Array) {
          disposables.push(disposable);
        } else if (disposables) {
          disposables.add(disposable);
        }
        return disposable;
      }
    };
  }
  __name(createEmitter, "createEmitter");
  function showRenderError(errorText, outputNode, errors) {
    outputNode.innerText = errorText;
    const errList = document.createElement("ul");
    for (const result of errors) {
      console.error(result);
      const item = document.createElement("li");
      item.innerText = result.message;
      errList.appendChild(item);
    }
    outputNode.appendChild(errList);
  }
  __name(showRenderError, "showRenderError");
  const outputItemRequests = new class {
    _requestPool = 0;
    _requests = /* @__PURE__ */ new Map();
    getOutputItem(outputId, mime) {
      const requestId = this._requestPool++;
      const { promise, resolve } = promiseWithResolvers();
      this._requests.set(requestId, { resolve });
      postNotebookMessage("getOutputItem", { requestId, outputId, mime });
      return promise;
    }
    resolveOutputItem(requestId, output) {
      const request = this._requests.get(requestId);
      if (!request) {
        return;
      }
      this._requests.delete(requestId);
      request.resolve(output);
    }
  }();
  let hasWarnedAboutAllOutputItemsProposal = false;
  function createOutputItem(id, mime, metadata, valueBytes, allOutputItemData, appended) {
    function create(id2, mime2, metadata2, valueBytes2, appended2) {
      return Object.freeze({
        id: id2,
        mime: mime2,
        metadata: metadata2,
        appendedText() {
          if (appended2) {
            return textDecoder.decode(appended2.valueBytes);
          }
          return void 0;
        },
        data() {
          return valueBytes2;
        },
        text() {
          return textDecoder.decode(valueBytes2);
        },
        json() {
          return JSON.parse(this.text());
        },
        blob() {
          return new Blob([valueBytes2], { type: this.mime });
        },
        get _allOutputItems() {
          if (!hasWarnedAboutAllOutputItemsProposal) {
            hasWarnedAboutAllOutputItemsProposal = true;
            console.warn(`'_allOutputItems' is proposed API. DO NOT ship an extension that depends on it!`);
          }
          return allOutputItemList;
        }
      });
    }
    __name(create, "create");
    const allOutputItemCache = /* @__PURE__ */ new Map();
    const allOutputItemList = Object.freeze(allOutputItemData.map((outputItem) => {
      const mime2 = outputItem.mime;
      return Object.freeze({
        mime: mime2,
        getItem() {
          const existingTask = allOutputItemCache.get(mime2);
          if (existingTask) {
            return existingTask;
          }
          const task = outputItemRequests.getOutputItem(id, mime2).then((item2) => {
            return item2 ? create(id, item2.mime, metadata, item2.valueBytes) : void 0;
          });
          allOutputItemCache.set(mime2, task);
          return task;
        }
      });
    }));
    const item = create(id, mime, metadata, valueBytes, appended);
    allOutputItemCache.set(mime, Promise.resolve(item));
    return item;
  }
  __name(createOutputItem, "createOutputItem");
  const onDidReceiveKernelMessage = createEmitter();
  const ttPolicy = window.trustedTypes?.createPolicy("notebookRenderer", {
    createHTML: /* @__PURE__ */ __name((value) => value, "createHTML"),
    // CodeQL [SM03712] The rendered content is provided by renderer extensions, which are responsible for sanitizing their content themselves. The notebook webview is also sandboxed.
    createScript: /* @__PURE__ */ __name((value) => value, "createScript")
    // CodeQL [SM03712] The rendered content is provided by renderer extensions, which are responsible for sanitizing their content themselves. The notebook webview is also sandboxed.
  });
  window.addEventListener("wheel", handleWheel);
  const matchColor = window.getComputedStyle(window.document.getElementById("_defaultColorPalatte")).color;
  const currentMatchColor = window.getComputedStyle(window.document.getElementById("_defaultColorPalatte")).backgroundColor;
  class JSHighlighter {
    static {
      __name(this, "JSHighlighter");
    }
    _activeHighlightInfo;
    constructor() {
      this._activeHighlightInfo = /* @__PURE__ */ new Map();
    }
    addHighlights(matches, ownerID) {
      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const ret = highlightRange(match.originalRange, true, "mark", match.isShadow ? {
          "style": "background-color: " + matchColor + ";"
        } : {
          "class": "find-match"
        });
        match.highlightResult = ret;
      }
      const highlightInfo = {
        matches,
        currentMatchIndex: -1
      };
      this._activeHighlightInfo.set(ownerID, highlightInfo);
    }
    removeHighlights(ownerID) {
      this._activeHighlightInfo.get(ownerID)?.matches.forEach((match) => {
        match.highlightResult?.dispose();
      });
      this._activeHighlightInfo.delete(ownerID);
    }
    highlightCurrentMatch(index, ownerID) {
      const highlightInfo = this._activeHighlightInfo.get(ownerID);
      if (!highlightInfo) {
        console.error("Modified current highlight match before adding highlight list.");
        return;
      }
      const oldMatch = highlightInfo.matches[highlightInfo.currentMatchIndex];
      oldMatch?.highlightResult?.update(matchColor, oldMatch.isShadow ? void 0 : "find-match");
      const match = highlightInfo.matches[index];
      highlightInfo.currentMatchIndex = index;
      const sel = window.getSelection();
      if (!!match && !!sel && match.highlightResult) {
        let offset = 0;
        try {
          const outputOffset = window.document.getElementById(match.id).getBoundingClientRect().top;
          const tempRange = document.createRange();
          tempRange.selectNode(match.highlightResult.range.startContainer);
          match.highlightResult.range.startContainer.parentElement?.scrollIntoView({ behavior: "auto", block: "end", inline: "nearest" });
          const rangeOffset = tempRange.getBoundingClientRect().top;
          tempRange.detach();
          offset = rangeOffset - outputOffset;
        } catch (e) {
          console.error(e);
        }
        match.highlightResult?.update(currentMatchColor, match.isShadow ? void 0 : "current-find-match");
        window.document.getSelection()?.removeAllRanges();
        postNotebookMessage("didFindHighlightCurrent", {
          offset
        });
      }
    }
    unHighlightCurrentMatch(index, ownerID) {
      const highlightInfo = this._activeHighlightInfo.get(ownerID);
      if (!highlightInfo) {
        return;
      }
      const oldMatch = highlightInfo.matches[index];
      if (oldMatch && oldMatch.highlightResult) {
        oldMatch.highlightResult.update(matchColor, oldMatch.isShadow ? void 0 : "find-match");
      }
    }
    dispose() {
      window.document.getSelection()?.removeAllRanges();
      this._activeHighlightInfo.forEach((highlightInfo) => {
        highlightInfo.matches.forEach((match) => {
          match.highlightResult?.dispose();
        });
      });
    }
  }
  class CSSHighlighter {
    static {
      __name(this, "CSSHighlighter");
    }
    _activeHighlightInfo;
    _matchesHighlight;
    _currentMatchesHighlight;
    constructor() {
      this._activeHighlightInfo = /* @__PURE__ */ new Map();
      this._matchesHighlight = new Highlight();
      this._matchesHighlight.priority = 1;
      this._currentMatchesHighlight = new Highlight();
      this._currentMatchesHighlight.priority = 2;
      CSS.highlights?.set(`find-highlight`, this._matchesHighlight);
      CSS.highlights?.set(`current-find-highlight`, this._currentMatchesHighlight);
    }
    _refreshRegistry(updateMatchesHighlight = true) {
      if (updateMatchesHighlight) {
        this._matchesHighlight.clear();
      }
      this._currentMatchesHighlight.clear();
      this._activeHighlightInfo.forEach((highlightInfo) => {
        if (updateMatchesHighlight) {
          for (let i = 0; i < highlightInfo.matches.length; i++) {
            this._matchesHighlight.add(highlightInfo.matches[i].originalRange);
          }
        }
        if (highlightInfo.currentMatchIndex < highlightInfo.matches.length && highlightInfo.currentMatchIndex >= 0) {
          this._currentMatchesHighlight.add(highlightInfo.matches[highlightInfo.currentMatchIndex].originalRange);
        }
      });
    }
    addHighlights(matches, ownerID) {
      for (let i = 0; i < matches.length; i++) {
        this._matchesHighlight.add(matches[i].originalRange);
      }
      const newEntry = {
        matches,
        currentMatchIndex: -1
      };
      this._activeHighlightInfo.set(ownerID, newEntry);
    }
    highlightCurrentMatch(index, ownerID) {
      const highlightInfo = this._activeHighlightInfo.get(ownerID);
      if (!highlightInfo) {
        console.error("Modified current highlight match before adding highlight list.");
        return;
      }
      highlightInfo.currentMatchIndex = index;
      const match = highlightInfo.matches[index];
      if (match) {
        let offset = 0;
        try {
          const outputOffset = window.document.getElementById(match.id).getBoundingClientRect().top;
          match.originalRange.startContainer.parentElement?.scrollIntoView({ behavior: "auto", block: "end", inline: "nearest" });
          const rangeOffset = match.originalRange.getBoundingClientRect().top;
          offset = rangeOffset - outputOffset;
          postNotebookMessage("didFindHighlightCurrent", {
            offset
          });
        } catch (e) {
          console.error(e);
        }
      }
      this._refreshRegistry(false);
    }
    unHighlightCurrentMatch(index, ownerID) {
      const highlightInfo = this._activeHighlightInfo.get(ownerID);
      if (!highlightInfo) {
        return;
      }
      highlightInfo.currentMatchIndex = -1;
    }
    removeHighlights(ownerID) {
      this._activeHighlightInfo.delete(ownerID);
      this._refreshRegistry();
    }
    dispose() {
      window.document.getSelection()?.removeAllRanges();
      this._currentMatchesHighlight.clear();
      this._matchesHighlight.clear();
    }
  }
  const _highlighter = CSS.highlights ? new CSSHighlighter() : new JSHighlighter();
  function extractSelectionLine(selection) {
    const range = selection.getRangeAt(0);
    const oldRange = range.cloneRange();
    const captureLength = selection.toString().length;
    selection.collapseToStart();
    selection.modify("move", "backward", "lineboundary");
    selection.modify("extend", "forward", "lineboundary");
    const line = selection.toString();
    const rangeStart = getStartOffset(selection.getRangeAt(0), oldRange);
    const lineRange = {
      start: rangeStart,
      end: rangeStart + captureLength
    };
    selection.removeAllRanges();
    selection.addRange(oldRange);
    return { line, range: lineRange };
  }
  __name(extractSelectionLine, "extractSelectionLine");
  function getStartOffset(lineRange, originalRange) {
    const firstCommonAncestor = findFirstCommonAncestor(lineRange.startContainer, originalRange.startContainer);
    const selectionOffset = getSelectionOffsetRelativeTo(firstCommonAncestor, lineRange.startContainer) + lineRange.startOffset;
    const textOffset = getSelectionOffsetRelativeTo(firstCommonAncestor, originalRange.startContainer) + originalRange.startOffset;
    return textOffset - selectionOffset;
  }
  __name(getStartOffset, "getStartOffset");
  function findFirstCommonAncestor(nodeA, nodeB) {
    const range = new Range();
    range.setStart(nodeA, 0);
    range.setEnd(nodeB, 0);
    return range.commonAncestorContainer;
  }
  __name(findFirstCommonAncestor, "findFirstCommonAncestor");
  function getTextContentLength(node) {
    let length = 0;
    if (node.nodeType === Node.TEXT_NODE) {
      length += node.textContent?.length || 0;
    } else {
      for (const childNode of node.childNodes) {
        length += getTextContentLength(childNode);
      }
    }
    return length;
  }
  __name(getTextContentLength, "getTextContentLength");
  function getSelectionOffsetRelativeTo(parentElement, currentNode) {
    if (!currentNode) {
      return 0;
    }
    let offset = 0;
    if (currentNode === parentElement || !parentElement.contains(currentNode)) {
      return offset;
    }
    let prevSibling = currentNode.previousSibling;
    while (prevSibling) {
      offset += getTextContentLength(prevSibling);
      prevSibling = prevSibling.previousSibling;
    }
    return offset + getSelectionOffsetRelativeTo(parentElement, currentNode.parentNode);
  }
  __name(getSelectionOffsetRelativeTo, "getSelectionOffsetRelativeTo");
  const find = /* @__PURE__ */ __name((query, options) => {
    let find2 = true;
    let matches = [];
    const range = document.createRange();
    range.selectNodeContents(window.document.getElementById("findStart"));
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    viewModel.toggleDragDropEnabled(false);
    try {
      document.designMode = "On";
      while (find2 && matches.length < 500) {
        find2 = window.find(
          query,
          /* caseSensitive*/
          !!options.caseSensitive,
          /* backwards*/
          false,
          /* wrapAround*/
          false,
          /* wholeWord */
          !!options.wholeWord,
          /* searchInFrames*/
          true,
          false
        );
        if (find2) {
          const selection = window.getSelection();
          if (!selection) {
            console.log("no selection");
            break;
          }
          if (options.includeMarkup && selection.rangeCount > 0 && selection.getRangeAt(0).startContainer.nodeType === 1 && selection.getRangeAt(0).startContainer.classList.contains("markup")) {
            const preview = selection.anchorNode?.firstChild;
            const root = preview.shadowRoot;
            const shadowSelection = root?.getSelection ? root?.getSelection() : null;
            if (shadowSelection && shadowSelection.anchorNode) {
              matches.push({
                type: "preview",
                id: preview.id,
                cellId: preview.id,
                container: preview,
                isShadow: true,
                originalRange: shadowSelection.getRangeAt(0),
                searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(shadowSelection) : void 0
              });
            }
          }
          if (options.includeOutput && selection.rangeCount > 0 && selection.getRangeAt(0).startContainer.nodeType === 1 && selection.getRangeAt(0).startContainer.classList.contains("output_container")) {
            const cellId = selection.getRangeAt(0).startContainer.parentElement.id;
            const outputNode = selection.anchorNode?.firstChild;
            const root = outputNode.shadowRoot;
            const shadowSelection = root?.getSelection ? root?.getSelection() : null;
            if (shadowSelection && shadowSelection.anchorNode) {
              matches.push({
                type: "output",
                id: outputNode.id,
                cellId,
                container: outputNode,
                isShadow: true,
                originalRange: shadowSelection.getRangeAt(0),
                searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(shadowSelection) : void 0
              });
            }
          }
          const anchorNode = selection.anchorNode?.parentElement;
          if (anchorNode) {
            const lastEl = matches.length ? matches[matches.length - 1] : null;
            if (lastEl && lastEl.container.contains(anchorNode) && options.includeOutput) {
              matches.push({
                type: lastEl.type,
                id: lastEl.id,
                cellId: lastEl.cellId,
                container: lastEl.container,
                isShadow: false,
                originalRange: selection.getRangeAt(0),
                searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(selection) : void 0
              });
            } else {
              for (let node = anchorNode; node; node = node.parentElement) {
                if (!(node instanceof Element)) {
                  break;
                }
                if (node.classList.contains("output") && options.includeOutput) {
                  const cellId = node.parentElement?.parentElement?.id;
                  if (cellId) {
                    matches.push({
                      type: "output",
                      id: node.id,
                      cellId,
                      container: node,
                      isShadow: false,
                      originalRange: selection.getRangeAt(0),
                      searchPreviewInfo: options.shouldGetSearchPreviewInfo ? extractSelectionLine(selection) : void 0
                    });
                  }
                  break;
                }
                if (node.id === "container" || node === window.document.body) {
                  break;
                }
              }
            }
          } else {
            break;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    matches = matches.filter((match) => options.findIds.length ? options.findIds.includes(match.cellId) : true);
    _highlighter.addHighlights(matches, options.ownerID);
    window.document.getSelection()?.removeAllRanges();
    viewModel.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
    document.designMode = "Off";
    postNotebookMessage("didFind", {
      matches: matches.map((match, index) => ({
        type: match.type,
        id: match.id,
        cellId: match.cellId,
        index,
        searchPreviewInfo: match.searchPreviewInfo
      }))
    });
  }, "find");
  const copyOutputImage = /* @__PURE__ */ __name(async (outputId, altOutputId, retries = 5) => {
    if (!window.document.hasFocus() && retries > 0) {
      setTimeout(() => {
        copyOutputImage(outputId, altOutputId, retries - 1);
      }, 50);
      return;
    }
    try {
      const outputElement = window.document.getElementById(outputId) ?? window.document.getElementById(altOutputId);
      let image = outputElement?.querySelector("img");
      if (!image) {
        const svgImage = outputElement?.querySelector("svg.output-image") ?? outputElement?.querySelector("div.svgContainerStyle > svg");
        if (svgImage) {
          image = new Image();
          image.src = "data:image/svg+xml," + encodeURIComponent(svgImage.outerHTML);
        }
      }
      if (image) {
        const imageToCopy = image;
        await navigator.clipboard.write([new ClipboardItem({
          "image/png": new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            canvas.width = imageToCopy.naturalWidth;
            canvas.height = imageToCopy.naturalHeight;
            const context = canvas.getContext("2d");
            context.drawImage(imageToCopy, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                console.error("No blob data to write to clipboard");
              }
              canvas.remove();
            }, "image/png");
          })
        })]);
      } else {
        console.error("Could not find image element to copy for output with id", outputId);
      }
    } catch (e) {
      console.error("Could not copy image:", e);
    }
  }, "copyOutputImage");
  window.addEventListener("message", async (rawEvent) => {
    const event = rawEvent;
    switch (event.data.type) {
      case "initializeMarkup": {
        try {
          await Promise.all(event.data.cells.map((info) => viewModel.ensureMarkupCell(info)));
        } finally {
          dimensionUpdater.updateImmediately();
          postNotebookMessage("initializedMarkup", { requestId: event.data.requestId });
        }
        break;
      }
      case "createMarkupCell":
        viewModel.ensureMarkupCell(event.data.cell);
        break;
      case "showMarkupCell":
        viewModel.showMarkupCell(event.data.id, event.data.top, event.data.content, event.data.metadata);
        break;
      case "hideMarkupCells":
        for (const id of event.data.ids) {
          viewModel.hideMarkupCell(id);
        }
        break;
      case "unhideMarkupCells":
        for (const id of event.data.ids) {
          viewModel.unhideMarkupCell(id);
        }
        break;
      case "deleteMarkupCell":
        for (const id of event.data.ids) {
          viewModel.deleteMarkupCell(id);
        }
        break;
      case "updateSelectedMarkupCells":
        viewModel.updateSelectedCells(event.data.selectedCellIds);
        break;
      case "html": {
        const data = event.data;
        if (data.createOnIdle) {
          outputRunner.enqueueIdle(data.outputId, (signal) => {
            return viewModel.renderOutputCell(data, signal);
          });
        } else {
          outputRunner.enqueue(data.outputId, (signal) => {
            return viewModel.renderOutputCell(data, signal);
          });
        }
        break;
      }
      case "view-scroll": {
        event.data.widgets.forEach((widget) => {
          outputRunner.enqueue(widget.outputId, () => {
            viewModel.updateOutputsScroll([widget]);
          });
        });
        viewModel.updateMarkupScrolls(event.data.markupCells);
        break;
      }
      case "clear":
        renderers.clearAll();
        viewModel.clearAll();
        window.document.getElementById("container").innerText = "";
        break;
      case "clearOutput": {
        const { cellId, rendererId, outputId } = event.data;
        outputRunner.cancelOutput(outputId);
        viewModel.clearOutput(cellId, outputId, rendererId);
        break;
      }
      case "hideOutput": {
        const { cellId, outputId } = event.data;
        outputRunner.enqueue(outputId, () => {
          viewModel.hideOutput(cellId);
        });
        break;
      }
      case "showOutput": {
        const { outputId, cellTop, cellId, content } = event.data;
        outputRunner.enqueue(outputId, () => {
          viewModel.showOutput(cellId, outputId, cellTop);
          if (content) {
            viewModel.updateAndRerender(cellId, outputId, content);
          }
        });
        break;
      }
      case "copyImage": {
        await copyOutputImage(event.data.outputId, event.data.altOutputId);
        break;
      }
      case "ack-dimension": {
        for (const { cellId, outputId, height } of event.data.updates) {
          viewModel.updateOutputHeight(cellId, outputId, height);
        }
        break;
      }
      case "preload": {
        const resources = event.data.resources;
        for (const { uri } of resources) {
          kernelPreloads.load(uri);
        }
        break;
      }
      case "updateRenderers": {
        const { rendererData } = event.data;
        renderers.updateRendererData(rendererData);
        break;
      }
      case "focus-output":
        focusFirstFocusableOrContainerInOutput(event.data.cellOrOutputId, event.data.alternateId);
        break;
      case "blur-output":
        blurOutput();
        break;
      case "select-output-contents":
        selectOutputContents(event.data.cellOrOutputId);
        break;
      case "select-input-contents":
        selectInputContents(event.data.cellOrOutputId);
        break;
      case "decorations": {
        let outputContainer = window.document.getElementById(event.data.cellId);
        if (!outputContainer) {
          viewModel.ensureOutputCell(event.data.cellId, -1e5, true);
          outputContainer = window.document.getElementById(event.data.cellId);
        }
        outputContainer?.classList.add(...event.data.addedClassNames);
        outputContainer?.classList.remove(...event.data.removedClassNames);
        break;
      }
      case "customKernelMessage":
        onDidReceiveKernelMessage.fire(event.data.message);
        break;
      case "customRendererMessage":
        renderers.getRenderer(event.data.rendererId)?.receiveMessage(event.data.message);
        break;
      case "notebookStyles": {
        const documentStyle = window.document.documentElement.style;
        for (let i = documentStyle.length - 1; i >= 0; i--) {
          const property = documentStyle[i];
          if (property && property.startsWith("--notebook-")) {
            documentStyle.removeProperty(property);
          }
        }
        for (const [name, value] of Object.entries(event.data.styles)) {
          documentStyle.setProperty(`--${name}`, value);
        }
        break;
      }
      case "notebookOptions":
        currentOptions = event.data.options;
        viewModel.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
        currentRenderOptions = event.data.renderOptions;
        settingChange.fire(currentRenderOptions);
        break;
      case "tokenizedCodeBlock": {
        const { codeBlockId, html } = event.data;
        MarkdownCodeBlock.highlightCodeBlock(codeBlockId, html);
        break;
      }
      case "tokenizedStylesChanged": {
        tokenizationStyle.replaceSync(event.data.css);
        break;
      }
      case "find": {
        _highlighter.removeHighlights(event.data.options.ownerID);
        find(event.data.query, event.data.options);
        break;
      }
      case "findHighlightCurrent": {
        _highlighter?.highlightCurrentMatch(event.data.index, event.data.ownerID);
        break;
      }
      case "findUnHighlightCurrent": {
        _highlighter?.unHighlightCurrentMatch(event.data.index, event.data.ownerID);
        break;
      }
      case "findStop": {
        _highlighter.removeHighlights(event.data.ownerID);
        break;
      }
      case "returnOutputItem": {
        outputItemRequests.resolveOutputItem(event.data.requestId, event.data.output);
      }
    }
  });
  const renderFallbackErrorName = "vscode.fallbackToNextRenderer";
  class Renderer {
    constructor(data) {
      this.data = data;
    }
    static {
      __name(this, "Renderer");
    }
    _onMessageEvent = createEmitter();
    _loadPromise;
    _api;
    receiveMessage(message) {
      this._onMessageEvent.fire(message);
    }
    async renderOutputItem(item, element, signal) {
      try {
        await this.load();
      } catch (e) {
        if (!signal.aborted) {
          showRenderError(`Error loading renderer '${this.data.id}'`, element, e instanceof Error ? [e] : []);
        }
        return;
      }
      if (!this._api) {
        if (!signal.aborted) {
          showRenderError(`Renderer '${this.data.id}' does not implement renderOutputItem`, element, []);
        }
        return;
      }
      try {
        const renderStart = performance.now();
        await this._api.renderOutputItem(item, element, signal);
        this.postDebugMessage("Rendered output item", { id: item.id, duration: `${performance.now() - renderStart}ms` });
      } catch (e) {
        if (signal.aborted) {
          return;
        }
        if (e instanceof Error && e.name === renderFallbackErrorName) {
          throw e;
        }
        showRenderError(`Error rendering output item using '${this.data.id}'`, element, e instanceof Error ? [e] : []);
        this.postDebugMessage("Rendering output item failed", { id: item.id, error: e + "" });
      }
    }
    disposeOutputItem(id) {
      this._api?.disposeOutputItem?.(id);
    }
    createRendererContext() {
      const { id, messaging } = this.data;
      const context = {
        setState: /* @__PURE__ */ __name((newState) => vscode.setState({ ...vscode.getState(), [id]: newState }), "setState"),
        getState: /* @__PURE__ */ __name(() => {
          const state = vscode.getState();
          return typeof state === "object" && state ? state[id] : void 0;
        }, "getState"),
        getRenderer: /* @__PURE__ */ __name(async (id2) => {
          const renderer = renderers.getRenderer(id2);
          if (!renderer) {
            return void 0;
          }
          if (renderer._api) {
            return renderer._api;
          }
          return renderer.load();
        }, "getRenderer"),
        workspace: {
          get isTrusted() {
            return isWorkspaceTrusted;
          }
        },
        settings: {
          get lineLimit() {
            return currentRenderOptions.lineLimit;
          },
          get outputScrolling() {
            return currentRenderOptions.outputScrolling;
          },
          get outputWordWrap() {
            return currentRenderOptions.outputWordWrap;
          },
          get linkifyFilePaths() {
            return currentRenderOptions.linkifyFilePaths;
          },
          get minimalError() {
            return currentRenderOptions.minimalError;
          }
        },
        get onDidChangeSettings() {
          return settingChange.event;
        }
      };
      if (messaging) {
        context.onDidReceiveMessage = this._onMessageEvent.event;
        context.postMessage = (message) => postNotebookMessage("customRendererMessage", { rendererId: id, message });
      }
      return Object.freeze(context);
    }
    load() {
      this._loadPromise ??= this._load();
      return this._loadPromise;
    }
    /** Inner function cached in the _loadPromise(). */
    async _load() {
      this.postDebugMessage("Start loading renderer");
      try {
        await kernelPreloads.waitForAllCurrent();
        const importStart = performance.now();
        const module = await __import(this.data.entrypoint.path);
        this.postDebugMessage("Imported renderer", { duration: `${performance.now() - importStart}ms` });
        if (!module) {
          return;
        }
        this._api = await module.activate(this.createRendererContext());
        this.postDebugMessage("Activated renderer", { duration: `${performance.now() - importStart}ms` });
        const dependantRenderers = ctx.rendererData.filter((d) => d.entrypoint.extends === this.data.id);
        if (dependantRenderers.length) {
          this.postDebugMessage("Activating dependant renderers", { dependents: dependantRenderers.map((x) => x.id).join(", ") });
        }
        await Promise.all(dependantRenderers.map(async (d) => {
          const renderer = renderers.getRenderer(d.id);
          if (!renderer) {
            throw new Error(`Could not find extending renderer: ${d.id}`);
          }
          try {
            return await renderer.load();
          } catch (e) {
            console.error(e);
            this.postDebugMessage("Activating dependant renderer failed", { dependent: d.id, error: e + "" });
            return void 0;
          }
        }));
        return this._api;
      } catch (e) {
        this.postDebugMessage("Loading renderer failed");
        throw e;
      }
    }
    postDebugMessage(msg, data) {
      postNotebookMessage("logRendererDebugMessage", {
        message: `[renderer ${this.data.id}] - ${msg}`,
        data
      });
    }
  }
  const kernelPreloads = new class {
    preloads = /* @__PURE__ */ new Map();
    /**
     * Returns a promise that resolves when the given preload is activated.
     */
    waitFor(uri) {
      return this.preloads.get(uri) || Promise.resolve(new Error(`Preload not ready: ${uri}`));
    }
    /**
     * Loads a preload.
     * @param uri URI to load from
     * @param originalUri URI to show in an error message if the preload is invalid.
     */
    load(uri) {
      const promise = Promise.all([
        runKernelPreload(uri),
        this.waitForAllCurrent()
      ]);
      this.preloads.set(uri, promise);
      return promise;
    }
    /**
     * Returns a promise that waits for all currently-registered preloads to
     * activate before resolving.
     */
    waitForAllCurrent() {
      return Promise.all([...this.preloads.values()].map((p) => p.catch((err) => err)));
    }
  }();
  const outputRunner = new class {
    outputs = /* @__PURE__ */ new Map();
    /**
     * Pushes the action onto the list of actions for the given output ID,
     * ensuring that it's run in-order.
     */
    enqueue(outputId, action) {
      this.pendingOutputCreationRequest.get(outputId)?.dispose();
      this.pendingOutputCreationRequest.delete(outputId);
      const record = this.outputs.get(outputId);
      if (!record) {
        const controller = new AbortController();
        this.outputs.set(outputId, { abort: controller, queue: new Promise((r) => r(action(controller.signal))) });
      } else {
        record.queue = record.queue.then(async (r) => {
          if (!record.abort.signal.aborted) {
            await action(record.abort.signal);
          }
        });
      }
    }
    pendingOutputCreationRequest = /* @__PURE__ */ new Map();
    enqueueIdle(outputId, action) {
      this.pendingOutputCreationRequest.get(outputId)?.dispose();
      outputRunner.pendingOutputCreationRequest.set(outputId, runWhenIdle(() => {
        outputRunner.enqueue(outputId, action);
        outputRunner.pendingOutputCreationRequest.delete(outputId);
      }));
    }
    /**
     * Cancels the rendering of all outputs.
     */
    cancelAll() {
      this.pendingOutputCreationRequest.forEach((r) => r.dispose());
      this.pendingOutputCreationRequest.clear();
      for (const { abort } of this.outputs.values()) {
        abort.abort();
      }
      this.outputs.clear();
    }
    /**
     * Cancels any ongoing rendering out an output.
     */
    cancelOutput(outputId) {
      this.pendingOutputCreationRequest.get(outputId)?.dispose();
      this.pendingOutputCreationRequest.delete(outputId);
      const output = this.outputs.get(outputId);
      if (output) {
        output.abort.abort();
        this.outputs.delete(outputId);
      }
    }
  }();
  const renderers = new class {
    _renderers = /* @__PURE__ */ new Map();
    constructor() {
      for (const renderer of ctx.rendererData) {
        this.addRenderer(renderer);
      }
    }
    getRenderer(id) {
      return this._renderers.get(id);
    }
    rendererEqual(a, b) {
      if (a.id !== b.id || a.entrypoint.path !== b.entrypoint.path || a.entrypoint.extends !== b.entrypoint.extends || a.messaging !== b.messaging) {
        return false;
      }
      if (a.mimeTypes.length !== b.mimeTypes.length) {
        return false;
      }
      for (let i = 0; i < a.mimeTypes.length; i++) {
        if (a.mimeTypes[i] !== b.mimeTypes[i]) {
          return false;
        }
      }
      return true;
    }
    updateRendererData(rendererData) {
      const oldKeys = new Set(this._renderers.keys());
      const newKeys = new Set(rendererData.map((d) => d.id));
      for (const renderer of rendererData) {
        const existing = this._renderers.get(renderer.id);
        if (existing && this.rendererEqual(existing.data, renderer)) {
          continue;
        }
        this.addRenderer(renderer);
      }
      for (const key of oldKeys) {
        if (!newKeys.has(key)) {
          this._renderers.delete(key);
        }
      }
    }
    addRenderer(renderer) {
      this._renderers.set(renderer.id, new Renderer(renderer));
    }
    clearAll() {
      outputRunner.cancelAll();
      for (const renderer of this._renderers.values()) {
        renderer.disposeOutputItem();
      }
    }
    clearOutput(rendererId, outputId) {
      outputRunner.cancelOutput(outputId);
      this._renderers.get(rendererId)?.disposeOutputItem(outputId);
    }
    async render(item, preferredRendererId, element, signal) {
      const primaryRenderer = this.findRenderer(preferredRendererId, item);
      if (!primaryRenderer) {
        const errorMessage2 = (window.document.documentElement.style.getPropertyValue("--notebook-cell-renderer-not-found-error") || "").replace("$0", () => item.mime);
        this.showRenderError(item, element, errorMessage2);
        return;
      }
      if (!(await this._doRender(item, element, primaryRenderer, signal)).continue) {
        return;
      }
      for (const additionalItemData of item._allOutputItems) {
        if (additionalItemData.mime === item.mime) {
          continue;
        }
        const additionalItem = await additionalItemData.getItem();
        if (signal.aborted) {
          return;
        }
        if (additionalItem) {
          const renderer = this.findRenderer(void 0, additionalItem);
          if (renderer) {
            if (!(await this._doRender(additionalItem, element, renderer, signal)).continue) {
              return;
            }
          }
        }
      }
      const errorMessage = (window.document.documentElement.style.getPropertyValue("--notebook-cell-renderer-fallbacks-exhausted") || "").replace("$0", () => item.mime);
      this.showRenderError(item, element, errorMessage);
    }
    async _doRender(item, element, renderer, signal) {
      try {
        await renderer.renderOutputItem(item, element, signal);
        return { continue: false };
      } catch (e) {
        if (signal.aborted) {
          return { continue: false };
        }
        if (e instanceof Error && e.name === renderFallbackErrorName) {
          return { continue: true };
        } else {
          throw e;
        }
      }
    }
    findRenderer(preferredRendererId, info) {
      let renderer;
      if (typeof preferredRendererId === "string") {
        renderer = Array.from(this._renderers.values()).find((renderer2) => renderer2.data.id === preferredRendererId);
      } else {
        const renderers2 = Array.from(this._renderers.values()).filter((renderer2) => renderer2.data.mimeTypes.includes(info.mime) && !renderer2.data.entrypoint.extends);
        if (renderers2.length) {
          renderers2.sort((a, b) => +a.data.isBuiltin - +b.data.isBuiltin);
          renderer = renderers2[0];
        }
      }
      return renderer;
    }
    showRenderError(info, element, errorMessage) {
      const errorContainer = document.createElement("div");
      const error = document.createElement("div");
      error.className = "no-renderer-error";
      error.innerText = errorMessage;
      const cellText = document.createElement("div");
      cellText.innerText = info.text();
      errorContainer.appendChild(error);
      errorContainer.appendChild(cellText);
      element.innerText = "";
      element.appendChild(errorContainer);
    }
  }();
  const viewModel = new class ViewModel {
    static {
      __name(this, "ViewModel");
    }
    _markupCells = /* @__PURE__ */ new Map();
    _outputCells = /* @__PURE__ */ new Map();
    clearAll() {
      for (const cell of this._markupCells.values()) {
        cell.dispose();
      }
      this._markupCells.clear();
      for (const output of this._outputCells.values()) {
        output.dispose();
      }
      this._outputCells.clear();
    }
    async createMarkupCell(init, top, visible) {
      const existing = this._markupCells.get(init.cellId);
      if (existing) {
        console.error(`Trying to create markup that already exists: ${init.cellId}`);
        return existing;
      }
      const cell = new MarkupCell(init.cellId, init.mime, init.content, top, init.metadata);
      cell.element.style.visibility = visible ? "" : "hidden";
      this._markupCells.set(init.cellId, cell);
      await cell.ready;
      return cell;
    }
    async ensureMarkupCell(info) {
      let cell = this._markupCells.get(info.cellId);
      if (cell) {
        cell.element.style.visibility = info.visible ? "" : "hidden";
        await cell.updateContentAndRender(info.content, info.metadata);
      } else {
        cell = await this.createMarkupCell(info, info.offset, info.visible);
      }
    }
    deleteMarkupCell(id) {
      const cell = this.getExpectedMarkupCell(id);
      if (cell) {
        cell.remove();
        cell.dispose();
        this._markupCells.delete(id);
      }
    }
    async updateMarkupContent(id, newContent, metadata) {
      const cell = this.getExpectedMarkupCell(id);
      await cell?.updateContentAndRender(newContent, metadata);
    }
    showMarkupCell(id, top, newContent, metadata) {
      const cell = this.getExpectedMarkupCell(id);
      cell?.show(top, newContent, metadata);
    }
    hideMarkupCell(id) {
      const cell = this.getExpectedMarkupCell(id);
      cell?.hide();
    }
    unhideMarkupCell(id) {
      const cell = this.getExpectedMarkupCell(id);
      cell?.unhide();
    }
    getExpectedMarkupCell(id) {
      const cell = this._markupCells.get(id);
      if (!cell) {
        console.log(`Could not find markup cell '${id}'`);
        return void 0;
      }
      return cell;
    }
    updateSelectedCells(selectedCellIds) {
      const selectedCellSet = new Set(selectedCellIds);
      for (const cell of this._markupCells.values()) {
        cell.setSelected(selectedCellSet.has(cell.id));
      }
    }
    toggleDragDropEnabled(dragAndDropEnabled) {
      for (const cell of this._markupCells.values()) {
        cell.toggleDragDropEnabled(dragAndDropEnabled);
      }
    }
    updateMarkupScrolls(markupCells) {
      for (const { id, top } of markupCells) {
        const cell = this._markupCells.get(id);
        if (cell) {
          cell.element.style.top = `${top}px`;
        }
      }
    }
    async renderOutputCell(data, signal) {
      const preloadErrors = await Promise.all(
        data.requiredPreloads.map((p) => kernelPreloads.waitFor(p.uri).then(() => void 0, (err) => err))
      );
      if (signal.aborted) {
        return;
      }
      const cellOutput = this.ensureOutputCell(data.cellId, data.cellTop, false);
      return cellOutput.renderOutputElement(data, preloadErrors, signal);
    }
    ensureOutputCell(cellId, cellTop, skipCellTopUpdateIfExist) {
      let cell = this._outputCells.get(cellId);
      const existed = !!cell;
      if (!cell) {
        cell = new OutputCell(cellId);
        this._outputCells.set(cellId, cell);
      }
      if (existed && skipCellTopUpdateIfExist) {
        return cell;
      }
      cell.element.style.top = cellTop + "px";
      return cell;
    }
    clearOutput(cellId, outputId, rendererId) {
      const cell = this._outputCells.get(cellId);
      cell?.clearOutput(outputId, rendererId);
    }
    showOutput(cellId, outputId, top) {
      const cell = this._outputCells.get(cellId);
      cell?.show(outputId, top);
    }
    updateAndRerender(cellId, outputId, content) {
      const cell = this._outputCells.get(cellId);
      cell?.updateContentAndRerender(outputId, content);
    }
    hideOutput(cellId) {
      const cell = this._outputCells.get(cellId);
      cell?.hide();
    }
    updateOutputHeight(cellId, outputId, height) {
      const cell = this._outputCells.get(cellId);
      cell?.updateOutputHeight(outputId, height);
    }
    updateOutputsScroll(updates) {
      for (const request of updates) {
        const cell = this._outputCells.get(request.cellId);
        cell?.updateScroll(request);
      }
    }
  }();
  class MarkdownCodeBlock {
    static {
      __name(this, "MarkdownCodeBlock");
    }
    static pendingCodeBlocksToHighlight = /* @__PURE__ */ new Map();
    static highlightCodeBlock(id, html) {
      const el = MarkdownCodeBlock.pendingCodeBlocksToHighlight.get(id);
      if (!el) {
        return;
      }
      const trustedHtml = ttPolicy?.createHTML(html) ?? html;
      el.innerHTML = trustedHtml;
      const root = el.getRootNode();
      if (root instanceof ShadowRoot) {
        if (!root.adoptedStyleSheets.includes(tokenizationStyle)) {
          root.adoptedStyleSheets.push(tokenizationStyle);
        }
      }
    }
    static requestHighlightCodeBlock(root) {
      const codeBlocks = [];
      let i = 0;
      for (const el of root.querySelectorAll(".vscode-code-block")) {
        const lang = el.getAttribute("data-vscode-code-block-lang");
        if (el.textContent && lang) {
          const id = `${Date.now()}-${i++}`;
          codeBlocks.push({ value: el.textContent, lang, id });
          MarkdownCodeBlock.pendingCodeBlocksToHighlight.set(id, el);
        }
      }
      return codeBlocks;
    }
  }
  class MarkupCell {
    static {
      __name(this, "MarkupCell");
    }
    ready;
    id;
    element;
    outputItem;
    /// Internal field that holds text content
    _content;
    _isDisposed = false;
    renderTaskAbort;
    constructor(id, mime, content, top, metadata) {
      const self = this;
      this.id = id;
      this._content = { value: content, version: 0, metadata };
      const { promise, resolve, reject } = promiseWithResolvers();
      this.ready = promise;
      let cachedData;
      this.outputItem = Object.freeze({
        id,
        mime,
        get metadata() {
          return self._content.metadata;
        },
        text: /* @__PURE__ */ __name(() => {
          return this._content.value;
        }, "text"),
        json: /* @__PURE__ */ __name(() => {
          return void 0;
        }, "json"),
        data: /* @__PURE__ */ __name(() => {
          if (cachedData?.version === this._content.version) {
            return cachedData.value;
          }
          const data = textEncoder.encode(this._content.value);
          cachedData = { version: this._content.version, value: data };
          return data;
        }, "data"),
        blob() {
          return new Blob([this.data()], { type: this.mime });
        },
        _allOutputItems: [{
          mime,
          getItem: /* @__PURE__ */ __name(async () => this.outputItem, "getItem")
        }]
      });
      const root = window.document.getElementById("container");
      const markupCell = document.createElement("div");
      markupCell.className = "markup";
      markupCell.style.position = "absolute";
      markupCell.style.width = "100%";
      this.element = document.createElement("div");
      this.element.id = this.id;
      this.element.classList.add("preview");
      this.element.style.position = "absolute";
      this.element.style.top = top + "px";
      this.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
      markupCell.appendChild(this.element);
      root.appendChild(markupCell);
      this.addEventListeners();
      this.updateContentAndRender(this._content.value, this._content.metadata).then(() => {
        if (!this._isDisposed) {
          resizeObserver.observe(this.element, this.id, false, this.id);
        }
        resolve();
      }, () => reject());
    }
    dispose() {
      this._isDisposed = true;
      this.renderTaskAbort?.abort();
      this.renderTaskAbort = void 0;
    }
    addEventListeners() {
      this.element.addEventListener("dblclick", () => {
        postNotebookMessage("toggleMarkupPreview", { cellId: this.id });
      });
      this.element.addEventListener("click", (e) => {
        postNotebookMessage("clickMarkupCell", {
          cellId: this.id,
          altKey: e.altKey,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey
        });
      });
      this.element.addEventListener("contextmenu", (e) => {
        postNotebookMessage("contextMenuMarkupCell", {
          cellId: this.id,
          clientX: e.clientX,
          clientY: e.clientY
        });
      });
      this.element.addEventListener("mouseenter", () => {
        postNotebookMessage("mouseEnterMarkupCell", { cellId: this.id });
      });
      this.element.addEventListener("mouseleave", () => {
        postNotebookMessage("mouseLeaveMarkupCell", { cellId: this.id });
      });
      this.element.addEventListener("dragstart", (e) => {
        markupCellDragManager.startDrag(e, this.id);
      });
      this.element.addEventListener("drag", (e) => {
        markupCellDragManager.updateDrag(e, this.id);
      });
      this.element.addEventListener("dragend", (e) => {
        markupCellDragManager.endDrag(e, this.id);
      });
    }
    async updateContentAndRender(newContent, metadata) {
      this._content = { value: newContent, version: this._content.version + 1, metadata };
      this.renderTaskAbort?.abort();
      const controller = new AbortController();
      this.renderTaskAbort = controller;
      try {
        await renderers.render(this.outputItem, void 0, this.element, this.renderTaskAbort.signal);
      } finally {
        if (this.renderTaskAbort === controller) {
          this.renderTaskAbort = void 0;
        }
      }
      const root = this.element.shadowRoot ?? this.element;
      const html = [];
      for (const child of root.children) {
        switch (child.tagName) {
          case "LINK":
          case "SCRIPT":
          case "STYLE":
            break;
          default:
            html.push(child.outerHTML);
            break;
        }
      }
      const codeBlocks = MarkdownCodeBlock.requestHighlightCodeBlock(root);
      postNotebookMessage("renderedMarkup", {
        cellId: this.id,
        html: html.join(""),
        codeBlocks
      });
      dimensionUpdater.updateHeight(this.id, this.element.offsetHeight, {
        isOutput: false
      });
    }
    show(top, newContent, metadata) {
      this.element.style.visibility = "";
      this.element.style.top = `${top}px`;
      if (typeof newContent === "string" || metadata) {
        this.updateContentAndRender(newContent ?? this._content.value, metadata ?? this._content.metadata);
      } else {
        this.updateMarkupDimensions();
      }
    }
    hide() {
      this.element.style.visibility = "hidden";
    }
    unhide() {
      this.element.style.visibility = "";
      this.updateMarkupDimensions();
    }
    remove() {
      this.element.remove();
    }
    async updateMarkupDimensions() {
      dimensionUpdater.updateHeight(this.id, this.element.offsetHeight, {
        isOutput: false
      });
    }
    setSelected(selected) {
      this.element.classList.toggle("selected", selected);
    }
    toggleDragDropEnabled(enabled) {
      if (enabled) {
        this.element.classList.add("draggable");
        this.element.setAttribute("draggable", "true");
      } else {
        this.element.classList.remove("draggable");
        this.element.removeAttribute("draggable");
      }
    }
  }
  class OutputCell {
    static {
      __name(this, "OutputCell");
    }
    element;
    outputElements = /* @__PURE__ */ new Map();
    constructor(cellId) {
      const container = window.document.getElementById("container");
      const upperWrapperElement = createFocusSink(cellId);
      container.appendChild(upperWrapperElement);
      this.element = document.createElement("div");
      this.element.style.position = "absolute";
      this.element.style.outline = "0";
      this.element.id = cellId;
      this.element.classList.add("cell_container");
      container.appendChild(this.element);
      this.element = this.element;
      const lowerWrapperElement = createFocusSink(cellId, true);
      container.appendChild(lowerWrapperElement);
    }
    dispose() {
      for (const output of this.outputElements.values()) {
        output.dispose();
      }
      this.outputElements.clear();
    }
    createOutputElement(data) {
      let outputContainer = this.outputElements.get(data.outputId);
      if (!outputContainer) {
        outputContainer = new OutputContainer(data.outputId);
        this.element.appendChild(outputContainer.element);
        this.outputElements.set(data.outputId, outputContainer);
      }
      return outputContainer.createOutputElement(data.outputId, data.outputOffset, data.left, data.cellId);
    }
    async renderOutputElement(data, preloadErrors, signal) {
      const startTime = Date.now();
      const outputElement = this.createOutputElement(data);
      await outputElement.render(data.content, data.rendererId, preloadErrors, signal);
      outputElement.element.style.visibility = data.initiallyHidden ? "hidden" : "";
      if (!!data.executionId && !!data.rendererId) {
        let outputSize = void 0;
        let mimeType = void 0;
        if (data.content.type === 1) {
          outputSize = data.content.output.valueBytes.length;
          mimeType = data.content.output.mime;
        }
        postNotebookMessage("notebookPerformanceMessage", {
          cellId: data.cellId,
          executionId: data.executionId,
          duration: Date.now() - startTime,
          rendererId: data.rendererId,
          outputSize,
          mimeType
        });
      }
    }
    clearOutput(outputId, rendererId) {
      const output = this.outputElements.get(outputId);
      output?.clear(rendererId);
      output?.dispose();
      this.outputElements.delete(outputId);
    }
    show(outputId, top) {
      const outputContainer = this.outputElements.get(outputId);
      if (!outputContainer) {
        return;
      }
      this.element.style.visibility = "";
      this.element.style.top = `${top}px`;
    }
    hide() {
      this.element.style.visibility = "hidden";
    }
    updateContentAndRerender(outputId, content) {
      this.outputElements.get(outputId)?.updateContentAndRender(content);
    }
    updateOutputHeight(outputId, height) {
      this.outputElements.get(outputId)?.updateHeight(height);
    }
    updateScroll(request) {
      this.element.style.top = `${request.cellTop}px`;
      const outputElement = this.outputElements.get(request.outputId);
      if (outputElement) {
        outputElement.updateScroll(request.outputOffset);
        if (request.forceDisplay && outputElement.outputNode) {
          outputElement.outputNode.element.style.visibility = "";
        }
      }
      if (request.forceDisplay) {
        this.element.style.visibility = "";
      }
    }
  }
  class OutputContainer {
    constructor(outputId) {
      this.outputId = outputId;
      this.element = document.createElement("div");
      this.element.classList.add("output_container");
      this.element.setAttribute("data-vscode-context", JSON.stringify({ "preventDefaultContextMenuItems": true }));
      this.element.style.position = "absolute";
      this.element.style.overflow = "hidden";
    }
    static {
      __name(this, "OutputContainer");
    }
    element;
    _outputNode;
    get outputNode() {
      return this._outputNode;
    }
    dispose() {
      this._outputNode?.dispose();
    }
    clear(rendererId) {
      if (rendererId) {
        renderers.clearOutput(rendererId, this.outputId);
      }
      this.element.remove();
    }
    updateHeight(height) {
      this.element.style.maxHeight = `${height}px`;
      this.element.style.height = `${height}px`;
    }
    updateScroll(outputOffset) {
      this.element.style.top = `${outputOffset}px`;
    }
    createOutputElement(outputId, outputOffset, left, cellId) {
      this.element.innerText = "";
      this.element.style.maxHeight = "0px";
      this.element.style.top = `${outputOffset}px`;
      this._outputNode?.dispose();
      this._outputNode = new OutputElement(outputId, left, cellId);
      this.element.appendChild(this._outputNode.element);
      return this._outputNode;
    }
    updateContentAndRender(content) {
      this._outputNode?.updateAndRerender(content);
    }
  }
  vscode.postMessage({
    __vscode_notebook_message: true,
    type: "initialized"
  });
  for (const preload of ctx.staticPreloadsData) {
    kernelPreloads.load(preload.entrypoint);
  }
  function postNotebookMessage(type, properties) {
    vscode.postMessage({
      __vscode_notebook_message: true,
      type,
      ...properties
    });
  }
  __name(postNotebookMessage, "postNotebookMessage");
  class OutputElement {
    constructor(outputId, left, cellId) {
      this.outputId = outputId;
      this.cellId = cellId;
      this.element = document.createElement("div");
      this.element.id = outputId;
      this.element.classList.add("output");
      this.element.style.position = "absolute";
      this.element.style.top = `0px`;
      this.element.style.left = left + "px";
      this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
      this.element.addEventListener("mouseenter", () => {
        postNotebookMessage("mouseenter", { id: outputId });
      });
      this.element.addEventListener("mouseleave", () => {
        postNotebookMessage("mouseleave", { id: outputId });
      });
    }
    static {
      __name(this, "OutputElement");
    }
    element;
    _content;
    hasResizeObserver = false;
    renderTaskAbort;
    dispose() {
      this.renderTaskAbort?.abort();
      this.renderTaskAbort = void 0;
    }
    async render(content, preferredRendererId, preloadErrors, signal) {
      this.renderTaskAbort?.abort();
      this.renderTaskAbort = void 0;
      this._content = { preferredRendererId, preloadErrors };
      if (content.type === 0) {
        const trustedHtml = ttPolicy?.createHTML(content.htmlContent) ?? content.htmlContent;
        this.element.innerHTML = trustedHtml;
      } else if (preloadErrors.some((e) => e instanceof Error)) {
        const errors = preloadErrors.filter((e) => e instanceof Error);
        showRenderError(`Error loading preloads`, this.element, errors);
      } else {
        const item = createOutputItem(this.outputId, content.output.mime, content.metadata, content.output.valueBytes, content.allOutputs, content.output.appended);
        const controller = new AbortController();
        this.renderTaskAbort = controller;
        signal?.addEventListener("abort", () => controller.abort());
        try {
          await renderers.render(item, preferredRendererId, this.element, controller.signal);
        } finally {
          if (this.renderTaskAbort === controller) {
            this.renderTaskAbort = void 0;
          }
        }
      }
      if (!this.hasResizeObserver) {
        this.hasResizeObserver = true;
        resizeObserver.observe(this.element, this.outputId, true, this.cellId);
      }
      const offsetHeight = this.element.offsetHeight;
      const cps = document.defaultView.getComputedStyle(this.element);
      const verticalPadding = parseFloat(cps.paddingTop) + parseFloat(cps.paddingBottom);
      const contentHeight = offsetHeight - verticalPadding;
      if (elementHasContent(contentHeight) && cps.padding === "0px") {
        dimensionUpdater.updateHeight(this.outputId, offsetHeight + ctx.style.outputNodePadding * 2, {
          isOutput: true,
          init: true
        });
        this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
      } else if (elementHasContent(contentHeight)) {
        dimensionUpdater.updateHeight(this.outputId, this.element.offsetHeight, {
          isOutput: true,
          init: true
        });
        this.element.style.padding = `0 ${ctx.style.outputNodePadding}px 0 ${ctx.style.outputNodeLeftPadding}`;
      } else {
        dimensionUpdater.updateHeight(this.outputId, 0, {
          isOutput: true,
          init: true
        });
      }
      const root = this.element.shadowRoot ?? this.element;
      const codeBlocks = MarkdownCodeBlock.requestHighlightCodeBlock(root);
      if (codeBlocks.length > 0) {
        postNotebookMessage("renderedCellOutput", {
          codeBlocks
        });
      }
    }
    updateAndRerender(content) {
      if (this._content) {
        this.render(content, this._content.preferredRendererId, this._content.preloadErrors);
      }
    }
  }
  const markupCellDragManager = new class MarkupCellDragManager {
    static {
      __name(this, "MarkupCellDragManager");
    }
    currentDrag;
    // Transparent overlay that prevents elements from inside the webview from eating
    // drag events.
    dragOverlay;
    constructor() {
      window.document.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      window.document.addEventListener("drop", (e) => {
        e.preventDefault();
        const drag = this.currentDrag;
        if (!drag) {
          return;
        }
        this.currentDrag = void 0;
        postNotebookMessage("cell-drop", {
          cellId: drag.cellId,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          dragOffsetY: e.clientY
        });
      });
    }
    startDrag(e, cellId) {
      if (!e.dataTransfer) {
        return;
      }
      if (!currentOptions.dragAndDropEnabled) {
        return;
      }
      this.currentDrag = { cellId, clientY: e.clientY };
      const overlayZIndex = 9999;
      if (!this.dragOverlay) {
        this.dragOverlay = document.createElement("div");
        this.dragOverlay.style.position = "absolute";
        this.dragOverlay.style.top = "0";
        this.dragOverlay.style.left = "0";
        this.dragOverlay.style.zIndex = `${overlayZIndex}`;
        this.dragOverlay.style.width = "100%";
        this.dragOverlay.style.height = "100%";
        this.dragOverlay.style.background = "transparent";
        window.document.body.appendChild(this.dragOverlay);
      }
      e.target.style.zIndex = `${overlayZIndex + 1}`;
      e.target.classList.add("dragging");
      postNotebookMessage("cell-drag-start", {
        cellId,
        dragOffsetY: e.clientY
      });
      const trySendDragUpdate = /* @__PURE__ */ __name(() => {
        if (this.currentDrag?.cellId !== cellId) {
          return;
        }
        postNotebookMessage("cell-drag", {
          cellId,
          dragOffsetY: this.currentDrag.clientY
        });
        window.requestAnimationFrame(trySendDragUpdate);
      }, "trySendDragUpdate");
      window.requestAnimationFrame(trySendDragUpdate);
    }
    updateDrag(e, cellId) {
      if (cellId !== this.currentDrag?.cellId) {
        this.currentDrag = void 0;
      } else {
        this.currentDrag = { cellId, clientY: e.clientY };
      }
    }
    endDrag(e, cellId) {
      this.currentDrag = void 0;
      e.target.classList.remove("dragging");
      postNotebookMessage("cell-drag-end", {
        cellId
      });
      if (this.dragOverlay) {
        this.dragOverlay.remove();
        this.dragOverlay = void 0;
      }
      e.target.style.zIndex = "";
    }
  }();
}
__name(webviewPreloads, "webviewPreloads");
function preloadsScriptStr(styleValues, options, renderOptions, renderers, preloads, isWorkspaceTrusted, nonce) {
  const ctx = {
    style: styleValues,
    options,
    renderOptions,
    rendererData: renderers,
    staticPreloadsData: preloads,
    isWorkspaceTrusted,
    nonce
  };
  return `
		const __import = (x) => import(x);
		(${webviewPreloads})(
			JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(ctx))}"))
		)
//# sourceURL=notebookWebviewPreloads.js
`;
}
__name(preloadsScriptStr, "preloadsScriptStr");
function isEditableElement(element) {
  return element.tagName.toLowerCase() === "input" || element.tagName.toLowerCase() === "textarea" || "editContext" in element;
}
__name(isEditableElement, "isEditableElement");
export {
  isEditableElement,
  preloadsScriptStr
};
//# sourceMappingURL=webviewPreloads.js.map
