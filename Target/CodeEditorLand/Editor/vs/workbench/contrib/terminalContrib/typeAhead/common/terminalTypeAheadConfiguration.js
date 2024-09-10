import{localize as e}from"../../../../../nls.js";const l=["vim","vi","nano","tmux"];var a=(o=>(o.LocalEchoLatencyThreshold="terminal.integrated.localEchoLatencyThreshold",o.LocalEchoEnabled="terminal.integrated.localEchoEnabled",o.LocalEchoExcludePrograms="terminal.integrated.localEchoExcludePrograms",o.LocalEchoStyle="terminal.integrated.localEchoStyle",o))(a||{});const n={"terminal.integrated.localEchoLatencyThreshold":{description:e("terminal.integrated.localEchoLatencyThreshold","Length of network delay, in milliseconds, where local edits will be echoed on the terminal without waiting for server acknowledgement. If '0', local echo will always be on, and if '-1' it will be disabled."),type:"integer",minimum:-1,default:30},"terminal.integrated.localEchoEnabled":{markdownDescription:e("terminal.integrated.localEchoEnabled","When local echo should be enabled. This will override {0}","`#terminal.integrated.localEchoLatencyThreshold#`"),type:"string",enum:["on","off","auto"],enumDescriptions:[e("terminal.integrated.localEchoEnabled.on","Always enabled"),e("terminal.integrated.localEchoEnabled.off","Always disabled"),e("terminal.integrated.localEchoEnabled.auto","Enabled only for remote workspaces")],default:"auto"},"terminal.integrated.localEchoExcludePrograms":{description:e("terminal.integrated.localEchoExcludePrograms","Local echo will be disabled when any of these program names are found in the terminal title."),type:"array",items:{type:"string",uniqueItems:!0},default:l},"terminal.integrated.localEchoStyle":{description:e("terminal.integrated.localEchoStyle","Terminal style of locally echoed text; either a font style or an RGB color."),default:"dim",anyOf:[{enum:["bold","dim","italic","underlined","inverted","#ff0000"]},{type:"string",format:"color-hex"}]}};export{l as DEFAULT_LOCAL_ECHO_EXCLUDE,a as TerminalTypeAheadSettingId,n as terminalTypeAheadConfiguration};
