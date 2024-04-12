import React, { Component, ReactElement, ReactNode } from 'react';
import icon from './3274156.png';
import './App.css';
import { Button, Stack } from 'react-bootstrap';
import { render, screen } from '@testing-library/react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'https://kit.fontawesome.com/ddf6e20b43.js';

import root from './index';
import { useWindowDimensions } from './windowutils';
import { HangManGameState, DifficultyMode } from './gameState';

import { StackDirection } from 'react-bootstrap/esm/Stack';
import { JsxElement } from 'typescript';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, IconLookup, IconName, IconPrefix } from '@fortawesome/free-regular-svg-icons';
import { faA } from '@fortawesome/free-solid-svg-icons';
import * as FA_SolidSVG from '@fortawesome/free-solid-svg-icons';
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core';

export function GameLogin() {
  var test = (
    <AppBody>
      <BaseLayout>
        <h2 className='p-2'>Hangman</h2>
        <input className='p-2' type="text" placeholder='Name' id='name' name='game_login_input-name' required={true}/>
        {/* <input className='p-2' type="text" placeholder='Password' id='password' name='game_login_input-password' /> */}
        <Button className='p-2' type="submit" id='login_button' variant='success' onClick={onLoginClick}>Login</Button>
      </BaseLayout>
    </AppBody>
  );

  return test;
}

function onLoginClick(event: React.MouseEvent<HTMLButtonElement>){
  var button = event.currentTarget

  var nameElement =  button.ownerDocument.getElementsByName("game_login_input-name")[0];

  console.log(nameElement);

  var inputElement = nameElement as HTMLInputElement;

  if(!inputElement.checkValidity()) {
    inputElement.reportValidity();
    return;
  }

  sessionStorage.setItem("hangman_user_name", inputElement.value);

  root.render(<GameSelection />);

  console.log(button.id);
}

//--

export function GameSelection() {
  return (
    <AppBody>
      <BaseLayout>
        <h2 className='p-2'>Hangman</h2>
        <Button className='p-2' variant='success' name='easy' onClick={onGameModeClick}>Easy</Button>
        <Button className='p-2' variant='danger' name='hard' onClick={onGameModeClick}>Hard</Button>
      </BaseLayout>
    </AppBody>
  )
}

function onGameModeClick(event: React.MouseEvent<HTMLButtonElement>){
  var button = event.currentTarget;

  var selectedMode = DifficultyMode.EASY;

  if(button.name == "hard") selectedMode = DifficultyMode.HARD;

  var currentUser = sessionStorage.getItem("hangman_user_name");

  if(currentUser == null) {
    // TODO: ADD ERROR INDICATING SOMETHING HAS OCCURRED
    root.render(<GameLogin />);

    return;
  }

  var gameState = new HangManGameState(currentUser, selectedMode);

  gameState.toSession();

  root.render(<GamePlay />);
}

//--

export function GamePlay() {
  return (
    <div>
      <AppBody>
        <Button color='blue' size='sm' onClick={onGamePlayBackClick} style={{ height: "40px", width: "40px", marginLeft: "20px", marginBottom: "20px" }} className="position-absolute bottom-0 start-0" title="Back to Signin!">
          <FontAwesomeIcon icon={faCircleXmark} size='xl' color='white'/>
        </Button>
        <div className='Horizontal-Flow align-self-center'>
          <h2>
            WIP GAME PLAYER SPACE!
          </h2>
          <MainButtonGrid/>
        </div>
      </AppBody>
    </div>
  )
}

function onGamePlayBackClick(event: React.MouseEvent<HTMLButtonElement>){
  // TODO: Should be mode selection?
  root.render(<GameLogin />);
}

const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
const svgIcons = [FA_SolidSVG["faA"], FA_SolidSVG["faB"], FA_SolidSVG["faC"], FA_SolidSVG["faD"], FA_SolidSVG["faE"], FA_SolidSVG["faF"], FA_SolidSVG["faG"], FA_SolidSVG["faH"], FA_SolidSVG["faI"], FA_SolidSVG["faJ"], FA_SolidSVG["faK"], FA_SolidSVG["faL"], FA_SolidSVG["faM"], FA_SolidSVG["faN"], FA_SolidSVG["faO"], FA_SolidSVG["faP"], FA_SolidSVG["faQ"], FA_SolidSVG["faR"], FA_SolidSVG["faS"], FA_SolidSVG["faT"], FA_SolidSVG["faU"], FA_SolidSVG["faV"], FA_SolidSVG["faW"], FA_SolidSVG["faX"], FA_SolidSVG["faY"], FA_SolidSVG["faZ"]];

function MainButtonGrid() {
  var elements : ReactElement[] = new Array(alphabet.length)

  const { height, width } = useWindowDimensions();

  var buttonSize = width < 800 ? "30px" : "40px";
  var iconSize = width < 800 ? "sm" : "lg";
  var iconYPos = width < 800 ? "40" : "50";
  
  alphabet.forEach((entry, index) => {
    elements[index] = (
      <Button className='Horizontal-Flow align-self-center' onClick={(event) => onLetterButtonClick(event, index)} variant='success' style={{ height: buttonSize, width: buttonSize, margin: "6px"}} key={index}>
        <FontAwesomeIcon icon={svgIcons[index]} size={iconSize as SizeProp} className={`position-relative top-${iconYPos} start-50 translate-middle`}/>
      </Button>
    )
  });
  
  if(width < 800) {
    var rowElements : ReactElement[] = new Array(4)
  
    var chuckSize = 9;

    for(let i = 0; i < 3; i++) {
      var rowChildren = elements.slice(i * chuckSize, Math.min((i + 1) * chuckSize, alphabet.length));

      rowElements[i] = (<div className="row" children={rowChildren} key={i}/>)
    }
  
    return (<div className="col align-middle" children={rowElements}/>)
  } else {
    var middlePoint = elements.length / 2;

    var topRow = elements.slice(0, middlePoint);
    var bottomRow = elements.slice(middlePoint, elements.length);
  
    return (
      <div className="col">
        <div className="row" children={topRow}/>
        <div className="row" children={bottomRow}/>
      </div>
    )
  }
}

function onLetterButtonClick(event: React.MouseEvent<HTMLButtonElement>, index: number){
  console.log(alphabet[index] + " was just pressed!");
}

//--

function AppBody(props: {children: ReactNode}) {
  return (
    <div className="App">
      <div className="App-body d-flex h-100 justify-content-center" children={props.children}/>
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