import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

import { GameLogin, GameSelection } from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


if(localStorage.getItem("hangman_user_name") == null) {
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

export {root};