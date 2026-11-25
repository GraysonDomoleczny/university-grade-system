export async function sendRequest(url, method = "GET", data = null) {
	return await fetch(url, {
		method: method,
		headers: { "Content-Type": "application/json" },
		...(data !== null && { body: JSON.stringify(data) }),
	});
}
