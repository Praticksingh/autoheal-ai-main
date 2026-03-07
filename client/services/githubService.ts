import { apiClient } from './api';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
}

export class GitHubService {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';

  static async getUserRepos(username: string): Promise<GitHubRepo[]> {
    // Note: This would typically require authentication for private repos
    // For now, using public API
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/users/${username}/repos`);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user repos:', error);
      throw error;
    }
  }

  static async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}`);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch repo:', error);
      throw error;
    }
  }

  static async getUser(username: string): Promise<GitHubUser> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/users/${username}`);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  }

  // TODO: Add methods for authenticated requests when backend proxy is set up
  // static async getAuthenticatedUser(token: string): Promise<GitHubUser> {
  //   return apiClient.get('/api/github/user', {
  //     headers: { Authorization: `Bearer ${token}` }
  //   });
  // }
}