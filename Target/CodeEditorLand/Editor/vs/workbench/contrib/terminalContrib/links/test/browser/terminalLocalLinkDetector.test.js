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
import { TerminalCapabilityStore } from "../../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
import { createFileStat } from "../../../../../test/common/workbenchTestServices.js";
import { TerminalBuiltinLinkType } from "../../browser/links.js";
import { TerminalLinkResolver } from "../../browser/terminalLinkResolver.js";
import { TerminalLocalLinkDetector } from "../../browser/terminalLocalLinkDetector.js";
import { assertLinkHelper } from "./linkTestUtils.js";
const unixLinks = [
  // Absolute
  "/foo",
  "/foo/bar",
  "/foo/[bar]",
  "/foo/[bar].baz",
  "/foo/[bar]/baz",
  "/foo/bar+more",
  // URI file://
  { link: "file:///foo", resource: URI.file("/foo") },
  { link: "file:///foo/bar", resource: URI.file("/foo/bar") },
  { link: "file:///foo/bar%20baz", resource: URI.file("/foo/bar baz") },
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
  // URI file://
  { link: "file:///c:/foo", resource: URI.file("c:\\foo") },
  { link: "file:///c:/foo/bar", resource: URI.file("c:\\foo\\bar") },
  {
    link: "file:///c:/foo/bar%20baz",
    resource: URI.file("c:\\foo\\bar baz")
  },
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
  { urlFormat: "{0}" },
  { urlFormat: '{0}" on line {1}', line: "5" },
  { urlFormat: '{0}" on line {1}, column {2}', line: "5", column: "3" },
  { urlFormat: '{0}":line {1}', line: "5" },
  { urlFormat: '{0}":line {1}, column {2}', line: "5", column: "3" },
  { urlFormat: '{0}": line {1}', line: "5" },
  { urlFormat: '{0}": line {1}, col {2}', line: "5", column: "3" },
  { urlFormat: "{0}({1})", line: "5" },
  { urlFormat: "{0} ({1})", line: "5" },
  { urlFormat: "{0}({1},{2})", line: "5", column: "3" },
  { urlFormat: "{0} ({1},{2})", line: "5", column: "3" },
  { urlFormat: "{0}: ({1},{2})", line: "5", column: "3" },
  { urlFormat: "{0}({1}, {2})", line: "5", column: "3" },
  { urlFormat: "{0} ({1}, {2})", line: "5", column: "3" },
  { urlFormat: "{0}: ({1}, {2})", line: "5", column: "3" },
  { urlFormat: "{0}:{1}", line: "5" },
  { urlFormat: "{0}:{1}:{2}", line: "5", column: "3" },
  { urlFormat: "{0} {1}:{2}", line: "5", column: "3" },
  { urlFormat: "{0}[{1}]", line: "5" },
  { urlFormat: "{0} [{1}]", line: "5" },
  { urlFormat: "{0}[{1},{2}]", line: "5", column: "3" },
  { urlFormat: "{0} [{1},{2}]", line: "5", column: "3" },
  { urlFormat: "{0}: [{1},{2}]", line: "5", column: "3" },
  { urlFormat: "{0}[{1}, {2}]", line: "5", column: "3" },
  { urlFormat: "{0} [{1}, {2}]", line: "5", column: "3" },
  { urlFormat: "{0}: [{1}, {2}]", line: "5", column: "3" },
  { urlFormat: '{0}",{1}', line: "5" },
  { urlFormat: "{0}',{1}", line: "5" },
  { urlFormat: "{0}#{1}", line: "5" },
  { urlFormat: "{0}#{1}:{2}", line: "5", column: "5" }
];
const windowsFallbackLinks = [
  "C:\\foo bar",
  "C:\\foo bar\\baz",
  "C:\\foo\\bar baz",
  "C:\\foo/bar baz"
];
const supportedFallbackLinkFormats = [
  // Python style error: File "<path>", line <line>
  { urlFormat: 'File "{0}"', linkCellStartOffset: 5 },
  { urlFormat: 'File "{0}", line {1}', line: "5", linkCellStartOffset: 5 },
  // Unknown tool #200166: FILE  <path>:<line>:<col>
  { urlFormat: " FILE  {0}", linkCellStartOffset: 7 },
  { urlFormat: " FILE  {0}:{1}", line: "5", linkCellStartOffset: 7 },
  {
    urlFormat: " FILE  {0}:{1}:{2}",
    line: "5",
    column: "3",
    linkCellStartOffset: 7
  },
  // Some C++ compile error formats
  { urlFormat: "{0}({1}) :", line: "5", linkCellEndOffset: -2 },
  {
    urlFormat: "{0}({1},{2}) :",
    line: "5",
    column: "3",
    linkCellEndOffset: -2
  },
  {
    urlFormat: "{0}({1}, {2}) :",
    line: "5",
    column: "3",
    linkCellEndOffset: -2
  },
  { urlFormat: "{0}({1}):", line: "5", linkCellEndOffset: -1 },
  {
    urlFormat: "{0}({1},{2}):",
    line: "5",
    column: "3",
    linkCellEndOffset: -1
  },
  {
    urlFormat: "{0}({1}, {2}):",
    line: "5",
    column: "3",
    linkCellEndOffset: -1
  },
  { urlFormat: "{0}:{1} :", line: "5", linkCellEndOffset: -2 },
  {
    urlFormat: "{0}:{1}:{2} :",
    line: "5",
    column: "3",
    linkCellEndOffset: -2
  },
  { urlFormat: "{0}:{1}:", line: "5", linkCellEndOffset: -1 },
  {
    urlFormat: "{0}:{1}:{2}:",
    line: "5",
    column: "3",
    linkCellEndOffset: -1
  },
  // Cmd prompt
  { urlFormat: "{0}>", linkCellEndOffset: -1 },
  // The whole line is the path
  { urlFormat: "{0}" }
];
suite("Workbench - TerminalLocalLinkDetector", () => {
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
  async function assertLinksWithWrapped(link, resource) {
    const uri = resource ?? URI.file(link);
    await assertLinks(TerminalBuiltinLinkType.LocalFile, link, [
      {
        uri,
        range: [
          [1, 1],
          [link.length, 1]
        ]
      }
    ]);
    await assertLinks(TerminalBuiltinLinkType.LocalFile, ` ${link} `, [
      {
        uri,
        range: [
          [2, 1],
          [link.length + 1, 1]
        ]
      }
    ]);
    await assertLinks(TerminalBuiltinLinkType.LocalFile, `(${link})`, [
      {
        uri,
        range: [
          [2, 1],
          [link.length + 1, 1]
        ]
      }
    ]);
    await assertLinks(TerminalBuiltinLinkType.LocalFile, `[${link}]`, [
      {
        uri,
        range: [
          [2, 1],
          [link.length + 1, 1]
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
  suite("platform independent", () => {
    setup(() => {
      detector = instantiationService.createInstance(
        TerminalLocalLinkDetector,
        xterm,
        store.add(new TerminalCapabilityStore()),
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
    test("should support multiple link results", async () => {
      validResources = [
        URI.file("/parent/cwd/foo"),
        URI.file("/parent/cwd/bar")
      ];
      await assertLinks(
        TerminalBuiltinLinkType.LocalFile,
        "./foo ./bar",
        [
          {
            range: [
              [1, 1],
              [5, 1]
            ],
            uri: URI.file("/parent/cwd/foo")
          },
          {
            range: [
              [7, 1],
              [11, 1]
            ],
            uri: URI.file("/parent/cwd/bar")
          }
        ]
      );
    });
    test("should support trimming extra quotes", async () => {
      validResources = [URI.file("/parent/cwd/foo")];
      await assertLinks(
        TerminalBuiltinLinkType.LocalFile,
        '"foo"" on line 5',
        [
          {
            range: [
              [1, 1],
              [16, 1]
            ],
            uri: URI.file("/parent/cwd/foo")
          }
        ]
      );
    });
    test("should support trimming extra square brackets", async () => {
      validResources = [URI.file("/parent/cwd/foo")];
      await assertLinks(
        TerminalBuiltinLinkType.LocalFile,
        '"foo]" on line 5',
        [
          {
            range: [
              [1, 1],
              [16, 1]
            ],
            uri: URI.file("/parent/cwd/foo")
          }
        ]
      );
    });
  });
  suite("macOS/Linux", () => {
    setup(() => {
      detector = instantiationService.createInstance(
        TerminalLocalLinkDetector,
        xterm,
        store.add(new TerminalCapabilityStore()),
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
          test(`should detect in "${formattedLink}"`, async () => {
            validResources = [resource];
            await assertLinksWithWrapped(formattedLink, resource);
          });
        }
      });
    }
    test("Git diff links", async () => {
      validResources = [URI.file("/parent/cwd/foo/bar")];
      await assertLinks(
        TerminalBuiltinLinkType.LocalFile,
        `diff --git a/foo/bar b/foo/bar`,
        [
          {
            uri: validResources[0],
            range: [
              [14, 1],
              [20, 1]
            ]
          },
          {
            uri: validResources[0],
            range: [
              [24, 1],
              [30, 1]
            ]
          }
        ]
      );
      await assertLinks(
        TerminalBuiltinLinkType.LocalFile,
        `--- a/foo/bar`,
        [
          {
            uri: validResources[0],
            range: [
              [7, 1],
              [13, 1]
            ]
          }
        ]
      );
      await assertLinks(
        TerminalBuiltinLinkType.LocalFile,
        `+++ b/foo/bar`,
        [
          {
            uri: validResources[0],
            range: [
              [7, 1],
              [13, 1]
            ]
          }
        ]
      );
    });
  });
  if (isWindows) {
    suite("Windows", () => {
      const wslUnixToWindowsPathMap = /* @__PURE__ */ new Map();
      setup(() => {
        detector = instantiationService.createInstance(
          TerminalLocalLinkDetector,
          xterm,
          store.add(new TerminalCapabilityStore()),
          {
            initialCwd: "C:\\Parent\\Cwd",
            os: OperatingSystem.Windows,
            remoteAuthority: void 0,
            userHome: "C:\\Home",
            backend: {
              async getWslPath(original, direction) {
                if (direction === "unix-to-win") {
                  return wslUnixToWindowsPathMap.get(original) ?? original;
                }
                return original;
              }
            }
          },
          resolver
        );
        wslUnixToWindowsPathMap.clear();
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
            test(`should detect in "${formattedLink}"`, async () => {
              validResources = [resource];
              await assertLinksWithWrapped(
                formattedLink,
                resource
              );
            });
          }
        });
      }
      for (const l of windowsFallbackLinks) {
        const baseLink = typeof l === "string" ? l : l.link;
        const resource = typeof l === "string" ? URI.file(l) : l.resource;
        suite(`Fallback link "${baseLink}"`, () => {
          for (let i = 0; i < supportedFallbackLinkFormats.length; i++) {
            const linkFormat = supportedFallbackLinkFormats[i];
            const formattedLink = format(
              linkFormat.urlFormat,
              baseLink,
              linkFormat.line,
              linkFormat.column
            );
            const linkCellStartOffset = linkFormat.linkCellStartOffset ?? 0;
            const linkCellEndOffset = linkFormat.linkCellEndOffset ?? 0;
            test(`should detect in "${formattedLink}"`, async () => {
              validResources = [resource];
              await assertLinks(
                TerminalBuiltinLinkType.LocalFile,
                formattedLink,
                [
                  {
                    uri: resource,
                    range: [
                      [1 + linkCellStartOffset, 1],
                      [
                        formattedLink.length + linkCellEndOffset,
                        1
                      ]
                    ]
                  }
                ]
              );
            });
          }
        });
      }
      test("Git diff links", async () => {
        const resource = URI.file("C:\\Parent\\Cwd\\foo\\bar");
        validResources = [resource];
        await assertLinks(
          TerminalBuiltinLinkType.LocalFile,
          `diff --git a/foo/bar b/foo/bar`,
          [
            {
              uri: resource,
              range: [
                [14, 1],
                [20, 1]
              ]
            },
            {
              uri: resource,
              range: [
                [24, 1],
                [30, 1]
              ]
            }
          ]
        );
        await assertLinks(
          TerminalBuiltinLinkType.LocalFile,
          `--- a/foo/bar`,
          [
            {
              uri: resource,
              range: [
                [7, 1],
                [13, 1]
              ]
            }
          ]
        );
        await assertLinks(
          TerminalBuiltinLinkType.LocalFile,
          `+++ b/foo/bar`,
          [
            {
              uri: resource,
              range: [
                [7, 1],
                [13, 1]
              ]
            }
          ]
        );
      });
      suite("WSL", () => {
        test("Unix -> Windows /mnt/ style links", async () => {
          wslUnixToWindowsPathMap.set(
            "/mnt/c/foo/bar",
            "C:\\foo\\bar"
          );
          validResources = [URI.file("C:\\foo\\bar")];
          await assertLinksWithWrapped(
            "/mnt/c/foo/bar",
            validResources[0]
          );
        });
        test("Windows -> Unix \\\\wsl$\\ style links", async () => {
          validResources = [
            URI.file("\\\\wsl$\\Debian\\home\\foo\\bar")
          ];
          await assertLinksWithWrapped(
            "\\\\wsl$\\Debian\\home\\foo\\bar"
          );
        });
        test("Windows -> Unix \\\\wsl.localhost\\ style links", async () => {
          validResources = [
            URI.file("\\\\wsl.localhost\\Debian\\home\\foo\\bar")
          ];
          await assertLinksWithWrapped(
            "\\\\wsl.localhost\\Debian\\home\\foo\\bar"
          );
        });
      });
    });
  }
});
