import a from"assert";import{removeProperty as c,setProperty as r}from"../../common/jsonEdit.js";import"../../common/jsonFormatter.js";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"./utils.js";suite("JSON - edits",()=>{m();function e(n,t,f){a(t);let b=n.length;for(let i=t.length-1;i>=0;i--){const s=t[i];a(s.offset>=0&&s.length>=0&&s.offset+s.length<=n.length),a(typeof s.content=="string"),a(b>=s.offset+s.length),b=s.offset,n=n.substring(0,s.offset)+s.content+n.substring(s.offset+s.length)}a.strictEqual(n,f)}const o={insertSpaces:!0,tabSize:2,eol:`
`};test("set property",()=>{let n=`{
  "x": "y"
}`,t=r(n,["x"],"bar",o);e(n,t,`{
  "x": "bar"
}`),n="true",t=r(n,[],"bar",o),e(n,t,'"bar"'),n=`{
  "x": "y"
}`,t=r(n,["x"],{key:!0},o),e(n,t,`{
  "x": {
    "key": true
  }
}`),n=`{
  "a": "b",  "x": "y"
}`,t=r(n,["a"],null,o),e(n,t,`{
  "a": null,  "x": "y"
}`)}),test("insert property",()=>{let n="{}",t=r(n,["foo"],"bar",o);e(n,t,`{
  "foo": "bar"
}`),t=r(n,["foo","foo2"],"bar",o),e(n,t,`{
  "foo": {
    "foo2": "bar"
  }
}`),n=`{
}`,t=r(n,["foo"],"bar",o),e(n,t,`{
  "foo": "bar"
}`),n=`  {
  }`,t=r(n,["foo"],"bar",o),e(n,t,`  {
    "foo": "bar"
  }`),n=`{
  "x": "y"
}`,t=r(n,["foo"],"bar",o),e(n,t,`{
  "x": "y",
  "foo": "bar"
}`),n=`{
  "x": "y"
}`,t=r(n,["e"],"null",o),e(n,t,`{
  "x": "y",
  "e": "null"
}`),t=r(n,["x"],"bar",o),e(n,t,`{
  "x": "bar"
}`),n=`{
  "x": {
    "a": 1,
    "b": true
  }
}
`,t=r(n,["x"],"bar",o),e(n,t,`{
  "x": "bar"
}
`),t=r(n,["x","b"],"bar",o),e(n,t,`{
  "x": {
    "a": 1,
    "b": "bar"
  }
}
`),t=r(n,["x","c"],"bar",o,()=>0),e(n,t,`{
  "x": {
    "c": "bar",
    "a": 1,
    "b": true
  }
}
`),t=r(n,["x","c"],"bar",o,()=>1),e(n,t,`{
  "x": {
    "a": 1,
    "c": "bar",
    "b": true
  }
}
`),t=r(n,["x","c"],"bar",o,()=>2),e(n,t,`{
  "x": {
    "a": 1,
    "b": true,
    "c": "bar"
  }
}
`),t=r(n,["c"],"bar",o),e(n,t,`{
  "x": {
    "a": 1,
    "b": true
  },
  "c": "bar"
}
`),n=`{
  "a": [
    {
    } 
  ]  
}`,t=r(n,["foo"],"bar",o),e(n,t,`{
  "a": [
    {
    } 
  ],
  "foo": "bar"
}`),n="",t=r(n,["foo",0],"bar",o),e(n,t,`{
  "foo": [
    "bar"
  ]
}`),n="//comment",t=r(n,["foo",0],"bar",o),e(n,t,`{
  "foo": [
    "bar"
  ]
} //comment`)}),test("remove property",()=>{let n=`{
  "x": "y"
}`,t=c(n,["x"],o);e(n,t,`{
}`),n=`{
  "x": "y", "a": []
}`,t=c(n,["x"],o),e(n,t,`{
  "a": []
}`),n=`{
  "x": "y", "a": []
}`,t=c(n,["a"],o),e(n,t,`{
  "x": "y"
}`)}),test("insert item at 0",()=>{const n=`[
  2,
  3
]`,t=r(n,[0],1,o);e(n,t,`[
  1,
  2,
  3
]`)}),test("insert item at 0 in empty array",()=>{const n=`[
]`,t=r(n,[0],1,o);e(n,t,`[
  1
]`)}),test("insert item at an index",()=>{const n=`[
  1,
  3
]`,t=r(n,[1],2,o);e(n,t,`[
  1,
  2,
  3
]`)}),test("insert item at an index im empty array",()=>{const n=`[
]`,t=r(n,[1],1,o);e(n,t,`[
  1
]`)}),test("insert item at end index",()=>{const n=`[
  1,
  2
]`,t=r(n,[2],3,o);e(n,t,`[
  1,
  2,
  3
]`)}),test("insert item at end to empty array",()=>{const n=`[
]`,t=r(n,[-1],"bar",o);e(n,t,`[
  "bar"
]`)}),test("insert item at end",()=>{const n=`[
  1,
  2
]`,t=r(n,[-1],"bar",o);e(n,t,`[
  1,
  2,
  "bar"
]`)}),test("remove item in array with one item",()=>{const n=`[
  1
]`,t=r(n,[0],void 0,o);e(n,t,"[]")}),test("remove item in the middle of the array",()=>{const n=`[
  1,
  2,
  3
]`,t=r(n,[1],void 0,o);e(n,t,`[
  1,
  3
]`)}),test("remove last item in the array",()=>{const n=`[
  1,
  2,
  "bar"
]`,t=r(n,[2],void 0,o);e(n,t,`[
  1,
  2
]`)}),test("remove last item in the array if ends with comma",()=>{const n=`[
  1,
  "foo",
  "bar",
]`,t=r(n,[2],void 0,o);e(n,t,`[
  1,
  "foo"
]`)}),test("remove last item in the array if there is a comment in the beginning",()=>{const n=`// This is a comment
[
  1,
  "foo",
  "bar"
]`,t=r(n,[2],void 0,o);e(n,t,`// This is a comment
[
  1,
  "foo"
]`)})});
