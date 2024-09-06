import"../../../../../vs/base/common/jsonSchema.js";import*as e from"../../../../../vs/nls.js";import{Schemas as t}from"../../../../../vs/workbench/contrib/tasks/common/problemMatcher.js";const o={definitions:{showOutputType:{type:"string",enum:["always","silent","never"]},options:{type:"object",description:e.localize("JsonSchema.options","Additional command options"),properties:{cwd:{type:"string",description:e.localize("JsonSchema.options.cwd","The current working directory of the executed program or script. If omitted Code's current workspace root is used.")},env:{type:"object",additionalProperties:{type:"string"},description:e.localize("JsonSchema.options.env","The environment of the executed program or shell. If omitted the parent process' environment is used.")}},additionalProperties:{type:["string","array","object"]}},problemMatcherType:{oneOf:[{type:"string",errorMessage:e.localize("JsonSchema.tasks.matcherError","Unrecognized problem matcher. Is the extension that contributes this problem matcher installed?")},t.LegacyProblemMatcher,{type:"array",items:{anyOf:[{type:"string",errorMessage:e.localize("JsonSchema.tasks.matcherError","Unrecognized problem matcher. Is the extension that contributes this problem matcher installed?")},t.LegacyProblemMatcher]}}]},shellConfiguration:{type:"object",additionalProperties:!1,description:e.localize("JsonSchema.shellConfiguration","Configures the shell to be used."),properties:{executable:{type:"string",description:e.localize("JsonSchema.shell.executable","The shell to be used.")},args:{type:"array",description:e.localize("JsonSchema.shell.args","The shell arguments."),items:{type:"string"}}}},commandConfiguration:{type:"object",additionalProperties:!1,properties:{command:{type:"string",description:e.localize("JsonSchema.command","The command to be executed. Can be an external program or a shell command.")},args:{type:"array",description:e.localize("JsonSchema.tasks.args","Arguments passed to the command when this task is invoked."),items:{type:"string"}},options:{$ref:"#/definitions/options"}}},taskDescription:{type:"object",required:["taskName"],additionalProperties:!1,properties:{taskName:{type:"string",description:e.localize("JsonSchema.tasks.taskName","The task's name")},command:{type:"string",description:e.localize("JsonSchema.command","The command to be executed. Can be an external program or a shell command.")},args:{type:"array",description:e.localize("JsonSchema.tasks.args","Arguments passed to the command when this task is invoked."),items:{type:"string"}},options:{$ref:"#/definitions/options"},windows:{anyOf:[{$ref:"#/definitions/commandConfiguration",description:e.localize("JsonSchema.tasks.windows","Windows specific command configuration")},{properties:{problemMatcher:{$ref:"#/definitions/problemMatcherType",description:e.localize("JsonSchema.tasks.matchers","The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.")}}}]},osx:{anyOf:[{$ref:"#/definitions/commandConfiguration",description:e.localize("JsonSchema.tasks.mac","Mac specific command configuration")},{properties:{problemMatcher:{$ref:"#/definitions/problemMatcherType",description:e.localize("JsonSchema.tasks.matchers","The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.")}}}]},linux:{anyOf:[{$ref:"#/definitions/commandConfiguration",description:e.localize("JsonSchema.tasks.linux","Linux specific command configuration")},{properties:{problemMatcher:{$ref:"#/definitions/problemMatcherType",description:e.localize("JsonSchema.tasks.matchers","The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.")}}}]},suppressTaskName:{type:"boolean",description:e.localize("JsonSchema.tasks.suppressTaskName","Controls whether the task name is added as an argument to the command. If omitted the globally defined value is used."),default:!0},showOutput:{$ref:"#/definitions/showOutputType",description:e.localize("JsonSchema.tasks.showOutput","Controls whether the output of the running task is shown or not. If omitted the globally defined value is used.")},echoCommand:{type:"boolean",description:e.localize("JsonSchema.echoCommand","Controls whether the executed command is echoed to the output. Default is false."),default:!0},isWatching:{type:"boolean",deprecationMessage:e.localize("JsonSchema.tasks.watching.deprecation","Deprecated. Use isBackground instead."),description:e.localize("JsonSchema.tasks.watching","Whether the executed task is kept alive and is watching the file system."),default:!0},isBackground:{type:"boolean",description:e.localize("JsonSchema.tasks.background","Whether the executed task is kept alive and is running in the background."),default:!0},promptOnClose:{type:"boolean",description:e.localize("JsonSchema.tasks.promptOnClose","Whether the user is prompted when VS Code closes with a running task."),default:!1},isBuildCommand:{type:"boolean",description:e.localize("JsonSchema.tasks.build","Maps this task to Code's default build command."),default:!0},isTestCommand:{type:"boolean",description:e.localize("JsonSchema.tasks.test","Maps this task to Code's default test command."),default:!0},problemMatcher:{$ref:"#/definitions/problemMatcherType",description:e.localize("JsonSchema.tasks.matchers","The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.")}}},taskRunnerConfiguration:{type:"object",required:[],properties:{command:{type:"string",description:e.localize("JsonSchema.command","The command to be executed. Can be an external program or a shell command.")},args:{type:"array",description:e.localize("JsonSchema.args","Additional arguments passed to the command."),items:{type:"string"}},options:{$ref:"#/definitions/options"},showOutput:{$ref:"#/definitions/showOutputType",description:e.localize("JsonSchema.showOutput","Controls whether the output of the running task is shown or not. If omitted 'always' is used.")},isWatching:{type:"boolean",deprecationMessage:e.localize("JsonSchema.watching.deprecation","Deprecated. Use isBackground instead."),description:e.localize("JsonSchema.watching","Whether the executed task is kept alive and is watching the file system."),default:!0},isBackground:{type:"boolean",description:e.localize("JsonSchema.background","Whether the executed task is kept alive and is running in the background."),default:!0},promptOnClose:{type:"boolean",description:e.localize("JsonSchema.promptOnClose","Whether the user is prompted when VS Code closes with a running background task."),default:!1},echoCommand:{type:"boolean",description:e.localize("JsonSchema.echoCommand","Controls whether the executed command is echoed to the output. Default is false."),default:!0},suppressTaskName:{type:"boolean",description:e.localize("JsonSchema.suppressTaskName","Controls whether the task name is added as an argument to the command. Default is false."),default:!0},taskSelector:{type:"string",description:e.localize("JsonSchema.taskSelector","Prefix to indicate that an argument is task.")},problemMatcher:{$ref:"#/definitions/problemMatcherType",description:e.localize("JsonSchema.matchers","The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.")},tasks:{type:"array",description:e.localize("JsonSchema.tasks","The task configurations. Usually these are enrichments of task already defined in the external task runner."),items:{type:"object",$ref:"#/definitions/taskDescription"}}}}}};var n=o;export{n as default};
