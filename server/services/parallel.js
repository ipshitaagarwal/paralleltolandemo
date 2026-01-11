const PARALLEL_API_URL = 'https://api.parallel.ai/v1beta/search';

// Estimated cost per search (based on Parallel pricing)
const PARALLEL_COST_PER_SEARCH = 0.01; // $0.01 per search estimate

async function searchParallel(query, maxResults = 10) {
  const startTime = Date.now();

  const response = await fetch(PARALLEL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.PARALLEL_API_KEY,
      'parallel-beta': 'search-extract-2025-10-10'
    },
    body: JSON.stringify({
      objective: query,
      search_queries: [query],
      max_results: maxResults,
      excerpts: { max_chars_per_result: 5000 }
    })
  });

  const latency = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Parallel API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Normalize results to common format
  return {
    provider: 'parallel',
    searchId: data.search_id,
    latency,
    estimatedCost: PARALLEL_COST_PER_SEARCH,
    results: (data.results || []).map(r => ({
      title: r.title,
      url: r.url,
      publishedDate: r.publish_date,
      excerpt: Array.isArray(r.excerpts) ? r.excerpts.join('\n\n') : r.excerpts || ''
    }))
  };
}

module.exports = { searchParallel };
