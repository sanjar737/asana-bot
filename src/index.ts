import { getInput, info, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { components } from "@octokit/openapi-types";

const githubToken = getInput("github_token", { required: true });

const octokit = getOctokit(githubToken);

async function getDiff() {
  try {
    if (githubToken && context.payload.pull_request) {
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

function findSubstring(target: string, str: string) {
  const reg = new RegExp(target, "g");

  return !!str.match(reg);
}

function hasDataTestId(diff: components["schemas"]["diff-entry"][]) {
  const hasDataTestId = diff.some((file) => {
    if (!file.patch) {
      return false;
    }

    return findSubstring("\\+.*data-test-id", file.patch);
  });

  const message = hasDataTestId ? "pr has dti" : "pr doesnt has dti";

  info(message);
  return hasDataTestId;
}

async function hasTest(diff: components["schemas"]["diff-entry"][]) {
  const hasTest = diff.some((file) => {
    return findSubstring("\\.spec", file.filename);
  });

  const message = hasTest ? "pr has test" : "pr doesnt has test";

  info(message);
  return hasTest;
}

async function run() {
  const diff = await getDiff();

  if (diff) {
    hasDataTestId(diff);
    hasTest(diff);
  }
}

run();
