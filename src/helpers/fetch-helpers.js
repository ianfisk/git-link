export async function fetchJson(endpoint, options = {}) {
	const { headers, query, credentials, body, ...restOfOptions } = options;

	const response = await fetch(
		new Request(withQuery(endpoint, query), {
			...restOfOptions,
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'fetch',
				...headers,
			},
			body: body && new Blob([JSON.stringify(body)]),
			credentials: credentials || 'same-origin',
		})
	);

	if (response.status !== 404 && !response.ok) {
		throw response;
	}

	return response.status === 204 || response.status === 404 ? null : response.json();
}

function withQuery(url, query) {
	const queryString = query
		? Object.keys(query)
				.filter(key => !!query[key])
				.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
				.join('&')
		: '';

	return queryString ? `${url}?${queryString}` : url;
}
