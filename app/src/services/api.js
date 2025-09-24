export async function getContext(endpoint, options = {}) {
  const res = await fetch(`/api${endpoint}`, options);
  return await res.json();
}
