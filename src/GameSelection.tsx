import React from 'react';
import icon from './3274156.png';
import './App.css';
import { Button, Stack } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'

function GameSelection() {
  return (
    <div className="App">
      <body className="App-body">
        <Stack direction='horizontal' gap={10} className='Horizontal-Flow'>
          <Stack direction='vertical' gap={3} className='col-md-2.5 p-5 mx-auto w-10'>
            <h2 className='p-2'>Hangman</h2>
            <Button className='p-2' variant='primary'>Easy</Button>
            <Button className='p-2' variant='danger'>Hard</Button>
          </Stack>
          <img src={icon} className='App-icon' alt='icon'/>
        </Stack>
      </body>
    </div>
  );
}

export default GameSelection;
