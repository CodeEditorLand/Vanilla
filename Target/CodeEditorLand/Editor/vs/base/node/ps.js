import { exec } from "child_process";
import { FileAccess } from "../common/network.js";
function listProcesses(rootPid) {
  return new Promise((resolve, reject) => {
    let rootItem;
    const map = /* @__PURE__ */ new Map();
    function addToTree(pid, ppid, cmd, load, mem) {
      const parent = map.get(ppid);
      if (pid === rootPid || parent) {
        const item = {
          name: findName(cmd),
          cmd,
          pid,
          ppid,
          load,
          mem
        };
        map.set(pid, item);
        if (pid === rootPid) {
          rootItem = item;
        }
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(item);
          if (parent.children.length > 1) {
            parent.children = parent.children.sort(
              (a, b) => a.pid - b.pid
            );
          }
        }
      }
    }
    function findName(cmd) {
      const UTILITY_NETWORK_HINT = /--utility-sub-type=network/i;
      const WINDOWS_CRASH_REPORTER = /--crashes-directory/i;
      const WINPTY = /\\pipe\\winpty-control/i;
      const CONPTY = /conhost\.exe.+--headless/i;
      const TYPE = /--type=([a-zA-Z-]+)/;
      if (WINDOWS_CRASH_REPORTER.exec(cmd)) {
        return "electron-crash-reporter";
      }
      if (WINPTY.exec(cmd)) {
        return "winpty-agent";
      }
      if (CONPTY.exec(cmd)) {
        return "conpty-agent";
      }
      let matches = TYPE.exec(cmd);
      if (matches && matches.length === 2) {
        if (matches[1] === "renderer") {
          return `window`;
        } else if (matches[1] === "utility") {
          if (UTILITY_NETWORK_HINT.exec(cmd)) {
            return "utility-network-service";
          }
          return "utility-process";
        } else if (matches[1] === "extensionHost") {
          return "extension-host";
        }
        return matches[1];
      }
      const JS = /[a-zA-Z-]+\.js/g;
      let result = "";
      do {
        matches = JS.exec(cmd);
        if (matches) {
          result += matches + " ";
        }
      } while (matches);
      if (result) {
        if (cmd.indexOf("node ") < 0 && cmd.indexOf("node.exe") < 0) {
          return `electron-nodejs (${result})`;
        }
      }
      return cmd;
    }
    if (process.platform === "win32") {
      const cleanUNCPrefix = (value) => {
        if (value.indexOf("\\\\?\\") === 0) {
          return value.substring(4);
        } else if (value.indexOf("\\??\\") === 0) {
          return value.substring(4);
        } else if (value.indexOf('"\\\\?\\') === 0) {
          return '"' + value.substring(5);
        } else if (value.indexOf('"\\??\\') === 0) {
          return '"' + value.substring(5);
        } else {
          return value;
        }
      };
      import("@vscode/windows-process-tree").then(
        (windowsProcessTree) => {
          windowsProcessTree.getProcessList(
            rootPid,
            (processList) => {
              if (!processList) {
                reject(
                  new Error(
                    `Root process ${rootPid} not found`
                  )
                );
                return;
              }
              windowsProcessTree.getProcessCpuUsage(
                processList,
                (completeProcessList) => {
                  const processItems = /* @__PURE__ */ new Map();
                  completeProcessList.forEach((process2) => {
                    const commandLine = cleanUNCPrefix(
                      process2.commandLine || ""
                    );
                    processItems.set(process2.pid, {
                      name: findName(commandLine),
                      cmd: commandLine,
                      pid: process2.pid,
                      ppid: process2.ppid,
                      load: process2.cpu || 0,
                      mem: process2.memory || 0
                    });
                  });
                  rootItem = processItems.get(rootPid);
                  if (rootItem) {
                    processItems.forEach((item) => {
                      const parent = processItems.get(
                        item.ppid
                      );
                      if (parent) {
                        if (!parent.children) {
                          parent.children = [];
                        }
                        parent.children.push(item);
                      }
                    });
                    processItems.forEach((item) => {
                      if (item.children) {
                        item.children = item.children.sort(
                          (a, b) => a.pid - b.pid
                        );
                      }
                    });
                    resolve(rootItem);
                  } else {
                    reject(
                      new Error(
                        `Root process ${rootPid} not found`
                      )
                    );
                  }
                }
              );
            },
            windowsProcessTree.ProcessDataFlag.CommandLine | windowsProcessTree.ProcessDataFlag.Memory
          );
        }
      );
    } else {
      let calculateLinuxCpuUsage2 = function() {
        let processes = [rootItem];
        const pids = [];
        while (processes.length) {
          const process2 = processes.shift();
          if (process2) {
            pids.push(process2.pid);
            if (process2.children) {
              processes = processes.concat(process2.children);
            }
          }
        }
        let cmd = JSON.stringify(
          FileAccess.asFileUri("vs/base/node/cpuUsage.sh").fsPath
        );
        cmd += " " + pids.join(" ");
        exec(cmd, {}, (err, stdout, stderr) => {
          if (err || stderr) {
            reject(err || new Error(stderr.toString()));
          } else {
            const cpuUsage = stdout.toString().split("\n");
            for (let i = 0; i < pids.length; i++) {
              const processInfo = map.get(pids[i]);
              processInfo.load = Number.parseFloat(cpuUsage[i]);
            }
            if (!rootItem) {
              reject(
                new Error(`Root process ${rootPid} not found`)
              );
              return;
            }
            resolve(rootItem);
          }
        });
      };
      var calculateLinuxCpuUsage = calculateLinuxCpuUsage2;
      exec("which ps", {}, (err, stdout, stderr) => {
        if (err || stderr) {
          if (process.platform !== "linux") {
            reject(err || new Error(stderr.toString()));
          } else {
            const cmd = JSON.stringify(
              FileAccess.asFileUri("vs/base/node/ps.sh").fsPath
            );
            exec(cmd, {}, (err2, stdout2, stderr2) => {
              if (err2 || stderr2) {
                reject(err2 || new Error(stderr2.toString()));
              } else {
                parsePsOutput(stdout2, addToTree);
                calculateLinuxCpuUsage2();
              }
            });
          }
        } else {
          const ps = stdout.toString().trim();
          const args = "-ax -o pid=,ppid=,pcpu=,pmem=,command=";
          exec(
            `${ps} ${args}`,
            {
              maxBuffer: 1e3 * 1024,
              env: { LC_NUMERIC: "en_US.UTF-8" }
            },
            (err2, stdout2, stderr2) => {
              if (err2 || stderr2 && !stderr2.includes("screen size is bogus")) {
                reject(err2 || new Error(stderr2.toString()));
              } else {
                parsePsOutput(stdout2, addToTree);
                if (process.platform === "linux") {
                  calculateLinuxCpuUsage2();
                } else if (rootItem) {
                  resolve(rootItem);
                } else {
                  reject(
                    new Error(
                      `Root process ${rootPid} not found`
                    )
                  );
                }
              }
            }
          );
        }
      });
    }
  });
}
function parsePsOutput(stdout, addToTree) {
  const PID_CMD = /^\s*([0-9]+)\s+([0-9]+)\s+([0-9]+\.[0-9]+)\s+([0-9]+\.[0-9]+)\s+(.+)$/;
  const lines = stdout.toString().split("\n");
  for (const line of lines) {
    const matches = PID_CMD.exec(line.trim());
    if (matches && matches.length === 6) {
      addToTree(
        Number.parseInt(matches[1]),
        Number.parseInt(matches[2]),
        matches[5],
        Number.parseFloat(matches[3]),
        Number.parseFloat(matches[4])
      );
    }
  }
}
export {
  listProcesses
};
