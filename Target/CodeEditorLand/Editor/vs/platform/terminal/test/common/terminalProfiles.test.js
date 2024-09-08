import{deepStrictEqual as e}from"assert";import{Codicon as r}from"../../../../base/common/codicons.js";import{ensureNoDisposablesAreLeakedInTestSuite as l}from"../../../../base/test/common/utils.js";import"../../common/terminal.js";import{createProfileSchemaEnums as t}from"../../common/terminalProfiles.js";suite("terminalProfiles",()=>{l(),suite("createProfileSchemaEnums",()=>{test("should return an empty array when there are no profiles",()=>{e(t([]),{values:[null],markdownDescriptions:["Automatically detect the default"]})}),test("should return a single entry when there is one profile",()=>{e(t([{profileName:"name",path:"path",isDefault:!0}]),{values:[null,"name"],markdownDescriptions:["Automatically detect the default",`$(terminal) name
- path: path`]})}),test("should show all profile information",()=>{const a={profileName:"name",path:"path",isDefault:!0,args:["a","b"],color:"terminal.ansiRed",env:{c:"d",e:"f"},icon:r.zap,overrideName:!0};e(t([a]),{values:[null,"name"],markdownDescriptions:["Automatically detect the default",`$(zap) name
- path: path
- args: ['a','b']
- overrideName: true
- color: terminal.ansiRed
- env: {"c":"d","e":"f"}`]})}),test("should return a multiple entries when there are multiple profiles",()=>{e(t([{profileName:"name",path:"path",isDefault:!0},{profileName:"foo",path:"bar",isDefault:!1}]),{values:[null,"name","foo"],markdownDescriptions:["Automatically detect the default",`$(terminal) name
- path: path`,`$(terminal) foo
- path: bar`]})})})});
