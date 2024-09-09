import n from"assert";import{parse as o,stripComments as r}from"../../common/jsonc.js";import{ensureNoDisposablesAreLeakedInTestSuite as s}from"./utils.js";suite("JSON Parse",()=>{s(),test("Line comment",()=>{const e=["{",'  "prop": 10 // a comment',"}"].join(`
`),t=["{",'  "prop": 10 ',"}"].join(`
`);n.deepEqual(o(e),JSON.parse(t))}),test("Line comment - EOF",()=>{const e=["{","}","// a comment"].join(`
`),t=["{","}",""].join(`
`);n.deepEqual(o(e),JSON.parse(t))}),test("Line comment - \\r\\n",()=>{const e=["{",'  "prop": 10 // a comment',"}"].join(`\r
`),t=["{",'  "prop": 10 ',"}"].join(`\r
`);n.deepEqual(o(e),JSON.parse(t))}),test("Line comment - EOF - \\r\\n",()=>{const e=["{","}","// a comment"].join(`\r
`),t=["{","}",""].join(`\r
`);n.deepEqual(o(e),JSON.parse(t))}),test("Block comment - single line",()=>{const e=["{",'  /* before */"prop": 10/* after */',"}"].join(`
`),t=["{",'  "prop": 10',"}"].join(`
`);n.deepEqual(o(e),JSON.parse(t))}),test("Block comment - multi line",()=>{const e=["{","  /**","   * Some comment","   */",'  "prop": 10',"}"].join(`
`),t=["{","  ",'  "prop": 10',"}"].join(`
`);n.deepEqual(o(e),JSON.parse(t))}),test("Block comment - shortest match",()=>{n.strictEqual(r("/* abc */ */")," */")}),test("No strings - double quote",()=>{const e=["{",'  "/* */": 10',"}"].join(`
`),t=["{",'  "/* */": 10',"}"].join(`
`);n.deepEqual(o(e),JSON.parse(t))}),test("No strings - single quote",()=>{const e=["{","  '/* */': 10","}"].join(`
`),t=["{","  '/* */': 10","}"].join(`
`);n.strictEqual(r(e),t)}),test("Trailing comma in object",()=>{const e=["{",'  "a": 10,',"}"].join(`
`),t=["{",'  "a": 10',"}"].join(`
`);n.deepEqual(o(e),JSON.parse(t))}),test("Trailing comma in array",()=>{const e=['[ "a", "b", "c", ]'].join(`
`),t=['[ "a", "b", "c" ]'].join(`
`);n.deepEqual(o(e),JSON.parse(t))}),test("Trailing comma",()=>{const e=["{",'  "propA": 10, // a comment','  "propB": false, // a trailing comma',"}"].join(`
`),t=["{",'  "propA": 10,','  "propB": false',"}"].join(`
`);n.deepEqual(o(e),JSON.parse(t))}),test("Trailing comma - EOF",()=>{n.deepEqual(o(`
// This configuration file allows you to pass permanent command line arguments to VS Code.
// Only a subset of arguments is currently supported to reduce the likelihood of breaking
// the installation.
//
// PLEASE DO NOT CHANGE WITHOUT UNDERSTANDING THE IMPACT
//
// NOTE: Changing this file requires a restart of VS Code.
{
	// Use software rendering instead of hardware accelerated rendering.
	// This can help in cases where you see rendering issues in VS Code.
	// "disable-hardware-acceleration": true,
	// Allows to disable crash reporting.
	// Should restart the app if the value is changed.
	"enable-crash-reporter": true,
	// Unique id used for correlating crash reports sent from this instance.
	// Do not edit this value.
	"crash-reporter-id": "aaaaab31-7453-4506-97d0-93411b2c21c7",
	"locale": "en",
	// "log-level": "trace"
}
`),{"enable-crash-reporter":!0,"crash-reporter-id":"aaaaab31-7453-4506-97d0-93411b2c21c7",locale:"en"})})});
