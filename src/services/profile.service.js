const { getPool } = require("../config/db");
const { AppError } = require("../middleware/errorHandler");
const githubService = require("./github.service");
const { analyzeGitHubProfile } = require("../utils/githubAnalysis");

function parseJson(value, fallback) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function normalizeProfile(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    githubId: row.github_id,
    username: row.username,
    name: row.name,
    avatarUrl: row.avatar_url,
    profileUrl: row.profile_url,
    bio: row.bio,
    company: row.company,
    blog: row.blog,
    location: row.location,
    email: row.email,
    publicRepos: row.public_repos,
    publicGists: row.public_gists,
    followers: row.followers,
    following: row.following,
    totalStars: row.total_stars,
    totalForks: row.total_forks,
    topLanguage: row.top_language,
    languageBreakdown: parseJson(row.language_breakdown, []),
    topRepositories: parseJson(row.top_repositories, []),
    insights: parseJson(row.insights, {}),
    accountCreatedAt: row.account_created_at,
    githubUpdatedAt: row.github_updated_at,
    analyzedAt: row.analyzed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toDateOrNull(value) {
  return value ? new Date(value) : null;
}

async function findProfileByUsername(username) {
  const pool = getPool();
  const [rows] = await pool.execute("SELECT * FROM github_profiles WHERE LOWER(username) = LOWER(?) LIMIT 1", [username]);
  return normalizeProfile(rows[0]);
}

async function analyzeAndStoreProfile(username) {
  const user = await githubService.fetchGitHubUser(username);
  const repos = await githubService.fetchUserRepositories(user.login);
  const analysis = analyzeGitHubProfile(user, repos);

  const payload = {
    githubId: user.id,
    username: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    bio: user.bio,
    company: user.company,
    blog: user.blog,
    location: user.location,
    email: user.email,
    publicRepos: user.public_repos || 0,
    publicGists: user.public_gists || 0,
    followers: user.followers || 0,
    following: user.following || 0,
    totalStars: analysis.totalStars,
    totalForks: analysis.totalForks,
    topLanguage: analysis.topLanguage,
    languageBreakdown: JSON.stringify(analysis.languageBreakdown),
    topRepositories: JSON.stringify(analysis.topRepositories),
    insights: JSON.stringify(analysis.insights),
    accountCreatedAt: toDateOrNull(user.created_at),
    githubUpdatedAt: toDateOrNull(user.updated_at)
  };

  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO github_profiles (
      github_id, username, name, avatar_url, profile_url, bio, company, blog, location, email,
      public_repos, public_gists, followers, following, total_stars, total_forks, top_language,
      language_breakdown, top_repositories, insights, account_created_at, github_updated_at, analyzed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      id = LAST_INSERT_ID(id),
      username = VALUES(username),
      name = VALUES(name),
      avatar_url = VALUES(avatar_url),
      profile_url = VALUES(profile_url),
      bio = VALUES(bio),
      company = VALUES(company),
      blog = VALUES(blog),
      location = VALUES(location),
      email = VALUES(email),
      public_repos = VALUES(public_repos),
      public_gists = VALUES(public_gists),
      followers = VALUES(followers),
      following = VALUES(following),
      total_stars = VALUES(total_stars),
      total_forks = VALUES(total_forks),
      top_language = VALUES(top_language),
      language_breakdown = VALUES(language_breakdown),
      top_repositories = VALUES(top_repositories),
      insights = VALUES(insights),
      account_created_at = VALUES(account_created_at),
      github_updated_at = VALUES(github_updated_at),
      analyzed_at = CURRENT_TIMESTAMP`,
    [
      payload.githubId,
      payload.username,
      payload.name,
      payload.avatarUrl,
      payload.profileUrl,
      payload.bio,
      payload.company,
      payload.blog,
      payload.location,
      payload.email,
      payload.publicRepos,
      payload.publicGists,
      payload.followers,
      payload.following,
      payload.totalStars,
      payload.totalForks,
      payload.topLanguage,
      payload.languageBreakdown,
      payload.topRepositories,
      payload.insights,
      payload.accountCreatedAt,
      payload.githubUpdatedAt
    ]
  );

  const [rows] = await pool.execute("SELECT * FROM github_profiles WHERE id = ?", [result.insertId]);
  return normalizeProfile(rows[0]);
}

async function listProfiles(options) {
  const page = options.page;
  const limit = options.limit;
  const offset = (page - 1) * limit;
  const allowedSorts = {
    analyzedAt: "analyzed_at",
    followers: "followers",
    publicRepos: "public_repos",
    totalStars: "total_stars",
    username: "username"
  };
  const sortColumn = allowedSorts[options.sortBy] || allowedSorts.analyzedAt;
  const sortOrder = options.order === "asc" ? "ASC" : "DESC";
  const params = [];
  let whereSql = "";

  if (options.search) {
    whereSql = "WHERE username LIKE ? OR name LIKE ? OR location LIKE ?";
    const searchValue = `%${options.search}%`;
    params.push(searchValue, searchValue, searchValue);
  }

  const pool = getPool();
  const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM github_profiles ${whereSql}`, params);
  const [rows] = await pool.execute(
    `SELECT * FROM github_profiles ${whereSql} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  return {
    data: rows.map(normalizeProfile),
    meta: {
      page,
      limit,
      total: countRows[0].total,
      totalPages: Math.ceil(countRows[0].total / limit)
    }
  };
}

async function getStoredProfile(username) {
  const profile = await findProfileByUsername(username);

  if (!profile) {
    throw new AppError(`Stored profile '${username}' was not found. Analyze it first.`, 404);
  }

  return profile;
}

module.exports = {
  analyzeAndStoreProfile,
  listProfiles,
  getStoredProfile
};
