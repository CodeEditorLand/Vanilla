import { createDecorator } from "../../instantiation/common/instantiation.js";
const IOpenerService = createDecorator("openerService");
function withSelection(uri, selection) {
  return uri.with({
    fragment: `${selection.startLineNumber},${selection.startColumn}${selection.endLineNumber ? `-${selection.endLineNumber}${selection.endColumn ? `,${selection.endColumn}` : ""}` : ""}`
  });
}
function extractSelection(uri) {
  let selection;
  const match = /^L?(\d+)(?:,(\d+))?(-L?(\d+)(?:,(\d+))?)?/.exec(
    uri.fragment
  );
  if (match) {
    selection = {
      startLineNumber: Number.parseInt(match[1]),
      startColumn: match[2] ? Number.parseInt(match[2]) : 1,
      endLineNumber: match[4] ? Number.parseInt(match[4]) : void 0,
      endColumn: match[4] ? match[5] ? Number.parseInt(match[5]) : 1 : void 0
    };
    uri = uri.with({ fragment: "" });
  }
  return { selection, uri };
}
export {
  IOpenerService,
  extractSelection,
  withSelection
};
