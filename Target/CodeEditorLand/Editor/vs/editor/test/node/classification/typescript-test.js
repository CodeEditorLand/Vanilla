const x01 = "string";
const x02 = "'";
const x03 = "\n'	";
const x04 = "this is///         ^^^^^^^^^ stringa multiline string";
const x05 = x01;
const x06 = x05;
const x07 = 4 / 5;
const x08 = `howdy`;
const x09 = `'"\``;
const x10 = `$[]`;
const x11 = `${x07 + /**/
3}px`;
const x12 = `${x07 + /* @__PURE__ */ function() {
  return 5;
}()}px`;
const x13 = /([\w\-]+)?(#([\w\-]+))?((.([\w\-]+))*)/;
const x14 = /\./g;
const x15 = Math.abs(x07) / x07;
const x16 = / x07; /.test("3");
const x17 = `.monaco-dialog-modal-block${true ? ".dimmed" : ""}`;
const x18 = Math.min(14 <= 0.5 ? 123 / (2 * 1) : "".length / (2 - 2 * 1), 1);
const x19 = `${3 / "5".length} km/h)`;
//# sourceMappingURL=typescript-test.js.map
