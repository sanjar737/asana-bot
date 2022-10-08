import { getInput, info, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";

const githubToken = getInput("github_token", { required: true });

const octokit = getOctokit(githubToken);

async function getDiff() {
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
}

async function run() {
  try {
    const diff = getDiff();
    info("diff");
    console.log(diff);
  } catch (error) {
    setFailed((error as Error).message);
  }
}

run();
