import { fetchJson } from '../helpers/fetch-helpers';
import config from '../config';

export class NpmClient {
	constructor(baseUrl = config.npmUrlBase) {
		this.baseUrl = baseUrl;
	}

	async getMinimalPackageInformation(packageName) {
		const { name, homepage, repository } = await fetchJson(`${this.baseUrl}/${packageName}`);
		return { name, homepage, repository };
	}
}
