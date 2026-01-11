const OpenAI = require('openai');

let openai;

function getClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function judgeResults(query, parallelResults, exaResults, openaiResults) {
  const client = getClient();

  // Extract metrics
  const metrics = {
    parallel: {
      latency: parallelResults.latency || 0,
      cost: parallelResults.estimatedCost || 0,
      resultCount: parallelResults.results?.length || 0
    },
    openai: {
      latency: openaiResults.latency || 0,
      cost: openaiResults.estimatedCost || 0,
      resultCount: openaiResults.results?.length || 0
    },
    exa: {
      latency: exaResults.latency || 0,
      cost: exaResults.estimatedCost || 0,
      resultCount: exaResults.results?.length || 0
    }
  };

  // Ask LLM to judge accuracy only
  const prompt = `You are evaluating search result ACCURACY for the query: "${query}"

Rate each API's results on ACCURACY (1-10 scale):
- How relevant are the results to the query intent?
- How authoritative and useful are the sources?
- How comprehensive is the coverage?

PARALLEL API Results (${metrics.parallel.resultCount} results, ${metrics.parallel.latency}ms, $${metrics.parallel.cost.toFixed(4)}):
${JSON.stringify(parallelResults.results?.slice(0, 5) || [], null, 2)}

OPENAI WEB SEARCH Results (${metrics.openai.resultCount} results, ${metrics.openai.latency}ms, $${metrics.openai.cost.toFixed(4)}):
${JSON.stringify(openaiResults.results?.slice(0, 5) || [], null, 2)}

EXA API Results (${metrics.exa.resultCount} results, ${metrics.exa.latency}ms, $${metrics.exa.cost.toFixed(4)}):
${JSON.stringify(exaResults.results?.slice(0, 5) || [], null, 2)}

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "parallel": {"accuracy": X, "reasoning": "1-2 sentence explanation"},
  "openai": {"accuracy": X, "reasoning": "1-2 sentence explanation"},
  "exa": {"accuracy": X, "reasoning": "1-2 sentence explanation"}
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 1000
  });

  const content = response.choices[0].message.content.trim();

  let accuracyJudgment;
  try {
    let jsonStr = content;
    if (content.includes('```')) {
      jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }
    accuracyJudgment = JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse judge response:', content);
    throw new Error('Failed to parse LLM judge response');
  }

  // Calculate latency scores (lower is better, normalized to 1-10 scale)
  const latencies = [metrics.parallel.latency, metrics.openai.latency, metrics.exa.latency].filter(l => l > 0);
  const maxLatency = Math.max(...latencies, 1);
  const minLatency = Math.min(...latencies, 1);

  const latencyScore = (latency) => {
    if (latency === 0) return 0; // No data
    // Inverse scale: fastest gets 10, slowest gets proportionally lower
    if (maxLatency === minLatency) return 10;
    return Math.round(10 - ((latency - minLatency) / (maxLatency - minLatency)) * 7);
  };

  // Calculate cost scores (lower is better, normalized to 1-10 scale)
  const costs = [metrics.parallel.cost, metrics.openai.cost, metrics.exa.cost].filter(c => c > 0);
  const maxCost = Math.max(...costs, 0.001);
  const minCost = Math.min(...costs, 0.001);

  const costScore = (cost) => {
    if (cost === 0) return 0; // No data
    // Inverse scale: cheapest gets 10, most expensive gets proportionally lower
    if (maxCost === minCost) return 10;
    return Math.round(10 - ((cost - minCost) / (maxCost - minCost)) * 7);
  };

  // Build final judgment with all metrics
  const finalJudgment = {
    parallel: {
      latency: metrics.parallel.latency,
      latencyScore: latencyScore(metrics.parallel.latency),
      cost: metrics.parallel.cost,
      costScore: costScore(metrics.parallel.cost),
      accuracy: accuracyJudgment.parallel?.accuracy || 0,
      reasoning: accuracyJudgment.parallel?.reasoning || 'No evaluation available'
    },
    openai: {
      latency: metrics.openai.latency,
      latencyScore: latencyScore(metrics.openai.latency),
      cost: metrics.openai.cost,
      costScore: costScore(metrics.openai.cost),
      accuracy: accuracyJudgment.openai?.accuracy || 0,
      reasoning: accuracyJudgment.openai?.reasoning || 'No evaluation available'
    },
    exa: {
      latency: metrics.exa.latency,
      latencyScore: latencyScore(metrics.exa.latency),
      cost: metrics.exa.cost,
      costScore: costScore(metrics.exa.cost),
      accuracy: accuracyJudgment.exa?.accuracy || 0,
      reasoning: accuracyJudgment.exa?.reasoning || 'No evaluation available'
    }
  };

  // Calculate total scores (latency 25%, cost 25%, accuracy 50%)
  const calculateTotal = (scores) => {
    return Math.round(
      (scores.latencyScore * 0.25) +
      (scores.costScore * 0.25) +
      (scores.accuracy * 0.5)
    );
  };

  finalJudgment.parallel.total = calculateTotal(finalJudgment.parallel);
  finalJudgment.openai.total = calculateTotal(finalJudgment.openai);
  finalJudgment.exa.total = calculateTotal(finalJudgment.exa);

  // Determine winner
  const scores = [
    { provider: 'parallel', total: finalJudgment.parallel.total },
    { provider: 'openai', total: finalJudgment.openai.total },
    { provider: 'exa', total: finalJudgment.exa.total }
  ].sort((a, b) => b.total - a.total);

  if (scores[0].total === scores[1].total && scores[1].total === scores[2].total) {
    finalJudgment.winner = 'tie';
  } else if (scores[0].total === scores[1].total) {
    finalJudgment.winner = 'tie';
  } else {
    finalJudgment.winner = scores[0].provider;
  }

  finalJudgment.ranking = scores.map(s => s.provider);

  return finalJudgment;
}

async function generateTestSuite(count = 10, topic = null) {
  const client = getClient();

  let prompt;

  if (topic) {
    prompt = `Generate ${count} realistic search queries that someone might use when searching for information about: "${topic}"

The queries should be diverse and represent different aspects or questions related to this topic.
Include variations like:
- Specific lookups (e.g., "React useState hook documentation")
- How-to queries (e.g., "how to implement authentication in Next.js")
- Comparison queries (e.g., "Redux vs Zustand state management")
- Troubleshooting queries (e.g., "fix CORS error in Express")
- Best practices (e.g., "best practices for API design")

Make them realistic - actual queries a developer/user would type.

Return ONLY a valid JSON array of query strings (no markdown, no code blocks):
["query 1", "query 2", ...]`;
  } else {
    prompt = `Generate ${count} diverse search queries for testing search APIs.

Make queries realistic - things a user might actually search for.
Include a mix of:
- Current events / news
- Technical/research topics
- Company/product information
- How-to / instructional
- Factual questions

Return ONLY a valid JSON array of query strings (no markdown, no code blocks):
["query 1", "query 2", ...]`;
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 1000
  });

  const content = response.choices[0].message.content.trim();

  try {
    let jsonStr = content;
    if (content.includes('```')) {
      jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse test suite response:', content);
    throw new Error('Failed to parse test suite generation response');
  }
}

module.exports = { judgeResults, generateTestSuite };
