import{localize as e}from"../../../../../nls.js";import{TerminalSettingId as n}from"../../../../../platform/terminal/common/terminal.js";var s=(t=>(t.Enabled="terminal.integrated.suggest.enabled",t.QuickSuggestions="terminal.integrated.suggest.quickSuggestions",t.SuggestOnTriggerCharacters="terminal.integrated.suggest.suggestOnTriggerCharacters",t.RunOnEnter="terminal.integrated.suggest.runOnEnter",t.BuiltinCompletions="terminal.integrated.suggest.builtinCompletions",t))(s||{});const o="terminal.integrated.suggest",a={["terminal.integrated.suggest.enabled"]:{restricted:!0,markdownDescription:e("suggest.enabled",`Enables experimental terminal Intellisense suggestions for supported shells ({0}) when {1} is set to {2}.

If shell integration is installed manually, {3} needs to be set to {4} before calling the shell integration script.`,"PowerShell v7+",`\`#${n.ShellIntegrationEnabled}#\``,"`true`","`VSCODE_SUGGEST`","`1`"),type:"boolean",default:!1},["terminal.integrated.suggest.quickSuggestions"]:{restricted:!0,markdownDescription:e("suggest.quickSuggestions","Controls whether suggestions should automatically show up while typing. Also be aware of the {0}-setting which controls if suggestions are triggered by special characters.","`#terminal.integrated.suggest.suggestOnTriggerCharacters#`"),type:"boolean",default:!0},["terminal.integrated.suggest.suggestOnTriggerCharacters"]:{restricted:!0,markdownDescription:e("suggest.suggestOnTriggerCharacters","Controls whether suggestions should automatically show up when typing trigger characters."),type:"boolean",default:!0},["terminal.integrated.suggest.runOnEnter"]:{restricted:!0,markdownDescription:e("suggest.runOnEnter","Controls whether suggestions should run immediately when `Enter` (not `Tab`) is used to accept the result."),enum:["ignore","never","exactMatch","exactMatchIgnoreExtension","always"],markdownEnumDescriptions:[e("runOnEnter.ignore","Ignore suggestions and send the enter directly to the shell without completing. This is used as the default value so the suggest widget is as unobtrusive as possible."),e("runOnEnter.never","Never run on `Enter`."),e("runOnEnter.exactMatch","Run on `Enter` when the suggestion is typed in its entirety."),e("runOnEnter.exactMatchIgnoreExtension","Run on `Enter` when the suggestion is typed in its entirety or when a file is typed without its extension included."),e("runOnEnter.always","Always run on `Enter`.")],default:"ignore"},["terminal.integrated.suggest.builtinCompletions"]:{restricted:!0,markdownDescription:e("suggest.builtinCompletions","Controls which built-in completions are activated. This setting can cause conflicts if custom shell completions are configured in the shell profile."),type:"object",properties:{pwshCode:{description:e("suggest.builtinCompletions.pwshCode","Custom PowerShell argument completers will be registered for VS Code's `code` and `code-insiders` CLIs. This is currently very basic and always suggests flags and subcommands without checking context."),type:"boolean"},pwshGit:{description:e("suggest.builtinCompletions.pwshGit","Custom PowerShell argument completers will be registered for the `git` CLI."),type:"boolean"}},default:{pwshCode:!0,pwshGit:!0}}};export{s as TerminalSuggestSettingId,o as terminalSuggestConfigSection,a as terminalSuggestConfiguration};
