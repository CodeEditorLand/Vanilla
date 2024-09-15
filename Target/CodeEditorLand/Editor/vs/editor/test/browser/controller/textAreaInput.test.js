var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { OperatingSystem } from "../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { Position } from "../../../common/core/position.js";
import { IRecorded, IRecordedEvent, IRecordedTextareaState } from "./imeRecordedTypes.js";
import { TestAccessibilityService } from "../../../../platform/accessibility/test/common/testAccessibilityService.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { IBrowser, ICompleteTextAreaWrapper, ITextAreaInputHost, TextAreaInput } from "../../../browser/controller/editContext/textArea/textAreaEditContextInput.js";
import { ClipboardDataToCopy } from "../../../browser/controller/editContext/clipboardUtils.js";
import { TextAreaState } from "../../../browser/controller/editContext/textArea/textAreaEditContextState.js";
suite("TextAreaInput", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function yieldNow() {
    return new Promise((resolve, reject) => {
      queueMicrotask(resolve);
    });
  }
  __name(yieldNow, "yieldNow");
  async function simulateInteraction(recorded) {
    const disposables = new DisposableStore();
    const host = {
      getDataToCopy: /* @__PURE__ */ __name(function() {
        throw new Error("Function not implemented.");
      }, "getDataToCopy"),
      getScreenReaderContent: /* @__PURE__ */ __name(function() {
        return new TextAreaState("", 0, 0, null, void 0);
      }, "getScreenReaderContent"),
      deduceModelPosition: /* @__PURE__ */ __name(function(viewAnchorPosition, deltaOffset, lineFeedCnt) {
        throw new Error("Function not implemented.");
      }, "deduceModelPosition")
    };
    const wrapper = disposables.add(new class extends Disposable {
      _onKeyDown = this._register(new Emitter());
      onKeyDown = this._onKeyDown.event;
      _onKeyPress = this._register(new Emitter());
      onKeyPress = this._onKeyPress.event;
      _onKeyUp = this._register(new Emitter());
      onKeyUp = this._onKeyUp.event;
      _onCompositionStart = this._register(new Emitter());
      onCompositionStart = this._onCompositionStart.event;
      _onCompositionUpdate = this._register(new Emitter());
      onCompositionUpdate = this._onCompositionUpdate.event;
      _onCompositionEnd = this._register(new Emitter());
      onCompositionEnd = this._onCompositionEnd.event;
      _onBeforeInput = this._register(new Emitter());
      onBeforeInput = this._onBeforeInput.event;
      _onInput = this._register(new Emitter());
      onInput = this._onInput.event;
      onCut = Event.None;
      onCopy = Event.None;
      onPaste = Event.None;
      onFocus = Event.None;
      onBlur = Event.None;
      onSyntheticTap = Event.None;
      _state;
      _currDispatchingEvent;
      ownerDocument = document;
      constructor() {
        super();
        this._state = {
          selectionDirection: "none",
          selectionEnd: 0,
          selectionStart: 0,
          value: ""
        };
        this._currDispatchingEvent = null;
      }
      _initialize(state) {
        this._state.value = state.value;
        this._state.selectionStart = state.selectionStart;
        this._state.selectionEnd = state.selectionEnd;
      }
      _dispatchRecordedEvent(event) {
        this._currDispatchingEvent = event;
        this._state.value = event.state.value;
        this._state.selectionStart = event.state.selectionStart;
        this._state.selectionEnd = event.state.selectionEnd;
        this._state.selectionDirection = event.state.selectionDirection;
        if (event.type === "keydown" || event.type === "keypress" || event.type === "keyup") {
          const mockEvent = {
            timeStamp: event.timeStamp,
            type: event.type,
            altKey: event.altKey,
            charCode: event.charCode,
            code: event.code,
            ctrlKey: event.ctrlKey,
            isComposing: event.isComposing,
            key: event.key,
            keyCode: event.keyCode,
            location: event.location,
            metaKey: event.metaKey,
            repeat: event.repeat,
            shiftKey: event.shiftKey,
            getModifierState: /* @__PURE__ */ __name((keyArg) => false, "getModifierState")
          };
          if (event.type === "keydown") {
            this._onKeyDown.fire(mockEvent);
          } else if (event.type === "keypress") {
            this._onKeyPress.fire(mockEvent);
          } else {
            this._onKeyUp.fire(mockEvent);
          }
        } else if (event.type === "compositionstart" || event.type === "compositionupdate" || event.type === "compositionend") {
          const mockEvent = {
            timeStamp: event.timeStamp,
            type: event.type,
            data: event.data
          };
          if (event.type === "compositionstart") {
            this._onCompositionStart.fire(mockEvent);
          } else if (event.type === "compositionupdate") {
            this._onCompositionUpdate.fire(mockEvent);
          } else {
            this._onCompositionEnd.fire(mockEvent);
          }
        } else if (event.type === "beforeinput" || event.type === "input") {
          const mockEvent = {
            timeStamp: event.timeStamp,
            type: event.type,
            data: event.data,
            inputType: event.inputType,
            isComposing: event.isComposing
          };
          if (event.type === "beforeinput") {
            this._onBeforeInput.fire(mockEvent);
          } else {
            this._onInput.fire(mockEvent);
          }
        } else {
          throw new Error(`Not Implemented`);
        }
        this._currDispatchingEvent = null;
      }
      getValue() {
        return this._state.value;
      }
      setValue(reason, value) {
        if (this._currDispatchingEvent?.type === "compositionstart") {
          assert.fail("should not change the state of the textarea in a compositionstart");
        }
        this._state.value = value;
      }
      getSelectionStart() {
        return this._state.selectionDirection === "backward" ? this._state.selectionEnd : this._state.selectionStart;
      }
      getSelectionEnd() {
        return this._state.selectionDirection === "backward" ? this._state.selectionStart : this._state.selectionEnd;
      }
      setSelectionRange(reason, selectionStart, selectionEnd) {
        if (this._currDispatchingEvent?.type === "compositionstart") {
          assert.fail("should not change the state of the textarea in a compositionstart");
        }
        this._state.selectionStart = selectionStart;
        this._state.selectionEnd = selectionEnd;
        this._state.selectionDirection = selectionStart !== selectionEnd ? "forward" : "none";
      }
      setIgnoreSelectionChangeTime(reason) {
      }
      getIgnoreSelectionChangeTime() {
        return Date.now();
      }
      resetSelectionChangeTime() {
      }
      hasFocus() {
        return true;
      }
    }());
    const input = disposables.add(new TextAreaInput(host, wrapper, recorded.env.OS, recorded.env.browser, new TestAccessibilityService(), new NullLogService()));
    wrapper._initialize(recorded.initial);
    input._initializeFromTest();
    const outgoingEvents = [];
    disposables.add(input.onType((e) => outgoingEvents.push({
      type: "type",
      text: e.text,
      replacePrevCharCnt: e.replacePrevCharCnt,
      replaceNextCharCnt: e.replaceNextCharCnt,
      positionDelta: e.positionDelta
    })));
    disposables.add(input.onCompositionStart((e) => outgoingEvents.push({
      type: "compositionStart",
      data: e.data
    })));
    disposables.add(input.onCompositionUpdate((e) => outgoingEvents.push({
      type: "compositionUpdate",
      data: e.data
    })));
    disposables.add(input.onCompositionEnd((e) => outgoingEvents.push({
      type: "compositionEnd"
    })));
    for (const event of recorded.events) {
      wrapper._dispatchRecordedEvent(event);
      await yieldNow();
    }
    disposables.dispose();
    return outgoingEvents;
  }
  __name(simulateInteraction, "simulateInteraction");
  function interpretTypeEvents(OS, browser, initialState, events) {
    let text = initialState.value;
    let selectionStart = initialState.selectionStart;
    let selectionEnd = initialState.selectionEnd;
    for (const event of events) {
      if (event.type === "type") {
        text = text.substring(0, selectionStart - event.replacePrevCharCnt) + event.text + text.substring(selectionEnd + event.replaceNextCharCnt);
        selectionStart = selectionStart - event.replacePrevCharCnt + event.text.length;
        selectionEnd = selectionStart;
        if (event.positionDelta) {
          selectionStart += event.positionDelta;
          selectionEnd += event.positionDelta;
        }
      }
    }
    return {
      value: text,
      selectionStart,
      selectionEnd,
      selectionDirection: browser.isFirefox || OS === OperatingSystem.Windows || OS === OperatingSystem.Linux ? "forward" : "none"
    };
  }
  __name(interpretTypeEvents, "interpretTypeEvents");
  test("macOS - Chrome - Korean using 2-Set Korean (1)", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Macintosh, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyD", ctrlKey: false, isComposing: false, key: "\u3147", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 6.2, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionstart", data: "" },
        { timeStamp: 6.4, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "beforeinput", data: "\u3147", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 6.5, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionupdate", data: "\u3147" },
        { timeStamp: 6.9, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\u3147", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 136.1, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyD", ctrlKey: false, isComposing: true, key: "\u3147", keyCode: 68, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 288.1, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "\u314F", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 296, state: { value: "aa\u3147aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 296, state: { value: "aa\u3147aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\uC544" },
        { timeStamp: 296.4, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 368, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "\u314F", keyCode: 75, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 536.1, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "\u3131", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 543.2, state: { value: "aa\uC544aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\uC545", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 543.3, state: { value: "aa\uC544aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\uC545" },
        { timeStamp: 543.6, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\uC545", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 632, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "\u3131", keyCode: 82, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 783.9, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "\u314F", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 790.7, state: { value: "aa\uC545aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 790.8, state: { value: "aa\uC545aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\uC544" },
        { timeStamp: 791.2, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 791.2, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionend", data: "\uC544" },
        { timeStamp: 791.3, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionstart", data: "" },
        { timeStamp: 791.3, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\uAC00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 791.3, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\uAC00" },
        { timeStamp: 791.5, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "input", data: "\uAC00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 880.1, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "\u314F", keyCode: 75, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2209, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "compositionend", data: "\uAC00" }
      ],
      final: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\u3147", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u3147" },
      { type: "type", text: "\uC544", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uC544" },
      { type: "type", text: "\uC545", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uC545" },
      { type: "type", text: "\uC544", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uC544" },
      { type: "type", text: "\uC544", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "compositionStart", data: "" },
      { type: "type", text: "\uAC00", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uAC00" },
      { type: "type", text: "\uAC00", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("macOS - Chrome - Korean using 2-Set Korean (2)", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Macintosh, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyQ", ctrlKey: false, isComposing: false, key: "\u3142", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 7.4, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionstart", data: "" },
        { timeStamp: 7.6, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "beforeinput", data: "\u3142", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 7.6, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionupdate", data: "\u3142" },
        { timeStamp: 8.2, state: { value: "aa\u3142aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\u3142", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 136.1, state: { value: "aa\u3142aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyQ", ctrlKey: false, isComposing: true, key: "\u3142", keyCode: 81, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 680.1, state: { value: "aa\u3142aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyU", ctrlKey: false, isComposing: true, key: "\u3155", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 687.2, state: { value: "aa\u3142aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\uBCBC", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 687.4, state: { value: "aa\u3142aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\uBCBC" },
        { timeStamp: 688.8, state: { value: "aa\uBCBCaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\uBCBC", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 768.1, state: { value: "aa\uBCBCaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyU", ctrlKey: false, isComposing: true, key: "\u3155", keyCode: 85, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1768, state: { value: "aa\uBCBCaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyD", ctrlKey: false, isComposing: true, key: "\u3147", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1775, state: { value: "aa\uBCBCaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\uBCD1", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1775.1, state: { value: "aa\uBCBCaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\uBCD1" },
        { timeStamp: 1775.6, state: { value: "aa\uBCD1aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\uBCD1", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1928.1, state: { value: "aa\uBCD1aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyD", ctrlKey: false, isComposing: true, key: "\u3147", keyCode: 68, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 6565.7, state: { value: "aa\uBCD1aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionend", data: "\uBCD1" }
      ],
      final: { value: "aa\uBCD1aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\u3142", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u3142" },
      { type: "type", text: "\uBCBC", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uBCBC" },
      { type: "type", text: "\uBCD1", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uBCD1" },
      { type: "type", text: "\uBCD1", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("macOS - Chrome - Japanese using Hiragana (Google)", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Macintosh, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: false, key: "s", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 8.5, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionstart", data: "" },
        { timeStamp: 8.7, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "beforeinput", data: "\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 8.7, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionupdate", data: "\uFF53" },
        { timeStamp: 9.3, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 111.7, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "s", keyCode: 83, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 439.8, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "e", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 444.5, state: { value: "aa\uFF53aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 444.6, state: { value: "aa\uFF53aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\u305B" },
        { timeStamp: 445.2, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 559.9, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1943.9, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1949.3, state: { value: "aa\u305Baa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\u305B\uFF4E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1949.4, state: { value: "aa\u305Baa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\u305B\uFF4E" },
        { timeStamp: 1949.9, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "input", data: "\u305B\uFF4E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2039.9, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 78, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2207.8, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2215.7, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "none" }, type: "beforeinput", data: "\u305B\u3093", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2215.8, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "none" }, type: "compositionupdate", data: "\u305B\u3093" },
        { timeStamp: 2216.1, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "input", data: "\u305B\u3093", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2311.9, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 78, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2551.9, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "s", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2557, state: { value: "aa\u305B\u3093aa", selectionStart: 2, selectionEnd: 4, selectionDirection: "none" }, type: "beforeinput", data: "\u305B\u3093\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2557, state: { value: "aa\u305B\u3093aa", selectionStart: 2, selectionEnd: 4, selectionDirection: "none" }, type: "compositionupdate", data: "\u305B\u3093\uFF53" },
        { timeStamp: 2557.4, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }, type: "input", data: "\u305B\u3093\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2671.7, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "s", keyCode: 83, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2903.8, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "e", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2912.3, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 2, selectionEnd: 5, selectionDirection: "none" }, type: "beforeinput", data: "\u305B\u3093\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2912.5, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 2, selectionEnd: 5, selectionDirection: "none" }, type: "compositionupdate", data: "\u305B\u3093\u305B" },
        { timeStamp: 2912.9, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }, type: "input", data: "\u305B\u3093\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3023.9, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3519.9, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "i", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3537.1, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 2, selectionEnd: 5, selectionDirection: "none" }, type: "beforeinput", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3537.1, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 2, selectionEnd: 5, selectionDirection: "none" }, type: "compositionupdate", data: "\u305B\u3093\u305B\u3044" },
        { timeStamp: 3537.6, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "none" }, type: "input", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3639.9, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "i", keyCode: 73, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 4887.8, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: true, key: "Enter", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 4892.8, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 2, selectionEnd: 6, selectionDirection: "none" }, type: "beforeinput", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 4892.9, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 2, selectionEnd: 6, selectionDirection: "none" }, type: "compositionupdate", data: "\u305B\u3093\u305B\u3044" },
        { timeStamp: 4893, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "none" }, type: "input", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 4893, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "none" }, type: "compositionend", data: "\u305B\u3093\u305B\u3044" },
        { timeStamp: 4967.8, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: false, key: "Enter", keyCode: 13, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "none" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\uFF53", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uFF53" },
      { type: "type", text: "\u305B", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B" },
      { type: "type", text: "\u305B\uFF4E", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\uFF4E" },
      { type: "type", text: "\u305B\u3093", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093" },
      { type: "type", text: "\u305B\u3093\uFF53", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\uFF53" },
      { type: "type", text: "\u305B\u3093\u305B", replacePrevCharCnt: 3, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\u305B" },
      { type: "type", text: "\u305B\u3093\u305B\u3044", replacePrevCharCnt: 3, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\u305B\u3044" },
      { type: "type", text: "\u305B\u3093\u305B\u3044", replacePrevCharCnt: 4, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\u305B\u3044" },
      { type: "type", text: "\u305B\u3093\u305B\u3044", replacePrevCharCnt: 4, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("macOS - Chrome - Chinese using Pinyin - Traditional", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Macintosh, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyX", ctrlKey: false, isComposing: false, key: "x", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 48.7, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionstart", data: "" },
        { timeStamp: 48.8, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "beforeinput", data: "x", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 48.9, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionupdate", data: "x" },
        { timeStamp: 49.2, state: { value: "aaxaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "x", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 127.8, state: { value: "aaxaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyX", ctrlKey: false, isComposing: true, key: "x", keyCode: 88, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 480, state: { value: "aaxaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyU", ctrlKey: false, isComposing: true, key: "u", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 535.6, state: { value: "aaxaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "xu", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 535.7, state: { value: "aaxaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "xu" },
        { timeStamp: 535.9, state: { value: "aaxuaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "input", data: "xu", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 575.8, state: { value: "aaxuaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyU", ctrlKey: false, isComposing: true, key: "u", keyCode: 85, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1055.9, state: { value: "aaxuaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "Digit1", ctrlKey: false, isComposing: true, key: "1", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1061.7, state: { value: "aaxuaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "none" }, type: "beforeinput", data: "\u9700", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1061.8, state: { value: "aaxuaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "none" }, type: "compositionupdate", data: "\u9700" },
        { timeStamp: 1063.2, state: { value: "aa\u9700aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\u9700", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1063.3, state: { value: "aa\u9700aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionend", data: "\u9700" },
        { timeStamp: 1207.9, state: { value: "aa\u9700aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "Digit1", ctrlKey: false, isComposing: false, key: "1", keyCode: 49, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: { value: "aa\u9700aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "x", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "x" },
      { type: "type", text: "xu", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "xu" },
      { type: "type", text: "\u9700", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u9700" },
      { type: "type", text: "\u9700", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("macOS - Chrome - long press with arrow keys", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Macintosh, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: false, key: "o", keyCode: 79, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keypress", altKey: false, charCode: 111, code: "KeyO", ctrlKey: false, isComposing: false, key: "o", keyCode: 111, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2.8, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "beforeinput", data: "o", inputType: "insertText", isComposing: false },
        { timeStamp: 3.4, state: { value: "aaoaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "o", inputType: "insertText", isComposing: false },
        { timeStamp: 500.5, state: { value: "aaoaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: false, key: "o", keyCode: 79, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 583.9, state: { value: "aaoaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: false, key: "o", keyCode: 79, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 667.6, state: { value: "aaoaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: false, key: "o", keyCode: 79, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 750.9, state: { value: "aaoaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: false, key: "o", keyCode: 79, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 835, state: { value: "aaoaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: false, key: "o", keyCode: 79, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 856.1, state: { value: "aaoaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: false, key: "o", keyCode: 79, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1952.1, state: { value: "aaoaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "ArrowRight", ctrlKey: false, isComposing: false, key: "ArrowRight", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1956.5, state: { value: "aaoaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionstart", data: "o" },
        { timeStamp: 1956.8, state: { value: "aaoaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\xF4", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1956.9, state: { value: "aaoaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\xF4" },
        { timeStamp: 1960.6, state: { value: "aa\xF4aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\xF4", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2088.1, state: { value: "aa\xF4aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "ArrowRight", ctrlKey: false, isComposing: true, key: "ArrowRight", keyCode: 39, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2480.1, state: { value: "aa\xF4aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "ArrowRight", ctrlKey: false, isComposing: true, key: "ArrowRight", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2484.3, state: { value: "aa\xF4aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\xF6", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2484.4, state: { value: "aa\xF4aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\xF6" },
        { timeStamp: 2484.7, state: { value: "aa\xF6aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\xF6", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2584.2, state: { value: "aa\xF6aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "ArrowRight", ctrlKey: false, isComposing: true, key: "ArrowRight", keyCode: 39, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 6424.2, state: { value: "aa\xF6aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: true, key: "Enter", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 6431.7, state: { value: "aa\xF6aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "\xF6", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 6431.7, state: { value: "aa\xF6aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "\xF6" },
        { timeStamp: 6431.8, state: { value: "aa\xF6aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "\xF6", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 6431.9, state: { value: "aa\xF6aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionend", data: "\xF6" },
        { timeStamp: 6496.2, state: { value: "aa\xF6aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: false, key: "Enter", keyCode: 13, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: { value: "aa\xF6aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "type", text: "o", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionStart", data: "o" },
      { type: "type", text: "\xF4", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\xF4" },
      { type: "type", text: "\xF6", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\xF6" },
      { type: "type", text: "\xF6", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\xF6" },
      { type: "type", text: "\xF6", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("macOS - Chrome - pressing quotes on US Intl", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Macintosh, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "Quote", ctrlKey: false, isComposing: false, key: "Dead", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2.8, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionstart", data: "" },
        { timeStamp: 3.1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "beforeinput", data: "'", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3.2, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionupdate", data: "'" },
        { timeStamp: 3.7, state: { value: "aa'aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "'", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 71.9, state: { value: "aa'aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "Quote", ctrlKey: false, isComposing: true, key: "Dead", keyCode: 222, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 144, state: { value: "aa'aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "Quote", ctrlKey: false, isComposing: true, key: "Dead", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 146.2, state: { value: "aa'aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "'", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 146.4, state: { value: "aa'aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "'" },
        { timeStamp: 146.7, state: { value: "aa'aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "'", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 146.8, state: { value: "aa'aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionend", data: "'" },
        { timeStamp: 147.2, state: { value: "aa'aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionstart", data: "" },
        { timeStamp: 147.2, state: { value: "aa'aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: "'", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 147.7, state: { value: "aa'aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionupdate", data: "'" },
        { timeStamp: 148.2, state: { value: "aa''aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "input", data: "'", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 208.1, state: { value: "aa''aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "Quote", ctrlKey: false, isComposing: true, key: "Dead", keyCode: 222, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 323.7, state: { value: "aa''aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "Semicolon", ctrlKey: false, isComposing: true, key: ";", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 325.7, state: { value: "aa''aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "none" }, type: "beforeinput", data: "';", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 325.8, state: { value: "aa''aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "none" }, type: "compositionupdate", data: "';" },
        { timeStamp: 326.3, state: { value: "aa'';aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }, type: "input", data: "';", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 326.3, state: { value: "aa'';aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }, type: "compositionend", data: "';" },
        { timeStamp: 428, state: { value: "aa'';aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "Semicolon", ctrlKey: false, isComposing: false, key: ";", keyCode: 186, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: { value: "aa'';aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "none" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "'", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "'" },
      { type: "type", text: "'", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "'" },
      { type: "type", text: "'", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "compositionStart", data: "" },
      { type: "type", text: "'", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "'" },
      { type: "type", text: "';", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "';" },
      { type: "type", text: "';", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("macOS - Chrome - inserting emoji using ctrl+cmd+space", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Macintosh, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "ControlLeft", ctrlKey: true, isComposing: false, key: "Control", keyCode: 17, location: 1, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 600, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "MetaLeft", ctrlKey: true, isComposing: false, key: "Meta", keyCode: 91, location: 1, metaKey: true, repeat: false, shiftKey: false },
        { timeStamp: 1080.1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "Space", ctrlKey: true, isComposing: false, key: " ", keyCode: 32, location: 0, metaKey: true, repeat: false, shiftKey: false },
        { timeStamp: 1247.9, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "MetaLeft", ctrlKey: true, isComposing: false, key: "Meta", keyCode: 91, location: 1, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1263.8, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: true, isComposing: false, key: " ", keyCode: 32, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1367.8, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "ControlLeft", ctrlKey: false, isComposing: false, key: "Control", keyCode: 17, location: 1, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 17962.9, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "beforeinput", data: "\u{1F973}", inputType: "insertText", isComposing: false },
        { timeStamp: 17966.6, state: { value: "aa\u{1F973}aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "input", data: "\u{1F973}", inputType: "insertText", isComposing: false }
      ],
      final: { value: "aa\u{1F973}aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "type", text: "\u{1F973}", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("macOS - Firefox - long press with mouse", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Macintosh, browser: { isAndroid: false, isFirefox: true, isChrome: false, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: false, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keypress", altKey: false, charCode: 101, code: "KeyE", ctrlKey: false, isComposing: false, key: "e", keyCode: 101, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 7, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "e", inputType: "insertText", isComposing: false },
        { timeStamp: 7, state: { value: "aaeaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "e", inputType: "insertText", isComposing: false },
        { timeStamp: 500, state: { value: "aaeaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: false, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 667, state: { value: "aaeaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: false, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 750, state: { value: "aaeaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: false, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 834, state: { value: "aaeaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: false, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 917, state: { value: "aaeaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: false, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 1001, state: { value: "aaeaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: false, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: true, shiftKey: false },
        { timeStamp: 1024, state: { value: "aaeaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: false, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2988, state: { value: "aaeaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\xE8", inputType: "insertText", isComposing: false },
        { timeStamp: 2988, state: { value: "aa\xE8aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\xE8", inputType: "insertText", isComposing: false }
      ],
      final: { value: "aa\xE8aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "type", text: "e", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "type", text: "\xE8", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("macOS - Firefox - inserting emojis", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Macintosh, browser: { isAndroid: false, isFirefox: true, isChrome: false, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "\u{1F60D}", inputType: "insertText", isComposing: false },
        { timeStamp: 1, state: { value: "aa\u{1F60D}aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\u{1F60D}", inputType: "insertText", isComposing: false }
      ],
      final: { value: "aa\u{1F60D}aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "type", text: "\u{1F60D}", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("macOS - Safari - Chinese - issue #119469", async () => {
    const recorded = {
      env: { "OS": OperatingSystem.Macintosh, "browser": { "isAndroid": false, "isFirefox": false, "isChrome": false, "isSafari": true } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionstart", data: "" },
        { timeStamp: 1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "compositionupdate", data: "f" },
        { timeStamp: 1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "beforeinput", data: "f", inputType: "insertCompositionText", isComposing: void 0 },
        { timeStamp: 2, state: { value: "aafaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "f", inputType: "insertCompositionText", isComposing: void 0 },
        { timeStamp: -30, state: { value: "aafaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "KeyF", ctrlKey: false, isComposing: true, key: "f", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 106, state: { value: "aafaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "KeyF", ctrlKey: false, isComposing: true, key: "f", keyCode: 70, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 721, state: { value: "aafaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: null, inputType: "deleteCompositionText", isComposing: void 0 },
        { timeStamp: 723, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "input", data: null, inputType: "deleteCompositionText", isComposing: void 0 },
        { timeStamp: 723, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "none" }, type: "beforeinput", data: "f", inputType: "insertFromComposition", isComposing: void 0 },
        { timeStamp: 723, state: { value: "aafaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "input", data: "f", inputType: "insertFromComposition", isComposing: void 0 },
        { timeStamp: 723, state: { value: "aafaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "compositionend", data: "f" },
        { timeStamp: 698, state: { value: "aafaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: false, key: "Enter", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 826, state: { value: "aafaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: false, key: "Enter", keyCode: 13, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1114, state: { value: "aafaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keydown", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: false, key: "Enter", keyCode: 13, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1114, state: { value: "aafaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "keypress", altKey: false, charCode: 13, code: "Enter", ctrlKey: false, isComposing: false, key: "Enter", keyCode: 13, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1137, state: { value: "aafaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "none" }, type: "beforeinput", data: null, inputType: "insertLineBreak", isComposing: void 0 },
        { timeStamp: 1138, state: { value: "aaf\naa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "input", data: null, inputType: "insertLineBreak", isComposing: void 0 },
        { timeStamp: 1250, state: { value: "aaf\naa", selectionStart: 4, selectionEnd: 4, selectionDirection: "none" }, type: "keyup", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: false, key: "Enter", keyCode: 13, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: {
        value: "aaf\naa",
        selectionStart: 4,
        selectionEnd: 4,
        selectionDirection: "none"
      }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "f", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "f" },
      { type: "type", text: "f", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "type", text: "\n", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("Windows - Chrome - Japanese using Hiragana", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Windows, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 0.8, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 0.8, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 0.9, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionupdate", data: "\uFF53" },
        { timeStamp: 9.3, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 97.5, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 99.1, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "s", keyCode: 83, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 615.9, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 619.8, state: { value: "aa\uFF53aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 619.8, state: { value: "aa\uFF53aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B" },
        { timeStamp: 627.7, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 719.9, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 723.6, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1816.1, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1828.3, state: { value: "aa\u305Baa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\uFF4E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1828.4, state: { value: "aa\u305Baa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\uFF4E" },
        { timeStamp: 1828.7, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\u305B\uFF4E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1903.7, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1904.7, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 78, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2111.7, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2123.4, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2123.4, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093" },
        { timeStamp: 2123.7, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2215.8, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2217.1, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 78, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2968, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2970, state: { value: "aa\u305B\u3093aa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2970, state: { value: "aa\u305B\u3093aa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093\uFF53" },
        { timeStamp: 2970.2, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3079.7, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3080.7, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "s", keyCode: 83, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3295.2, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3297.1, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 2, selectionEnd: 5, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3297.2, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 2, selectionEnd: 5, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093\u305B" },
        { timeStamp: 3297.4, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3408, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3409, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3880.8, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3882.8, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 2, selectionEnd: 5, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3882.9, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 2, selectionEnd: 5, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093\u305B\u3044" },
        { timeStamp: 3883.3, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3976.3, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3977.5, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "i", keyCode: 73, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 6364.9, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 6367.4, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 2, selectionEnd: 6, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 6367.4, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 2, selectionEnd: 6, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093\u305B\u3044" },
        { timeStamp: 6367.6, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 6367.6, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "compositionend", data: "\u305B\u3093\u305B\u3044" },
        { timeStamp: 6479.6, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\uFF53", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uFF53" },
      { type: "type", text: "\u305B", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B" },
      { type: "type", text: "\u305B\uFF4E", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\uFF4E" },
      { type: "type", text: "\u305B\u3093", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093" },
      { type: "type", text: "\u305B\u3093\uFF53", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\uFF53" },
      { type: "type", text: "\u305B\u3093\u305B", replacePrevCharCnt: 3, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\u305B" },
      { type: "type", text: "\u305B\u3093\u305B\u3044", replacePrevCharCnt: 3, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\u305B\u3044" },
      { type: "type", text: "\u305B\u3093\u305B\u3044", replacePrevCharCnt: 4, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\u305B\u3044" },
      { type: "type", text: "\u305B\u3093\u305B\u3044", replacePrevCharCnt: 4, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("Windows 11 - Chrome - Japanese using Hiragana", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Windows, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 15, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 15, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 15, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionupdate", data: "\uFF53" },
        { timeStamp: 20, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 111, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 111, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "s", keyCode: 83, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 832, state: { value: "aa\uFF53aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 839, state: { value: "aa\uFF53aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 839, state: { value: "aa\uFF53aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B" },
        { timeStamp: 890, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 936, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 937, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1456, state: { value: "aa\u305Baa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1460, state: { value: "aa\u305Baa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\uFF4E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1460, state: { value: "aa\u305Baa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\uFF4E" },
        { timeStamp: 1461, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\u305B\uFF4E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1522, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1522, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 78, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1684, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1694, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1694, state: { value: "aa\u305B\uFF4Eaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093" },
        { timeStamp: 1694, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1763, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1763, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 78, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1873, state: { value: "aa\u305B\u3093aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1878, state: { value: "aa\u305B\u3093aa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1878, state: { value: "aa\u305B\u3093aa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093\uFF53" },
        { timeStamp: 1878, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093\uFF53", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1969, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1969, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "s", keyCode: 83, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2094, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2111, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 2, selectionEnd: 5, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2111, state: { value: "aa\u305B\u3093\uFF53aa", selectionStart: 2, selectionEnd: 5, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093\u305B" },
        { timeStamp: 2111, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093\u305B", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2222, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2222, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyE", ctrlKey: false, isComposing: true, key: "e", keyCode: 69, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2356, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2367, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 2, selectionEnd: 5, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2367, state: { value: "aa\u305B\u3093\u305Baa", selectionStart: 2, selectionEnd: 5, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093\u305B\u3044" },
        { timeStamp: 2367, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2456, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2456, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "i", keyCode: 73, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3776, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3776, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 2, selectionEnd: 6, selectionDirection: "forward" }, type: "beforeinput", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3776, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 2, selectionEnd: 6, selectionDirection: "forward" }, type: "compositionupdate", data: "\u305B\u3093\u305B\u3044" },
        { timeStamp: 3785, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "input", data: "\u305B\u3093\u305B\u3044", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3785, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "compositionend", data: "\u305B\u3093\u305B\u3044" },
        { timeStamp: 3886, state: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Enter", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: { value: "aa\u305B\u3093\u305B\u3044aa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\uFF53", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uFF53" },
      { type: "type", text: "\u305B", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B" },
      { type: "type", text: "\u305B\uFF4E", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\uFF4E" },
      { type: "type", text: "\u305B\u3093", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093" },
      { type: "type", text: "\u305B\u3093\uFF53", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\uFF53" },
      { type: "type", text: "\u305B\u3093\u305B", replacePrevCharCnt: 3, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\u305B" },
      { type: "type", text: "\u305B\u3093\u305B\u3044", replacePrevCharCnt: 3, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\u305B\u3044" },
      { type: "type", text: "\u305B\u3093\u305B\u3044", replacePrevCharCnt: 4, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u305B\u3093\u305B\u3044" },
      { type: "type", text: "\u305B\u3093\u305B\u3044", replacePrevCharCnt: 4, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("Windows - Chrome - Korean (1)", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Windows, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyD", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 23.1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 23.1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "\u3147", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 23.2, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionupdate", data: "\u3147" },
        { timeStamp: 23.6, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\u3147", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 119.3, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyD", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 215, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 215.4, state: { value: "aa\u3147aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 215.4, state: { value: "aa\u3147aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uC544" },
        { timeStamp: 215.9, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 303.2, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 511.1, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 511.7, state: { value: "aa\uC544aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uC545", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 511.7, state: { value: "aa\uC544aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uC545" },
        { timeStamp: 512.1, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uC545", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 598.2, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 791, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 791.5, state: { value: "aa\uC545aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 791.5, state: { value: "aa\uC545aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uC544" },
        { timeStamp: 791.8, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 791.9, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionend", data: "\uC544" },
        { timeStamp: 792, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 792, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uAC00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 792, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uAC00" },
        { timeStamp: 792.3, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\uAC00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 919, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2721.5, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionend", data: "\uAC00" }
      ],
      final: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\u3147", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u3147" },
      { type: "type", text: "\uC544", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uC544" },
      { type: "type", text: "\uC545", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uC545" },
      { type: "type", text: "\uC544", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uC544" },
      { type: "type", text: "\uC544", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "compositionStart", data: "" },
      { type: "type", text: "\uAC00", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uAC00" },
      { type: "type", text: "\uAC00", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("Windows 11 - Chrome - Korean (1)", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Windows, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyD", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 9, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 10, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "\u3147", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 10, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionupdate", data: "\u3147" },
        { timeStamp: 26, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\u3147", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 119, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyD", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 134, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyD", ctrlKey: false, isComposing: true, key: "d", keyCode: 68, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 442, state: { value: "aa\u3147aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 442, state: { value: "aa\u3147aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 442, state: { value: "aa\u3147aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uC544" },
        { timeStamp: 451, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 535, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 535, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "k", keyCode: 75, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 879, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 879, state: { value: "aa\uC544aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uC545", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 879, state: { value: "aa\uC544aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uC545" },
        { timeStamp: 881, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uC545", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 980, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 992, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "r", keyCode: 82, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1230, state: { value: "aa\uC545aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1230, state: { value: "aa\uC545aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1230, state: { value: "aa\uC545aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uC544" },
        { timeStamp: 1242, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uC544", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1242, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionend", data: "\uC544" },
        { timeStamp: 1242, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 1242, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uAC00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1242, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uAC00" },
        { timeStamp: 1243, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\uAC00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1375, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1375, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "k", keyCode: 75, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3412, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionend", data: "\uAC00" },
        { timeStamp: 3412, state: { value: "aa\uC544\uAC00aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: null, inputType: "deleteContentBackward", isComposing: false },
        { timeStamp: 3413, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: null, inputType: "deleteContentBackward", isComposing: false },
        { timeStamp: 3413, state: { value: "aa\uC544aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uAC00", inputType: "insertText", isComposing: false },
        { timeStamp: 3414, state: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\uAC00", inputType: "insertText", isComposing: false }
      ],
      final: { value: "aa\uC544\uAC00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\u3147", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u3147" },
      { type: "type", text: "\uC544", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uC544" },
      { type: "type", text: "\uC545", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uC545" },
      { type: "type", text: "\uC544", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uC544" },
      { type: "type", text: "\uC544", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "compositionStart", data: "" },
      { type: "type", text: "\uAC00", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uAC00" },
      { type: "type", text: "\uAC00", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "type", text: "", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "type", text: "\uAC00", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("Windows - Chrome - Korean (2)", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Windows, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyG", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 23.3, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 23.5, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "\u314E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 23.5, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionupdate", data: "\u314E" },
        { timeStamp: 27.3, state: { value: "aa\u314Eaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\u314E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 111.8, state: { value: "aa\u314Eaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyG", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 606.8, state: { value: "aa\u314Eaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 607.4, state: { value: "aa\u314Eaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uD558", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 607.4, state: { value: "aa\u314Eaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uD558" },
        { timeStamp: 607.8, state: { value: "aa\uD558aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uD558", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 705.2, state: { value: "aa\uD558aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1455.8, state: { value: "aa\uD558aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1456.4, state: { value: "aa\uD558aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uD55C", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1456.5, state: { value: "aa\uD558aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uD55C" },
        { timeStamp: 1456.9, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uD55C", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1567.4, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1963.1, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1963.7, state: { value: "aa\uD55Caa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uD55C", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1963.8, state: { value: "aa\uD55Caa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uD55C" },
        { timeStamp: 1963.8, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uD55C", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1963.9, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionend", data: "\uD55C" },
        { timeStamp: 1964.1, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 1964.1, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\u3131", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1964.1, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\u3131" },
        { timeStamp: 1964.4, state: { value: "aa\uD55C\u3131aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\u3131", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2063.6, state: { value: "aa\uD55C\u3131aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2823.6, state: { value: "aa\uD55C\u3131aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyM", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2824, state: { value: "aa\uD55C\u3131aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\uADF8", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2824.1, state: { value: "aa\uD55C\u3131aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\uADF8" },
        { timeStamp: 2824.4, state: { value: "aa\uD55C\uADF8aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\uADF8", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2935.3, state: { value: "aa\uD55C\uADF8aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyM", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3187.5, state: { value: "aa\uD55C\uADF8aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyF", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3188, state: { value: "aa\uD55C\uADF8aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\uAE00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3188, state: { value: "aa\uD55C\uADF8aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\uAE00" },
        { timeStamp: 3188.4, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\uAE00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3319.2, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyF", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3847.3, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3847.8, state: { value: "aa\uD55C\uAE00aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\uAE00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3847.8, state: { value: "aa\uD55C\uAE00aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\uAE00" },
        { timeStamp: 3847.9, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\uAE00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3848.1, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionend", data: "\uAE00" },
        { timeStamp: 3847.7, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: " ", keyCode: 32, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3847.8, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keypress", altKey: false, charCode: 32, code: "Space", ctrlKey: false, isComposing: false, key: " ", keyCode: 32, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3848.3, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: " ", inputType: "insertText", isComposing: false },
        { timeStamp: 3848.6, state: { value: "aa\uD55C\uAE00 aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "input", data: " ", inputType: "insertText", isComposing: false },
        { timeStamp: 3919.2, state: { value: "aa\uD55C\uAE00 aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3919.5, state: { value: "aa\uD55C\uAE00 aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: " ", keyCode: 32, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: { value: "aa\uD55C\uAE00 aa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\u314E", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u314E" },
      { type: "type", text: "\uD558", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uD558" },
      { type: "type", text: "\uD55C", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uD55C" },
      { type: "type", text: "\uD55C", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uD55C" },
      { type: "type", text: "\uD55C", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "compositionStart", data: "" },
      { type: "type", text: "\u3131", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u3131" },
      { type: "type", text: "\uADF8", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uADF8" },
      { type: "type", text: "\uAE00", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uAE00" },
      { type: "type", text: "\uAE00", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uAE00" },
      { type: "type", text: "\uAE00", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "type", text: " ", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("Windows 11 - Chrome - Korean (2)", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Windows, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "ControlLeft", ctrlKey: false, isComposing: false, key: "Control", keyCode: 17, location: 1, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1561, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyG", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1566, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 1566, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "\u314E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1566, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionupdate", data: "\u314E" },
        { timeStamp: 1567, state: { value: "aa\u314Eaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\u314E", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1681, state: { value: "aa\u314Eaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyG", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1681, state: { value: "aa\u314Eaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyG", ctrlKey: false, isComposing: true, key: "g", keyCode: 71, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2013, state: { value: "aa\u314Eaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2013, state: { value: "aa\u314Eaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uD558", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2013, state: { value: "aa\u314Eaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uD558" },
        { timeStamp: 2013, state: { value: "aa\uD558aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uD558", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2096, state: { value: "aa\uD558aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2096, state: { value: "aa\uD558aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "k", keyCode: 75, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2457, state: { value: "aa\uD558aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2457, state: { value: "aa\uD558aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uD55C", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2457, state: { value: "aa\uD558aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uD55C" },
        { timeStamp: 2457, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uD55C", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2568, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2568, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyS", ctrlKey: false, isComposing: true, key: "s", keyCode: 83, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3066, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3066, state: { value: "aa\uD55Caa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uD55C", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3066, state: { value: "aa\uD55Caa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uD55C" },
        { timeStamp: 3066, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uD55C", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3066, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionend", data: "\uD55C" },
        { timeStamp: 3070, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 3070, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\u3131", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3070, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\u3131" },
        { timeStamp: 3071, state: { value: "aa\uD55C\u3131aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\u3131", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3180, state: { value: "aa\uD55C\u3131aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3180, state: { value: "aa\uD55C\u3131aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "r", keyCode: 82, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3650, state: { value: "aa\uD55C\u3131aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyM", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3650, state: { value: "aa\uD55C\u3131aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\uADF8", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3650, state: { value: "aa\uD55C\u3131aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\uADF8" },
        { timeStamp: 3650, state: { value: "aa\uD55C\uADF8aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\uADF8", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3753, state: { value: "aa\uD55C\uADF8aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyM", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3768, state: { value: "aa\uD55C\uADF8aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyM", ctrlKey: false, isComposing: true, key: "m", keyCode: 77, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 4554, state: { value: "aa\uD55C\uADF8aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyF", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 4554, state: { value: "aa\uD55C\uADF8aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\uAE00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 4554, state: { value: "aa\uD55C\uADF8aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\uAE00" },
        { timeStamp: 4558, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\uAE00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 4685, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyF", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 4685, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyF", ctrlKey: false, isComposing: true, key: "f", keyCode: 70, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 6632, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionend", data: "\uAE00" },
        { timeStamp: 6634, state: { value: "aa\uD55C\uAE00aa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: null, inputType: "deleteContentBackward", isComposing: false },
        { timeStamp: 6634, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: null, inputType: "deleteContentBackward", isComposing: false },
        { timeStamp: 6634, state: { value: "aa\uD55Caa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uAE00", inputType: "insertText", isComposing: false },
        { timeStamp: 6634, state: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\uAE00", inputType: "insertText", isComposing: false }
      ],
      final: { value: "aa\uD55C\uAE00aa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\u314E", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u314E" },
      { type: "type", text: "\uD558", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uD558" },
      { type: "type", text: "\uD55C", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uD55C" },
      { type: "type", text: "\uD55C", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uD55C" },
      { type: "type", text: "\uD55C", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "compositionStart", data: "" },
      { type: "type", text: "\u3131", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u3131" },
      { type: "type", text: "\uADF8", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uADF8" },
      { type: "type", text: "\uAE00", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uAE00" },
      { type: "type", text: "\uAE00", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "type", text: "", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "type", text: "\uAE00", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("Windows - Chrome - Chinese", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Windows, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 0.8, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 0.9, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "n", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionupdate", data: "n" },
        { timeStamp: 1.2, state: { value: "aanaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "n", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 66.8, state: { value: "aanaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 67.9, state: { value: "aanaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 78, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 466.7, state: { value: "aanaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 470.1, state: { value: "aanaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "ni", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 470.2, state: { value: "aanaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "ni" },
        { timeStamp: 470.5, state: { value: "aaniaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "ni", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 563.2, state: { value: "aaniaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 564.2, state: { value: "aaniaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "i", keyCode: 73, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1835, state: { value: "aaniaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1837.2, state: { value: "aaniaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\u4F60", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1837.3, state: { value: "aaniaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\u4F60" },
        { timeStamp: 1837.7, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\u4F60", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1837.8, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionend", data: "\u4F60" },
        { timeStamp: 1914.9, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1916.1, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: " ", keyCode: 32, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3000.4, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyH", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3000.8, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 3000.8, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "h", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3000.9, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "h" },
        { timeStamp: 3001.3, state: { value: "aa\u4F60haa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "h", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3091.6, state: { value: "aa\u4F60haa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyH", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3092.6, state: { value: "aa\u4F60haa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyH", ctrlKey: false, isComposing: true, key: "h", keyCode: 72, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3131.5, state: { value: "aa\u4F60haa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyA", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3134.8, state: { value: "aa\u4F60haa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "ha", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3134.8, state: { value: "aa\u4F60haa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "ha" },
        { timeStamp: 3135.1, state: { value: "aa\u4F60haaa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "input", data: "ha", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3234.9, state: { value: "aa\u4F60haaa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyA", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3236.2, state: { value: "aa\u4F60haaa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyA", ctrlKey: false, isComposing: true, key: "a", keyCode: 65, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3491.7, state: { value: "aa\u4F60haaa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3494.8, state: { value: "aa\u4F60haaa", selectionStart: 3, selectionEnd: 5, selectionDirection: "forward" }, type: "beforeinput", data: "hao", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3495, state: { value: "aa\u4F60haaa", selectionStart: 3, selectionEnd: 5, selectionDirection: "forward" }, type: "compositionupdate", data: "hao" },
        { timeStamp: 3495.4, state: { value: "aa\u4F60haoaa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "input", data: "hao", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 3570.7, state: { value: "aa\u4F60haoaa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 3572.4, state: { value: "aa\u4F60haoaa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: true, key: "o", keyCode: 79, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 4739, state: { value: "aa\u4F60haoaa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 4742.1, state: { value: "aa\u4F60haoaa", selectionStart: 3, selectionEnd: 6, selectionDirection: "forward" }, type: "beforeinput", data: "\u597D", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 4742.1, state: { value: "aa\u4F60haoaa", selectionStart: 3, selectionEnd: 6, selectionDirection: "forward" }, type: "compositionupdate", data: "\u597D" },
        { timeStamp: 4742.5, state: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\u597D", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 4742.6, state: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionend", data: "\u597D" },
        { timeStamp: 4834.7, state: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 4836, state: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: " ", keyCode: 32, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "n", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "n" },
      { type: "type", text: "ni", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "ni" },
      { type: "type", text: "\u4F60", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u4F60" },
      { type: "type", text: "\u4F60", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "compositionStart", data: "" },
      { type: "type", text: "h", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "h" },
      { type: "type", text: "ha", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "ha" },
      { type: "type", text: "hao", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "hao" },
      { type: "type", text: "\u597D", replacePrevCharCnt: 3, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u597D" },
      { type: "type", text: "\u597D", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("Windows 11 - Chrome - Chinese", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Windows, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "n", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionupdate", data: "n" },
        { timeStamp: 1, state: { value: "aanaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "n", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 63, state: { value: "aanaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 63, state: { value: "aanaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyN", ctrlKey: false, isComposing: true, key: "n", keyCode: 78, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 331, state: { value: "aanaa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 331, state: { value: "aanaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "ni", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 331, state: { value: "aanaa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "ni" },
        { timeStamp: 342, state: { value: "aaniaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "ni", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 403, state: { value: "aaniaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 403, state: { value: "aaniaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyI", ctrlKey: false, isComposing: true, key: "i", keyCode: 73, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 614, state: { value: "aaniaa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 617, state: { value: "aaniaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "\u4F60", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 617, state: { value: "aaniaa", selectionStart: 2, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "\u4F60" },
        { timeStamp: 657, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\u4F60", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 658, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionend", data: "\u4F60" },
        { timeStamp: 715, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 715, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: " ", keyCode: 32, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1117, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyH", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1117, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 1117, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "h", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1117, state: { value: "aa\u4F60aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "h" },
        { timeStamp: 1117, state: { value: "aa\u4F60haa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "h", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1199, state: { value: "aa\u4F60haa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyH", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1199, state: { value: "aa\u4F60haa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyH", ctrlKey: false, isComposing: true, key: "h", keyCode: 72, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1317, state: { value: "aa\u4F60haa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyA", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1322, state: { value: "aa\u4F60haa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "beforeinput", data: "ha", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1322, state: { value: "aa\u4F60haa", selectionStart: 3, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionupdate", data: "ha" },
        { timeStamp: 1328, state: { value: "aa\u4F60haaa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "input", data: "ha", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1419, state: { value: "aa\u4F60haaa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyA", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1419, state: { value: "aa\u4F60haaa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyA", ctrlKey: false, isComposing: true, key: "a", keyCode: 65, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1592, state: { value: "aa\u4F60haaa", selectionStart: 5, selectionEnd: 5, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1592, state: { value: "aa\u4F60haaa", selectionStart: 3, selectionEnd: 5, selectionDirection: "forward" }, type: "beforeinput", data: "hao", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1592, state: { value: "aa\u4F60haaa", selectionStart: 3, selectionEnd: 5, selectionDirection: "forward" }, type: "compositionupdate", data: "hao" },
        { timeStamp: 1606, state: { value: "aa\u4F60haoaa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "input", data: "hao", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1666, state: { value: "aa\u4F60haoaa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1681, state: { value: "aa\u4F60haoaa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyO", ctrlKey: false, isComposing: true, key: "o", keyCode: 79, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2187, state: { value: "aa\u4F60haoaa", selectionStart: 6, selectionEnd: 6, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: true, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2187, state: { value: "aa\u4F60haoaa", selectionStart: 3, selectionEnd: 6, selectionDirection: "forward" }, type: "beforeinput", data: "\u597D", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2187, state: { value: "aa\u4F60haoaa", selectionStart: 3, selectionEnd: 6, selectionDirection: "forward" }, type: "compositionupdate", data: "\u597D" },
        { timeStamp: 2199, state: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "input", data: "\u597D", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 2199, state: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "compositionend", data: "\u597D" },
        { timeStamp: 2315, state: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: "Process", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 2323, state: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "Space", ctrlKey: false, isComposing: false, key: " ", keyCode: 32, location: 0, metaKey: false, repeat: false, shiftKey: false }
      ],
      final: { value: "aa\u4F60\u597Daa", selectionStart: 4, selectionEnd: 4, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "n", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "n" },
      { type: "type", text: "ni", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "ni" },
      { type: "type", text: "\u4F60", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u4F60" },
      { type: "type", text: "\u4F60", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" },
      { type: "compositionStart", data: "" },
      { type: "type", text: "h", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "h" },
      { type: "type", text: "ha", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "ha" },
      { type: "type", text: "hao", replacePrevCharCnt: 2, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "hao" },
      { type: "type", text: "\u597D", replacePrevCharCnt: 3, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u597D" },
      { type: "type", text: "\u597D", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
  test("Linux - Chrome - Korean", async () => {
    const recorded = {
      env: { OS: OperatingSystem.Linux, browser: { isAndroid: false, isFirefox: false, isChrome: true, isSafari: false } },
      initial: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" },
      events: [
        { timeStamp: 0, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "", ctrlKey: false, isComposing: false, key: "Unidentified", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1.2, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionstart", data: "" },
        { timeStamp: 1.3, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "beforeinput", data: "\u3131", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 1.4, state: { value: "aaaa", selectionStart: 2, selectionEnd: 2, selectionDirection: "forward" }, type: "compositionupdate", data: "\u3131" },
        { timeStamp: 1.7, state: { value: "aa\u3131aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\u3131", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 104.5, state: { value: "aa\u3131aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "r", keyCode: 82, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 150.6, state: { value: "aa\u3131aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "", ctrlKey: false, isComposing: true, key: "Unidentified", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 151.3, state: { value: "aa\u3131aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uAC00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 151.4, state: { value: "aa\u3131aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uAC00" },
        { timeStamp: 151.8, state: { value: "aa\uAC00aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uAC00", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 248.5, state: { value: "aa\uAC00aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyK", ctrlKey: false, isComposing: true, key: "k", keyCode: 75, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 322.9, state: { value: "aa\uAC00aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keydown", altKey: false, charCode: 0, code: "", ctrlKey: false, isComposing: true, key: "Unidentified", keyCode: 229, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 323.7, state: { value: "aa\uAC00aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "beforeinput", data: "\uAC01", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 323.9, state: { value: "aa\uAC00aa", selectionStart: 2, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionupdate", data: "\uAC01" },
        { timeStamp: 324.1, state: { value: "aa\uAC01aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "input", data: "\uAC01", inputType: "insertCompositionText", isComposing: true },
        { timeStamp: 448.5, state: { value: "aa\uAC01aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "keyup", altKey: false, charCode: 0, code: "KeyR", ctrlKey: false, isComposing: true, key: "r", keyCode: 82, location: 0, metaKey: false, repeat: false, shiftKey: false },
        { timeStamp: 1761, state: { value: "aa\uAC01aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }, type: "compositionend", data: "\uAC01" }
      ],
      final: { value: "aa\uAC01aa", selectionStart: 3, selectionEnd: 3, selectionDirection: "forward" }
    };
    const actualOutgoingEvents = await simulateInteraction(recorded);
    assert.deepStrictEqual(actualOutgoingEvents, [
      { type: "compositionStart", data: "" },
      { type: "type", text: "\u3131", replacePrevCharCnt: 0, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\u3131" },
      { type: "type", text: "\uAC00", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uAC00" },
      { type: "type", text: "\uAC01", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionUpdate", data: "\uAC01" },
      { type: "type", text: "\uAC01", replacePrevCharCnt: 1, replaceNextCharCnt: 0, positionDelta: 0 },
      { type: "compositionEnd" }
    ]);
    const actualResultingState = interpretTypeEvents(recorded.env.OS, recorded.env.browser, recorded.initial, actualOutgoingEvents);
    assert.deepStrictEqual(actualResultingState, recorded.final);
  });
});
//# sourceMappingURL=textAreaInput.test.js.map
