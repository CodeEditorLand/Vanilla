var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { applyFontInfo } from "./domFontInfo.js";
import { BareFontInfo } from "../../common/config/fontInfo.js";
var CharWidthRequestType = /* @__PURE__ */ ((CharWidthRequestType2) => {
  CharWidthRequestType2[CharWidthRequestType2["Regular"] = 0] = "Regular";
  CharWidthRequestType2[CharWidthRequestType2["Italic"] = 1] = "Italic";
  CharWidthRequestType2[CharWidthRequestType2["Bold"] = 2] = "Bold";
  return CharWidthRequestType2;
})(CharWidthRequestType || {});
class CharWidthRequest {
  static {
    __name(this, "CharWidthRequest");
  }
  chr;
  type;
  width;
  constructor(chr, type) {
    this.chr = chr;
    this.type = type;
    this.width = 0;
  }
  fulfill(width) {
    this.width = width;
  }
}
class DomCharWidthReader {
  static {
    __name(this, "DomCharWidthReader");
  }
  _bareFontInfo;
  _requests;
  _container;
  _testElements;
  constructor(bareFontInfo, requests) {
    this._bareFontInfo = bareFontInfo;
    this._requests = requests;
    this._container = null;
    this._testElements = null;
  }
  read(targetWindow) {
    this._createDomElements();
    targetWindow.document.body.appendChild(this._container);
    this._readFromDomElements();
    this._container?.remove();
    this._container = null;
    this._testElements = null;
  }
  _createDomElements() {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-50000px";
    container.style.width = "50000px";
    const regularDomNode = document.createElement("div");
    applyFontInfo(regularDomNode, this._bareFontInfo);
    container.appendChild(regularDomNode);
    const boldDomNode = document.createElement("div");
    applyFontInfo(boldDomNode, this._bareFontInfo);
    boldDomNode.style.fontWeight = "bold";
    container.appendChild(boldDomNode);
    const italicDomNode = document.createElement("div");
    applyFontInfo(italicDomNode, this._bareFontInfo);
    italicDomNode.style.fontStyle = "italic";
    container.appendChild(italicDomNode);
    const testElements = [];
    for (const request of this._requests) {
      let parent;
      if (request.type === 0 /* Regular */) {
        parent = regularDomNode;
      }
      if (request.type === 2 /* Bold */) {
        parent = boldDomNode;
      }
      if (request.type === 1 /* Italic */) {
        parent = italicDomNode;
      }
      parent.appendChild(document.createElement("br"));
      const testElement = document.createElement("span");
      DomCharWidthReader._render(testElement, request);
      parent.appendChild(testElement);
      testElements.push(testElement);
    }
    this._container = container;
    this._testElements = testElements;
  }
  static _render(testElement, request) {
    if (request.chr === " ") {
      let htmlString = "\xA0";
      for (let i = 0; i < 8; i++) {
        htmlString += htmlString;
      }
      testElement.innerText = htmlString;
    } else {
      let testString = request.chr;
      for (let i = 0; i < 8; i++) {
        testString += testString;
      }
      testElement.textContent = testString;
    }
  }
  _readFromDomElements() {
    for (let i = 0, len = this._requests.length; i < len; i++) {
      const request = this._requests[i];
      const testElement = this._testElements[i];
      request.fulfill(testElement.offsetWidth / 256);
    }
  }
}
function readCharWidths(targetWindow, bareFontInfo, requests) {
  const reader = new DomCharWidthReader(bareFontInfo, requests);
  reader.read(targetWindow);
}
__name(readCharWidths, "readCharWidths");
export {
  CharWidthRequest,
  CharWidthRequestType,
  readCharWidths
};
//# sourceMappingURL=charWidthReader.js.map
