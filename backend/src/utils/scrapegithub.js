const GITHUB_API = "https://api.github.com";

function githubHeaders() {
  const headers = {
    "User-Agent": "NodeJS-Profile-Scraper",
    Accept: "application/vnd.github+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function githubGet(url) {
  const response = await fetch(url, {
    headers: githubHeaders(),
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      const reset = response.headers.get("x-ratelimit-reset");

      throw new Error(
        `Rate limited. Resets at ${
          reset ? new Date(Number(reset) * 1000).toISOString() : "unknown"
        }`,
      );
    }

    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

// Fetch GitHub user profile
export async function fetchGithubUser(username) {
  return githubGet(`${GITHUB_API}/users/${encodeURIComponent(username)}`);
}

// Fetch all public repositories
export async function fetchGithubRepos(username) {
  const repos = [];
  let page = 1;

  while (true) {
    const batch = await githubGet(
      `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`,
    );

    repos.push(...batch);

    if (batch.length < 100) {
      break;
    }

    page++;
  }

  // Return only the fields needed by the frontend
  return repos.map((repo) => ({
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics,
    is_fork: repo.fork,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
  }));
}

// Fetch profile and repositories together
export async function githubresult(username) {
  const [user, repos] = await Promise.all([
    fetchGithubUser(username),
    fetchGithubRepos(username),
  ]);

  return {
    user,
    repos,
  };
}
