import t from"assert";import{LanguagesRegistry as r}from"../../../editor/common/services/languagesRegistry.js";function a(){t.strictEqual(r.instanceCount,0,"Error: Test run should not leak in LanguagesRegistry.")}export{a as assertCleanState};