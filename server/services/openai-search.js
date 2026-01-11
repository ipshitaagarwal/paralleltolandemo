const OpenAI = require('openai');

let openai;

// Estimated cost per OpenAI search
const OPENAI_SEARCH_COST_ESTIMATE = 0.04;

function getClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function searchOpenAI(query, numResults = 10) {
  const client = getClient();
  const startTime = Date.now();

  try {
    // Use gpt-4o-search-preview which has built-in web search
    const response = await client.chat.completions.create({
      model: 'gpt-4o-search-preview',
      messages: [
        {
          role: 'user',
          content: `Search the web for: "${query}"

Return exactly ${numResults} search results as a JSON array. Each result must have:
- title: the page title
- url: the full URL
- excerpt: a 1-2 sentence summary

IMPORTANT: Return ONLY the JSON array, no other text:
[{"title":"...","url":"...","excerpt":"..."},...]`
        }
      ]
    });

    const latency = Date.now() - startTime;
    const content = response.choices[0].message.content || '';

    // Parse the response
    let results = [];
    try {
      // Try to extract JSON from the response
      let jsonStr = content.trim();

      // Handle potential markdown code blocks
      if (jsonStr.includes('```')) {
        const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          jsonStr = match[1].trim();
        }
      }

      // Try to find JSON array in the response
      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        results = JSON.parse(arrayMatch[0]);
      }
    } catch (parseErr) {
      console.error('Failed to parse OpenAI search response:', parseErr.message);
      console.error('Response content:', content.substring(0, 500));
    }

    // Deduplicate by URL and ensure proper structure
    const seen = new Set();
    const uniqueResults = results
      .filter(r => r && r.url && !seen.has(r.url) && (seen.add(r.url), true))
      .slice(0, numResults)
      .map(r => ({
        title: r.title || 'Untitled',
        url: r.url,
        excerpt: r.excerpt || r.summary || ''
      }));

    return {
      provider: 'openai',
      results: uniqueResults,
      latency,
      estimatedCost: OPENAI_SEARCH_COST_ESTIMATE
    };
  } catch (err) {
    console.error('OpenAI search error:', err.message);
    return {
      provider: 'openai',
      error: err.message,
      results: [],
      latency: Date.now() - startTime,
      estimatedCost: 0
    };
  }
}

module.exports = { searchOpenAI };
