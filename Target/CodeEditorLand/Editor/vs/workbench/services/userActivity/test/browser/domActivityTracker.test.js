import{TestInstantiationService as r}from"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{DomActivityTracker as m}from"../../browser/domActivityTracker.js";import{UserActivityService as n}from"../../common/userActivityService.js";import*as v from"sinon";import t from"assert";suite("DomActivityTracker",()=>{let e,o,s,i;setup(()=>{i=v.useFakeTimers(),s=new r,e=new n(s),o=new m(e)}),teardown(()=>{o.dispose(),e.dispose(),i.restore(),s.dispose()}),test("marks inactive on no input",()=>{t.equal(e.isActive,!0),i.tick(9e4),t.equal(e.isActive,!1)}),test("preserves activity state when active",()=>{t.equal(e.isActive,!0);const c=10;for(let a=0;a<c;a++)document.dispatchEvent(new MouseEvent("keydown")),i.tick(9e4/c);t.equal(e.isActive,!0)}),test("restores active state",()=>{t.equal(e.isActive,!0),i.tick(9e4),t.equal(e.isActive,!1),document.dispatchEvent(new MouseEvent("keydown")),t.equal(e.isActive,!0),i.tick(9e4),t.equal(e.isActive,!1)})});
