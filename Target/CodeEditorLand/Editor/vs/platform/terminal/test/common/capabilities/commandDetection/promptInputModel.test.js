import{ensureNoDisposablesAreLeakedInTestSuite as x}from"../../../../../../base/test/common/utils.js";import{NullLogService as f}from"../../../../../log/common/log.js";import{PromptInputModel as K}from"../../../../common/capabilities/commandDetection/promptInputModel.js";import{Emitter as p}from"../../../../../../base/common/event.js";import{notDeepStrictEqual as C,strictEqual as s}from"assert";import{timeout as d}from"../../../../../../base/common/async.js";import{importAMDNodeModule as y}from"../../../../../../amdX.js";suite("PromptInputModel",()=>{const w=x();let r,e,l,b;async function t(i){await new Promise(o=>e.write(i,o))}function n(){l.fire({marker:e.registerMarker()})}function c(){b.fire(null)}function m(i){r.setContinuationPrompt(i)}async function a(i){if(await d(0),r.cursorIndex!==-1&&!i.includes("|"))throw new Error("assertPromptInput must contain | character");const o=r.getCombinedString();s(o,i.replaceAll(`
`,"\u23CE"));const h=i.replace(/[\|\[\]]/g,""),u=i.indexOf("|");s(r.value,h),s(r.cursorIndex,u,`value=${r.value}`)}setup(async()=>{const i=(await y("@xterm/xterm","lib/xterm.js")).Terminal;e=w.add(new i({allowProposedApi:!0})),l=w.add(new p),b=w.add(new p),r=w.add(new K(e,l.event,b.event,new f))}),test("basic input and execute",async()=>{await t("$ "),n(),await a("|"),await t("foo bar"),await a("foo bar|"),await t(`\r
`),c(),await a("foo bar"),await t(`(command output)\r
$ `),n(),await a("|")}),test("should not fire onDidChangeInput events when nothing changes",async()=>{const i=[];w.add(r.onDidChangeInput(o=>i.push(o))),await t("$ "),n(),await a("|"),await t("foo"),await a("foo|"),await t(" bar"),await a("foo bar|"),await t(`\r
`),c(),await a("foo bar"),await t("$ "),n(),await a("|"),await t("foo bar"),await a("foo bar|");for(let o=0;o<i.length-1;o++)C(i[o],i[o+1],"not adjacent events should fire with the same value")}),test("should fire onDidInterrupt followed by onDidFinish when ctrl+c is pressed",async()=>{await t("$ "),n(),await a("|"),await t("foo"),await a("foo|"),await new Promise(i=>{w.add(r.onDidInterrupt(()=>{w.add(r.onDidFinishInput(()=>{i()}))})),e.input(""),t("^C").then(()=>c())})}),test("cursor navigation",async()=>{await t("$ "),n(),await a("|"),await t("foo bar"),await a("foo bar|"),await t("\x1B[3D"),await a("foo |bar"),await t("\x1B[4D"),await a("|foo bar"),await t("\x1B[3C"),await a("foo| bar"),await t("\x1B[4C"),await a("foo bar|"),await t("\x1B[D"),await a("foo ba|r"),await t("\x1B[C"),await a("foo bar|")}),test("ghost text",async()=>{await t("$ "),n(),await a("|"),await t("foo\x1B[2m bar\x1B[0m\x1B[4D"),await a("foo|[ bar]"),await t("\x1B[2D"),await a("f|oo[ bar]")}),test("wide input (Korean)",async()=>{await t("$ "),n(),await a("|"),await t("\uC548\uC601"),await a("\uC548\uC601|"),await t(`\r
\uCEF4\uD4E8\uD130`),await a(`\uC548\uC601
\uCEF4\uD4E8\uD130|`),await t(`\r
\uC0AC\uB78C`),await a(`\uC548\uC601
\uCEF4\uD4E8\uD130
\uC0AC\uB78C|`),await t("\x1B[G"),await a(`\uC548\uC601
\uCEF4\uD4E8\uD130
|\uC0AC\uB78C`),await t("\x1B[A"),await a(`\uC548\uC601
|\uCEF4\uD4E8\uD130
\uC0AC\uB78C`),await t("\x1B[4C"),await a(`\uC548\uC601
\uCEF4\uD4E8|\uD130
\uC0AC\uB78C`),await t("\x1B[1;4H"),await a(`\uC548|\uC601
\uCEF4\uD4E8\uD130
\uC0AC\uB78C`),await t("\x1B[D"),await a(`|\uC548\uC601
\uCEF4\uD4E8\uD130
\uC0AC\uB78C`)}),test("emoji input",async()=>{await t("$ "),n(),await a("|"),await t("\u270C\uFE0F\u{1F44D}"),await a("\u270C\uFE0F\u{1F44D}|"),await t(`\r
\u{1F60E}\u{1F615}\u{1F605}`),await a(`\u270C\uFE0F\u{1F44D}
\u{1F60E}\u{1F615}\u{1F605}|`),await t(`\r
\u{1F914}\u{1F937}\u{1F629}`),await a(`\u270C\uFE0F\u{1F44D}
\u{1F60E}\u{1F615}\u{1F605}
\u{1F914}\u{1F937}\u{1F629}|`),await t("\x1B[G"),await a(`\u270C\uFE0F\u{1F44D}
\u{1F60E}\u{1F615}\u{1F605}
|\u{1F914}\u{1F937}\u{1F629}`),await t("\x1B[A"),await a(`\u270C\uFE0F\u{1F44D}
|\u{1F60E}\u{1F615}\u{1F605}
\u{1F914}\u{1F937}\u{1F629}`),await t("\x1B[2C"),await a(`\u270C\uFE0F\u{1F44D}
\u{1F60E}\u{1F615}|\u{1F605}
\u{1F914}\u{1F937}\u{1F629}`),await t("\x1B[1;4H"),await a(`\u270C\uFE0F|\u{1F44D}
\u{1F60E}\u{1F615}\u{1F605}
\u{1F914}\u{1F937}\u{1F629}`),await t("\x1B[D"),await a(`|\u270C\uFE0F\u{1F44D}
\u{1F60E}\u{1F615}\u{1F605}
\u{1F914}\u{1F937}\u{1F629}`)}),suite("trailing whitespace",()=>{test("delete whitespace with backspace",async()=>{await t("$ "),n(),await a("|"),await t(" "),await a(" |"),e.input("\x7F",!0),await t("\x1B[D"),await a("|"),e.input(" ".repeat(4),!0),await t(" ".repeat(4)),await a("    |"),e.input("\x1B[D".repeat(2),!0),await t("\x1B[2D"),await a("  |  "),e.input("\x7F",!0),await t("\x1B[D"),await a(" |  "),e.input("\x7F",!0),await t("\x1B[D"),await a("|  "),e.input(" ",!0),await t(" "),await a(" |  "),e.input(" ",!0),await t(" "),await a("  |  "),e.input("\x1B[C",!0),await t("\x1B[C"),await a("   | "),e.input("a",!0),await t("a"),await a("   a| "),e.input("\x7F",!0),await t("\x1B[D\x1B[K"),await a("   | "),e.input("\x1B[D".repeat(2),!0),await t("\x1B[2D"),await a(" |   "),e.input("\x1B[3~",!0),await t(""),await a(" |  ")}),test.skip("track whitespace when ConPTY deletes whitespace unexpectedly",async()=>{await t("$ "),n(),await a("|"),e.input("ls",!0),await t("ls"),await a("ls|"),e.input(" ".repeat(4),!0),await t(" ".repeat(4)),await a("ls    |"),e.input(" ",!0),await t("\x1B[4D\x1B[5X\x1B[5C"),await a("ls     |")}),test("track whitespace beyond cursor",async()=>{await t("$ "),n(),await a("|"),await t(" ".repeat(8)),await a(`${" ".repeat(8)}|`),await t("\x1B[4D"),await a(`${" ".repeat(4)}|${" ".repeat(4)}`)})}),suite("multi-line",()=>{test("basic 2 line",async()=>{await t("$ "),n(),await a("|"),await t('echo "a'),await a('echo "a|'),await t(`
\r\u2219 `),m("\u2219 "),await a(`echo "a
|`),await t("b"),await a(`echo "a
b|`)}),test("basic 3 line",async()=>{await t("$ "),n(),await a("|"),await t('echo "a'),await a('echo "a|'),await t(`
\r\u2219 `),m("\u2219 "),await a(`echo "a
|`),await t("b"),await a(`echo "a
b|`),await t(`
\r\u2219 `),m("\u2219 "),await a(`echo "a
b
|`),await t("c"),await a(`echo "a
b
c|`)}),test("navigate left in multi-line",async()=>{await t("$ "),n(),await a("|"),await t('echo "a'),await a('echo "a|'),await t(`
\r\u2219 `),m("\u2219 "),await a(`echo "a
|`),await t("b"),await a(`echo "a
b|`),await t("\x1B[D"),await a(`echo "a
|b`),await t("\x1B[@c"),await a(`echo "a
c|b`),await t(`\x1B[K
\r\u2219 `),await a(`echo "a
c
|`),await t("b"),await a(`echo "a
c
b|`),await t(" foo"),await a(`echo "a
c
b foo|`),await t("\x1B[3D"),await a(`echo "a
c
b |foo`)}),test("navigate up in multi-line",async()=>{await t("$ "),n(),await a("|"),await t('echo "foo'),await a('echo "foo|'),await t(`
\r\u2219 `),m("\u2219 "),await a(`echo "foo
|`),await t("bar"),await a(`echo "foo
bar|`),await t(`
\r\u2219 `),m("\u2219 "),await a(`echo "foo
bar
|`),await t("baz"),await a(`echo "foo
bar
baz|`),await t("\x1B[A"),await a(`echo "foo
bar|
baz`),await t("\x1B[D"),await a(`echo "foo
ba|r
baz`),await t("\x1B[D"),await a(`echo "foo
b|ar
baz`),await t("\x1B[D"),await a(`echo "foo
|bar
baz`),await t("\x1B[1;9H"),await a(`echo "|foo
bar
baz`),await t("\x1B[C"),await a(`echo "f|oo
bar
baz`),await t("\x1B[C"),await a(`echo "fo|o
bar
baz`),await t("\x1B[C"),await a(`echo "foo|
bar
baz`)}),test("navigating up when first line contains invalid/stale trailing whitespace",async()=>{await t("$ "),n(),await a("|"),await t('echo "foo      \x1B[6D'),await a('echo "foo|'),await t(`
\r\u2219 `),m("\u2219 "),await a(`echo "foo
|`),await t("bar"),await a(`echo "foo
bar|`),await t("\x1B[D"),await a(`echo "foo
ba|r`),await t("\x1B[D"),await a(`echo "foo
b|ar`),await t("\x1B[D"),await a(`echo "foo
|bar`)})}),suite("wrapped line (non-continuation)",()=>{test("basic wrapped line",async()=>{e.resize(5,10),await t("$ "),n(),await a("|"),await t("ech"),await a("ech|"),await t("o "),await a("echo |"),await t('"a"'),await a('echo "a"| ')})}),suite("recorded sessions",()=>{async function i(o){for(const h of o)await t(h)}suite("Windows 11 (10.0.22621.3447), pwsh 7.4.2, starship prompt 1.10.2",()=>{test("input with ignored ghost text",async()=>{await i(["\x1B[?25l\x1B[2J\x1B[m\x1B[H\x1B]0;C:\\Program Files\\WindowsApps\\Microsoft.PowerShell_7.4.2.0_x64__8wekyb3d8bbwe\\pwsh.exe\x07\x1B[?25h",`\x1B[?25l\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\x1B[H\x1B[?25h`,"\x1B]633;P;IsWindows=True\x07","\x1B]633;P;ContinuationPrompt=\x1B[38;5;8m\u2219\x1B[0m \x07","\x1B]633;A\x07\x1B]633;P;Cwd=C:\\Github\\microsoft\\vscode\x07\x1B]633;B\x07",`\x1B[34m\r
\uE0B6\x1B[38;2;17;17;17m\x1B[44m03:13:47 \x1B[34m\x1B[41m\uE0B0 \x1B[38;2;17;17;17mvscode \x1B[31m\x1B[43m\uE0B0 \x1B[38;2;17;17;17m\uE0A0 tyriar/prompt_input_model \x1B[33m\x1B[46m\uE0B0 \x1B[38;2;17;17;17m$\u21E1 \x1B[36m\x1B[49m\uE0B0 \x1B[mvia \x1B[32m\x1B[1m\uE718 v18.18.2 \r
\u276F\x1B[m `]),n(),await a("|"),await i(["\x1B[?25l\x1B[93mf\x1B[97m\x1B[2m\x1B[3makecommand\x1B[3;4H\x1B[?25h","\x1B[m","\x1B[93m\bfo\x1B[9X","\x1B[m","\x1B[?25l\x1B[93m\x1B[3;3Hfoo\x1B[?25h","\x1B[m"]),await a("foo|")}),test("input with accepted and run ghost text",async()=>{await i(["\x1B[?25l\x1B[2J\x1B[m\x1B[H\x1B]0;C:\\Program Files\\WindowsApps\\Microsoft.PowerShell_7.4.2.0_x64__8wekyb3d8bbwe\\pwsh.exe\x07\x1B[?25h",`\x1B[?25l\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\x1B[H\x1B[?25h`,"\x1B]633;P;IsWindows=True\x07","\x1B]633;P;ContinuationPrompt=\x1B[38;5;8m\u2219\x1B[0m \x07","\x1B]633;A\x07\x1B]633;P;Cwd=C:\\Github\\microsoft\\vscode\x07\x1B]633;B\x07",`\x1B[34m\r
\uE0B6\x1B[38;2;17;17;17m\x1B[44m03:41:36 \x1B[34m\x1B[41m\uE0B0 \x1B[38;2;17;17;17mvscode \x1B[31m\x1B[43m\uE0B0 \x1B[38;2;17;17;17m\uE0A0 tyriar/prompt_input_model \x1B[33m\x1B[46m\uE0B0 \x1B[38;2;17;17;17m$ \x1B[36m\x1B[49m\uE0B0 \x1B[mvia \x1B[32m\x1B[1m\uE718 v18.18.2 \r
\u276F\x1B[m `]),r.setContinuationPrompt("\u2219 "),n(),await a("|"),await i(['\x1B[?25l\x1B[93me\x1B[97m\x1B[2m\x1B[3mcho "hello world"\x1B[3;4H\x1B[?25h',"\x1B[m"]),await a('e|[cho "hello world"]'),await i(['\x1B[?25l\x1B[93m\bec\x1B[97m\x1B[2m\x1B[3mho "hello world"\x1B[3;5H\x1B[?25h',"\x1B[m"]),await a('ec|[ho "hello world"]'),await i(['\x1B[?25l\x1B[93m\x1B[3;3Hech\x1B[97m\x1B[2m\x1B[3mo "hello world"\x1B[3;6H\x1B[?25h',"\x1B[m"]),await a('ech|[o "hello world"]'),await i(['\x1B[?25l\x1B[93m\x1B[3;3Hecho\x1B[97m\x1B[2m\x1B[3m "hello world"\x1B[3;7H\x1B[?25h',"\x1B[m"]),await a('echo|[ "hello world"]'),await i(['\x1B[?25l\x1B[93m\x1B[3;3Hecho \x1B[97m\x1B[2m\x1B[3m"hello world"\x1B[3;8H\x1B[?25h',"\x1B[m"]),await a('echo |["hello world"]'),await i(['\x1B[?25l\x1B[93m\x1B[3;3Hecho \x1B[36m"hello world"\x1B[?25h',"\x1B[m"]),await a('echo "hello world"|'),await i(['\x1B]633;E;echo "hello world";ff464d39-bc80-4bae-9ead-b1cafc4adf6f\x07\x1B]633;C\x07']),c(),await a('echo "hello world"'),await i([`\r
`,`hello world\r
`]),await a('echo "hello world"'),await i(["\x1B]633;D;0\x07\x1B]633;A\x07\x1B]633;P;Cwd=C:\\Github\\microsoft\\vscode\x07\x1B]633;B\x07",`\x1B[34m\r
\uE0B6\x1B[38;2;17;17;17m\x1B[44m03:41:42 \x1B[34m\x1B[41m\uE0B0 \x1B[38;2;17;17;17mvscode \x1B[31m\x1B[43m\uE0B0 \x1B[38;2;17;17;17m\uE0A0 tyriar/prompt_input_model \x1B[33m\x1B[46m\uE0B0 \x1B[38;2;17;17;17m$ \x1B[36m\x1B[49m\uE0B0 \x1B[mvia \x1B[32m\x1B[1m\uE718 v18.18.2 \r
\u276F\x1B[m `]),n(),await a("|")}),test("input, go to start (ctrl+home), delete word in front (ctrl+delete)",async()=>{await i(["\x1B[?25l\x1B[2J\x1B[m\x1B[H\x1B]0;C:Program FilesWindowsAppsMicrosoft.PowerShell_7.4.2.0_x64__8wekyb3d8bbwepwsh.exe\x07\x1B[?25h",`\x1B[?25l\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\r
\x1B[K\x1B[H\x1B[?25h`,"\x1B]633;P;IsWindows=True\x07","\x1B]633;P;ContinuationPrompt=\x1B[38;5;8m\u2219\x1B[0m \x07","\x1B]633;A\x07\x1B]633;P;Cwd=C:\\Github\\microsoft\\vscode\x07\x1B]633;B\x07",`\x1B[34m\r
\uE0B6\x1B[38;2;17;17;17m\x1B[44m16:07:06 \x1B[34m\x1B[41m\uE0B0 \x1B[38;2;17;17;17mvscode \x1B[31m\x1B[43m\uE0B0 \x1B[38;2;17;17;17m\uE0A0 tyriar/210662 \x1B[33m\x1B[46m\uE0B0 \x1B[38;2;17;17;17m$! \x1B[36m\x1B[49m\uE0B0 \x1B[mvia \x1B[32m\x1B[1m\uE718 v18.18.2 \r
\u276F\x1B[m `]),n(),await a("|"),await i(["\x1B[?25l\x1B[93mG\x1B[97m\x1B[2m\x1B[3mit push\x1B[3;4H\x1B[?25h","\x1B[m","\x1B[?25l\x1B[93m\bGe\x1B[97m\x1B[2m\x1B[3mt-ChildItem -Path a\x1B[3;5H\x1B[?25h","\x1B[m","\x1B[?25l\x1B[93m\x1B[3;3HGet\x1B[97m\x1B[2m\x1B[3m-ChildItem -Path a\x1B[3;6H\x1B[?25h"]),await a("Get|[-ChildItem -Path a]"),await i(["\x1B[m","\x1B[?25l\x1B[3;3H\x1B[?25h","\x1B[21X"]),await d(0);const o=r.getCombinedString();s(o,"|".replaceAll(`
`,"\u23CE"))})})})});
