import { strictEqual } from "assert";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { timeout } from "../../../../../../base/common/async.js";
import {
  OperatingSystem,
  isWindows
} from "../../../../../../base/common/platform.js";
import { format } from "../../../../../../base/common/strings.js";
import { URI } from "../../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { TestInstantiationService } from "../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { NullLogService } from "../../../../../../platform/log/common/log.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
import { createFileStat } from "../../../../../test/common/workbenchTestServices.js";
import { TerminalBuiltinLinkType } from "../../browser/links.js";
import { TerminalLinkResolver } from "../../browser/terminalLinkResolver.js";
import { TerminalMultiLineLinkDetector } from "../../browser/terminalMultiLineLinkDetector.js";
import { assertLinkHelper } from "./linkTestUtils.js";
const unixLinks = [
  // Absolute
  "/foo",
  "/foo/bar",
  "/foo/[bar]",
  "/foo/[bar].baz",
  "/foo/[bar]/baz",
  "/foo/bar+more",
  // User home
  { link: "~/foo", resource: URI.file("/home/foo") },
  // Relative
  { link: "./foo", resource: URI.file("/parent/cwd/foo") },
  { link: "./$foo", resource: URI.file("/parent/cwd/$foo") },
  { link: "../foo", resource: URI.file("/parent/foo") },
  { link: "foo/bar", resource: URI.file("/parent/cwd/foo/bar") },
  { link: "foo/bar+more", resource: URI.file("/parent/cwd/foo/bar+more") }
];
const windowsLinks = [
  // Absolute
  "c:\\foo",
  { link: "\\\\?\\C:\\foo", resource: URI.file("C:\\foo") },
  "c:/foo",
  "c:/foo/bar",
  "c:\\foo\\bar",
  "c:\\foo\\bar+more",
  "c:\\foo/bar\\baz",
  // User home
  { link: "~\\foo", resource: URI.file("C:\\Home\\foo") },
  { link: "~/foo", resource: URI.file("C:\\Home\\foo") },
  // Relative
  { link: ".\\foo", resource: URI.file("C:\\Parent\\Cwd\\foo") },
  { link: "./foo", resource: URI.file("C:\\Parent\\Cwd\\foo") },
  { link: "./$foo", resource: URI.file("C:\\Parent\\Cwd\\$foo") },
  { link: "..\\foo", resource: URI.file("C:\\Parent\\foo") },
  { link: "foo/bar", resource: URI.file("C:\\Parent\\Cwd\\foo\\bar") },
  { link: "foo/bar", resource: URI.file("C:\\Parent\\Cwd\\foo\\bar") },
  { link: "foo/[bar]", resource: URI.file("C:\\Parent\\Cwd\\foo\\[bar]") },
  {
    link: "foo/[bar].baz",
    resource: URI.file("C:\\Parent\\Cwd\\foo\\[bar].baz")
  },
  {
    link: "foo/[bar]/baz",
    resource: URI.file("C:\\Parent\\Cwd\\foo\\[bar]/baz")
  },
  { link: "foo\\bar", resource: URI.file("C:\\Parent\\Cwd\\foo\\bar") },
  {
    link: "foo\\[bar].baz",
    resource: URI.file("C:\\Parent\\Cwd\\foo\\[bar].baz")
  },
  {
    link: "foo\\[bar]\\baz",
    resource: URI.file("C:\\Parent\\Cwd\\foo\\[bar]\\baz")
  },
  {
    link: "foo\\bar+more",
    resource: URI.file("C:\\Parent\\Cwd\\foo\\bar+more")
  }
];
const supportedLinkFormats = [
  // 5: file content...                         [#181837]
  //   5:3  error                               [#181837]
  { urlFormat: "{0}\r\n{1}:foo", line: "5" },
  { urlFormat: "{0}\r\n{1}: foo", line: "5" },
  {
    urlFormat: "{0}\r\n5:another link\r\n{1}:{2} foo",
    line: "5",
    column: "3"
  },
  { urlFormat: "{0}\r\n  {1}:{2} foo", line: "5", column: "3" },
  {
    urlFormat: "{0}\r\n  5:6  error  another one\r\n  {1}:{2}  error",
    line: "5",
    column: "3"
  },
  {
    urlFormat: `{0}\r
  5:6  error  ${"a".repeat(80)}\r
  {1}:{2}  error`,
    line: "5",
    column: "3"
  },
  // @@ ... <to-file-range> @@ content...       [#182878]   (tests check the entire line, so they don't include the line content at the end of the last @@)
  { urlFormat: "+++ b/{0}\r\n@@ -7,6 +{1},7 @@", line: "5" },
  {
    urlFormat: "+++ b/{0}\r\n@@ -1,1 +1,1 @@\r\nfoo\r\nbar\r\n@@ -7,6 +{1},7 @@",
    line: "5"
  }
];
suite("Workbench - TerminalMultiLineLinkDetector", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let configurationService;
  let detector;
  let resolver;
  let xterm;
  let validResources;
  async function assertLinks(type, text, expected) {
    let to;
    const race = await Promise.race([
      assertLinkHelper(text, expected, detector, type).then(
        () => "success"
      ),
      (to = timeout(2)).then(() => "timeout")
    ]);
    strictEqual(
      race,
      "success",
      `Awaiting link assertion for "${text}" timed out`
    );
    to.cancel();
  }
  async function assertLinksMain(link, resource) {
    const uri = resource ?? URI.file(link);
    const lines = link.split("\r\n");
    const lastLine = lines.at(-1);
    let lineCount = 0;
    for (const line of lines) {
      lineCount += Math.max(Math.ceil(line.length / 80), 1);
    }
    await assertLinks(TerminalBuiltinLinkType.LocalFile, link, [
      {
        uri,
        range: [
          [1, lineCount],
          [lastLine.length, lineCount]
        ]
      }
    ]);
  }
  setup(async () => {
    instantiationService = store.add(new TestInstantiationService());
    configurationService = new TestConfigurationService();
    instantiationService.stub(IConfigurationService, configurationService);
    instantiationService.stub(IFileService, {
      async stat(resource) {
        if (!validResources.map((e) => e.path).includes(resource.path)) {
          throw new Error("Doesn't exist");
        }
        return createFileStat(resource);
      }
    });
    instantiationService.stub(ITerminalLogService, new NullLogService());
    resolver = instantiationService.createInstance(TerminalLinkResolver);
    validResources = [];
    const TerminalCtor = (await importAMDNodeModule(
      "@xterm/xterm",
      "lib/xterm.js"
    )).Terminal;
    xterm = new TerminalCtor({
      allowProposedApi: true,
      cols: 80,
      rows: 30
    });
  });
  suite("macOS/Linux", () => {
    setup(() => {
      detector = instantiationService.createInstance(
        TerminalMultiLineLinkDetector,
        xterm,
        {
          initialCwd: "/parent/cwd",
          os: OperatingSystem.Linux,
          remoteAuthority: void 0,
          userHome: "/home",
          backend: void 0
        },
        resolver
      );
    });
    for (const l of unixLinks) {
      const baseLink = typeof l === "string" ? l : l.link;
      const resource = typeof l === "string" ? URI.file(l) : l.resource;
      suite(`Link: ${baseLink}`, () => {
        for (let i = 0; i < supportedLinkFormats.length; i++) {
          const linkFormat = supportedLinkFormats[i];
          const formattedLink = format(
            linkFormat.urlFormat,
            baseLink,
            linkFormat.line,
            linkFormat.column
          );
          test(`should detect in "${escapeMultilineTestName(formattedLink)}"`, async () => {
            validResources = [resource];
            await assertLinksMain(formattedLink, resource);
          });
        }
      });
    }
  });
  if (isWindows) {
    suite("Windows", () => {
      setup(() => {
        detector = instantiationService.createInstance(
          TerminalMultiLineLinkDetector,
          xterm,
          {
            initialCwd: "C:\\Parent\\Cwd",
            os: OperatingSystem.Windows,
            remoteAuthority: void 0,
            userHome: "C:\\Home"
          },
          resolver
        );
      });
      for (const l of windowsLinks) {
        const baseLink = typeof l === "string" ? l : l.link;
        const resource = typeof l === "string" ? URI.file(l) : l.resource;
        suite(`Link "${baseLink}"`, () => {
          for (let i = 0; i < supportedLinkFormats.length; i++) {
            const linkFormat = supportedLinkFormats[i];
            const formattedLink = format(
              linkFormat.urlFormat,
              baseLink,
              linkFormat.line,
              linkFormat.column
            );
            test(`should detect in "${escapeMultilineTestName(formattedLink)}"`, async () => {
              validResources = [resource];
              await assertLinksMain(formattedLink, resource);
            });
          }
        });
      }
    });
  }
});
function escapeMultilineTestName(text) {
  return text.replaceAll("\r\n", "\\r\\n");
}
