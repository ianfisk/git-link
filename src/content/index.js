import UrlPattern from 'url-pattern';
import config from '../config';
import { GitClient, NpmClient } from '../clients';

const packageJsonPattern = new UrlPattern('*/:owner/:repo/blob/:ref/package.json*');

const gitClient = new GitClient();
const npmClient = new NpmClient();

const [packageJsonElement] = document.getElementsByClassName('js-file-line-container');
if (packageJsonElement) {
	processPackageJson(packageJsonElement);
} else {
	document.addEventListener('DOMContentLoaded', () => {
		processPackageJson(document.getElementsByClassName('js-file-line-container')[0]);
	});
}

async function processPackageJson(packageJsonContainer) {
	if (!packageJsonContainer) {
		return;
	}

	const packageJsonContents = await getPackageJsonContents(packageJsonContainer);
	if (
		packageJsonContents &&
		(packageJsonContents.devDependencies || packageJsonContents.dependencies)
	) {
		linkifyDependencies(packageJsonContents, packageJsonContainer);
	}
}

async function getPackageJsonContents(packageJsonContainer) {
	const match = packageJsonPattern.match(window.location.href);

	let packageJsonContents;
	try {
		packageJsonContents = JSON.parse(packageJsonContainer.textContent);
	} catch (e) {
		// try to get the contents from Github's API
		if (match) {
			packageJsonContents = await gitClient.getFileContents({ ...match, path: 'package.json' });
		}
	}

	return packageJsonContents;
}

async function linkifyDependencies(packageJsonContents, packageJsonContainer) {
	const allDependencies = {
		...packageJsonContents.devDependencies,
		...packageJsonContents.dependencies,
	};

	const [contentsTableBody] = packageJsonContainer.getElementsByTagName('tbody');
	if (contentsTableBody) {
		const { children } = contentsTableBody;
		for (let i = 0; i < children.length; i++) {
			const line = children[i];
			const [fileLine] = line.getElementsByClassName('js-file-line');
			const [packageNameSpan] = fileLine.getElementsByTagName('span');

			const packageName = packageNameSpan && packageNameSpan.textContent.replace(/"/g, '');
			if (packageName && allDependencies[packageName]) {
				const { name, homepage } = await npmClient.getMinimalPackageInformation(packageName);

				const anchor = createAnchor(homepage || `${config.npmPackagePageUrlBase}/${name}`);
				anchor.appendChild(packageNameSpan.cloneNode(true));
				packageNameSpan.replaceWith(anchor);
			}
		}
	}
}

function createAnchor(href) {
	const anchor = document.createElement('a');
	anchor.target = '_blank';
	anchor.rel = 'noopener noreferrer';
	anchor.href = href;
	return anchor;
}
