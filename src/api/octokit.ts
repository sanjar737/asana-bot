import { getInput } from "@actions/core";
import { getOctokit } from "@actions/github";

const githubToken = getInput("github_token", { required: true });
const octokit = getOctokit(githubToken);

export default octokit;
