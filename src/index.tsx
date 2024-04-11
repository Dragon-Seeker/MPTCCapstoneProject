import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { useState, useEffect } from 'react';
import reportWebVitals from './reportWebVitals';

import { GameLogin, GameSelection } from './App';
import { HangManGameState, DifficultyMode } from './gameState';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

var gameState = HangManGameState.fromSession();

if(gameState == null) {
  root.render(
    <React.StrictMode>
      <GameLogin />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <GameSelection />
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

export default root;