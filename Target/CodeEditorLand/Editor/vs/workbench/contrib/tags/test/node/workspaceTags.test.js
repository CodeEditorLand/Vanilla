import assert from "assert";
import * as crypto from "crypto";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { getHashedRemotesFromConfig as baseGetHashedRemotesFromConfig } from "../../common/workspaceTags.js";
function hash(value) {
  return crypto.createHash("sha1").update(value.toString()).digest("hex");
}
async function asyncHash(value) {
  return hash(value);
}
async function getHashedRemotesFromConfig(text, stripEndingDotGit = false) {
  return baseGetHashedRemotesFromConfig(
    text,
    stripEndingDotGit,
    (remote) => asyncHash(remote)
  );
}
suite("Telemetry - WorkspaceTags", () => {
  test("Single remote hashed", async () => {
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote(
          "https://username:password@github3.com/username/repository.git"
        )
      ),
      [hash("github3.com/username/repository.git")]
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote("ssh://user@git.server.org/project.git")
      ),
      [hash("git.server.org/project.git")]
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote("user@git.server.org:project.git")
      ),
      [hash("git.server.org/project.git")]
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(remote("/opt/git/project.git")),
      []
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote(
          "https://username:password@github3.com/username/repository.git"
        ),
        true
      ),
      [hash("github3.com/username/repository")]
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote("ssh://user@git.server.org/project.git"),
        true
      ),
      [hash("git.server.org/project")]
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote("user@git.server.org:project.git"),
        true
      ),
      [hash("git.server.org/project")]
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote("/opt/git/project.git"),
        true
      ),
      []
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote(
          "https://username:password@github3.com/username/repository.git"
        ),
        true
      ),
      await getHashedRemotesFromConfig(
        remote(
          "https://username:password@github3.com/username/repository"
        )
      )
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote("ssh://user@git.server.org/project.git"),
        true
      ),
      await getHashedRemotesFromConfig(
        remote("ssh://user@git.server.org/project")
      )
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote("user@git.server.org:project.git"),
        true
      ),
      [hash("git.server.org/project")]
    );
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(
        remote("/opt/git/project.git"),
        true
      ),
      await getHashedRemotesFromConfig(remote("/opt/git/project"))
    );
  });
  test("Multiple remotes hashed", async () => {
    const config = [
      "https://github.com/microsoft/vscode.git",
      "https://git.example.com/gitproject.git"
    ].map(remote).join(" ");
    assert.deepStrictEqual(await getHashedRemotesFromConfig(config), [
      hash("github.com/microsoft/vscode.git"),
      hash("git.example.com/gitproject.git")
    ]);
    assert.deepStrictEqual(await getHashedRemotesFromConfig(config, true), [
      hash("github.com/microsoft/vscode"),
      hash("git.example.com/gitproject")
    ]);
    const noDotGitConfig = [
      "https://github.com/microsoft/vscode",
      "https://git.example.com/gitproject"
    ].map(remote).join(" ");
    assert.deepStrictEqual(
      await getHashedRemotesFromConfig(config, true),
      await getHashedRemotesFromConfig(noDotGitConfig)
    );
  });
  function remote(url) {
    return `[remote "origin"]
	url = ${url}
	fetch = +refs/heads/*:refs/remotes/origin/*
`;
  }
  ensureNoDisposablesAreLeakedInTestSuite();
});
export {
  getHashedRemotesFromConfig
};
