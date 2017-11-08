import { fetchJson } from '../helpers/fetch-helpers';
import config from '../config';

export class GitClient {
	constructor(baseUrl = config.gitUrlBase) {
		this.baseUrl = baseUrl;
	}

	async getContents({ owner, repo, path, ref }) {
		return fetchJson(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`);
	}
}
