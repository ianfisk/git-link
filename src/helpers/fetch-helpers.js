export async function fetchJson(input, init = {}) {
	const response = await fetch(
		new Request(input, {
			...init,
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'fetch',
				...init.headers,
			},
		})
	);
	rejectOnError(response);
	return response.json();
}

function rejectOnError(response) {
	if (!response.ok) {
		throw response;
	}

	return response;
}
