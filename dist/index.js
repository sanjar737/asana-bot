"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const githubToken = (0, core_1.getInput)("github_token", { required: true });
const octokit = (0, github_1.getOctokit)(githubToken);
async function getDiff() {
    if (githubToken && github_1.context.payload.pull_request) {
        const result = await octokit.rest.repos.compareCommits({
            repo: github_1.context.repo.repo,
            owner: github_1.context.repo.owner,
            head: github_1.context.payload.pull_request.head.sha,
            base: github_1.context.payload.pull_request.base.sha,
            per_page: 100,
        });
        return result.data.files || [];
    }
    return [];
}
async function run() {
    try {
        const diff = getDiff();
        (0, core_1.info)("diff");
        console.log(diff);
    }
    catch (error) {
        (0, core_1.setFailed)(error.message);
    }
}
run();
//# sourceMappingURL=index.js.map