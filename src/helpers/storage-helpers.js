export function get(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, items => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(items ? items[key] : null);
			}
		});
	}).catch(noop);
}

export function set(item) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.set(item, () => rejectOnError(resolve, reject));
	}).catch(noop);
}

function rejectOnError(resolve, reject, ...args) {
	if (chrome.runtime.lastError) {
		reject(chrome.runtime.lastError);
	} else {
		resolve(...args);
	}
}

const noop = () => {};
