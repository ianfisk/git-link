import UrlPattern from 'url-pattern';
import { GitClient } from '../clients';
import { get, set } from '../helpers/storage-helpers';

const packageJsonPattern = new UrlPattern('*/:owner/:repo/blob/:ref/package.json*');
const gitClient = new GitClient();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (sender.url.includes('package.json') && request.packageJsonContents) {
		try {
			const packageJsonContents = JSON.parse(request.packageJsonContents);
			sendResponse(packageJsonContents);
		} catch (e) {
			// try to get the contents from Github's API
			const match = packageJsonPattern.match(sender.url);
			if (match) {
				getPackageJsonContents(match, sendResponse);

				// return true from the event listener to indicate an async response
				return true;
			}
		}
	}

	return false;
});

chrome.runtime.onInstalled.addListener(() => {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: { hostEquals: 'github.com', pathContains: 'package.json', schemes: ['https'] },
					}),
				],
				actions: [
					new chrome.declarativeContent.ShowPageAction(),
					new chrome.declarativeContent.RequestContentScript({
						js: ['content.js'],
					}),
				],
			},
		]);
	});
});

async function getPackageJsonContents(urlMatch, sendResponse) {
	const packageJsonKey = getPackageJsonStorageKey(urlMatch);
	const savedContent = await get(packageJsonKey);
	if (savedContent) {
		sendResponse(savedContent);
		return;
	}

	const packageJson = await gitClient.getContents({ ...urlMatch, path: 'package.json' });
	const packageJsonContents = JSON.parse(atob(packageJson.content));

	set({ [packageJsonKey]: packageJsonContents });
	sendResponse(packageJsonContents);
}

function getPackageJsonStorageKey({ owner, repo, ref }) {
	return `${owner}-${repo}-${ref}`;
}
