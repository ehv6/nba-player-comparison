// src/components/PlayerComparison.jsx
import React from 'react';

function PlayerComparison({ data }) {
  const { player1, player2, aiAnalysis } = data;
  
  // Helper function to get color based on comparison
  const getComparisonColor = (stat1, stat2) => {
    if (stat1 === stat2) return 'equal';
    return stat1 > stat2 ? 'better' : 'worse';
  };
  
  // Function to determine if higher is better for a given stat
  const isHigherBetter = (statName) => {
    const lowerIsBetter = ['turnovers', 'personal_fouls'];
    return !lowerIsBetter.includes(statName);
  };
  
  // Function to get the comparison class for stats
  const getStatClass = (statName, value1, value2) => {
    if (value1 === value2) return 'equal';
    
    const higher = value1 > value2;
    const better = isHigherBetter(statName) ? higher : !higher;
    
    return better ? 'better' : 'worse';
  };

  const renderStatRow = (statName, label) => {
    const value1 = player1.stats[statName] || 0;
    const value2 = player2.stats[statName] || 0;
    
    return (
      <tr key={statName}>
        <td className={getStatClass(statName, value1, value2)}>{value1.toFixed(1)}</td>
        <td>{label}</td>
        <td className={getStatClass(statName, value2, value1)}>{value2.toFixed(1)}</td>
      </tr>
    );
  };

  return (
    <div className="player-comparison">
      <div className="comparison-header">
        <div className="player-card">
          <h2>{player1.first_name} {player1.last_name}</h2>
          <p>{player1.team?.full_name || 'N/A'}</p>
          <p>Position: {player1.position || 'N/A'}</p>
        </div>
        <div className="vs">VS</div>
        <div className="player-card">
          <h2>{player2.first_name} {player2.last_name}</h2>
          <p>{player2.team?.full_name || 'N/A'}</p>
          <p>Position: {player2.position || 'N/A'}</p>
        </div>
      </div>
      
      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>{player1.last_name}</th>
              <th>Stat</th>
              <th>{player2.last_name}</th>
            </tr>
          </thead>
          <tbody>
            {renderStatRow('pts', 'Points')}
            {renderStatRow('ast', 'Assists')}
            {renderStatRow('reb', 'Rebounds')}
            {renderStatRow('stl', 'Steals')}
            {renderStatRow('blk', 'Blocks')}
            {renderStatRow('fg_pct', 'Field Goal %')}
            {renderStatRow('fg3_pct', '3PT %')}
            {renderStatRow('ft_pct', 'Free Throw %')}
            {renderStatRow('turnover', 'Turnovers')}
            {renderStatRow('min', 'Minutes')}
          </tbody>
        </table>
      </div>
      
      <div className="ai-analysis">
        <h3>AI Analysis</h3>
        <div className="analysis-container">
          <div className="analysis-card">
            <h4>Why {player1.last_name} is better:</h4>
            <p>{aiAnalysis.player1Advantages}</p>
          </div>
          <div className="analysis-card">
            <h4>Why {player2.last_name} is better:</h4>
            <p>{aiAnalysis.player2Advantages}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerComparison;