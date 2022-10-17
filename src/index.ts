import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import octokit from "./api/octokit";
import { getDiff, hasDataTestId, hasTest } from "./helpers/diff";
import asana from "api/asana";

async function run() {
  if (!context.payload.pull_request) {
    return;
  }

  let pullRequestBody = context.payload.pull_request?.body || "";

  const diff = await getDiff();

  if (diff) {
    if (hasDataTestId(diff)) {
      pullRequestBody = pullRequestBody.replace(
        /\[.](?=.*Добавил\(а\) data-test-id)/,
        "[x]"
      );
    }

    if (hasTest(diff)) {
      pullRequestBody = pullRequestBody.replace(
        /\[.](?=.*Написал\(а\) unit-тесты)/,
        "[x]"
      );
    }
  }

  const taskGid = pullRequestBody.match(/(?<=\/)\d*(?=\/f)/);

  if (taskGid) {
    const stories = await asana.stories.findByTask(taskGid[0]);

    const hasQaComment = stories.data
      .filter((story) => story.type === "comment")
      .some((story) => story.text.search("QA:") !== -1);

    if (hasQaComment) {
      pullRequestBody = pullRequestBody.replace(
        /\[.](?=.*Добавил\(a\) комментарий к задаче)/,
        "[x]"
      );
    }
  }

  const params = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request.number,
    body: pullRequestBody,
  };

  try {
    octokit.rest.pulls.update(params);
  } catch (error) {
    setFailed((error as Error).message);
  }
}

run();
