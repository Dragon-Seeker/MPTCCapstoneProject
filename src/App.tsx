import React, { Component, ReactElement, ReactNode, TextareaHTMLAttributes } from 'react';
import icon from './3274156.png';
import './App.css';
import { Button, Stack } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'https://kit.fontawesome.com/ddf6e20b43.js';

import { root } from './index';
import { getElementTyped, useWindowDimensions } from './GeneralUtils';
import { HangManGameState, DifficultyMode } from './GameState';

import { StackDirection } from 'react-bootstrap/esm/Stack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as FA_SolidSVG from '@fortawesome/free-solid-svg-icons';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faBackward } from '@fortawesome/free-solid-svg-icons';

import { useState } from 'react';
import { WordData, WordSet } from './WordConfig';

// Create GameLogin page with the name and button for login in
export function GameLogin() {
  return (
    <AppBody>
      <BaseLayout>
        <h2 className='p-2'>Hangman</h2>
        <input className='p-2' type="text" placeholder='Name' id='name' name='game_login_input-name' required={true} onKeyDownCapture={(e) => { if(e.key == "Enter") onLoginEnter((e.currentTarget as HTMLInputElement));}}/>
        {/* <input className='p-2' type="text" placeholder='Password' id='password' name='game_login_input-password' /> */}
        <Button className='p-2' type="submit" id='login_button' variant='success' onClick={(e) => onLoginEnter(e.currentTarget.ownerDocument.getElementsByName("game_login_input-name")[0] as HTMLInputElement)}>Login</Button>
      </BaseLayout>
    </AppBody>
  );
}

// Method used to validate that the input element desired has a valid input before moving to Game Selection
function onLoginEnter(inputElement: HTMLInputElement){
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
  const [wordDataState, setWordDataState] = useState(new Array(WordData.fromStorage()));

  function setState(state: WordData | null) {
    setWordDataState(new Array(state));

    //console.log("Attempting to setState: " + state);
    state?.toStorage();
  }

  function getState() : WordData | null {
    return wordDataState[0];
  }

  var fileData = getState() != null ? setFileFrom(getState()!.toJSONString()) : null;

  var fileDataExists = fileData != null;
  
  //console.log(WordData.fromStorage()?.toJSONString());

  return (
    <AppBody>
      <Button color='blue' size='sm' onClick={onGameModeBackClick} style={{ height: "40px", width: "40px", marginLeft: "20px", marginBottom: "20px" }} className="position-absolute bottom-0 start-0" title="Back to Login!">
        <FontAwesomeIcon icon={faBackward} size='xl' color='white'/>
      </Button>
      <Stack direction='horizontal' style={{ marginRight: "20px", marginBottom: "20px", fontSize: 13 }} className="position-absolute bottom-0 end-0">
        <input type="file" id="xxx" name="xxx" accept=".json,.txt" style={{width: "65px", marginRight: "10px" }} className="position-relative top-90" onChange={(e) => onUploadEvent(e, setState)}/>
        <Button title={(fileDataExists) ? "Download Data: " + fileData?.[1] : ""} variant={fileDataExists ? "info" : "secondary"} onClick={downloadFile} style={{height: "40px", width: "40px"}} disabled={!fileDataExists}>
          <FontAwesomeIcon icon={FA_SolidSVG.faFile} size='lg' color='white' /* className="position-relative top-90 start-50 translate-middle"  *//>
        </Button>
        <a id="link" href={fileData?.[0]} download={fileData?.[1]} hidden={true}>link to your file (upload a file first)</a>
        {/* <p style={{height: "20px", width: "40px"}}>{getState()?.toJSONString()}</p> */}
      </Stack>
      {createThemeSelections(getState())}
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

function createThemeSelections(wordData: WordData | null) {
  var userData = HangManGameState.fromStorage();

  var selectedTheme = userData != null ? userData?.selectedTheme! : "";

  var themes = wordData?.themes != null ? wordData?.themes : new Map();

  console.log("Selected Theme: " + selectedTheme);

  if(!themes.has(selectedTheme)) selectedTheme = "any";

  var children: ReactElement[] = new Array((wordData != null ? themes.size : 0) + 1);

  children[0] = (<option value="any" key="0" /* selected={selectedTheme == ""} */>Any</option>);

  var index: number = 1;

  console.log("Selected Theme: " + selectedTheme);

  themes.forEach((v, k, m) => {
    children[index] = (<option value={k} key={index} /* selected={selectedTheme == k} */>{v.name}</option>);
    index++;
  })
  
  return (
    <Stack id="theme_selection" direction='vertical' style={{fontSize: "16px", marginTop: "2px", marginBottom: "20px"}} className="position-absolute bottom-0 start-50 translate-middle">
      <label htmlFor="themes" style={{marginBottom: "5px"}}>Choose a theme:</label>
      <select name="themes" id="themes" defaultValue={selectedTheme} children={children}/>
    </Stack>
  )
}

function onUploadEvent(event: React.ChangeEvent<HTMLInputElement>, setter: (state: WordData | null) => void) {
  var inputElement = event.target;
  var doc = inputElement.ownerDocument;

  var link = doc.getElementsByTagName('a')[0];

  if(inputElement == null) return;

  var objectURL = link.href;

  if (objectURL) URL.revokeObjectURL(objectURL); // revoke the old object url to avoid using more memory than needed

  const file = inputElement.files![0];
  objectURL = URL.createObjectURL(file);

  var fr = new FileReader();

  fr.onload = function () {
    var data = WordData.fromString(fr.result as string);

    if(data != null) setter(data);

    //console.log(data?.toString());
    //console.log(WordData.fromStorage()?.toJSONString);
  }

  fr.readAsText(file);
  
  link.download = file.name; // this name is used when the user downloads the file
  link.href = objectURL;
}

function setFileFrom(data: string) : [string, string] {
  var blob = new Blob([data], {type: 'text/plain'});

  return [window.URL.createObjectURL(
    new File([blob], 'custom_word_data.json', {type: blob.type})
  ), 'custom_word_data.json'];
}

function downloadFile(event: React.MouseEvent<HTMLButtonElement>) {
  var link = event.currentTarget.ownerDocument.getElementsByTagName('a')[0];

  link.click();
}

// Back function that takes you back to main menu and deletes storage for the game state
function onGameModeBackClick(event: React.MouseEvent<HTMLButtonElement>){
  HangManGameState.deleteStorage();
  localStorage.removeItem("hangman_user_name");
  WordData.deleteStorage();

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

  var currentUser = localStorage.getItem("hangman_user_name");

  if(currentUser == null) {
    // TODO: ADD ERROR INDICATING SOMETHING HAS OCCURRED
    root.render(<GameLogin />);

    return;
  }

  var newGameState = new HangManGameState(currentUser, selectedMode);

  var themeElement: HTMLSelectElement = getElementTyped("themes", button);

  console.log("Selected options index: " + themeElement.selectedIndex);
  console.log("Options Size: " + themeElement.selectedOptions.length)
  console.log("Children Elements: " + themeElement.children.length);

  var selectedTheme = themeElement.selectedOptions[0];

  newGameState.setSelectedTheme(selectedTheme.value);

  newGameState.setWordFromTheme();
  // newGameState.setNewWordFromArray(words);

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

    var currentGuess = textArea.value.toLowerCase();

    if(state.getCurrentCondition() != 0 || (!currentGuess.replace(/\s/g, '').length)) {
      return;
    }
  
    if(state.currentWord?.toLowerCase() != currentGuess) {
      state.numberOfGuesses += 1;
    } else {
      state.guessResults = state.currentWord;
    }
  
    setState(state);
  }
  
  // Helper function to reset the game by setting a new word and setting the state
  function resetGame(event: React.MouseEvent<HTMLButtonElement>) {
    var state = getState();

    state.setWordFromTheme();
    //state.setNewWordFromArray(words);
    setState(state);
  }

  // Method to build the temp message for game over information
  function GameEndElement() {
    var winCondition = getState()!.getCurrentCondition();

    return (winCondition == 0) ? null : (<h3>Gameover, You {(winCondition == 1) ? "Lose" : "Win"}!</h3>);
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
          <h3 className='position-absolute top-0 start-50 translate-middle' style={{ marginTop: "60px"}}> 
            {getState()!.guessesLeft()} remaining guesses!
          </h3>
          <div /* style={{height: "300px", width: "300px"}} */>
            <canvas width={300} height={300} ref={(e) => {renderHangmanCanvas(e, getState()!)}}>
            </canvas>
          </div>
          <h1 style={{ marginBottom: "20px", marginTop: "20px", letterSpacing: "3px"}}> 
            {/* Guessing Result:  */}{getState().getCurrentCondition() == 1 ? getState().currentWord : getState()!.guessResults} 
          </h1>
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

// Main method to render the hangman in a HTML canvas element
function renderHangmanCanvas(e: HTMLCanvasElement | null, state: HangManGameState) {
  if(e == null) return;

  var ctx = e?.getContext('2d')!;
  
  ctx.clearRect(0, 0, e.width, e.height);

  var centerX = e.width / 2;
  var centerY = e.height / 2;

  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "black";

  var shownParts = new Array<String>();
  var amountGuess = state.numberOfGuesses; 

  if(state.getCurrentCondition() != 0) {
    amountGuess = state.currentMode.maxNumberOfGuess
  }

  if(state.currentMode == DifficultyMode.EASY) {
    if(amountGuess > 0) shownParts.push("head");
    if(amountGuess > 1) shownParts.push("body");
    if(amountGuess > 2) shownParts.push("left_arm");
    if(amountGuess > 3) shownParts.push("right_arm");
    if(amountGuess > 4) shownParts.push("left_leg");
    if(amountGuess > 5) shownParts.push("right_leg");
    if(amountGuess > 6) shownParts.push("mouth");
    if(amountGuess > 7) shownParts.push("eyes");
  } else {
    if(amountGuess > 0) {
      shownParts.push("head");
      shownParts.push("body");
    }
    if(amountGuess > 1) {
      shownParts.push("left_arm");
      shownParts.push("right_arm");
    }
    if(amountGuess > 2) {
      shownParts.push("left_leg");
      shownParts.push("right_leg");
    }
    if(amountGuess > 3) {
      shownParts.push("mouth");
      shownParts.push("eyes");
    }
  }

  { // Dev Box
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, e.height);
    ctx.lineTo(e.width, e.height);
    ctx.lineTo(e.width, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  ctx.strokeStyle = "#4f607d"; // color
  ctx.fillStyle = "#4f607d";

  var centerHeadX = centerX;
  var centerHeadY = centerY - 50;

  if(shownParts.includes("head")) { // Head
    ctx.beginPath();
    //ctx.fillStyle = "#0000ff"; // #ffe4c4
    ctx.arc(centerHeadX, centerHeadY, 25, 0, Math.PI * 2); 
    ctx.fill();
  }

  if(shownParts.includes("body")) { // Body
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 50);
    ctx.lineTo(centerX, centerY + 60);
    ctx.lineWidth = 10;
    // ctx.strokeStyle = "navy";
    ctx.stroke();
  }

  {
    ctx.beginPath();
    // ctx.strokeStyle = "pink"; 
    if(shownParts.includes("right_arm")) { //Left Arm
      ctx.moveTo(centerX, centerY - 20);
      ctx.lineTo(centerX + 50, centerY);
    }
    if(shownParts.includes("left_arm")) { //Right Arm
      ctx.moveTo(centerX, centerY - 20);
      ctx.lineTo(centerX - 50, centerY);
    }
    ctx.stroke();
  }
    

  { // Legs
    var startY = centerY + 100;

    ctx.beginPath();
    // ctx.strokeStyle = "pink"; 
    if(shownParts.includes("right_leg")) { //Left leg
      ctx.moveTo(centerX, startY - 45);
      ctx.lineTo(centerX + 40, startY);
    }
    if(shownParts.includes("left_leg")) { //Right Leg
      ctx.moveTo(centerX, startY - 45);
      ctx.lineTo(centerX - 40, startY);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "black";

  if(state.getCurrentCondition() == 2){
     { // Derpy Face
      var centerHeadX = centerX;
      var centerHeadY = centerY - 50;
      ctx.beginPath();
      ///ctx.strokeStyle = "blue"; // color
      ctx.lineWidth = 2;
      ctx.arc(centerHeadX, centerHeadY, 18,  Math.PI / 6, Math.PI * (5 / 6), false); // draw semicircle for smiling
      ctx.stroke();

      ctx.beginPath();
      //ctx.fillStyle = "green"; // color
      ctx.arc(centerHeadX - 20, centerHeadY, 3, 0, Math.PI * 2, true); // draw left eye
      ctx.fill();
      ctx.arc(centerHeadX + 20, centerHeadY, 3, 0, Math.PI * 2, true); // draw right eye
      ctx.fill();
    } 
  } else {
    if(shownParts.includes("mouth")) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.translate(centerHeadX, centerHeadY);
      ctx.rotate(180 * Math.PI / 180);
      ctx.arc(0, -25, 18,  Math.PI / 6, Math.PI * (5 / 6), false); // draw semicircle for smiling
      ctx.stroke();
  
      ctx.resetTransform();
      // ctx.beginPath();
      // ctx.arc(centerHeadX - 13, centerHeadY - 4, 3, 0, Math.PI * 2, true); // draw left eye
      // ctx.fill();
      // ctx.arc(centerHeadX + 13, centerHeadY - 4, 3, 0, Math.PI * 2, true); // draw right eye
      // ctx.fill();
    }
  
    if(shownParts.includes("eyes")) {
      {
        var eyeCenterX = centerHeadX - 13;
        var eyeCenterY = centerHeadY - 4;
  
        ctx.beginPath();
        var size = 5;
        ctx.moveTo(eyeCenterX - size, eyeCenterY - size);
        ctx.lineTo(eyeCenterX + size, eyeCenterY + size);
        ctx.moveTo(eyeCenterX + size, eyeCenterY - size);
        ctx.lineTo(eyeCenterX - size, eyeCenterY + size);
        ctx.stroke();
      }
  
      {
        var eyeCenterX = centerHeadX + 13;
        var eyeCenterY = centerHeadY - 4;
  
        ctx.beginPath();
        var size = 5;
        ctx.moveTo(eyeCenterX - size, eyeCenterY - size);
        ctx.lineTo(eyeCenterX + size, eyeCenterY + size);
        ctx.moveTo(eyeCenterX + size, eyeCenterY - size);
        ctx.lineTo(eyeCenterX - size, eyeCenterY + size);
        ctx.stroke();
      }
    }
  }

  //context.fillRect(20, 20, 80, 80);
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
    <div className="App" /* style={{minHeight: "750px", minWidth: "400px"}} */>
      <div className="App-body d-flex h-100 justify-content-center" children={props.children}/>
    </div>
  )
}

// Helper method used for layout of login and selection screens
function BaseLayout(props: {children: ReactNode}) {
  const { height, width } = useWindowDimensions();

  var columnMode = width < 800;

  var heightToSmall = height > 650;

  return (
    <Stack direction={(columnMode ? 'vertical' : 'horizontal') as StackDirection} gap={10} className='Horizontal-Flow align-self-center'>
      {(columnMode && heightToSmall) ? <img src={icon} className='App-icon' alt='icon'/> : null}
      <Stack direction='vertical' gap={3} className='col-md-2.5 p-5 mx-auto w-10 align-self-start' children={props.children}/>
      {(!columnMode && heightToSmall) ? <img src={icon} className='App-icon' alt='icon'/> : null}
    </Stack>
  )
}