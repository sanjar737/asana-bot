import { info, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { components } from "@octokit/openapi-types";
import octokit from "../api/octokit";

export async function getDiff() {
  try {
    if (context.payload.pull_request) {
      const result = await octokit.rest.repos.compareCommits({
        repo: context.repo.repo,
        owner: context.repo.owner,
        head: context.payload.pull_request.head.sha,
        base: context.payload.pull_request.base.sha,
        per_page: 100,
      });

      return result.data.files || [];
    }

    return [];
  } catch (error) {
    setFailed((error as Error).message);
  }
}

export function hasDataTestId(diff: components["schemas"]["diff-entry"][]) {
  const hasDataTestId = diff.some((file) => {
    if (!file.patch) {
      return false;
    }

    return file.patch.search("data-test-id") !== -1;
  });

  const message = hasDataTestId ? "pr has dti" : "pr doesnt has dti";

  info(message);

  return hasDataTestId;
}

export function hasTest(diff: components["schemas"]["diff-entry"][]) {
  const hasTest = diff
    .filter((file) => file.status === "added")
    .some((file) => {
      return file.filename.search(".spec") !== -1;
    });

  const message = hasTest ? "pr has test" : "pr doesnt has test";

  info(message);

  return hasTest;
}
