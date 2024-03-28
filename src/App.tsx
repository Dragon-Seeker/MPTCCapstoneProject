import React, { Component, ReactNode } from 'react';
import icon from './3274156.png';
import './App.css';
import { Button, Stack } from 'react-bootstrap';
import { render, screen } from '@testing-library/react';

import 'bootstrap/dist/css/bootstrap.min.css';

import root from './index';
import { useWindowDimensions } from './windowutils';

import { StackDirection } from 'react-bootstrap/esm/Stack';
import { JsxElement } from 'typescript';

export function App() {
  return (
    <AppBody>
      <BaseLayout>
        <h2 className='p-2'>Hangman</h2>
        <input className='p-2' type="text" placeholder='Name' id='name' />
        <input className='p-2' type="text" placeholder='Password' id='password' />
        <Button className='p-2' id='login_button' variant='success' onClick={onClick}>Login</Button>
      </BaseLayout>
    </AppBody>
  )
}

function onClick(event: React.MouseEvent<HTMLButtonElement>){
  var button = event.currentTarget
  
  root.render(<GameSelection />);

  console.log(button.id);
}

//--

export function GameSelection() {
  return (
    <AppBody>
      <BaseLayout>
        <h2 className='p-2'>Hangman</h2>
        <Button className='p-2' variant='primary'>Easy</Button>
        <Button className='p-2' variant='danger'>Hard</Button>
      </BaseLayout>
    </AppBody>
  )
}

//--

function AppBody(props: {children: ReactNode}) {
  return (
    <div className="App">
      <div className="App-body d-flex h-100 justify-content-center " children={props.children}/>
    </div>
  )
}

function BaseLayout(props: {children: ReactNode}) {
  const { height, width } = useWindowDimensions();

  var columnMode = width < 800;

  return (
    <Stack direction={(columnMode ? 'vertical' : 'horizontal') as StackDirection} gap={10} className='Horizontal-Flow align-self-center'>
      {(columnMode) ? <img src={icon} className='App-icon' alt='icon'/> : null}
      <Stack direction='vertical' gap={3} className='col-md-2.5 p-5 mx-auto w-10 align-self-start' children={props.children}/>
      {(!columnMode) ? <img src={icon} className='App-icon' alt='icon'/> : null}
    </Stack>
  )
}