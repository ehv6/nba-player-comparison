// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// NBA API Configuration
const NBA_API_BASE_URL = 'https://www.balldontlie.io/api/v1';

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Search players endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.length < 3) {
      return res.status(400).json({ error: 'Search query must be at least 3 characters' });
    }

    const response = await axios.get(`${NBA_API_BASE_URL}/players`, {
      params: {
        search: name,
        per_page: 10
      }
    });

    res.json(response.data.data);
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ error: 'Failed to search players' });
  }
});

// Function to get player season averages
async function getPlayerStats(playerId) {
  try {
    const response = await axios.get(`${NBA_API_BASE_URL}/season_averages`, {
      params: {
        player_ids: [playerId]
      }
    });
    
    return response.data.data[0] || {};
  } catch (error) {
    console.error(`Error fetching stats for player ${playerId}:`, error);
    throw error;
  }
}

// Function to get player details
async function getPlayerDetails(playerId) {
  try {
    const response = await axios.get(`${NBA_API_BASE_URL}/players/${playerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for player ${playerId}:`, error);
    throw error;
  }
}

// Generate AI analysis using OpenAI
async function generateAIAnalysis(player1, player2) {
  try {
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o", // You can adjust the model as needed
        messages: [
          {
            role: "system",
            content: "You are a basketball analyst expert. Compare the two NBA players based on their statistics and provide objective analysis."
          },
          {
            role: "user",
            content: `Compare these two NBA players:
              Player 1: ${player1.first_name} ${player1.last_name} (${player1.team?.full_name || 'N/A'})
              Player 1 Stats: ${JSON.stringify(player1.stats)}
              
              Player 2: ${player2.first_name} ${player2.last_name} (${player2.team?.full_name || 'N/A'})
              Player 2 Stats: ${JSON.stringify(player2.stats)}
              
              Please provide two separate analyses: 
              1. Why ${player1.first_name} ${player1.last_name} is the better player (reference specific stats)
              2. Why ${player2.first_name} ${player2.last_name} is the better player (reference specific stats)
              
              Each analysis should be concise but comprehensive, backed by the statistics provided.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = openaiResponse.data.choices[0].message.content;
    
    // Parse the response to extract the two analyses
    const parts = content.split(/(?=Why|^\d\.\s*Why)/im);
    
    let player1Advantages = '';
    let player2Advantages = '';
    
    for (const part of parts) {
      if (part.includes(player1.first_name) && part.includes("better player")) {
        player1Advantages = part.replace(/^.*?better player\s*(?:\(reference specific stats\))?\s*:?\s*/i, '').trim();
      } else if (part.includes(player2.first_name) && part.includes("better player")) {
        player2Advantages = part.replace(/^.*?better player\s*(?:\(reference specific stats\))?\s*:?\s*/i, '').trim();
      }
    }
    
    // If parsing failed, use the whole response
    if (!player1Advantages && !player2Advantages) {
      const halfPoint = Math.floor(content.length / 2);
      player1Advantages = content.substring(0, halfPoint);
      player2Advantages = content.substring(halfPoint);
    }

    return {
      player1Advantages,
      player2Advantages
    };
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return {
      player1Advantages: 'Analysis unavailable due to an error',
      player2Advantages: 'Analysis unavailable due to an error'
    };
  }
}

// Compare players endpoint
app.post('/api/compare', async (req, res) => {
  try {
    const { player1, player2 } = req.body;
    
    if (!player1 || !player2 || !player1.id || !player2.id) {
      return res.status(400).json({ error: 'Invalid player data' });
    }

    // Get player stats
    const [player1Stats, player2Stats] = await Promise.all([
      getPlayerStats(player1.id),
      getPlayerStats(player2.id)
    ]);

    // Prepare player objects with stats
    const player1WithStats = { ...player1, stats: player1Stats };
    const player2WithStats = { ...player2, stats: player2Stats };

    // Generate AI analysis
    const aiAnalysis = await generateAIAnalysis(player1WithStats, player2WithStats);

    // Return combined data
    res.json({
      player1: player1WithStats,
      player2: player2WithStats,
      aiAnalysis
    });
  } catch (error) {
    console.error('Error comparing players:', error);
    res.status(500).json({ error: 'Failed to compare players' });
  }
});

// Catch-all handler for React router in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});