import r from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as i}from"../../../../base/test/common/utils.js";import{OPTIONS as a,parseArgs as o}from"../../node/argv.js";import{getUserDataPath as p}from"../../node/userDataPath.js";import n from"../../../product/common/product.js";suite("User data path",()=>{test("getUserDataPath - default",()=>{const e=p(o(process.argv,a),n.nameShort);r.ok(e.length>0)}),test("getUserDataPath - portable mode",()=>{const e=process.env.VSCODE_PORTABLE;try{const t="portable-dir";process.env.VSCODE_PORTABLE=t;const s=p(o(process.argv,a),n.nameShort);r.ok(s.includes(t))}finally{typeof e=="string"?process.env.VSCODE_PORTABLE=e:delete process.env.VSCODE_PORTABLE}}),test("getUserDataPath - --user-data-dir",()=>{const e="cli-data-dir",t=o(process.argv,a);t["user-data-dir"]=e;const s=p(t,n.nameShort);r.ok(s.includes(e))}),test("getUserDataPath - VSCODE_APPDATA",()=>{const e=process.env.VSCODE_APPDATA;try{const t="appdata-dir";process.env.VSCODE_APPDATA=t;const s=p(o(process.argv,a),n.nameShort);r.ok(s.includes(t))}finally{typeof e=="string"?process.env.VSCODE_APPDATA=e:delete process.env.VSCODE_APPDATA}}),i()});
