import assert from "assert";
import * as fs from "fs";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import * as path from "../../../../../base/common/path.js";
import * as pfs from "../../../../../base/node/pfs.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { asTextOrError } from "../../../../../platform/request/common/request.js";
import { RequestService } from "../../../../../platform/request/node/requestService.js";
import {
  Extensions,
  asCssVariableName
} from "../../../../../platform/theme/common/colorRegistry.js";
import "../../../../workbench.desktop.main.js";
import { FileAccess } from "../../../../../base/common/network.js";
import { mock } from "../../../../../base/test/common/mock.js";
import {
  NullLogService,
  NullLogger
} from "../../../../../platform/log/common/log.js";
const experimental = [];
const knwonVariablesFileName = "vscode-known-variables.json";
suite("Color Registry", () => {
  test(`update colors in ${knwonVariablesFileName}`, async () => {
    const varFilePath = FileAccess.asFileUri(
      `vs/../../build/lib/stylelint/${knwonVariablesFileName}`
    ).fsPath;
    const content = (await fs.promises.readFile(varFilePath)).toString();
    const variablesInfo = JSON.parse(content);
    const colorsArray = variablesInfo.colors;
    assert.ok(
      colorsArray && colorsArray.length > 0,
      "${knwonVariablesFileName} contains no color descriptions"
    );
    const colors = new Set(colorsArray);
    const updatedColors = [];
    const missing = [];
    const themingRegistry = Registry.as(
      Extensions.ColorContribution
    );
    for (const color of themingRegistry.getColors()) {
      const id = asCssVariableName(color.id);
      if (colors.has(id)) {
        colors.delete(id);
      } else if (!color.deprecationMessage) {
        missing.push(id);
      }
      updatedColors.push(id);
    }
    const superfluousKeys = [...colors.keys()];
    let errorText = "";
    if (missing.length > 0) {
      errorText += `
Adding the following colors:

${JSON.stringify(missing, void 0, "	")}
`;
    }
    if (superfluousKeys.length > 0) {
      errorText += `
Removing the following colors:

${superfluousKeys.join("\n")}
`;
    }
    if (errorText.length > 0) {
      updatedColors.sort();
      variablesInfo.colors = updatedColors;
      await pfs.Promises.writeFile(
        varFilePath,
        JSON.stringify(variablesInfo, void 0, "	")
      );
      assert.fail(
        `
Updating ${path.normalize(varFilePath)}.
Please verify and commit.

${errorText}
`
      );
    }
  });
  test("all colors listed in theme-color.md", async () => {
    const environmentService = new class extends mock() {
      args = { _: [] };
    }();
    const docUrl = "https://raw.githubusercontent.com/microsoft/vscode-docs/main/api/references/theme-color.md";
    const reqContext = await new RequestService(
      new NullLogger(),
      new TestConfigurationService(),
      environmentService,
      new NullLogService()
    ).request({ url: docUrl }, CancellationToken.None);
    const content = await asTextOrError(reqContext);
    const expression = /-\s*\`([\w\.]+)\`: (.*)/g;
    let m;
    const colorsInDoc = /* @__PURE__ */ Object.create(null);
    let nColorsInDoc = 0;
    while (m = expression.exec(content)) {
      colorsInDoc[m[1]] = {
        description: m[2],
        offset: m.index,
        length: m.length
      };
      nColorsInDoc++;
    }
    assert.ok(
      nColorsInDoc > 0,
      "theme-color.md contains to color descriptions"
    );
    const missing = /* @__PURE__ */ Object.create(null);
    const descriptionDiffs = /* @__PURE__ */ Object.create(null);
    const themingRegistry = Registry.as(
      Extensions.ColorContribution
    );
    for (const color of themingRegistry.getColors()) {
      if (colorsInDoc[color.id]) {
        const docDescription = colorsInDoc[color.id].description;
        const specDescription = getDescription(color);
        if (docDescription !== specDescription) {
          descriptionDiffs[color.id] = {
            docDescription,
            specDescription
          };
        }
        delete colorsInDoc[color.id];
      } else if (!color.deprecationMessage) {
        missing[color.id] = getDescription(color);
      }
    }
    const colorsInExtensions = await getColorsFromExtension();
    for (const colorId in colorsInExtensions) {
      if (colorsInDoc[colorId]) {
        delete colorsInDoc[colorId];
      } else {
        missing[colorId] = colorsInExtensions[colorId];
      }
    }
    for (const colorId of experimental) {
      if (missing[colorId]) {
        delete missing[colorId];
      }
      if (colorsInDoc[colorId]) {
        assert.fail(
          `Color ${colorId} found in doc but marked experimental. Please remove from experimental list.`
        );
      }
    }
    const superfluousKeys = Object.keys(colorsInDoc);
    const undocumentedKeys = Object.keys(missing).map(
      (k) => `\`${k}\`: ${missing[k]}`
    );
    let errorText = "";
    if (undocumentedKeys.length > 0) {
      errorText += `

Add the following colors:

${undocumentedKeys.join("\n")}
`;
    }
    if (superfluousKeys.length > 0) {
      errorText += `
Remove the following colors:

${superfluousKeys.join("\n")}
`;
    }
    if (errorText.length > 0) {
      assert.fail(
        `

Open https://github.dev/microsoft/vscode-docs/blob/vnext/api/references/theme-color.md#50${errorText}`
      );
    }
  });
});
function getDescription(color) {
  let specDescription = color.description;
  if (color.deprecationMessage) {
    specDescription = specDescription + " " + color.deprecationMessage;
  }
  return specDescription;
}
async function getColorsFromExtension() {
  const extPath = FileAccess.asFileUri("vs/../../extensions").fsPath;
  const extFolders = await pfs.Promises.readDirsInDir(extPath);
  const result = /* @__PURE__ */ Object.create(null);
  for (const folder of extFolders) {
    try {
      const packageJSON = JSON.parse(
        (await fs.promises.readFile(
          path.join(extPath, folder, "package.json")
        )).toString()
      );
      const contributes = packageJSON["contributes"];
      if (contributes) {
        const colors = contributes["colors"];
        if (colors) {
          for (const color of colors) {
            const colorId = color["id"];
            if (colorId) {
              result[colorId] = colorId["description"];
            }
          }
        }
      }
    } catch (e) {
    }
  }
  return result;
}
export {
  experimental
};
