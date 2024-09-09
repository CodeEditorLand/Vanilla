import e from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as u}from"../../../../base/test/common/utils.js";import{addSetting as i,merge as l,updateIgnoredSettings as m}from"../../common/settingsMerge.js";const a={eol:`
`,insertSpaces:!1,tabSize:4};suite("SettingsMerge - Merge",()=>{u(),test("merge when local and remote are same with one entry",async()=>{const n=s({a:1}),o=s({a:1}),t=l(n,o,null,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when local and remote are same with multiple entries",async()=>{const n=s({a:1,b:2}),o=s({a:1,b:2}),t=l(n,o,null,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when local and remote are same with multiple entries in different order",async()=>{const n=s({b:2,a:1}),o=s({a:1,b:2}),t=l(n,o,null,[],[],a);e.strictEqual(t.localContent,n),e.strictEqual(t.remoteContent,o),e.ok(t.hasConflicts),e.strictEqual(t.conflictsSettings.length,0)}),test("merge when local and remote are same with different base content",async()=>{const n=s({b:2,a:1}),o=s({a:2,b:1}),t=s({a:1,b:2}),c=l(n,t,o,[],[],a);e.strictEqual(c.localContent,n),e.strictEqual(c.remoteContent,t),e.strictEqual(c.conflictsSettings.length,0),e.ok(c.hasConflicts)}),test("merge when a new entry is added to remote",async()=>{const n=s({a:1}),o=s({a:1,b:2}),t=l(n,o,null,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when multiple new entries are added to remote",async()=>{const n=s({a:1}),o=s({a:1,b:2,c:3}),t=l(n,o,null,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when multiple new entries are added to remote from base and local has not changed",async()=>{const n=s({a:1}),o=s({b:2,a:1,c:3}),t=l(n,o,n,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when an entry is removed from remote from base and local has not changed",async()=>{const n=s({a:1,b:2}),o=s({a:1}),t=l(n,o,n,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when all entries are removed from base and local has not changed",async()=>{const n=s({a:1}),o=s({}),t=l(n,o,n,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when an entry is updated in remote from base and local has not changed",async()=>{const n=s({a:1}),o=s({a:2}),t=l(n,o,n,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when remote has moved forwareded with multiple changes and local stays with base",async()=>{const n=s({a:1}),o=s({a:2,b:1,c:3,d:4}),t=l(n,o,n,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when remote has moved forwareded with order changes and local stays with base",async()=>{const n=s({a:1,b:2,c:3}),o=s({a:2,d:4,c:3,b:2}),t=l(n,o,n,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when remote has moved forwareded with comment changes and local stays with base",async()=>{const n=`
{
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 1,
}`,o=s`
{
	// comment b has changed
	"b": 2,
	// this is comment for c
	"c": 1,
}`,t=l(n,o,n,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when remote has moved forwareded with comment and order changes and local stays with base",async()=>{const n=`
{
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 1,
}`,o=s`
{
	// this is comment for c
	"c": 1,
	// comment b has changed
	"b": 2,
}`,t=l(n,o,n,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when a new entries are added to local",async()=>{const n=s({a:1,b:2,c:3,d:4}),o=s({a:1}),t=l(n,o,null,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,n),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when multiple new entries are added to local from base and remote is not changed",async()=>{const n=s({a:2,b:1,c:3,d:4}),o=s({a:1}),t=l(n,o,o,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,n),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when an entry is removed from local from base and remote has not changed",async()=>{const n=s({a:1,c:2}),o=s({a:2,b:1,c:3,d:4}),t=l(n,o,o,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,n),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when an entry is updated in local from base and remote has not changed",async()=>{const n=s({a:1,c:2}),o=s({a:2,c:2}),t=l(n,o,o,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,n),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when local has moved forwarded with multiple changes and remote stays with base",async()=>{const n=s({a:2,b:1,c:3,d:4}),o=s({a:1}),t=l(n,o,o,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,n),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when local has moved forwarded with order changes and remote stays with base",async()=>{const n=`
{
	"b": 2,
	"c": 1,
}`,o=s`
{
	"c": 1,
	"b": 2,
}`,t=l(n,o,o,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,n),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when local has moved forwarded with comment changes and remote stays with base",async()=>{const n=`
{
	// comment for b has changed
	"b": 2,
	// comment for c
	"c": 1,
}`,o=s`
{
	// comment for b
	"b": 2,
	// comment for c
	"c": 1,
}`,t=l(n,o,o,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,n),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when local has moved forwarded with comment and order changes and remote stays with base",async()=>{const n=`
{
	// comment for c
	"c": 1,
	// comment for b has changed
	"b": 2,
}`,o=s`
{
	// comment for b
	"b": 2,
	// comment for c
	"c": 1,
}`,t=l(n,o,o,[],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,n),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("merge when local and remote with one entry but different value",async()=>{const n=s({a:1}),o=s({a:2}),t=[{key:"a",localValue:1,remoteValue:2}],c=l(n,o,null,[],[],a);e.strictEqual(c.localContent,n),e.strictEqual(c.remoteContent,o),e.ok(c.hasConflicts),e.deepStrictEqual(c.conflictsSettings,t)}),test("merge when the entry is removed in remote but updated in local and a new entry is added in remote",async()=>{const n=s({a:1}),o=s({a:2}),t=s({b:2}),c=[{key:"a",localValue:2,remoteValue:void 0}],r=l(o,t,n,[],[],a);e.strictEqual(r.localContent,s({a:2,b:2})),e.strictEqual(r.remoteContent,t),e.ok(r.hasConflicts),e.deepStrictEqual(r.conflictsSettings,c)}),test("merge with single entry and local is empty",async()=>{const n=s({a:1}),o=s({}),t=s({a:2}),c=[{key:"a",localValue:void 0,remoteValue:2}],r=l(o,t,n,[],[],a);e.strictEqual(r.localContent,o),e.strictEqual(r.remoteContent,t),e.ok(r.hasConflicts),e.deepStrictEqual(r.conflictsSettings,c)}),test("merge when local and remote has moved forwareded with conflicts",async()=>{const n=s({a:1,b:2,c:3,d:4}),o=s({a:2,c:3,d:5,e:4,f:1}),t=s({b:3,c:3,d:6,e:5}),c=[{key:"b",localValue:void 0,remoteValue:3},{key:"a",localValue:2,remoteValue:void 0},{key:"d",localValue:5,remoteValue:6},{key:"e",localValue:4,remoteValue:5}],r=l(o,t,n,[],[],a);e.strictEqual(r.localContent,s({a:2,c:3,d:5,e:4,f:1})),e.strictEqual(r.remoteContent,s({b:3,c:3,d:6,e:5,f:1})),e.ok(r.hasConflicts),e.deepStrictEqual(r.conflictsSettings,c)}),test("merge when local and remote has moved forwareded with change in order",async()=>{const n=s({a:1,b:2,c:3,d:4}),o=s({a:2,c:3,b:2,d:4,e:5}),t=s({a:1,b:2,c:4}),c=l(o,t,n,[],[],a);e.strictEqual(c.localContent,s({a:2,c:4,b:2,e:5})),e.strictEqual(c.remoteContent,s({a:2,b:2,e:5,c:4})),e.ok(c.hasConflicts),e.deepStrictEqual(c.conflictsSettings,[])}),test("merge when local and remote has moved forwareded with comment changes",async()=>{const n=`
{
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 1
}`,o=`
{
	// comment b has changed in local
	"b": 2,
	// this is comment for c
	"c": 1
}`,t=`
{
	// comment b has changed in remote
	"b": 2,
	// this is comment for c
	"c": 1
}`,c=l(o,t,n,[],[],a);e.strictEqual(c.localContent,o),e.strictEqual(c.remoteContent,t),e.ok(c.hasConflicts),e.deepStrictEqual(c.conflictsSettings,[])}),test("resolve when local and remote has moved forwareded with resolved conflicts",async()=>{const n=s({a:1,b:2,c:3,d:4}),o=s({a:2,c:3,d:5,e:4,f:1}),t=s({b:3,c:3,d:6,e:5}),c=[{key:"d",localValue:5,remoteValue:6}],r=l(o,t,n,[],[{key:"a",value:2},{key:"b",value:void 0},{key:"e",value:5}],a);e.strictEqual(r.localContent,s({a:2,c:3,d:5,e:5,f:1})),e.strictEqual(r.remoteContent,s({c:3,d:6,e:5,f:1,a:2})),e.ok(r.hasConflicts),e.deepStrictEqual(r.conflictsSettings,c)}),test("ignored setting is not merged when changed in local and remote",async()=>{const n=s({a:1}),o=s({a:2}),t=l(n,o,null,["a"],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("ignored setting is not merged when changed in local and remote from base",async()=>{const n=s({a:0}),o=s({a:1}),t=s({a:2}),c=l(o,t,n,["a"],[],a);e.strictEqual(c.localContent,null),e.strictEqual(c.remoteContent,null),e.strictEqual(c.conflictsSettings.length,0),e.ok(!c.hasConflicts)}),test("ignored setting is not merged when added in remote",async()=>{const n=s({}),o=s({a:1}),t=l(n,o,null,["a"],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("ignored setting is not merged when added in remote from base",async()=>{const n=s({b:2}),o=s({a:1,b:2}),t=l(n,o,n,["a"],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("ignored setting is not merged when removed in remote",async()=>{const n=s({a:1}),o=s({}),t=l(n,o,null,["a"],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("ignored setting is not merged when removed in remote from base",async()=>{const n=s({a:2}),o=s({}),t=l(n,o,n,["a"],[],a);e.strictEqual(t.localContent,null),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)}),test("ignored setting is not merged with other changes without conflicts",async()=>{const n=s({a:2,b:2,c:3,d:4,e:5}),o=s({a:1,b:2,c:3}),t=s({a:3,b:3,d:4,e:6}),c=l(o,t,n,["a","e"],[],a);e.strictEqual(c.localContent,s({a:1,b:3})),e.strictEqual(c.remoteContent,s({a:3,b:3,e:6})),e.strictEqual(c.conflictsSettings.length,0),e.ok(!c.hasConflicts)}),test("ignored setting is not merged with other changes conflicts",async()=>{const n=s({a:2,b:2,c:3,d:4,e:5}),o=s({a:1,b:4,c:3,d:5}),t=s({a:3,b:3,e:6}),c=[{key:"d",localValue:5,remoteValue:void 0},{key:"b",localValue:4,remoteValue:3}],r=l(o,t,n,["a","e"],[],a);e.strictEqual(r.localContent,s({a:1,b:4,d:5})),e.strictEqual(r.remoteContent,s({a:3,b:3,e:6})),e.deepStrictEqual(r.conflictsSettings,c),e.ok(r.hasConflicts)}),test("merge when remote has comments and local is empty",async()=>{const n=`
{

}`,o=s`
{
	// this is a comment
	"a": 1,
}`,t=l(n,o,null,[],[],a);e.strictEqual(t.localContent,o),e.strictEqual(t.remoteContent,null),e.strictEqual(t.conflictsSettings.length,0),e.ok(!t.hasConflicts)})}),suite("SettingsMerge - Compute Remote Content",()=>{u(),test("local content is returned when there are no ignored settings",async()=>{const n=s({a:1,b:2,c:3}),o=s({a:3,b:3,d:4,e:6}),t=m(n,o,[],a);e.strictEqual(t,n)}),test("when target content is empty",async()=>{const n=s({a:3}),o=m("",n,["a"],a);e.strictEqual(o,"")}),test("when source content is empty",async()=>{const n=s({a:3,b:3}),o=s({b:3}),t=m(n,"",["a"],a);e.strictEqual(t,o)}),test("ignored settings are not updated from remote content",async()=>{const n=s({a:1,b:2,c:3}),o=s({a:3,b:3,d:4,e:6}),t=s({a:3,b:2,c:3}),c=m(n,o,["a"],a);e.strictEqual(c,t)})}),suite("SettingsMerge - Add Setting",()=>{u(),test("Insert after a setting without comments",()=>{const n=`
{
	"a": 1,
	"b": 2,
	"c": 3
}`,o=`
{
	"a": 2,
	"d": 3
}`,t=`
{
	"a": 2,
	"b": 2,
	"d": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting without comments at the end",()=>{const n=`
{
	"a": 1,
	"b": 2,
	"c": 3
}`,o=`
{
	"a": 2
}`,t=`
{
	"a": 2,
	"b": 2
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert between settings without comment",()=>{const n=`
{
	"a": 1,
	"b": 2,
	"c": 3
}`,o=`
{
	"a": 1,
	"c": 3
}`,t=`
{
	"a": 1,
	"b": 2,
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert between settings and there is a comment in between in source",()=>{const n=`
{
	"a": 1,
	// this is comment for b
	"b": 2,
	"c": 3
}`,o=`
{
	"a": 1,
	"c": 3
}`,t=`
{
	"a": 1,
	"b": 2,
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting and after a comment at the end",()=>{const n=`
{
	"a": 1,
	// this is comment for b
	"b": 2
}`,o=`
{
	"a": 1
	// this is comment for b
}`,t=`
{
	"a": 1,
	// this is comment for b
	"b": 2
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting ending with comma and after a comment at the end",()=>{const n=`
{
	"a": 1,
	// this is comment for b
	"b": 2
}`,o=`
{
	"a": 1,
	// this is comment for b
}`,t=`
{
	"a": 1,
	// this is comment for b
	"b": 2
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a comment and there are no settings",()=>{const n=`
{
	// this is comment for b
	"b": 2
}`,o=`
{
	// this is comment for b
}`,t=`
{
	// this is comment for b
	"b": 2
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting and between a comment and setting",()=>{const n=`
{
	"a": 1,
	// this is comment for b
	"b": 2,
	"c": 3
}`,o=`
{
	"a": 1,
	// this is comment for b
	"c": 3
}`,t=`
{
	"a": 1,
	// this is comment for b
	"b": 2,
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting between two comments and there is a setting after",()=>{const n=`
{
	"a": 1,
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 3
}`,o=`
{
	"a": 1,
	// this is comment for b
	// this is comment for c
	"c": 3
}`,t=`
{
	"a": 1,
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting between two comments on the same line and there is a setting after",()=>{const n=`
{
	"a": 1,
	/* this is comment for b */
	"b": 2,
	// this is comment for c
	"c": 3
}`,o=`
{
	"a": 1,
	/* this is comment for b */ // this is comment for c
	"c": 3
}`,t=`
{
	"a": 1,
	/* this is comment for b */
	"b": 2, // this is comment for c
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting between two line comments on the same line and there is a setting after",()=>{const n=`
{
	"a": 1,
	/* this is comment for b */
	"b": 2,
	// this is comment for c
	"c": 3
}`,o=`
{
	"a": 1,
	// this is comment for b // this is comment for c
	"c": 3
}`,t=`
{
	"a": 1,
	// this is comment for b // this is comment for c
	"b": 2,
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting between two comments and there is no setting after",()=>{const n=`
{
	"a": 1,
	// this is comment for b
	"b": 2
	// this is a comment
}`,o=`
{
	"a": 1
	// this is comment for b
	// this is a comment
}`,t=`
{
	"a": 1,
	// this is comment for b
	"b": 2
	// this is a comment
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting with comma and between two comments and there is no setting after",()=>{const n=`
{
	"a": 1,
	// this is comment for b
	"b": 2
	// this is a comment
}`,o=`
{
	"a": 1,
	// this is comment for b
	// this is a comment
}`,t=`
{
	"a": 1,
	// this is comment for b
	"b": 2
	// this is a comment
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting without comments",()=>{const n=`
{
	"a": 1,
	"b": 2,
	"c": 3
}`,o=`
{
	"d": 2,
	"c": 3
}`,t=`
{
	"d": 2,
	"b": 2,
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting without comments at the end",()=>{const n=`
{
	"a": 1,
	"b": 2,
	"c": 3
}`,o=`
{
	"c": 3
}`,t=`
{
	"b": 2,
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting with comment",()=>{const n=`
{
	"a": 1,
	"b": 2,
	// this is comment for c
	"c": 3
}`,o=`
{
	// this is comment for c
	"c": 3
}`,t=`
{
	"b": 2,
	// this is comment for c
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting and before a comment at the beginning",()=>{const n=`
{
	// this is comment for b
	"b": 2,
	"c": 3,
}`,o=`
{
	// this is comment for b
	"c": 3
}`,t=`
{
	// this is comment for b
	"b": 2,
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting ending with comma and before a comment at the begninning",()=>{const n=`
{
	// this is comment for b
	"b": 2,
	"c": 3,
}`,o=`
{
	// this is comment for b
	"c": 3,
}`,t=`
{
	// this is comment for b
	"b": 2,
	"c": 3,
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting and between a setting and comment",()=>{const n=`
{
	"a": 1,
	// this is comment for b
	"b": 2,
	"c": 3
}`,o=`
{
	"d": 1,
	// this is comment for b
	"c": 3
}`,t=`
{
	"d": 1,
	// this is comment for b
	"b": 2,
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting between two comments and there is a setting before",()=>{const n=`
{
	"a": 1,
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 3
}`,o=`
{
	"d": 1,
	// this is comment for b
	// this is comment for c
	"c": 3
}`,t=`
{
	"d": 1,
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting between two comments on the same line and there is a setting before",()=>{const n=`
{
	"a": 1,
	/* this is comment for b */
	"b": 2,
	// this is comment for c
	"c": 3
}`,o=`
{
	"d": 1,
	/* this is comment for b */ // this is comment for c
	"c": 3
}`,t=`
{
	"d": 1,
	/* this is comment for b */
	"b": 2,
	// this is comment for c
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting between two line comments on the same line and there is a setting before",()=>{const n=`
{
	"a": 1,
	/* this is comment for b */
	"b": 2,
	// this is comment for c
	"c": 3
}`,o=`
{
	"d": 1,
	// this is comment for b // this is comment for c
	"c": 3
}`,t=`
{
	"d": 1,
	"b": 2,
	// this is comment for b // this is comment for c
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting between two comments and there is no setting before",()=>{const n=`
{
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 1
}`,o=`
{
	// this is comment for b
	// this is comment for c
	"c": 1
}`,t=`
{
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 1
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert before a setting with comma and between two comments and there is no setting before",()=>{const n=`
{
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 1
}`,o=`
{
	// this is comment for b
	// this is comment for c
	"c": 1,
}`,t=`
{
	// this is comment for b
	"b": 2,
	// this is comment for c
	"c": 1,
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a setting that is of object type",()=>{const n=`
{
	"b": {
		"d": 1
	},
	"a": 2,
	"c": 1
}`,t=i("a",n,`
{
	"b": {
		"d": 1
	},
	"c": 1
}`,a);e.strictEqual(t,n)}),test("Insert after a setting that is of array type",()=>{const n=`
{
	"b": [
		1
	],
	"a": 2,
	"c": 1
}`,t=i("a",n,`
{
	"b": [
		1
	],
	"c": 1
}`,a);e.strictEqual(t,n)}),test("Insert after a comment with comma separator of previous setting and no next nodes ",()=>{const n=`
{
	"a": 1
	// this is comment for a
	,
	"b": 2
}`,o=`
{
	"a": 1
	// this is comment for a
	,
}`,t=`
{
	"a": 1
	// this is comment for a
	,
	"b": 2
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a comment with comma separator of previous setting and there is a setting after ",()=>{const n=`
{
	"a": 1
	// this is comment for a
	,
	"b": 2,
	"c": 3
}`,o=`
{
	"a": 1
	// this is comment for a
	,
	"c": 3
}`,t=`
{
	"a": 1
	// this is comment for a
	,
	"b": 2,
	"c": 3
}`,c=i("b",n,o,a);e.strictEqual(c,t)}),test("Insert after a comment with comma separator of previous setting and there is a comment after ",()=>{const n=`
{
	"a": 1
	// this is comment for a
	,
	"b": 2
	// this is a comment
}`,o=`
{
	"a": 1
	// this is comment for a
	,
	// this is a comment
}`,t=`
{
	"a": 1
	// this is comment for a
	,
	"b": 2
	// this is a comment
}`,c=i("b",n,o,a);e.strictEqual(c,t)})});function s(n){return JSON.stringify(n,null,"	")}
