require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { searchParallel } = require('./services/parallel');
const { searchExa } = require('./services/exa');
const { searchOpenAI } = require('./services/openai-search');
const { judgeResults, generateTestSuite } = require('./services/openai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the built client
app.use(express.static(path.join(__dirname, '../client/dist')));

// Search all APIs
app.post('/api/search', async (req, res) => {
  try {
    const { query, numResults = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const [parallelResults, exaResults, openaiResults] = await Promise.all([
      searchParallel(query, numResults).catch(err => ({ provider: 'parallel', error: err.message, results: [] })),
      searchExa(query, numResults).catch(err => ({ provider: 'exa', error: err.message, results: [] })),
      searchOpenAI(query, numResults).catch(err => ({ provider: 'openai', error: err.message, results: [] }))
    ]);

    res.json({ parallel: parallelResults, exa: exaResults, openai: openaiResults });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Judge results
app.post('/api/judge', async (req, res) => {
  try {
    const { query, parallelResults, exaResults, openaiResults } = req.body;

    if (!query || !parallelResults || !exaResults || !openaiResults) {
      return res.status(400).json({ error: 'Query, parallelResults, exaResults, and openaiResults are required' });
    }

    const judgment = await judgeResults(query, parallelResults, exaResults, openaiResults);
    res.json(judgment);
  } catch (err) {
    console.error('Judge error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate test suite
app.post('/api/suite/generate', async (req, res) => {
  try {
    const { count = 10, topic } = req.body;
    const queries = await generateTestSuite(count, topic);
    res.json({ queries });
  } catch (err) {
    console.error('Suite generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Run test suite with SSE for progress updates
app.post('/api/suite/run', async (req, res) => {
  try {
    const { queries } = req.body;

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({ error: 'Queries array is required' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const results = [];
    let parallelWins = 0;
    let exaWins = 0;
    let openaiWins = 0;
    let ties = 0;

    // Process queries with progress updates
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];

      // Send progress update
      res.write(`data: ${JSON.stringify({ type: 'progress', current: i + 1, total: queries.length, query })}\n\n`);

      try {
        // Search all APIs with timeout
        const timeoutPromise = (promise, ms) => Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
        ]);

        const [parallelResults, exaResults, openaiResults] = await Promise.all([
          timeoutPromise(searchParallel(query, 10), 15000).catch(err => ({ provider: 'parallel', error: err.message, results: [] })),
          timeoutPromise(searchExa(query, 10), 15000).catch(err => ({ provider: 'exa', error: err.message, results: [] })),
          timeoutPromise(searchOpenAI(query, 10), 20000).catch(err => ({ provider: 'openai', error: err.message, results: [] }))
        ]);

        // Judge results with timeout
        const judgment = await timeoutPromise(judgeResults(query, parallelResults, exaResults, openaiResults), 30000);

        if (judgment.winner === 'parallel') parallelWins++;
        else if (judgment.winner === 'exa') exaWins++;
        else if (judgment.winner === 'openai') openaiWins++;
        else ties++;

        const result = {
          query,
          parallel: {
            resultCount: parallelResults.results.length,
            scores: judgment.parallel,
            error: parallelResults.error
          },
          exa: {
            resultCount: exaResults.results.length,
            scores: judgment.exa,
            error: exaResults.error
          },
          openai: {
            resultCount: openaiResults.results.length,
            scores: judgment.openai,
            error: openaiResults.error
          },
          winner: judgment.winner,
          ranking: judgment.ranking
        };

        results.push(result);

        // Send individual result
        res.write(`data: ${JSON.stringify({ type: 'result', index: i, result })}\n\n`);

      } catch (err) {
        const errorResult = { query, error: err.message };
        results.push(errorResult);
        res.write(`data: ${JSON.stringify({ type: 'result', index: i, result: errorResult })}\n\n`);
      }
    }

    // Send final summary
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      results,
      summary: {
        total: queries.length,
        parallelWins,
        exaWins,
        openaiWins,
        ties
      }
    })}\n\n`);

    res.end();

  } catch (err) {
    console.error('Suite run error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
});

// Serve the Vue app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
