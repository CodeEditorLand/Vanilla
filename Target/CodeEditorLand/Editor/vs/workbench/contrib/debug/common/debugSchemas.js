import"../../../../../vs/base/common/jsonSchema.js";import{Disposable as d}from"../../../../../vs/base/common/lifecycle.js";import*as e from"../../../../../vs/nls.js";import"../../../../../vs/platform/extensions/common/extensions.js";import{SyncDescriptor as p}from"../../../../../vs/platform/instantiation/common/descriptors.js";import{Registry as c}from"../../../../../vs/platform/registry/common/platform.js";import"../../../../../vs/workbench/contrib/debug/common/debug.js";import{launchSchemaId as u}from"../../../../../vs/workbench/services/configuration/common/configuration.js";import{inputsSchema as l}from"../../../../../vs/workbench/services/configurationResolver/common/configurationResolverSchema.js";import{Extensions as g}from"../../../../../vs/workbench/services/extensionManagement/common/extensionFeatures.js";import*as i from"../../../../../vs/workbench/services/extensions/common/extensionsRegistry.js";const q=i.ExtensionsRegistry.registerExtensionPoint({extensionPoint:"debuggers",defaultExtensionKind:["workspace"],jsonSchema:{description:e.localize("vscode.extension.contributes.debuggers","Contributes debug adapters."),type:"array",defaultSnippets:[{body:[{type:""}]}],items:{additionalProperties:!1,type:"object",defaultSnippets:[{body:{type:"",program:"",runtime:""}}],properties:{type:{description:e.localize("vscode.extension.contributes.debuggers.type","Unique identifier for this debug adapter."),type:"string"},label:{description:e.localize("vscode.extension.contributes.debuggers.label","Display name for this debug adapter."),type:"string"},program:{description:e.localize("vscode.extension.contributes.debuggers.program","Path to the debug adapter program. Path is either absolute or relative to the extension folder."),type:"string"},args:{description:e.localize("vscode.extension.contributes.debuggers.args","Optional arguments to pass to the adapter."),type:"array"},runtime:{description:e.localize("vscode.extension.contributes.debuggers.runtime","Optional runtime in case the program attribute is not an executable but requires a runtime."),type:"string"},runtimeArgs:{description:e.localize("vscode.extension.contributes.debuggers.runtimeArgs","Optional runtime arguments."),type:"array"},variables:{description:e.localize("vscode.extension.contributes.debuggers.variables","Mapping from interactive variables (e.g. ${action.pickProcess}) in `launch.json` to a command."),type:"object"},initialConfigurations:{description:e.localize("vscode.extension.contributes.debuggers.initialConfigurations","Configurations for generating the initial 'launch.json'."),type:["array","string"]},languages:{description:e.localize("vscode.extension.contributes.debuggers.languages",'List of languages for which the debug extension could be considered the "default debugger".'),type:"array"},configurationSnippets:{description:e.localize("vscode.extension.contributes.debuggers.configurationSnippets","Snippets for adding new configurations in 'launch.json'."),type:"array"},configurationAttributes:{description:e.localize("vscode.extension.contributes.debuggers.configurationAttributes","JSON schema configurations for validating 'launch.json'."),type:"object"},when:{description:e.localize("vscode.extension.contributes.debuggers.when","Condition which must be true to enable this type of debugger. Consider using 'shellExecutionSupported', 'virtualWorkspace', 'resourceScheme' or an extension-defined context key as appropriate for this."),type:"string",default:""},hiddenWhen:{description:e.localize("vscode.extension.contributes.debuggers.hiddenWhen","When this condition is true, this debugger type is hidden from the debugger list, but is still enabled."),type:"string",default:""},deprecated:{description:e.localize("vscode.extension.contributes.debuggers.deprecated","Optional message to mark this debug type as being deprecated."),type:"string",default:""},windows:{description:e.localize("vscode.extension.contributes.debuggers.windows","Windows specific settings."),type:"object",properties:{runtime:{description:e.localize("vscode.extension.contributes.debuggers.windows.runtime","Runtime used for Windows."),type:"string"}}},osx:{description:e.localize("vscode.extension.contributes.debuggers.osx","macOS specific settings."),type:"object",properties:{runtime:{description:e.localize("vscode.extension.contributes.debuggers.osx.runtime","Runtime used for macOS."),type:"string"}}},linux:{description:e.localize("vscode.extension.contributes.debuggers.linux","Linux specific settings."),type:"object",properties:{runtime:{description:e.localize("vscode.extension.contributes.debuggers.linux.runtime","Runtime used for Linux."),type:"string"}}},strings:{description:e.localize("vscode.extension.contributes.debuggers.strings","UI strings contributed by this debug adapter."),type:"object",properties:{unverifiedBreakpoints:{description:e.localize("vscode.extension.contributes.debuggers.strings.unverifiedBreakpoints","When there are unverified breakpoints in a language supported by this debug adapter, this message will appear on the breakpoint hover and in the breakpoints view. Markdown and command links are supported."),type:"string"}}}}}}}),L=i.ExtensionsRegistry.registerExtensionPoint({extensionPoint:"breakpoints",jsonSchema:{description:e.localize("vscode.extension.contributes.breakpoints","Contributes breakpoints."),type:"array",defaultSnippets:[{body:[{language:""}]}],items:{type:"object",additionalProperties:!1,defaultSnippets:[{body:{language:""}}],properties:{language:{description:e.localize("vscode.extension.contributes.breakpoints.language","Allow breakpoints for this language."),type:"string"},when:{description:e.localize("vscode.extension.contributes.breakpoints.when","Condition which must be true to enable breakpoints in this language. Consider matching this to the debugger when clause as appropriate."),type:"string",default:""}}}}}),b={type:"object",description:e.localize("presentation","Presentation options on how to show this configuration in the debug configuration dropdown and the command palette."),properties:{hidden:{type:"boolean",default:!1,description:e.localize("presentation.hidden","Controls if this configuration should be shown in the configuration dropdown and the command palette.")},group:{type:"string",default:"",description:e.localize("presentation.group","Group that this configuration belongs to. Used for grouping and sorting in the configuration dropdown and the command palette.")},order:{type:"number",default:1,description:e.localize("presentation.order","Order of this configuration within a group. Used for grouping and sorting in the configuration dropdown and the command palette.")}},default:{hidden:!1,group:"",order:1}},s={name:"Compound",configurations:[]},W={id:u,type:"object",title:e.localize("app.launch.json.title","Launch"),allowTrailingCommas:!0,allowComments:!0,required:[],default:{version:"0.2.0",configurations:[],compounds:[]},properties:{version:{type:"string",description:e.localize("app.launch.json.version","Version of this file format."),default:"0.2.0"},configurations:{type:"array",description:e.localize("app.launch.json.configurations","List of configurations. Add new configurations or edit existing ones by using IntelliSense."),items:{defaultSnippets:[],type:"object",oneOf:[]}},compounds:{type:"array",description:e.localize("app.launch.json.compounds","List of compounds. Each compound references multiple configurations which will get launched together."),items:{type:"object",required:["name","configurations"],properties:{name:{type:"string",description:e.localize("app.launch.json.compound.name","Name of compound. Appears in the launch configuration drop down menu.")},presentation:b,configurations:{type:"array",default:[],items:{oneOf:[{enum:[],description:e.localize("useUniqueNames","Please use unique configuration names.")},{type:"object",required:["name"],properties:{name:{enum:[],description:e.localize("app.launch.json.compound.name","Name of compound. Appears in the launch configuration drop down menu.")},folder:{enum:[],description:e.localize("app.launch.json.compound.folder","Name of folder in which the compound is located.")}}}]},description:e.localize("app.launch.json.compounds.configurations","Names of configurations that will be started as part of this compound.")},stopAll:{type:"boolean",default:!1,description:e.localize("app.launch.json.compound.stopAll","Controls whether manually terminating one session will stop all of the compound sessions.")},preLaunchTask:{type:"string",default:"",description:e.localize("compoundPrelaunchTask","Task to run before any of the compound configurations start.")}},default:s},default:[s]},inputs:l.definitions.inputs}};class m extends d{type="table";shouldRender(t){return!!t.contributes?.debuggers}render(t){const n=t.contributes?.debuggers||[];if(!n.length)return{data:{headers:[],rows:[]},dispose:()=>{}};const r=[e.localize("debugger name","Name"),e.localize("debugger type","Type")],a=n.map(o=>[o.label??"",o.type]);return{data:{headers:r,rows:a},dispose:()=>{}}}}c.as(g.ExtensionFeaturesRegistry).registerExtensionFeature({id:"debuggers",label:e.localize("debuggers","Debuggers"),access:{canToggle:!1},renderer:new p(m)});export{L as breakpointsExtPoint,q as debuggersExtPoint,W as launchSchema,b as presentationSchema};