import React, { Component, ReactElement, ReactNode, TextareaHTMLAttributes } from 'react';
import icon from './3274156.png';
import './App.css';
import { Button, Stack } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'https://kit.fontawesome.com/ddf6e20b43.js';

import { root } from './index';
import { useWindowDimensions } from './windowutils';
import { HangManGameState, DifficultyMode } from './gameState';

import { StackDirection } from 'react-bootstrap/esm/Stack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as FA_SolidSVG from '@fortawesome/free-solid-svg-icons';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faBackward } from '@fortawesome/free-solid-svg-icons';

import { useState } from 'react';

// Create GameLogin page with the name and button for login in
export function GameLogin() {
  return (
    <AppBody>
      <BaseLayout>
        <h2 className='p-2'>Hangman</h2>
        <input className='p-2' type="text" placeholder='Name' id='name' name='game_login_input-name' required={true}/>
        {/* <input className='p-2' type="text" placeholder='Password' id='password' name='game_login_input-password' /> */}
        <Button className='p-2' type="submit" id='login_button' variant='success' onClick={onLoginClick}>Login</Button>
      </BaseLayout>
    </AppBody>
  );
}

// Method used to validate that the input element desired has a valid input before moving to Game Selection
function onLoginClick(event: React.MouseEvent<HTMLButtonElement>){
  var button = event.currentTarget

  var inputElement = button.ownerDocument.getElementsByName("game_login_input-name")[0] as HTMLInputElement;

  if(!inputElement.checkValidity()) {
    inputElement.reportValidity();
    return;
  }

  localStorage.setItem("hangman_user_name", inputElement.value);

  root.render(<GameSelection />);
}

//--

// method used to create the game selection screen with the choices being easy or hard
export function GameSelection() {
  return (
    <AppBody>
      <Button color='blue' size='sm' onClick={onGameModeBackClick} style={{ height: "40px", width: "40px", marginLeft: "20px", marginBottom: "20px" }} className="position-absolute bottom-0 start-0" title="Back to Login!">
        <FontAwesomeIcon icon={faBackward} size='xl' color='white'/>
      </Button>
      <BaseLayout>
        <h2 className='p-2'>Hangman</h2>
        <Button className='p-2' variant='success' name='easy' onClick={onGameModeClick}>Easy</Button>
        <Button className='p-2' variant='danger' name='hard' onClick={onGameModeClick}>Hard</Button>
        <div className=''/>
        {
          (HangManGameState.fromStorage()?.currentWord != null) ? <Button className='p-2' variant='secondary' name='continue' onClick={onGameModeContinueClick}>Continue</Button> : null
        }
      </BaseLayout>
    </AppBody>
  )
}

// Back function that takes you back to main menu and deletes storage for the game state
function onGameModeBackClick(event: React.MouseEvent<HTMLButtonElement>){
  HangManGameState.deleteStorage();
  localStorage.removeItem("hangman_user_name");

  root.render(<GameLogin />);
}

// Method to return to a game saved in storage
function onGameModeContinueClick(event: React.MouseEvent<HTMLButtonElement>){
  var currentUser = localStorage.getItem("hangman_user_name");

  if(currentUser == null) {
    // TODO: ADD ERROR INDICATING SOMETHING HAS OCCURRED
    root.render(<GameLogin />);

    return;
  }

  root.render(<GamePlay passedGameState={HangManGameState.fromStorage()!}/>);
}

// Method used when a game mode is selected and the game state will be setup and passed to the main game render object
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

  var newGameState = new HangManGameState(currentUser, selectedMode);

  newGameState.setNewWordFromArray(words);

  root.render(<GamePlay passedGameState={newGameState}/>);
}

//--

const words : string[] = ["test", "word", "name"]

// Main method used to setup state manipulation for the game state and layout the rendering for the game
export function GamePlay(props: {passedGameState: HangManGameState}) {
  const [currentGameState, setCurrentGameState] = useState(new Array(props['passedGameState']));

  function setState(state: HangManGameState) {
    setCurrentGameState(new Array(state));

    state.toStorage();
  }

  function getState() : HangManGameState {
    return currentGameState[0];
  }
  
  // Method used to check if the given text area on a enter is the current word or not
  function onTextAreaEnter(textArea: HTMLInputElement) {
    var state = getState();

    if(state.getCurrentCondition() != 0) {
      return;
    }
  
    if(state.currentWord?.toLowerCase() != textArea.value.toLowerCase()) {
      state.numberOfGuesses += 1;
    } else {
      state.guessResults = state.currentWord;
    }
  
    setState(state);
  }
  
  // Helper function to reset the game by setting a new word and setting the state
  function resetGame(event: React.MouseEvent<HTMLButtonElement>) {
    var state = getState();

    state.setNewWordFromArray(words);
    setState(state);
  }

  // Method to build the temp message for game over information
  function GameEndElement() {
    var winCondition = getState()!.getCurrentCondition();

    var elements : ReactElement[] = new Array(alphabet.length)

    if(winCondition == 1) {
      elements.push((<h3 key={0}>Gameover, You Lose!</h3>));
      elements.push((<h3 key={1}>The word was: {getState().currentWord}</h3>));
    } else if(winCondition == 2) {
      elements.push((<h3 key={0}>Gameover, You Win!</h3>));
    }

    return (<div children={elements}/>)
  }

  return (
    <div>
      <AppBody>
        <Button size='sm' onClick={(e) => root.render(<GameSelection />)} style={{ height: "40px", width: "40px", marginLeft: "20px", marginBottom: "20px" }} className="position-absolute bottom-0 start-0" title="Back to Mode Selection!">
          <FontAwesomeIcon icon={faBackward} size='xl' color='white'/>
        </Button>
        <Button variant='warning' size='sm' onClick={resetGame} style={{ height: "40px", width: "40px", marginRight: "20px", marginBottom: "20px"}} className="position-absolute bottom-0 end-0" title="Reset from beginning">
          <FontAwesomeIcon icon={FA_SolidSVG.faRotateRight} size='xl' color='white'/>
        </Button>
        <div className='Horizontal-Flow align-self-center align-content-center justify-content-center'>
          <GameEndElement/>
          <h2 style={{ margin: "40px" }}> Guessing Result: {getState()!.guessResults} </h2>
          <h3> Number Of Guess Left: {getState()!.guessesLeft()} </h3>
          <div className='d-flex justify-content-center align-middle' style={{ height: "40px", margin: "10px"}}>
            <input name='word_guess_input' onKeyDownCapture={(e) => { if(e.key == "Enter") onTextAreaEnter((e.currentTarget as HTMLInputElement));}} style={{ height: "40px", marginRight: "10px"}} disabled={(getState().getCurrentCondition() != 0)} ref={e => {if(e != null && getState().getCurrentCondition() != 0) e!.value = ""}}/>
            <Button className='p-2' type="submit" id='enter_button' variant={(getState().getCurrentCondition() != 0) ?  'secondary' : 'success'} style={{ height: "40px"}} onClick={(e) => onTextAreaEnter(e.currentTarget.ownerDocument.getElementsByName("word_guess_input")[0] as HTMLInputElement)}>Guess</Button>
          </div>
          <MainButtonGrid state={getState()}  setter={setState}/>
        </div>
      </AppBody>
    </div>
  )
}

const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
const svgIcons = [FA_SolidSVG["faA"], FA_SolidSVG["faB"], FA_SolidSVG["faC"], FA_SolidSVG["faD"], FA_SolidSVG["faE"], FA_SolidSVG["faF"], FA_SolidSVG["faG"], FA_SolidSVG["faH"], FA_SolidSVG["faI"], FA_SolidSVG["faJ"], FA_SolidSVG["faK"], FA_SolidSVG["faL"], FA_SolidSVG["faM"], FA_SolidSVG["faN"], FA_SolidSVG["faO"], FA_SolidSVG["faP"], FA_SolidSVG["faQ"], FA_SolidSVG["faR"], FA_SolidSVG["faS"], FA_SolidSVG["faT"], FA_SolidSVG["faU"], FA_SolidSVG["faV"], FA_SolidSVG["faW"], FA_SolidSVG["faX"], FA_SolidSVG["faY"], FA_SolidSVG["faZ"]];

// Method used to build out the button panel from the given alphabet
function MainButtonGrid(props: {state: HangManGameState, setter: (state: HangManGameState) => void}) {
  const { height, width } = useWindowDimensions();

  var state = props['state'];
  var setter = props['setter'];

  var buttonSize = width < 800 ? "30px" : "40px";
  var iconSize = width < 800 ? "sm" : "lg";
  var iconYPos = width < 800 ? "40" : "50";

  var elements : ReactElement[] = new Array(alphabet.length)
  
  alphabet.forEach((entry, index) => {
    elements[index] = (
      <Button className='Horizontal-Flow align-self-center' onClick={(event) => onLetterButtonClick(event, index, state, setter)} variant={variantType(entry, state)} style={{ height: buttonSize, width: buttonSize, margin: "6px"}} key={index}>
        <FontAwesomeIcon icon={svgIcons[index]} size={iconSize as SizeProp} className={`position-relative top-${iconYPos} start-50 translate-middle`}/>
      </Button>
    )
  });
  
  // Attempt to check if the width is to small for the logger and if so use the more compressed version
  if(width < 800) {
    var rowElements : ReactElement[] = new Array(4)
  
    var chuckSize = 9;

    for(let i = 0; i < 3; i++) {
      var rowChildren = elements.slice(i * chuckSize, Math.min((i + 1) * chuckSize, alphabet.length));

      rowElements[i] = (<div className="row align-content-center justify-content-center" children={rowChildren} key={i}/>)
    }
  
    return (<div className="col align-middle justify-content-center" children={rowElements}/>)
  } else {
    var middlePoint = elements.length / 2;

    var topRow = elements.slice(0, middlePoint);
    var bottomRow = elements.slice(middlePoint, elements.length);
  
    return (
      <div className="col align-middle justify-content-center">
        <div className="row" children={topRow}/>
        <div className="row" children={bottomRow}/>
      </div>
    )
  }
}

// Method used to check the variant type that a button should be rendered based on the character and game state
function variantType(character: string, state: HangManGameState){
  var characterState = state.getGuessedLetterState(character);

  if(characterState == 1) {
    return 'secondary'
  } else if(characterState == 2) {
    return 'danger'
  } else if(characterState == 3){
    return 'info';
  }

  return 'success';
}

/**
   * Method used by the letter buttons to check various things about the letter or game state:
   *  1: Has been guessed before, if so break out
   *  2: The game is in a game over condition, if so break out
   *  3: If the letter is contained within the current word, if so set the guess word with the letter or else increment guess counter
   */
function onLetterButtonClick(event: React.MouseEvent<HTMLButtonElement>, index: number, state: HangManGameState, setState: (state: HangManGameState) => void){
  var selectChar = alphabet[index];

  if(state.getGuessedLetterState(selectChar) != 0 || state.getCurrentCondition() != 0) return;

  var currentWord = state.currentWord!;

  var guessedChars = new Map<number, string>();

  for (let index = 0; index < currentWord.length; index++) {
    const element = currentWord[index];

    if(element.toLowerCase() == selectChar.toLowerCase()) {
      guessedChars.set(index, element);
    }
  }

  if(guessedChars.size == 0) {
    state.guessedLetters.set(selectChar, 2);

    state.numberOfGuesses += 1;
  } else {
    state.guessedLetters.set(selectChar, 3);

    var result = state.guessResults;

    guessedChars.forEach((v, k) => result = setCharAt(result, k, v));

    state.guessResults = result;
  }

  setState(state);
}

// Method used to replace character within a string via a given index and character
function setCharAt(str: string, index: number, chr: string) {
  if(index > str.length - 1) return str;

  return str.substring(0, index) + chr + str.substring(index + 1);
}

//--

// Helper method used to setup the main app body for theming purposes
function AppBody(props: {children: ReactNode}) {
  return (
    <div className="App">
      <div className="App-body d-flex h-100 justify-content-center" children={props.children}/>
    </div>
  )
}

// Helper method used for layout of login and selection screens
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