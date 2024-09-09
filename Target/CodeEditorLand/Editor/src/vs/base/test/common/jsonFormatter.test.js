import i from"assert";import*as r from"../../common/jsonFormatter.js";import{ensureNoDisposablesAreLeakedInTestSuite as d}from"./utils.js";suite("JSON - formatter",()=>{d();function e(n,t,s=!0){let o;const m=n.indexOf("|"),l=n.lastIndexOf("|");m!==-1&&l!==-1&&(n=n.substring(0,m)+n.substring(m+1,l)+n.substring(l+1),o={offset:m,length:l-m});const u=r.format(n,o,{tabSize:2,insertSpaces:s,eol:`
`});let j=n.length;for(let a=u.length-1;a>=0;a--){const c=u[a];i(c.offset>=0&&c.length>=0&&c.offset+c.length<=n.length),i(typeof c.content=="string"),i(j>=c.offset+c.length),j=c.offset,n=n.substring(0,c.offset)+c.content+n.substring(c.offset+c.length)}i.strictEqual(n,t)}test("object - single property",()=>{const n=['{"x" : 1}'].join(`
`),t=["{",'  "x": 1',"}"].join(`
`);e(n,t)}),test("object - multiple properties",()=>{const n=['{"x" : 1,  "y" : "foo", "z"  : true}'].join(`
`),t=["{",'  "x": 1,','  "y": "foo",','  "z": true',"}"].join(`
`);e(n,t)}),test("object - no properties ",()=>{const n=['{"x" : {    },  "y" : {}}'].join(`
`),t=["{",'  "x": {},','  "y": {}',"}"].join(`
`);e(n,t)}),test("object - nesting",()=>{const n=['{"x" : {  "y" : { "z"  : { }}, "a": true}}'].join(`
`),t=["{",'  "x": {','    "y": {','      "z": {}',"    },",'    "a": true',"  }","}"].join(`
`);e(n,t)}),test("array - single items",()=>{const n=['["[]"]'].join(`
`),t=["[",'  "[]"',"]"].join(`
`);e(n,t)}),test("array - multiple items",()=>{const n=["[true,null,1.2]"].join(`
`),t=["[","  true,","  null,","  1.2","]"].join(`
`);e(n,t)}),test("array - no items",()=>{const n=["[      ]"].join(`
`),t=["[]"].join(`
`);e(n,t)}),test("array - nesting",()=>{const n=['[ [], [ [ {} ], "a" ]  ]'].join(`
`),t=["[","  [],","  [","    [","      {}","    ],",'    "a"',"  ]","]"].join(`
`);e(n,t)}),test("syntax errors",()=>{const n=["[ null 1.2 ]"].join(`
`),t=["[","  null 1.2","]"].join(`
`);e(n,t)}),test("empty lines",()=>{const n=["{",'"a": true,',"",'"b": true',"}"].join(`
`),t=["{",'	"a": true,','	"b": true',"}"].join(`
`);e(n,t,!1)}),test("single line comment",()=>{const n=["[ ","//comment",'"foo", "bar"',"] "].join(`
`),t=["[","  //comment",'  "foo",','  "bar"',"]"].join(`
`);e(n,t)}),test("block line comment",()=>{const n=["[{","        /*comment*/     ",'"foo" : true',"}] "].join(`
`),t=["[","  {","    /*comment*/",'    "foo": true',"  }","]"].join(`
`);e(n,t)}),test("single line comment on same line",()=>{const n=[" {  ",'        "a": {}// comment    '," } "].join(`
`),t=["{",'  "a": {} // comment    ',"}"].join(`
`);e(n,t)}),test("single line comment on same line 2",()=>{const n=["{ //comment","}"].join(`
`),t=["{ //comment","}"].join(`
`);e(n,t)}),test("block comment on same line",()=>{const n=['{      "a": {}, /*comment*/    ','        /*comment*/ "b": {},    ','        "c": {/*comment*/}    } '].join(`
`),t=["{",'  "a": {}, /*comment*/','  /*comment*/ "b": {},','  "c": { /*comment*/}',"}"].join(`
`);e(n,t)}),test("block comment on same line advanced",()=>{const n=[' {       "d": [',"             null","        ] /*comment*/",'        ,"e": /*comment*/ [null] }'].join(`
`),t=["{",'  "d": [',"    null","  ] /*comment*/,",'  "e": /*comment*/ [',"    null","  ]","}"].join(`
`);e(n,t)}),test("multiple block comments on same line",()=>{const n=['{      "a": {} /*comment*/, /*comment*/   ','        /*comment*/ "b": {}  /*comment*/  } '].join(`
`),t=["{",'  "a": {} /*comment*/, /*comment*/','  /*comment*/ "b": {} /*comment*/',"}"].join(`
`);e(n,t)}),test("multiple mixed comments on same line",()=>{const n=["[ /*comment*/  /*comment*/   // comment ","]"].join(`
`),t=["[ /*comment*/ /*comment*/ // comment ","]"].join(`
`);e(n,t)}),test("range",()=>{const n=['{ "a": {},','|"b": [null, null]|',"} "].join(`
`),t=['{ "a": {},','"b": [',"  null,","  null","]","} "].join(`
`);e(n,t)}),test("range with existing indent",()=>{const n=['{ "a": {},','   |"b": [null],','"c": {}',"}|"].join(`
`),t=['{ "a": {},','   "b": [',"    null","  ],",'  "c": {}',"}"].join(`
`);e(n,t)}),test("range with existing indent - tabs",()=>{const n=['{ "a": {},','|  "b": [null],   ','"c": {}',"} |    "].join(`
`),t=['{ "a": {},','	"b": [',"		null","	],",'	"c": {}',"}"].join(`
`);e(n,t,!1)}),test("block comment none-line breaking symbols",()=>{const n=['{ "a": [ 1',"/* comment */",", 2","/* comment */","]","/* comment */",",",' "b": true',"/* comment */","}"].join(`
`),t=["{",'  "a": [',"    1","    /* comment */","    ,","    2","    /* comment */","  ]","  /* comment */","  ,",'  "b": true',"  /* comment */","}"].join(`
`);e(n,t)}),test("line comment after none-line breaking symbols",()=>{const n=['{ "a":',"// comment","null,",' "b"',"// comment",": null","// comment","}"].join(`
`),t=["{",'  "a":',"  // comment","  null,",'  "b"',"  // comment","  : null","  // comment","}"].join(`
`);e(n,t)}),test("toFormattedString",()=>{const n={a:{b:1,d:["hello"]}},t=(o,m)=>["{",`${o}"a": {`,`${o}${o}"b": 1,`,`${o}${o}"d": [`,`${o}${o}${o}"hello"`,`${o}${o}]`,`${o}}`,"}"].join(m);let s=r.toFormattedString(n,{insertSpaces:!0,tabSize:2,eol:`
`});i.strictEqual(s,t("  ",`
`)),s=r.toFormattedString(n,{insertSpaces:!0,tabSize:2,eol:`\r
`}),i.strictEqual(s,t("  ",`\r
`)),s=r.toFormattedString(n,{insertSpaces:!1,eol:`\r
`}),i.strictEqual(s,t("	",`\r
`))})});
