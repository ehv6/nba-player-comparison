// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import PlayerSearch from './components/PlayerSearch';
import PlayerComparison from './components/PlayerComparison';

function App() {
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const comparePlayersHandler = async (player1, player2) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player1, player2 }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to compare players');
      }
      
      const data = await response.json();
      setComparisonResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>NBA Player Comparison</h1>
        <p>Compare stats and get AI-powered analysis of any two NBA players</p>
      </header>
      
      <PlayerSearch onCompare={comparePlayersHandler} />
      
      {isLoading && <div className="loading">Loading player comparison...</div>}
      {error && <div className="error">{error}</div>}
      
      {comparisonResult && <PlayerComparison data={comparisonResult} />}
    </div>
  );
}

export default App;