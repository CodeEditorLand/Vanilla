import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { INativeEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IProcessMainService } from "../../../../platform/issue/common/issue.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import { IWorkbenchProcessService } from "../common/issue.js";
import "./processService.js";
import "./issueMainService.js";
class OpenProcessExplorer extends Action2 {
  static ID = "workbench.action.openProcessExplorer";
  constructor() {
    super({
      id: OpenProcessExplorer.ID,
      title: localize2("openProcessExplorer", "Open Process Explorer"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const processService = accessor.get(IWorkbenchProcessService);
    return processService.openProcessExplorer();
  }
}
registerAction2(OpenProcessExplorer);
MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
  group: "5_tools",
  command: {
    id: OpenProcessExplorer.ID,
    title: localize(
      {
        key: "miOpenProcessExplorerer",
        comment: ["&& denotes a mnemonic"]
      },
      "Open &&Process Explorer"
    )
  },
  order: 2
});
class StopTracing extends Action2 {
  static ID = "workbench.action.stopTracing";
  constructor() {
    super({
      id: StopTracing.ID,
      title: localize2("stopTracing", "Stop Tracing"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const processService = accessor.get(IProcessMainService);
    const environmentService = accessor.get(INativeEnvironmentService);
    const dialogService = accessor.get(IDialogService);
    const nativeHostService = accessor.get(INativeHostService);
    const progressService = accessor.get(IProgressService);
    if (!environmentService.args.trace) {
      const { confirmed } = await dialogService.confirm({
        message: localize(
          "stopTracing.message",
          "Tracing requires to launch with a '--trace' argument"
        ),
        primaryButton: localize(
          {
            key: "stopTracing.button",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Relaunch and Enable Tracing"
        )
      });
      if (confirmed) {
        return nativeHostService.relaunch({ addArgs: ["--trace"] });
      }
    }
    await progressService.withProgress(
      {
        location: ProgressLocation.Dialog,
        title: localize("stopTracing.title", "Creating trace file..."),
        cancellable: false,
        detail: localize(
          "stopTracing.detail",
          "This can take up to one minute to complete."
        )
      },
      () => processService.stopTracing()
    );
  }
}
registerAction2(StopTracing);
CommandsRegistry.registerCommand("_issues.getSystemStatus", (accessor) => {
  return accessor.get(IProcessMainService).getSystemStatus();
});
