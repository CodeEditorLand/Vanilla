import { isValidBasename } from "../../../../../base/common/extpath.js";
import { extname } from "../../../../../base/common/path.js";
import { basename, joinPath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { getIconClassesForLanguageId } from "../../../../../editor/common/services/getIconClasses.js";
import * as nls from "../../../../../nls.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import {
  IQuickInputService
} from "../../../../../platform/quickinput/common/quickInput.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { ITextFileService } from "../../../../services/textfile/common/textfiles.js";
import { IUserDataProfileService } from "../../../../services/userDataProfile/common/userDataProfile.js";
import { ISnippetsService } from "../snippets.js";
import { SnippetSource } from "../snippetsFile.js";
import { SnippetsAction } from "./abstractSnippetsActions.js";
var ISnippetPick;
((ISnippetPick2) => {
  function is(thing) {
    return !!thing && URI.isUri(thing.filepath);
  }
  ISnippetPick2.is = is;
})(ISnippetPick || (ISnippetPick = {}));
async function computePicks(snippetService, userDataProfileService, languageService, labelService) {
  const existing = [];
  const future = [];
  const seen = /* @__PURE__ */ new Set();
  const added = /* @__PURE__ */ new Map();
  for (const file of await snippetService.getSnippetFiles()) {
    if (file.source === SnippetSource.Extension) {
      continue;
    }
    if (file.isGlobalSnippets) {
      await file.load();
      const names = /* @__PURE__ */ new Set();
      let source;
      outer: for (const snippet2 of file.data) {
        if (!source) {
          source = snippet2.source;
        }
        for (const scope of snippet2.scopes) {
          const name = languageService.getLanguageName(scope);
          if (name) {
            if (names.size >= 4) {
              names.add(`${name}...`);
              break outer;
            } else {
              names.add(name);
            }
          }
        }
      }
      const snippet = {
        label: basename(file.location),
        filepath: file.location,
        description: names.size === 0 ? nls.localize("global.scope", "(global)") : nls.localize(
          "global.1",
          "({0})",
          [...names].join(", ")
        )
      };
      existing.push(snippet);
      if (!source) {
        continue;
      }
      const detail = nls.localize(
        "detail.label",
        "({0}) {1}",
        source,
        labelService.getUriLabel(file.location, { relative: true })
      );
      const lastItem = added.get(basename(file.location));
      if (lastItem) {
        snippet.detail = detail;
        lastItem.snippet.detail = lastItem.detail;
      }
      added.set(basename(file.location), { snippet, detail });
    } else {
      const mode = basename(file.location).replace(/\.json$/, "");
      existing.push({
        label: basename(file.location),
        description: `(${languageService.getLanguageName(mode)})`,
        filepath: file.location
      });
      seen.add(mode);
    }
  }
  const dir = userDataProfileService.currentProfile.snippetsHome;
  for (const languageId of languageService.getRegisteredLanguageIds()) {
    const label = languageService.getLanguageName(languageId);
    if (label && !seen.has(languageId)) {
      future.push({
        label: languageId,
        description: `(${label})`,
        filepath: joinPath(dir, `${languageId}.json`),
        hint: true,
        iconClasses: getIconClassesForLanguageId(languageId)
      });
    }
  }
  existing.sort((a, b) => {
    const a_ext = extname(a.filepath.path);
    const b_ext = extname(b.filepath.path);
    if (a_ext === b_ext) {
      return a.label.localeCompare(b.label);
    } else if (a_ext === ".code-snippets") {
      return -1;
    } else {
      return 1;
    }
  });
  future.sort((a, b) => {
    return a.label.localeCompare(b.label);
  });
  return { existing, future };
}
async function createSnippetFile(scope, defaultPath, quickInputService, fileService, textFileService, opener) {
  function createSnippetUri(input2) {
    const filename = extname(input2) !== ".code-snippets" ? `${input2}.code-snippets` : input2;
    return joinPath(defaultPath, filename);
  }
  await fileService.createFolder(defaultPath);
  const input = await quickInputService.input({
    placeHolder: nls.localize("name", "Type snippet file name"),
    async validateInput(input2) {
      if (!input2) {
        return nls.localize("bad_name1", "Invalid file name");
      }
      if (!isValidBasename(input2)) {
        return nls.localize(
          "bad_name2",
          "'{0}' is not a valid file name",
          input2
        );
      }
      if (await fileService.exists(createSnippetUri(input2))) {
        return nls.localize("bad_name3", "'{0}' already exists", input2);
      }
      return void 0;
    }
  });
  if (!input) {
    return void 0;
  }
  const resource = createSnippetUri(input);
  await textFileService.write(
    resource,
    [
      "{",
      "	// Place your " + scope + " snippets here. Each snippet is defined under a snippet name and has a scope, prefix, body and ",
      "	// description. Add comma separated ids of the languages where the snippet is applicable in the scope field. If scope ",
      "	// is left empty or omitted, the snippet gets applied to all languages. The prefix is what is ",
      "	// used to trigger the snippet and the body will be expanded and inserted. Possible variables are: ",
      "	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. ",
      "	// Placeholders with the same ids are connected.",
      "	// Example:",
      '	// "Print to console": {',
      '	// 	"scope": "javascript,typescript",',
      '	// 	"prefix": "log",',
      '	// 	"body": [',
      `	// 		"console.log('$1');",`,
      '	// 		"$2"',
      "	// 	],",
      '	// 	"description": "Log output to console"',
      "	// }",
      "}"
    ].join("\n")
  );
  await opener.open(resource);
  return void 0;
}
async function createLanguageSnippetFile(pick, fileService, textFileService) {
  if (await fileService.exists(pick.filepath)) {
    return;
  }
  const contents = [
    "{",
    "	// Place your snippets for " + pick.label + " here. Each snippet is defined under a snippet name and has a prefix, body and ",
    "	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:",
    "	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the ",
    "	// same ids are connected.",
    "	// Example:",
    '	// "Print to console": {',
    '	// 	"prefix": "log",',
    '	// 	"body": [',
    `	// 		"console.log('$1');",`,
    '	// 		"$2"',
    "	// 	],",
    '	// 	"description": "Log output to console"',
    "	// }",
    "}"
  ].join("\n");
  await textFileService.write(pick.filepath, contents);
}
class ConfigureSnippetsAction extends SnippetsAction {
  constructor() {
    super({
      id: "workbench.action.openSnippets",
      title: nls.localize2("openSnippet.label", "Configure Snippets"),
      shortTitle: {
        ...nls.localize2("userSnippets", "Snippets"),
        mnemonicTitle: nls.localize(
          {
            key: "miOpenSnippets",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Snippets"
        )
      },
      f1: true,
      menu: [
        {
          id: MenuId.MenubarPreferencesMenu,
          group: "2_configuration",
          order: 5
        },
        {
          id: MenuId.GlobalActivity,
          group: "2_configuration",
          order: 5
        }
      ]
    });
  }
  async run(accessor) {
    const snippetService = accessor.get(ISnippetsService);
    const quickInputService = accessor.get(IQuickInputService);
    const opener = accessor.get(IOpenerService);
    const languageService = accessor.get(ILanguageService);
    const userDataProfileService = accessor.get(IUserDataProfileService);
    const workspaceService = accessor.get(IWorkspaceContextService);
    const fileService = accessor.get(IFileService);
    const textFileService = accessor.get(ITextFileService);
    const labelService = accessor.get(ILabelService);
    const picks = await computePicks(
      snippetService,
      userDataProfileService,
      languageService,
      labelService
    );
    const existing = picks.existing;
    const globalSnippetPicks = [
      {
        scope: nls.localize("new.global_scope", "global"),
        label: nls.localize(
          "new.global",
          "New Global Snippets file..."
        ),
        uri: userDataProfileService.currentProfile.snippetsHome
      }
    ];
    const workspaceSnippetPicks = [];
    for (const folder of workspaceService.getWorkspace().folders) {
      workspaceSnippetPicks.push({
        scope: nls.localize(
          "new.workspace_scope",
          "{0} workspace",
          folder.name
        ),
        label: nls.localize(
          "new.folder",
          "New Snippets file for '{0}'...",
          folder.name
        ),
        uri: folder.toResource(".vscode")
      });
    }
    if (existing.length > 0) {
      existing.unshift({
        type: "separator",
        label: nls.localize("group.global", "Existing Snippets")
      });
      existing.push({
        type: "separator",
        label: nls.localize("new.global.sep", "New Snippets")
      });
    } else {
      existing.push({
        type: "separator",
        label: nls.localize("new.global.sep", "New Snippets")
      });
    }
    const pick = await quickInputService.pick(
      [].concat(
        existing,
        globalSnippetPicks,
        workspaceSnippetPicks,
        picks.future
      ),
      {
        placeHolder: nls.localize(
          "openSnippet.pickLanguage",
          "Select Snippets File or Create Snippets"
        ),
        matchOnDescription: true
      }
    );
    if (globalSnippetPicks.indexOf(pick) >= 0) {
      return createSnippetFile(
        pick.scope,
        pick.uri,
        quickInputService,
        fileService,
        textFileService,
        opener
      );
    } else if (workspaceSnippetPicks.indexOf(pick) >= 0) {
      return createSnippetFile(
        pick.scope,
        pick.uri,
        quickInputService,
        fileService,
        textFileService,
        opener
      );
    } else if (ISnippetPick.is(pick)) {
      if (pick.hint) {
        await createLanguageSnippetFile(
          pick,
          fileService,
          textFileService
        );
      }
      return opener.open(pick.filepath);
    }
  }
}
export {
  ConfigureSnippetsAction
};
