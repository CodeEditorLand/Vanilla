import {
  convertLinkRangeToBuffer,
  getXtermLineContent
} from "./terminalLinkHelpers.js";
class TerminalExternalLinkDetector {
  constructor(id, xterm, _provideLinks) {
    this.id = id;
    this.xterm = xterm;
    this._provideLinks = _provideLinks;
  }
  maxLinkLength = 2e3;
  async detect(lines, startLine, endLine) {
    const text = getXtermLineContent(
      this.xterm.buffer.active,
      startLine,
      endLine,
      this.xterm.cols
    );
    if (text === "" || text.length > this.maxLinkLength) {
      return [];
    }
    const externalLinks = await this._provideLinks(text);
    if (!externalLinks) {
      return [];
    }
    const result = externalLinks.map((link) => {
      const bufferRange = convertLinkRangeToBuffer(
        lines,
        this.xterm.cols,
        {
          startColumn: link.startIndex + 1,
          startLineNumber: 1,
          endColumn: link.startIndex + link.length + 1,
          endLineNumber: 1
        },
        startLine
      );
      const matchingText = text.substring(
        link.startIndex,
        link.startIndex + link.length
      ) || "";
      const l = {
        text: matchingText,
        label: link.label,
        bufferRange,
        type: { id: this.id },
        activate: link.activate
      };
      return l;
    });
    return result;
  }
}
export {
  TerminalExternalLinkDetector
};
