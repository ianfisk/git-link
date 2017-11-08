import { get, set } from '../helpers/storage-helpers';
import { NpmClient } from '../clients';

const npmPackageUrl = 'https://www.npmjs.com/package';
const npmClient = new NpmClient();

const [packageJsonElement] = document.getElementsByClassName('js-file-line-container');
if (packageJsonElement) {
	processPackageJson(packageJsonElement);
} else {
	document.addEventListener('DOMContentLoaded', () => {
		processPackageJson(document.getElementsByClassName('js-file-line-container')[0]);
	});
}

function processPackageJson(packageJsonContainer) {
	if (packageJsonContainer) {
		chrome.runtime.sendMessage(
			{ packageJsonContents: packageJsonContainer.textContent },
			packageJsonContents => {
				if (
					packageJsonContents &&
					(packageJsonContents.devDependencies || packageJsonContents.dependencies)
				) {
					linkifyDependencies(packageJsonContents, packageJsonContainer);
				}
			}
		);
	}
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
				const { name, homepage } = await getNpmPackageInfo(packageName);

				const anchor = createAnchor(homepage || `${npmPackageUrl}/${name}`);
				anchor.appendChild(packageNameSpan.cloneNode(true));
				packageNameSpan.replaceWith(anchor);
			}
		}
	}
}

async function getNpmPackageInfo(packageName) {
	const savedPackageInfo = await get(packageName);
	if (savedPackageInfo) {
		return savedPackageInfo;
	}

	const { name, homepage, repository } = await npmClient.getMinimalPackageInformation(packageName);
	const minimalPackageInfo = { name, homepage, repository };
	if (name && homepage && repository) {
		set({ [packageName]: minimalPackageInfo });
	}

	return minimalPackageInfo;
}

function createAnchor(href) {
	const anchor = document.createElement('a');
	anchor.target = '_blank';
	anchor.rel = 'noopener noreferrer';
	anchor.href = href;
	return anchor;
}
