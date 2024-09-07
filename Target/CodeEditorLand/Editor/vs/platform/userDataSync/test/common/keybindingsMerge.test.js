import t from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as s}from"../../../../base/test/common/utils.js";import{merge as l}from"../../common/keybindingsMerge.js";import{TestUserDataSyncUtilService as r}from"./userDataSyncClient.js";suite("KeybindingsMerge - No Conflicts",()=>{s(),test("merge when local and remote are same with one entry",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),e=await d(a,o,null);t.ok(!e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when local and remote are same with similar when contexts",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),o=n([{key:"alt+c",command:"a",when:"!editorReadonly && editorTextFocus"}]),e=await d(a,o,null);t.ok(!e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when local and remote has entries in different order",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+a",command:"a",when:"editorTextFocus"}]),o=n([{key:"alt+a",command:"a",when:"editorTextFocus"},{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"}]),e=await d(a,o,null);t.ok(!e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when local and remote are same with multiple entries",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),e=await d(a,o,null);t.ok(!e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when local and remote are same with different base content",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),o=n([{key:"ctrl+c",command:"e"},{key:"shift+d",command:"d",args:{text:"`"}}]),e=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),c=await d(a,e,o);t.ok(!c.hasChanges),t.ok(!c.hasConflicts),t.strictEqual(c.mergeContent,a)}),test("merge when local and remote are same with multiple entries in different order",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),o=n([{key:"cmd+c",command:"b",args:{text:"`"}},{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),e=await d(a,o,null);t.ok(!e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when local and remote are same when remove entry is in different order",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),o=n([{key:"alt+d",command:"-a"},{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"cmd+c",command:"b",args:{text:"`"}}]),e=await d(a,o,null);t.ok(!e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when a new entry is added to remote",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),e=await d(a,o,null);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,o)}),test("merge when multiple new entries are added to remote",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}},{key:"cmd+d",command:"c"}]),e=await d(a,o,null);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,o)}),test("merge when multiple new entries are added to remote from base and local has not changed",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}},{key:"cmd+d",command:"c"}]),e=await d(a,o,a);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,o)}),test("merge when an entry is removed from remote from base and local has not changed",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),e=await d(a,o,a);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,o)}),test("merge when an entry (same command) is removed from remote from base and local has not changed",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),e=await d(a,o,a);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,o)}),test("merge when an entry is updated in remote from base and local has not changed",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),e=await d(a,o,a);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,o)}),test("merge when a command with multiple entries is updated from remote from base and local has not changed",async()=>{const a=n([{key:"shift+c",command:"c"},{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"b"},{key:"cmd+c",command:"a"}]),o=n([{key:"shift+c",command:"c"},{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"b"},{key:"cmd+d",command:"a"}]),e=await d(a,o,a);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,o)}),test("merge when remote has moved forwareded with multiple changes and local stays with base",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"cmd+c",command:"b",args:{text:"`"}},{key:"alt+d",command:"-a"},{key:"cmd+e",command:"d"},{key:"cmd+d",command:"c",when:"context1"}]),o=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"cmd+e",command:"d"},{key:"alt+d",command:"-a"},{key:"alt+f",command:"f"},{key:"alt+d",command:"-f"},{key:"cmd+d",command:"c",when:"context1"},{key:"cmd+c",command:"-c"}]),e=await d(a,o,a);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,o)}),test("merge when a new entry is added to local",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),e=await d(a,o,null);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when multiple new entries are added to local",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}},{key:"cmd+d",command:"c"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),e=await d(a,o,null);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when multiple new entries are added to local from base and remote is not changed",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}},{key:"cmd+d",command:"c"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),e=await d(a,o,o);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when an entry is removed from local from base and remote has not changed",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"},{key:"cmd+c",command:"b",args:{text:"`"}}]),e=await d(a,o,o);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when an entry (with same command) is removed from local from base and remote has not changed",async()=>{const a=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"-a"}]),e=await d(a,o,o);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when an entry is updated in local from base and remote has not changed",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),e=await d(a,o,o);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when a command with multiple entries is updated from local from base and remote has not changed",async()=>{const a=n([{key:"shift+c",command:"c"},{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"b"},{key:"cmd+c",command:"a"}]),o=n([{key:"shift+c",command:"c"},{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+d",command:"b"},{key:"cmd+d",command:"a"}]),e=await d(a,o,o);t.ok(e.hasChanges),t.ok(!e.hasConflicts),t.strictEqual(e.mergeContent,a)}),test("merge when local has moved forwareded with multiple changes and remote stays with base",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"cmd+e",command:"d"},{key:"alt+d",command:"-a"},{key:"alt+f",command:"f"},{key:"alt+d",command:"-f"},{key:"cmd+d",command:"c",when:"context1"},{key:"cmd+c",command:"-c"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"cmd+c",command:"b",args:{text:"`"}},{key:"alt+d",command:"-a"},{key:"cmd+e",command:"d"},{key:"cmd+d",command:"c",when:"context1"}]),e=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"cmd+e",command:"d"},{key:"alt+d",command:"-a"},{key:"alt+f",command:"f"},{key:"alt+d",command:"-f"},{key:"cmd+d",command:"c",when:"context1"},{key:"cmd+c",command:"-c"}]),c=await d(a,o,o);t.ok(c.hasChanges),t.ok(!c.hasConflicts),t.strictEqual(c.mergeContent,e)}),test("merge when local and remote has moved forwareded with conflicts",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"ctrl+c",command:"-a"},{key:"cmd+e",command:"d"},{key:"alt+a",command:"f"},{key:"alt+d",command:"-f"},{key:"cmd+d",command:"c",when:"context1"},{key:"cmd+c",command:"-c"}]),o=n([{key:"alt+d",command:"-f"},{key:"cmd+e",command:"d"},{key:"cmd+c",command:"-c"},{key:"cmd+d",command:"c",when:"context1"},{key:"alt+a",command:"f"},{key:"alt+e",command:"e"}]),e=n([{key:"alt+a",command:"f"},{key:"cmd+c",command:"-c"},{key:"cmd+d",command:"d"},{key:"alt+d",command:"-f"},{key:"alt+c",command:"c",when:"context1"},{key:"alt+g",command:"g",when:"context2"}]),c=n([{key:"alt+d",command:"-f"},{key:"cmd+d",command:"d"},{key:"cmd+c",command:"-c"},{key:"alt+c",command:"c",when:"context1"},{key:"alt+a",command:"f"},{key:"alt+e",command:"e"},{key:"alt+g",command:"g",when:"context2"}]),m=await d(o,e,a);t.ok(m.hasChanges),t.ok(!m.hasConflicts),t.strictEqual(m.mergeContent,c)}),test("merge when local and remote with one entry but different value",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),e=await d(a,o,null);t.ok(e.hasChanges),t.ok(e.hasConflicts),t.strictEqual(e.mergeContent,`[
	{
		"key": "alt+d",
		"command": "a",
		"when": "editorTextFocus && !editorReadonly"
	}
]`)}),test("merge when local and remote with different keybinding",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+a",command:"-a",when:"editorTextFocus && !editorReadonly"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+a",command:"-a",when:"editorTextFocus && !editorReadonly"}]),e=await d(a,o,null);t.ok(e.hasChanges),t.ok(e.hasConflicts),t.strictEqual(e.mergeContent,`[
	{
		"key": "alt+d",
		"command": "a",
		"when": "editorTextFocus && !editorReadonly"
	},
	{
		"key": "alt+a",
		"command": "-a",
		"when": "editorTextFocus && !editorReadonly"
	}
]`)}),test("merge when the entry is removed in local but updated in remote",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"}]),o=n([]),e=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),c=await d(o,e,a);t.ok(c.hasChanges),t.ok(c.hasConflicts),t.strictEqual(c.mergeContent,"[]")}),test("merge when the entry is removed in local but updated in remote and a new entry is added in local",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"}]),o=n([{key:"alt+b",command:"b"}]),e=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),c=await d(o,e,a);t.ok(c.hasChanges),t.ok(c.hasConflicts),t.strictEqual(c.mergeContent,`[
	{
		"key": "alt+b",
		"command": "b"
	}
]`)}),test("merge when the entry is removed in remote but updated in local",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),e=n([]),c=await d(o,e,a);t.ok(c.hasChanges),t.ok(c.hasConflicts),t.strictEqual(c.mergeContent,`[
	{
		"key": "alt+c",
		"command": "a",
		"when": "editorTextFocus && !editorReadonly"
	}
]`)}),test("merge when the entry is removed in remote but updated in local and a new entry is added in remote",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"}]),o=n([{key:"alt+c",command:"a",when:"editorTextFocus && !editorReadonly"}]),e=n([{key:"alt+b",command:"b"}]),c=await d(o,e,a);t.ok(c.hasChanges),t.ok(c.hasConflicts),t.strictEqual(c.mergeContent,`[
	{
		"key": "alt+c",
		"command": "a",
		"when": "editorTextFocus && !editorReadonly"
	},
	{
		"key": "alt+b",
		"command": "b"
	}
]`)}),test("merge when local and remote has moved forwareded with conflicts (2)",async()=>{const a=n([{key:"alt+d",command:"a",when:"editorTextFocus && !editorReadonly"},{key:"alt+c",command:"-a"},{key:"cmd+e",command:"d"},{key:"alt+a",command:"f"},{key:"alt+d",command:"-f"},{key:"cmd+d",command:"c",when:"context1"},{key:"cmd+c",command:"-c"}]),o=n([{key:"alt+d",command:"-f"},{key:"cmd+e",command:"d"},{key:"cmd+c",command:"-c"},{key:"cmd+d",command:"c",when:"context1"},{key:"alt+a",command:"f"},{key:"alt+e",command:"e"}]),e=n([{key:"alt+a",command:"f"},{key:"cmd+c",command:"-c"},{key:"cmd+d",command:"d"},{key:"alt+d",command:"-f"},{key:"alt+c",command:"c",when:"context1"},{key:"alt+g",command:"g",when:"context2"}]),c=await d(o,e,a);t.ok(c.hasChanges),t.ok(c.hasConflicts),t.strictEqual(c.mergeContent,`[
	{
		"key": "alt+d",
		"command": "-f"
	},
	{
		"key": "cmd+d",
		"command": "d"
	},
	{
		"key": "cmd+c",
		"command": "-c"
	},
	{
		"key": "cmd+d",
		"command": "c",
		"when": "context1"
	},
	{
		"key": "alt+a",
		"command": "f"
	},
	{
		"key": "alt+e",
		"command": "e"
	},
	{
		"key": "alt+g",
		"command": "g",
		"when": "context2"
	}
]`)})});async function d(a,o,e){const c=new r,m=await c.resolveFormattingOptions();return l(a,o,e,m,c)}function n(a){return JSON.stringify(a,null,"	")}