const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "";

async function http(path, init) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...(init || {})
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  getAlerts: (p) => {
    const qs = p ? "?" + new URLSearchParams(Object.entries(p).filter(([, v]) => !!v)).toString() : "";
    return http(`/alerts${qs}`);
  },
  getZones: () => http(`/zones`),
  search: (q) => http(`/search?q=${encodeURIComponent(q)}`)
};
