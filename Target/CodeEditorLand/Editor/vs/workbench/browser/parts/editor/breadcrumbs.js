import"../../../../base/browser/ui/breadcrumbs/breadcrumbsWidget.js";import{Emitter as d}from"../../../../base/common/event.js";import"../../../../base/common/glob.js";import"../../../../base/common/lifecycle.js";import{localize as e}from"../../../../nls.js";import"../../../../platform/configuration/common/configuration.js";import{ConfigurationScope as r,Extensions as l}from"../../../../platform/configuration/common/configurationRegistry.js";import{InstantiationType as u,registerSingleton as c}from"../../../../platform/instantiation/common/extensions.js";import{createDecorator as m}from"../../../../platform/instantiation/common/instantiation.js";import{Registry as p}from"../../../../platform/registry/common/platform.js";import"../../../common/editor.js";const h=m("IEditorBreadcrumbsService");class y{_map=new Map;register(o,t){if(this._map.has(o))throw new Error(`group (${o}) has already a widget`);return this._map.set(o,t),{dispose:()=>this._map.delete(o)}}getWidget(o){return this._map.get(o)}}c(h,y,u.Delayed);class s{constructor(){}static IsEnabled=s._stub("breadcrumbs.enabled");static UseQuickPick=s._stub("breadcrumbs.useQuickPick");static FilePath=s._stub("breadcrumbs.filePath");static SymbolPath=s._stub("breadcrumbs.symbolPath");static SymbolSortOrder=s._stub("breadcrumbs.symbolSortOrder");static Icons=s._stub("breadcrumbs.icons");static TitleScrollbarSizing=s._stub("workbench.editor.titleScrollbarSizing");static FileExcludes=s._stub("files.exclude");static _stub(o){return{bindTo(t){const n=new d,b=t.onDidChangeConfiguration(a=>{a.affectsConfiguration(o)&&n.fire(void 0)});return new class{name=o;onDidChange=n.event;getValue(a){return a?t.getValue(o,a):t.getValue(o)}updateValue(a,i){return i?t.updateValue(o,a,i):t.updateValue(o,a)}dispose(){b.dispose(),n.dispose()}}}}}}p.as(l.Configuration).registerConfiguration({id:"breadcrumbs",title:e("title","Breadcrumb Navigation"),order:101,type:"object",properties:{"breadcrumbs.enabled":{description:e("enabled","Enable/disable navigation breadcrumbs."),type:"boolean",default:!0},"breadcrumbs.filePath":{description:e("filepath","Controls whether and how file paths are shown in the breadcrumbs view."),type:"string",default:"on",enum:["on","off","last"],enumDescriptions:[e("filepath.on","Show the file path in the breadcrumbs view."),e("filepath.off","Do not show the file path in the breadcrumbs view."),e("filepath.last","Only show the last element of the file path in the breadcrumbs view.")]},"breadcrumbs.symbolPath":{description:e("symbolpath","Controls whether and how symbols are shown in the breadcrumbs view."),type:"string",default:"on",enum:["on","off","last"],enumDescriptions:[e("symbolpath.on","Show all symbols in the breadcrumbs view."),e("symbolpath.off","Do not show symbols in the breadcrumbs view."),e("symbolpath.last","Only show the current symbol in the breadcrumbs view.")]},"breadcrumbs.symbolSortOrder":{description:e("symbolSortOrder","Controls how symbols are sorted in the breadcrumbs outline view."),type:"string",default:"position",scope:r.LANGUAGE_OVERRIDABLE,enum:["position","name","type"],enumDescriptions:[e("symbolSortOrder.position","Show symbol outline in file position order."),e("symbolSortOrder.name","Show symbol outline in alphabetical order."),e("symbolSortOrder.type","Show symbol outline in symbol type order.")]},"breadcrumbs.icons":{description:e("icons","Render breadcrumb items with icons."),type:"boolean",default:!0},"breadcrumbs.showFiles":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.file","When enabled breadcrumbs show `file`-symbols.")},"breadcrumbs.showModules":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.module","When enabled breadcrumbs show `module`-symbols.")},"breadcrumbs.showNamespaces":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.namespace","When enabled breadcrumbs show `namespace`-symbols.")},"breadcrumbs.showPackages":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.package","When enabled breadcrumbs show `package`-symbols.")},"breadcrumbs.showClasses":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.class","When enabled breadcrumbs show `class`-symbols.")},"breadcrumbs.showMethods":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.method","When enabled breadcrumbs show `method`-symbols.")},"breadcrumbs.showProperties":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.property","When enabled breadcrumbs show `property`-symbols.")},"breadcrumbs.showFields":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.field","When enabled breadcrumbs show `field`-symbols.")},"breadcrumbs.showConstructors":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.constructor","When enabled breadcrumbs show `constructor`-symbols.")},"breadcrumbs.showEnums":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.enum","When enabled breadcrumbs show `enum`-symbols.")},"breadcrumbs.showInterfaces":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.interface","When enabled breadcrumbs show `interface`-symbols.")},"breadcrumbs.showFunctions":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.function","When enabled breadcrumbs show `function`-symbols.")},"breadcrumbs.showVariables":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.variable","When enabled breadcrumbs show `variable`-symbols.")},"breadcrumbs.showConstants":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.constant","When enabled breadcrumbs show `constant`-symbols.")},"breadcrumbs.showStrings":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.string","When enabled breadcrumbs show `string`-symbols.")},"breadcrumbs.showNumbers":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.number","When enabled breadcrumbs show `number`-symbols.")},"breadcrumbs.showBooleans":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.boolean","When enabled breadcrumbs show `boolean`-symbols.")},"breadcrumbs.showArrays":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.array","When enabled breadcrumbs show `array`-symbols.")},"breadcrumbs.showObjects":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.object","When enabled breadcrumbs show `object`-symbols.")},"breadcrumbs.showKeys":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.key","When enabled breadcrumbs show `key`-symbols.")},"breadcrumbs.showNull":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.null","When enabled breadcrumbs show `null`-symbols.")},"breadcrumbs.showEnumMembers":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.enumMember","When enabled breadcrumbs show `enumMember`-symbols.")},"breadcrumbs.showStructs":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.struct","When enabled breadcrumbs show `struct`-symbols.")},"breadcrumbs.showEvents":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.event","When enabled breadcrumbs show `event`-symbols.")},"breadcrumbs.showOperators":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.operator","When enabled breadcrumbs show `operator`-symbols.")},"breadcrumbs.showTypeParameters":{type:"boolean",default:!0,scope:r.LANGUAGE_OVERRIDABLE,markdownDescription:e("filteredTypes.typeParameter","When enabled breadcrumbs show `typeParameter`-symbols.")}}});export{s as BreadcrumbsConfig,y as BreadcrumbsService,h as IBreadcrumbsService};
