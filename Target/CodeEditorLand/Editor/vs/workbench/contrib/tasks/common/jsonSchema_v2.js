import*as e from"../../../../nls.js";import*as s from"../../../../base/common/objects.js";import"../../../../base/common/jsonSchema.js";import B from"./jsonSchemaCommon.js";import{ProblemMatcherRegistry as b}from"./problemMatcher.js";import{TaskDefinitionRegistry as z}from"./taskDefinitionRegistry.js";import*as E from"../../../services/configurationResolver/common/configurationResolverUtils.js";import{inputsSchema as W}from"../../../services/configurationResolver/common/configurationResolverSchema.js";import{getAllCodicons as C}from"../../../../base/common/codicons.js";function d(t){Array.isArray(t)?t.forEach(d):typeof t=="object"&&(t.$ref&&(t.$ref=t.$ref+"2"),Object.getOwnPropertyNames(t).forEach(o=>{const i=t[o];(Array.isArray(i)||typeof i=="object")&&d(i)}))}const k={anyOf:[{type:"boolean",default:!0,description:e.localize("JsonSchema.shell","Specifies whether the command is a shell command or an external program. Defaults to false if omitted.")},{$ref:"#/definitions/shellConfiguration"}],deprecationMessage:e.localize("JsonSchema.tasks.isShellCommand.deprecated","The property isShellCommand is deprecated. Use the type property of the task and the shell property in the options instead. See also the 1.14 release notes.")},O={type:"boolean",description:e.localize("JsonSchema.hide","Hide this task from the run task quick pick"),default:!0},w={type:"object",additionalProperties:!0,properties:{type:{type:"string",description:e.localize("JsonSchema.tasks.dependsOn.identifier","The task identifier.")}}},T={anyOf:[{type:"string",description:e.localize("JsonSchema.tasks.dependsOn.string","Another task this task depends on.")},w,{type:"array",description:e.localize("JsonSchema.tasks.dependsOn.array","The other tasks this task depends on."),items:{anyOf:[{type:"string"},w]}}],description:e.localize("JsonSchema.tasks.dependsOn","Either a string representing another task or an array of other tasks that this task depends on.")},v={type:"string",enum:["parallel","sequence"],enumDescriptions:[e.localize("JsonSchema.tasks.dependsOrder.parallel","Run all dependsOn tasks in parallel."),e.localize("JsonSchema.tasks.dependsOrder.sequence","Run all dependsOn tasks in sequence.")],default:"parallel",description:e.localize("JsonSchema.tasks.dependsOrder","Determines the order of the dependsOn tasks for this task. Note that this property is not recursive.")},N={type:"string",description:e.localize("JsonSchema.tasks.detail","An optional description of a task that shows in the Run Task quick pick as a detail.")},q={type:"object",description:e.localize("JsonSchema.tasks.icon","An optional icon for the task"),properties:{id:{description:e.localize("JsonSchema.tasks.icon.id","An optional codicon ID to use"),type:["string","null"],enum:Array.from(C(),t=>t.id),markdownEnumDescriptions:Array.from(C(),t=>`$(${t.id})`)},color:{description:e.localize("JsonSchema.tasks.icon.color","An optional color of the icon"),type:["string","null"],enum:["terminal.ansiBlack","terminal.ansiRed","terminal.ansiGreen","terminal.ansiYellow","terminal.ansiBlue","terminal.ansiMagenta","terminal.ansiCyan","terminal.ansiWhite"]}}},h={type:"object",default:{echo:!0,reveal:"always",focus:!1,panel:"shared",showReuseMessage:!0,clear:!1},description:e.localize("JsonSchema.tasks.presentation","Configures the panel that is used to present the task's output and reads its input."),additionalProperties:!1,properties:{echo:{type:"boolean",default:!0,description:e.localize("JsonSchema.tasks.presentation.echo","Controls whether the executed command is echoed to the panel. Default is true.")},focus:{type:"boolean",default:!1,description:e.localize("JsonSchema.tasks.presentation.focus","Controls whether the panel takes focus. Default is false. If set to true the panel is revealed as well.")},revealProblems:{type:"string",enum:["always","onProblem","never"],enumDescriptions:[e.localize("JsonSchema.tasks.presentation.revealProblems.always","Always reveals the problems panel when this task is executed."),e.localize("JsonSchema.tasks.presentation.revealProblems.onProblem","Only reveals the problems panel if a problem is found."),e.localize("JsonSchema.tasks.presentation.revealProblems.never","Never reveals the problems panel when this task is executed.")],default:"never",description:e.localize("JsonSchema.tasks.presentation.revealProblems",'Controls whether the problems panel is revealed when running this task or not. Takes precedence over option "reveal". Default is "never".')},reveal:{type:"string",enum:["always","silent","never"],enumDescriptions:[e.localize("JsonSchema.tasks.presentation.reveal.always","Always reveals the terminal when this task is executed."),e.localize("JsonSchema.tasks.presentation.reveal.silent","Only reveals the terminal if the task exits with an error or the problem matcher finds an error."),e.localize("JsonSchema.tasks.presentation.reveal.never","Never reveals the terminal when this task is executed.")],default:"always",description:e.localize("JsonSchema.tasks.presentation.reveal",'Controls whether the terminal running the task is revealed or not. May be overridden by option "revealProblems". Default is "always".')},panel:{type:"string",enum:["shared","dedicated","new"],default:"shared",description:e.localize("JsonSchema.tasks.presentation.instance","Controls if the panel is shared between tasks, dedicated to this task or a new one is created on every run.")},showReuseMessage:{type:"boolean",default:!0,description:e.localize("JsonSchema.tasks.presentation.showReuseMessage","Controls whether to show the `Terminal will be reused by tasks, press any key to close it` message.")},clear:{type:"boolean",default:!1,description:e.localize("JsonSchema.tasks.presentation.clear","Controls whether the terminal is cleared before executing the task.")},group:{type:"string",description:e.localize("JsonSchema.tasks.presentation.group","Controls whether the task is executed in a specific terminal group using split panes.")},close:{type:"boolean",description:e.localize("JsonSchema.tasks.presentation.close","Controls whether the terminal the task runs in is closed when the task exits.")}}},I=s.deepClone(h);I.deprecationMessage=e.localize("JsonSchema.tasks.terminal","The terminal property is deprecated. Use presentation instead");const M={type:"string",enum:["build","test","none"],enumDescriptions:[e.localize("JsonSchema.tasks.group.build","Marks the task as a build task accessible through the 'Run Build Task' command."),e.localize("JsonSchema.tasks.group.test","Marks the task as a test task accessible through the 'Run Test Task' command."),e.localize("JsonSchema.tasks.group.none","Assigns the task to no group")],description:e.localize("JsonSchema.tasks.group.kind","The task's execution group.")},g={oneOf:[M,{type:"object",properties:{kind:M,isDefault:{type:["boolean","string"],default:!1,description:e.localize("JsonSchema.tasks.group.isDefault","Defines if this task is the default task in the group, or a glob to match the file which should trigger this task.")}}}],defaultSnippets:[{body:{kind:"build",isDefault:!0},description:e.localize("JsonSchema.tasks.group.defaultBuild","Marks the task as the default build task.")},{body:{kind:"test",isDefault:!0},description:e.localize("JsonSchema.tasks.group.defaultTest","Marks the task as the default test task.")}],description:e.localize("JsonSchema.tasks.group",'Defines to which execution group this task belongs to. It supports "build" to add it to the build group and "test" to add it to the test group.')},D={type:"string",enum:["shell"],default:"process",description:e.localize("JsonSchema.tasks.type","Defines whether the task is run as a process or as a command inside a shell.")},H={oneOf:[{oneOf:[{type:"string"},{type:"array",items:{type:"string"},description:e.localize("JsonSchema.commandArray","The shell command to be executed. Array items will be joined using a space character")}]},{type:"object",required:["value","quoting"],properties:{value:{oneOf:[{type:"string"},{type:"array",items:{type:"string"},description:e.localize("JsonSchema.commandArray","The shell command to be executed. Array items will be joined using a space character")}],description:e.localize("JsonSchema.command.quotedString.value","The actual command value")},quoting:{type:"string",enum:["escape","strong","weak"],enumDescriptions:[e.localize("JsonSchema.tasks.quoting.escape","Escapes characters using the shell's escape character (e.g. ` under PowerShell and \\ under bash)."),e.localize("JsonSchema.tasks.quoting.strong","Quotes the argument using the shell's strong quote character (e.g. ' under PowerShell and bash)."),e.localize("JsonSchema.tasks.quoting.weak",`Quotes the argument using the shell's weak quote character (e.g. " under PowerShell and bash).`)],default:"strong",description:e.localize("JsonSchema.command.quotesString.quote","How the command value should be quoted.")}}}],description:e.localize("JsonSchema.command","The command to be executed. Can be an external program or a shell command.")},P={type:"array",items:{oneOf:[{type:"string"},{type:"object",required:["value","quoting"],properties:{value:{type:"string",description:e.localize("JsonSchema.args.quotedString.value","The actual argument value")},quoting:{type:"string",enum:["escape","strong","weak"],enumDescriptions:[e.localize("JsonSchema.tasks.quoting.escape","Escapes characters using the shell's escape character (e.g. ` under PowerShell and \\ under bash)."),e.localize("JsonSchema.tasks.quoting.strong","Quotes the argument using the shell's strong quote character (e.g. ' under PowerShell and bash)."),e.localize("JsonSchema.tasks.quoting.weak",`Quotes the argument using the shell's weak quote character (e.g. " under PowerShell and bash).`)],default:"strong",description:e.localize("JsonSchema.args.quotesString.quote","How the argument value should be quoted.")}}}]},description:e.localize("JsonSchema.tasks.args","Arguments passed to the command when this task is invoked.")},L={type:"string",description:e.localize("JsonSchema.tasks.label","The task's user interface label")},x={type:"string",enum:["2.0.0"],description:e.localize("JsonSchema.version","The config's version number.")},R={type:"string",description:e.localize("JsonSchema.tasks.identifier","A user defined identifier to reference the task in launch.json or a dependsOn clause."),deprecationMessage:e.localize("JsonSchema.tasks.identifier.deprecated","User defined identifiers are deprecated. For custom task use the name as a reference and for tasks provided by extensions use their defined task identifier.")},A={type:"object",additionalProperties:!1,properties:{reevaluateOnRerun:{type:"boolean",description:e.localize("JsonSchema.tasks.reevaluateOnRerun","Whether to reevaluate task variables on rerun."),default:!0},runOn:{type:"string",enum:["default","folderOpen"],description:e.localize("JsonSchema.tasks.runOn","Configures when the task should be run. If set to folderOpen, then the task will be run automatically when the folder is opened."),default:"default"},instanceLimit:{type:"number",description:e.localize("JsonSchema.tasks.instanceLimit","The number of instances of the task that are allowed to run simultaneously."),default:1}},description:e.localize("JsonSchema.tasks.runOptions","The task's run related options")},S=B.definitions,j=s.deepClone(S.options),Q=j.properties;Q.shell=s.deepClone(S.shellConfiguration);const $={type:"object",additionalProperties:!1,properties:{label:{type:"string",description:e.localize("JsonSchema.tasks.taskLabel","The task's label")},taskName:{type:"string",description:e.localize("JsonSchema.tasks.taskName","The task's name"),deprecationMessage:e.localize("JsonSchema.tasks.taskName.deprecated","The task's name property is deprecated. Use the label property instead.")},identifier:s.deepClone(R),group:s.deepClone(g),isBackground:{type:"boolean",description:e.localize("JsonSchema.tasks.background","Whether the executed task is kept alive and is running in the background."),default:!0},promptOnClose:{type:"boolean",description:e.localize("JsonSchema.tasks.promptOnClose","Whether the user is prompted when VS Code closes with a running task."),default:!1},presentation:s.deepClone(h),icon:s.deepClone(q),hide:s.deepClone(O),options:j,problemMatcher:{$ref:"#/definitions/problemMatcherType",description:e.localize("JsonSchema.tasks.matchers","The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.")},runOptions:s.deepClone(A),dependsOn:s.deepClone(T),dependsOrder:s.deepClone(v),detail:s.deepClone(N)}},c=[];z.onReady().then(()=>{V()});function V(){for(const t of z.all()){if(c.find(l=>l.properties?.type?.enum?.find?l.properties?.type.enum.find(f=>f===t.taskType):void 0))continue;const o=s.deepClone($),i=o.properties;if(i.type={type:"string",description:e.localize("JsonSchema.customizations.customizes.type","The task type to customize"),enum:[t.taskType]},t.required?o.required=t.required.slice():o.required=[],o.required.push("type"),t.properties)for(const l of Object.keys(t.properties)){const f=t.properties[l];i[l]=s.deepClone(f)}d(o),c.push(o)}}const p=s.deepClone($);p.properties.customize={type:"string",deprecationMessage:e.localize("JsonSchema.tasks.customize.deprecated","The customize property is deprecated. See the 1.14 release notes on how to migrate to the new task customization approach")},p.required||(p.required=[]),p.required.push("customize"),c.push(p);const n=s.deepClone(S),m=n.taskDescription;m.required=["label"];const a=m.properties;a.label=s.deepClone(L),a.command=s.deepClone(H),a.args=s.deepClone(P),a.isShellCommand=s.deepClone(k),a.dependsOn=T,a.hide=s.deepClone(O),a.dependsOrder=v,a.identifier=s.deepClone(R),a.type=s.deepClone(D),a.presentation=s.deepClone(h),a.terminal=I,a.icon=s.deepClone(q),a.group=s.deepClone(g),a.runOptions=s.deepClone(A),a.detail=N,a.taskName.deprecationMessage=e.localize("JsonSchema.tasks.taskName.deprecated","The task's name property is deprecated. Use the label property instead.");const u=s.deepClone(m);m.default={label:"My Task",type:"shell",command:"echo Hello",problemMatcher:[]},n.showOutputType.deprecationMessage=e.localize("JsonSchema.tasks.showOutput.deprecated","The property showOutput is deprecated. Use the reveal property inside the presentation property instead. See also the 1.14 release notes."),a.echoCommand.deprecationMessage=e.localize("JsonSchema.tasks.echoCommand.deprecated","The property echoCommand is deprecated. Use the echo property inside the presentation property instead. See also the 1.14 release notes."),a.suppressTaskName.deprecationMessage=e.localize("JsonSchema.tasks.suppressTaskName.deprecated","The property suppressTaskName is deprecated. Inline the command with its arguments into the task instead. See also the 1.14 release notes."),a.isBuildCommand.deprecationMessage=e.localize("JsonSchema.tasks.isBuildCommand.deprecated","The property isBuildCommand is deprecated. Use the group property instead. See also the 1.14 release notes."),a.isTestCommand.deprecationMessage=e.localize("JsonSchema.tasks.isTestCommand.deprecated","The property isTestCommand is deprecated. Use the group property instead. See also the 1.14 release notes."),u.properties.type={type:"string",enum:["process"],default:"process",description:e.localize("JsonSchema.tasks.type","Defines whether the task is run as a process or as a command inside a shell.")},u.required.push("command"),u.required.push("type"),c.push(u),c.push({$ref:"#/definitions/taskDescription"});const r=n.taskRunnerConfiguration.properties,F=r.tasks;F.items={oneOf:c},r.inputs=W.definitions.inputs,n.commandConfiguration.properties.isShellCommand=s.deepClone(k),n.commandConfiguration.properties.args=s.deepClone(P),n.options.properties.shell={$ref:"#/definitions/shellConfiguration"},r.isShellCommand=s.deepClone(k),r.type=s.deepClone(D),r.group=s.deepClone(g),r.presentation=s.deepClone(h),r.suppressTaskName.deprecationMessage=e.localize("JsonSchema.tasks.suppressTaskName.deprecated","The property suppressTaskName is deprecated. Inline the command with its arguments into the task instead. See also the 1.14 release notes."),r.taskSelector.deprecationMessage=e.localize("JsonSchema.tasks.taskSelector.deprecated","The property taskSelector is deprecated. Inline the command with its arguments into the task instead. See also the 1.14 release notes.");const y=s.deepClone(n.taskRunnerConfiguration);delete y.properties.tasks,y.additionalProperties=!1,n.osSpecificTaskRunnerConfiguration=y,r.version=s.deepClone(x);const J={oneOf:[{allOf:[{type:"object",required:["version"],properties:{version:s.deepClone(x),windows:{$ref:"#/definitions/osSpecificTaskRunnerConfiguration",description:e.localize("JsonSchema.windows","Windows specific command configuration")},osx:{$ref:"#/definitions/osSpecificTaskRunnerConfiguration",description:e.localize("JsonSchema.mac","Mac specific command configuration")},linux:{$ref:"#/definitions/osSpecificTaskRunnerConfiguration",description:e.localize("JsonSchema.linux","Linux specific command configuration")}}},{$ref:"#/definitions/taskRunnerConfiguration"}]}]};J.definitions=n;function U(t,o){const i=t[o].properties;i?Object.keys(i).forEach(l=>{U(i,l)}):E.applyDeprecatedVariableMessage(t[o])}Object.getOwnPropertyNames(n).forEach(t=>{const o=t+"2";n[o]=n[t],delete n[t],U(n,o)}),d(J);function G(){try{const t=b.keys().map(o=>"$"+o);n.problemMatcherType2.oneOf[0].enum=t,n.problemMatcherType2.oneOf[2].items.anyOf[0].enum=t}catch{console.log("Installing problem matcher ids failed")}}b.onReady().then(()=>{G()});var ae=J;export{ae as default,G as updateProblemMatchers,V as updateTaskDefinitions};
