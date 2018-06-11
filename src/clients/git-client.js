import { fetchJson } from '../helpers/fetch-helpers';
import config from '../config';

export class GitClient {
	constructor(baseUrl = config.gitUrlBase) {
		this.baseUrl = baseUrl;
	}

	async getFileContents({ owner, repo, path, ref }) {
		const response = await fetchJson(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
			query: {
				ref,
			},
		});

		return response.content ? JSON.parse(atob(response.content)) : null;
	}
}
