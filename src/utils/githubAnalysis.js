function daysBetween(startDate, endDate = new Date()) {
  if (!startDate) {
    return null;
  }

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const diffMs = endDate.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getMostRecentDate(repos, fieldName) {
  const timestamps = repos
    .map((repo) => new Date(repo[fieldName]).getTime())
    .filter((timestamp) => Number.isFinite(timestamp));

  if (!timestamps.length) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function buildLanguageBreakdown(repos) {
  const breakdown = repos.reduce((accumulator, repo) => {
    const language = repo.language || "Unknown";
    if (!accumulator[language]) {
      accumulator[language] = {
        repositoryCount: 0,
        stars: 0,
        forks: 0
      };
    }

    accumulator[language].repositoryCount += 1;
    accumulator[language].stars += repo.stargazers_count || 0;
    accumulator[language].forks += repo.forks_count || 0;
    return accumulator;
  }, {});

  return Object.entries(breakdown)
    .map(([language, stats]) => ({
      language,
      ...stats
    }))
    .sort((a, b) => b.repositoryCount - a.repositoryCount || b.stars - a.stars);
}

function buildTopRepositories(repos) {
  return repos
    .map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      openIssues: repo.open_issues_count || 0,
      topics: repo.topics || [],
      isFork: Boolean(repo.fork),
      createdAt: repo.created_at,
      updatedAt: repo.updated_at
    }))
    .sort((a, b) => b.stars - a.stars || b.forks - a.forks)
    .slice(0, 10);
}

function calculateActivityScore({ user, repos, languageBreakdown, latestRepoUpdatedAt }) {
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const repoScore = Math.min(user.public_repos || 0, 100) * 0.2;
  const followerScore = Math.min(user.followers || 0, 1000) * 0.025;
  const starScore = Math.min(totalStars, 500) * 0.05;
  const languageScore = Math.min(languageBreakdown.length, 10);
  const daysSinceUpdate = daysBetween(latestRepoUpdatedAt);
  const recencyScore = daysSinceUpdate === null ? 0 : Math.max(0, 20 - Math.min(daysSinceUpdate, 365) / 18.25);

  return Math.round(repoScore + followerScore + starScore + languageScore + recencyScore);
}

function analyzeGitHubProfile(user, repos) {
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
  const originalRepositories = repos.filter((repo) => !repo.fork).length;
  const forkedRepositories = repos.filter((repo) => repo.fork).length;
  const languageBreakdown = buildLanguageBreakdown(repos);
  const topRepositories = buildTopRepositories(repos);
  const latestRepoUpdatedAt = getMostRecentDate(repos, "updated_at");
  const topLanguage = languageBreakdown[0]?.language || null;

  return {
    totalStars,
    totalForks,
    topLanguage,
    languageBreakdown,
    topRepositories,
    insights: {
      accountAgeDays: daysBetween(user.created_at),
      analyzedRepositoryCount: repos.length,
      originalRepositories,
      forkedRepositories,
      averageStarsPerRepository: repos.length ? Number((totalStars / repos.length).toFixed(2)) : 0,
      latestRepositoryUpdatedAt: latestRepoUpdatedAt,
      activityScore: calculateActivityScore({
        user,
        repos,
        languageBreakdown,
        latestRepoUpdatedAt
      }),
      profileCompleteness: {
        hasName: Boolean(user.name),
        hasBio: Boolean(user.bio),
        hasLocation: Boolean(user.location),
        hasBlog: Boolean(user.blog),
        hasCompany: Boolean(user.company)
      }
    }
  };
}

module.exports = {
  analyzeGitHubProfile
};
