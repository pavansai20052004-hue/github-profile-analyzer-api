const axios = require("axios");
const config = require("../config/env");
const { AppError } = require("../middleware/errorHandler");

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "github-profile-analyzer-api"
};

if (config.githubToken) {
  headers.Authorization = `Bearer ${config.githubToken}`;
}

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  timeout: 15000,
  headers
});

function toGitHubError(error, username) {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (status === 404) {
    return new AppError(`GitHub user '${username}' was not found`, 404);
  }

  if (status === 403) {
    return new AppError(
      "GitHub API rate limit or access restriction reached. Add GITHUB_TOKEN in .env and try again.",
      429,
      message
    );
  }

  if (status) {
    return new AppError(`GitHub API request failed with status ${status}`, status >= 500 ? 502 : status, message);
  }

  return new AppError("Unable to reach GitHub API. Please check your network and try again.", 502);
}

async function fetchGitHubUser(username) {
  try {
    const response = await githubClient.get(`/users/${encodeURIComponent(username)}`);
    return response.data;
  } catch (error) {
    throw toGitHubError(error, username);
  }
}

async function fetchUserRepositories(username) {
  const maxRepos = config.analysisMaxRepos;
  const repos = [];
  const maxPages = Math.ceil(maxRepos / 100);

  try {
    for (let page = 1; page <= maxPages; page += 1) {
      const response = await githubClient.get(`/users/${encodeURIComponent(username)}/repos`, {
        params: {
          type: "owner",
          sort: "updated",
          direction: "desc",
          per_page: 100,
          page
        }
      });

      repos.push(...response.data);

      if (response.data.length < 100 || repos.length >= maxRepos) {
        break;
      }
    }

    return repos.slice(0, maxRepos);
  } catch (error) {
    throw toGitHubError(error, username);
  }
}

module.exports = {
  fetchGitHubUser,
  fetchUserRepositories
};
