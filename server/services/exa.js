const EXA_API_URL = 'https://api.exa.ai/search';

// Estimated cost per search (based on Exa pricing - $0.0035 per search + $0.001 per result with text)
const EXA_BASE_COST = 0.0035;
const EXA_COST_PER_RESULT_WITH_TEXT = 0.001;

async function searchExa(query, numResults = 10) {
  const startTime = Date.now();

  const response = await fetch(EXA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.EXA_API_KEY
    },
    body: JSON.stringify({
      query,
      numResults,
      text: true
    })
  });

  const latency = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Exa API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const resultCount = (data.results || []).length;
  const estimatedCost = EXA_BASE_COST + (resultCount * EXA_COST_PER_RESULT_WITH_TEXT);

  // Normalize results to common format
  return {
    provider: 'exa',
    requestId: data.requestId,
    searchType: data.searchType,
    latency,
    estimatedCost,
    results: (data.results || []).map(r => ({
      title: r.title,
      url: r.url,
      publishedDate: r.publishedDate,
      excerpt: r.text || r.highlights?.join('\n\n') || ''
    }))
  };
}

module.exports = { searchExa };
