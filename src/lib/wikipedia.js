export const fetchWikipediaSummary = async (name) => {
  try {
    const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`Wikipedia Error: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch Wikipedia summary:', error);
    return null;
  }
};
