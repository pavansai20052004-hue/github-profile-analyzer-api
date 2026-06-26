const test = require("node:test");
const assert = require("node:assert/strict");
const { analyzeGitHubProfile } = require("../src/utils/githubAnalysis");

test("analyzeGitHubProfile summarizes useful repository and profile insights", () => {
  const user = {
    public_repos: 3,
    followers: 25,
    created_at: "2020-01-01T00:00:00Z",
    name: "Test User",
    bio: "Builds APIs",
    location: "Hyderabad",
    blog: "https://example.com",
    company: null
  };

  const repos = [
    {
      name: "api",
      full_name: "test/api",
      html_url: "https://github.com/test/api",
      description: "API project",
      language: "JavaScript",
      stargazers_count: 10,
      forks_count: 2,
      open_issues_count: 1,
      topics: ["nodejs"],
      fork: false,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    {
      name: "docs",
      full_name: "test/docs",
      html_url: "https://github.com/test/docs",
      description: "Docs",
      language: "Markdown",
      stargazers_count: 3,
      forks_count: 1,
      open_issues_count: 0,
      topics: [],
      fork: false,
      created_at: "2023-02-01T00:00:00Z",
      updated_at: "2023-12-01T00:00:00Z"
    },
    {
      name: "starter",
      full_name: "test/starter",
      html_url: "https://github.com/test/starter",
      description: null,
      language: "JavaScript",
      stargazers_count: 1,
      forks_count: 0,
      open_issues_count: 0,
      topics: [],
      fork: true,
      created_at: "2023-03-01T00:00:00Z",
      updated_at: "2023-11-01T00:00:00Z"
    }
  ];

  const analysis = analyzeGitHubProfile(user, repos);

  assert.equal(analysis.totalStars, 14);
  assert.equal(analysis.totalForks, 3);
  assert.equal(analysis.topLanguage, "JavaScript");
  assert.equal(analysis.languageBreakdown[0].repositoryCount, 2);
  assert.equal(analysis.topRepositories[0].name, "api");
  assert.equal(analysis.insights.originalRepositories, 2);
  assert.equal(analysis.insights.forkedRepositories, 1);
  assert.equal(analysis.insights.averageStarsPerRepository, 4.67);
  assert.equal(analysis.insights.profileCompleteness.hasCompany, false);
  assert.ok(analysis.insights.activityScore >= 0);
});
