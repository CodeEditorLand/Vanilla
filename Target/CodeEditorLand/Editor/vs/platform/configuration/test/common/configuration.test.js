import t from"assert";import{merge as s,removeFromValueTree as r}from"../../common/configuration.js";import{mergeChanges as a}from"../../common/configurationModels.js";suite("Configuration",()=>{test("simple merge",()=>{let e={a:1,b:2};s(e,{a:3,c:4},!0),t.deepStrictEqual(e,{a:3,b:2,c:4}),e={a:1,b:2},s(e,{a:3,c:4},!1),t.deepStrictEqual(e,{a:1,b:2,c:4})}),test("object merge",()=>{const e={a:{b:1,c:!0,d:2}};s(e,{a:{b:void 0,c:!1,e:"a"}},!0),t.deepStrictEqual(e,{a:{b:void 0,c:!1,d:2,e:"a"}})}),test("array merge",()=>{const e={a:["b","c"]};s(e,{a:["b","d"]},!0),t.deepStrictEqual(e,{a:["b","d"]})}),test("removeFromValueTree: remove a non existing key",()=>{const e={a:{b:2}};r(e,"c"),t.deepStrictEqual(e,{a:{b:2}})}),test("removeFromValueTree: remove a multi segmented key from an object that has only sub sections of the key",()=>{const e={a:{b:2}};r(e,"a.b.c"),t.deepStrictEqual(e,{a:{b:2}})}),test("removeFromValueTree: remove a single segmented key",()=>{const e={a:1};r(e,"a"),t.deepStrictEqual(e,{})}),test("removeFromValueTree: remove a single segmented key when its value is undefined",()=>{const e={a:void 0};r(e,"a"),t.deepStrictEqual(e,{})}),test("removeFromValueTree: remove a multi segmented key when its value is undefined",()=>{const e={a:{b:1}};r(e,"a.b"),t.deepStrictEqual(e,{})}),test("removeFromValueTree: remove a multi segmented key when its value is array",()=>{const e={a:{b:[1]}};r(e,"a.b"),t.deepStrictEqual(e,{})}),test("removeFromValueTree: remove a multi segmented key first segment value is array",()=>{const e={a:[1]};r(e,"a.0"),t.deepStrictEqual(e,{a:[1]})}),test("removeFromValueTree: remove when key is the first segmenet",()=>{const e={a:{b:1}};r(e,"a"),t.deepStrictEqual(e,{})}),test("removeFromValueTree: remove a multi segmented key when the first node has more values",()=>{const e={a:{b:{c:1},d:1}};r(e,"a.b.c"),t.deepStrictEqual(e,{a:{d:1}})}),test("removeFromValueTree: remove a multi segmented key when in between node has more values",()=>{const e={a:{b:{c:{d:1},d:1}}};r(e,"a.b.c.d"),t.deepStrictEqual(e,{a:{b:{d:1}}})}),test("removeFromValueTree: remove a multi segmented key when the last but one node has more values",()=>{const e={a:{b:{c:1,d:1}}};r(e,"a.b.c"),t.deepStrictEqual(e,{a:{b:{d:1}}})})}),suite("Configuration Changes: Merge",()=>{test("merge only keys",()=>{const e=a({keys:["a","b"],overrides:[]},{keys:["c","d"],overrides:[]});t.deepStrictEqual(e,{keys:["a","b","c","d"],overrides:[]})}),test("merge only keys with duplicates",()=>{const e=a({keys:["a","b"],overrides:[]},{keys:["c","d"],overrides:[]},{keys:["a","d","e"],overrides:[]});t.deepStrictEqual(e,{keys:["a","b","c","d","e"],overrides:[]})}),test("merge only overrides",()=>{const e=a({keys:[],overrides:[["a",["1","2"]]]},{keys:[],overrides:[["b",["3","4"]]]});t.deepStrictEqual(e,{keys:[],overrides:[["a",["1","2"]],["b",["3","4"]]]})}),test("merge only overrides with duplicates",()=>{const e=a({keys:[],overrides:[["a",["1","2"]],["b",["5","4"]]]},{keys:[],overrides:[["b",["3","4"]]]},{keys:[],overrides:[["c",["1","4"]],["a",["2","3"]]]});t.deepStrictEqual(e,{keys:[],overrides:[["a",["1","2","3"]],["b",["5","4","3"]],["c",["1","4"]]]})}),test("merge",()=>{const e=a({keys:["b","b"],overrides:[["a",["1","2"]],["b",["5","4"]]]},{keys:["b"],overrides:[["b",["3","4"]]]},{keys:["c","a"],overrides:[["c",["1","4"]],["a",["2","3"]]]});t.deepStrictEqual(e,{keys:["b","c","a"],overrides:[["a",["1","2","3"]],["b",["5","4","3"]],["c",["1","4"]]]})}),test("merge single change",()=>{const e=a({keys:["b","b"],overrides:[["a",["1","2"]],["b",["5","4"]]]});t.deepStrictEqual(e,{keys:["b","b"],overrides:[["a",["1","2"]],["b",["5","4"]]]})}),test("merge no changes",()=>{const e=a();t.deepStrictEqual(e,{keys:[],overrides:[]})})});