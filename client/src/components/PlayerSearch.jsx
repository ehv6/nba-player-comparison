import React, { useState, useEffect } from 'react';

function PlayerSearch({ onCompare }) {
  const [player1Input, setPlayer1Input] = useState('');
  const [player2Input, setPlayer2Input] = useState('');
  const [player1Options, setPlayer1Options] = useState([]);
  const [player2Options, setPlayer2Options] = useState([]);
  const [player1Selected, setPlayer1Selected] = useState(null);
  const [player2Selected, setPlayer2Selected] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchPlayers = async (query, setOptions) => {
    if (query.length < 3) {
      setOptions([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      console.log('Searching for:', query);
      const response = await fetch(`/api/search?name=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search error:', errorText);
        throw new Error(`Failed to search players: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      setOptions(data);
    } catch (error) {
      console.error('Error searching players:', error);
      setOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (player1Input) {
        searchPlayers(player1Input, setPlayer1Options);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [player1Input]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (player2Input) {
        searchPlayers(player2Input, setPlayer2Options);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [player2Input]);

  const selectPlayer = (player, isPlayer1) => {
    if (isPlayer1) {
      setPlayer1Selected(player);
      setPlayer1Input(player.first_name + ' ' + player.last_name);
      setPlayer1Options([]);
    } else {
      setPlayer2Selected(player);
      setPlayer2Input(player.first_name + ' ' + player.last_name);
      setPlayer2Options([]);
    }
  };

  const handleCompare = () => {
    if (player1Selected && player2Selected) {
      onCompare(player1Selected, player2Selected);
    }
  };

  return (
    <div className="player-search">
      <div className="search-container">
        <div className="search-box">
          <label htmlFor="player1">Player 1</label>
          <input
            id="player1"
            type="text"
            value={player1Input}
            onChange={(e) => setPlayer1Input(e.target.value)}
            placeholder="Search for a player..."
          />
          {player1Options.length > 0 && (
            <ul className="search-results">
              {player1Options.map((player) => (
                <li key={player.id} onClick={() => selectPlayer(player, true)}>
                  {player.first_name} {player.last_name} - {player.team?.full_name || 'N/A'}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="search-box">
          <label htmlFor="player2">Player 2</label>
          <input
            id="player2"
            type="text"
            value={player2Input}
            onChange={(e) => setPlayer2Input(e.target.value)}
            placeholder="Search for a player..."
          />
          {player2Options.length > 0 && (
            <ul className="search-results">
              {player2Options.map((player) => (
                <li key={player.id} onClick={() => selectPlayer(player, false)}>
                  {player.first_name} {player.last_name} - {player.team?.full_name || 'N/A'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ✅ Added Visual Indicator */}
      <div className="search-status">
        <p>
          Player 1:{' '}
          {player1Selected
            ? `${player1Selected.first_name} ${player1Selected.last_name} selected`
            : 'Not selected'}
        </p>
        <p>
          Player 2:{' '}
          {player2Selected
            ? `${player2Selected.first_name} ${player2Selected.last_name} selected`
            : 'Not selected'}
        </p>
      </div>
      
      <button 
        className="compare-button" 
        onClick={handleCompare}
        disabled={!player1Selected || !player2Selected || searchLoading}
      >
        Compare Players
      </button>
    </div>
  );
}

export default PlayerSearch;
