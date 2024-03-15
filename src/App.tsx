import React, { Component } from 'react';
import icon from './3274156.png';
import './App.css';
import { Button, Stack } from 'react-bootstrap';
import { render, screen } from '@testing-library/react';
import 'bootstrap/dist/css/bootstrap.min.css'

import root from './index'

import GameSelection from './GameSelection';

function App() {
  return (
    <div className="App">
      <body className="App-body">
        <Stack direction='horizontal' gap={10} className='Horizontal-Flow'>
          <Stack direction='vertical' gap={3} className='col-md-2.5 p-5 mx-auto w-10'>
            <h2 className='p-2'>Hangman</h2>
            <input className='p-2' type="text" placeholder='Name' id='name' />
            <input className='p-2' type="text" placeholder='Password' id='password' />
            <Button className='p-2' id='login_button' variant='success' onClick={onClick}>Login</Button>
          </Stack>
          <img src={icon} className='App-icon' alt='icon'/>
        </Stack>
      </body>
    </div>
  );
}

function onClick(event: React.MouseEvent<HTMLButtonElement>){
  var button = event.currentTarget
  
  root.render(<GameSelection />);

  console.log(button.id);
}

export default App;
