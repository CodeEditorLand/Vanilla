import s from"assert";import{isFunction as a}from"../../../../base/common/types.js";import{Registry as o}from"../../common/platform.js";suite("Platform / Registry",()=>{test("registry - api",function(){s.ok(a(o.add)),s.ok(a(o.as)),s.ok(a(o.knows))}),test("registry - mixin",function(){o.add("foo",{bar:!0}),s.ok(o.knows("foo")),s.ok(o.as("foo").bar),s.strictEqual(o.as("foo").bar,!0)}),test("registry - knows, as",function(){const t={};o.add("knows,as",t),s.ok(o.knows("knows,as")),s.ok(!o.knows("knows,as1234")),s.ok(o.as("knows,as")===t),s.ok(o.as("knows,as1234")===null)}),test("registry - mixin, fails on duplicate ids",function(){o.add("foo-dup",{bar:!0});try{o.add("foo-dup",{bar:!1}),s.ok(!1)}catch{s.ok(!0)}})});
