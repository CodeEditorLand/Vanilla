var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { IRecorded, IRecordedCompositionEvent, IRecordedEvent, IRecordedInputEvent, IRecordedKeyboardEvent, IRecordedTextareaState } from "./imeRecordedTypes.js";
import * as browser from "../../../../base/browser/browser.js";
import * as platform from "../../../../base/common/platform.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { TextAreaWrapper } from "../../../browser/controller/editContext/textArea/textAreaEditContextInput.js";
(() => {
  const startButton = mainWindow.document.getElementById("startRecording");
  const endButton = mainWindow.document.getElementById("endRecording");
  let inputarea;
  const disposables = new DisposableStore();
  let originTimeStamp = 0;
  let recorded = {
    env: null,
    initial: null,
    events: [],
    final: null
  };
  const readTextareaState = /* @__PURE__ */ __name(() => {
    return {
      selectionDirection: inputarea.selectionDirection,
      selectionEnd: inputarea.selectionEnd,
      selectionStart: inputarea.selectionStart,
      value: inputarea.value
    };
  }, "readTextareaState");
  startButton.onclick = () => {
    disposables.clear();
    startTest();
    originTimeStamp = 0;
    recorded = {
      env: {
        OS: platform.OS,
        browser: {
          isAndroid: browser.isAndroid,
          isFirefox: browser.isFirefox,
          isChrome: browser.isChrome,
          isSafari: browser.isSafari
        }
      },
      initial: readTextareaState(),
      events: [],
      final: null
    };
  };
  endButton.onclick = () => {
    recorded.final = readTextareaState();
    console.log(printRecordedData());
  };
  function printRecordedData() {
    const lines = [];
    lines.push(`const recorded: IRecorded = {`);
    lines.push(`	env: ${JSON.stringify(recorded.env)}, `);
    lines.push(`	initial: ${printState(recorded.initial)}, `);
    lines.push(`	events: [
		${recorded.events.map((ev) => printEvent(ev)).join(",\n		")}
	],`);
    lines.push(`	final: ${printState(recorded.final)},`);
    lines.push(`}`);
    return lines.join("\n");
    function printString(str) {
      return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }
    __name(printString, "printString");
    function printState(state) {
      return `{ value: '${printString(state.value)}', selectionStart: ${state.selectionStart}, selectionEnd: ${state.selectionEnd}, selectionDirection: '${state.selectionDirection}' }`;
    }
    __name(printState, "printState");
    function printEvent(ev) {
      if (ev.type === "keydown" || ev.type === "keypress" || ev.type === "keyup") {
        return `{ timeStamp: ${ev.timeStamp.toFixed(2)}, state: ${printState(ev.state)}, type: '${ev.type}', altKey: ${ev.altKey}, charCode: ${ev.charCode}, code: '${ev.code}', ctrlKey: ${ev.ctrlKey}, isComposing: ${ev.isComposing}, key: '${ev.key}', keyCode: ${ev.keyCode}, location: ${ev.location}, metaKey: ${ev.metaKey}, repeat: ${ev.repeat}, shiftKey: ${ev.shiftKey} }`;
      }
      if (ev.type === "compositionstart" || ev.type === "compositionupdate" || ev.type === "compositionend") {
        return `{ timeStamp: ${ev.timeStamp.toFixed(2)}, state: ${printState(ev.state)}, type: '${ev.type}', data: '${printString(ev.data)}' }`;
      }
      if (ev.type === "beforeinput" || ev.type === "input") {
        return `{ timeStamp: ${ev.timeStamp.toFixed(2)}, state: ${printState(ev.state)}, type: '${ev.type}', data: ${ev.data === null ? "null" : `'${printString(ev.data)}'`}, inputType: '${ev.inputType}', isComposing: ${ev.isComposing} }`;
      }
      return JSON.stringify(ev);
    }
    __name(printEvent, "printEvent");
  }
  __name(printRecordedData, "printRecordedData");
  function startTest() {
    inputarea = document.createElement("textarea");
    mainWindow.document.body.appendChild(inputarea);
    inputarea.focus();
    disposables.add(toDisposable(() => {
      inputarea.remove();
    }));
    const wrapper = disposables.add(new TextAreaWrapper(inputarea));
    wrapper.setValue("", `aaaa`);
    wrapper.setSelectionRange("", 2, 2);
    const recordEvent = /* @__PURE__ */ __name((e) => {
      recorded.events.push(e);
    }, "recordEvent");
    const recordKeyboardEvent = /* @__PURE__ */ __name((e) => {
      if (e.type !== "keydown" && e.type !== "keypress" && e.type !== "keyup") {
        throw new Error(`Not supported!`);
      }
      if (originTimeStamp === 0) {
        originTimeStamp = e.timeStamp;
      }
      const ev = {
        timeStamp: e.timeStamp - originTimeStamp,
        state: readTextareaState(),
        type: e.type,
        altKey: e.altKey,
        charCode: e.charCode,
        code: e.code,
        ctrlKey: e.ctrlKey,
        isComposing: e.isComposing,
        key: e.key,
        keyCode: e.keyCode,
        location: e.location,
        metaKey: e.metaKey,
        repeat: e.repeat,
        shiftKey: e.shiftKey
      };
      recordEvent(ev);
    }, "recordKeyboardEvent");
    const recordCompositionEvent = /* @__PURE__ */ __name((e) => {
      if (e.type !== "compositionstart" && e.type !== "compositionupdate" && e.type !== "compositionend") {
        throw new Error(`Not supported!`);
      }
      if (originTimeStamp === 0) {
        originTimeStamp = e.timeStamp;
      }
      const ev = {
        timeStamp: e.timeStamp - originTimeStamp,
        state: readTextareaState(),
        type: e.type,
        data: e.data
      };
      recordEvent(ev);
    }, "recordCompositionEvent");
    const recordInputEvent = /* @__PURE__ */ __name((e) => {
      if (e.type !== "beforeinput" && e.type !== "input") {
        throw new Error(`Not supported!`);
      }
      if (originTimeStamp === 0) {
        originTimeStamp = e.timeStamp;
      }
      const ev = {
        timeStamp: e.timeStamp - originTimeStamp,
        state: readTextareaState(),
        type: e.type,
        data: e.data,
        inputType: e.inputType,
        isComposing: e.isComposing
      };
      recordEvent(ev);
    }, "recordInputEvent");
    wrapper.onKeyDown(recordKeyboardEvent);
    wrapper.onKeyPress(recordKeyboardEvent);
    wrapper.onKeyUp(recordKeyboardEvent);
    wrapper.onCompositionStart(recordCompositionEvent);
    wrapper.onCompositionUpdate(recordCompositionEvent);
    wrapper.onCompositionEnd(recordCompositionEvent);
    wrapper.onBeforeInput(recordInputEvent);
    wrapper.onInput(recordInputEvent);
  }
  __name(startTest, "startTest");
})();
//# sourceMappingURL=imeRecorder.js.map
