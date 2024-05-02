import { reviverForMap, replacerForMap } from "./GeneralUtils";
import { WordData, WordSet } from "./WordConfig";

export class HangManGameState {
    public static STORAGE_KEY = "hangman_game_state";

    userName: String;

    currentMode: DifficultyMode;
    currentWord: string | null = null;

    guessResults: string = "";
    guessedLetters: Map<string, number> = new Map();

    numberOfGuesses: number = 0;

    selectedTheme: string | null = null;

    constructor(userName: String, currentMode : DifficultyMode){
        this.userName = userName;
        this.currentMode = currentMode;
    }

    public wordHasBeenSelected() : Boolean {
        return this.currentWord == null;
    }

    public guessesLeft() : number {
        return this.currentMode.maxNumberOfGuess - this.numberOfGuesses;
    }

    public getGuessedLetterState(letter: string) : number {
        return this.guessedLetters.has(letter) ? this.guessedLetters.get(letter)! : (this.getCurrentCondition() != 0 ? 1 : 0);
    }

    public getCurrentCondition() {
        var outOfGuess = this.guessesLeft() == 0;
        var hasWon = this.currentWord == this.guessResults;

        if(outOfGuess || hasWon) {
            if(outOfGuess && !hasWon) {
                return 1;
            } else {
                return 2;
            }
        }

        return 0;
    }

    public setSelectedTheme(theme: string) {
        this.selectedTheme = theme;

        console.log(theme);
    }

    public getWordSet(): WordSet {
        var wordData = WordData.fromStorage();

        if(this.selectedTheme != null && wordData != null && wordData!.word_sets.has(this.selectedTheme)) {
            return wordData?.word_sets.get(this.selectedTheme)!;
        }

        return WordSet.builtinSet
    }

    public setWordFromTheme() {
        var wordSet = this.getWordSet();
        
        var words: Array<string> | null = null;

        words = (this.currentMode == DifficultyMode.EASY) ? wordSet.easy :wordSet.hard;

        if (words == null || words.length == 0) words = wordSet.easy;
        if (words == null || words.length == 0) words = wordSet.hard;

        if(words == null || words.length == 0) {
            words = (this.currentMode == DifficultyMode.EASY) ? WordSet.builtinSet.easy : WordSet.builtinSet.hard;
        }

        this.setNewWordFromArray(words);
    }

    public setNewWordFromArray(words: string[]) {
        this.setNewWord(() => words[this.randomInt(0, words.length)])
    }

    public randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public setNewWord(func: () => string ) {
        this.currentWord = func();
    
        var guessingWord = "";
    
        for (let index = 0; index < this.currentWord.length; index++) {
            guessingWord = guessingWord.concat("_");
        }
    
        this.guessResults = guessingWord;
    
        this.numberOfGuesses = 0;
    
        this.guessedLetters = new Map();
    
        this.toStorage();
    }

    public static deleteStorage() {
        localStorage.removeItem(HangManGameState.STORAGE_KEY);
    }

    public static fromStorage() : HangManGameState | null {
        var stateData = localStorage.getItem(HangManGameState.STORAGE_KEY);

        if(stateData == null) return null;

        var stateJson: any;

        try {
            stateJson = JSON.parse(stateData, reviverForMap);
        } catch(e: any) {
            console.log(e);

            return null;
        }

        var stateObject = new HangManGameState(stateJson.userName, stateJson.currentMode);       

        stateObject.selectedTheme = stateJson.selectedTheme;

        stateObject.currentWord = stateJson.currentWord;

        stateObject.guessResults = stateJson.guessResults;
        stateObject.guessedLetters = stateJson.guessedLetters;

        stateObject.numberOfGuesses = stateJson.numberOfGuesses;

        return stateObject;
    }

    public toStorage() {
        localStorage.setItem(HangManGameState.STORAGE_KEY, JSON.stringify(this, replacerForMap));
    }
}

export class DifficultyMode {
    static EASY: DifficultyMode = new DifficultyMode(8);
    static HARD: DifficultyMode = new DifficultyMode(4);

    maxNumberOfGuess: number;

    constructor(maxNumberOfGuess: number){
        this.maxNumberOfGuess = maxNumberOfGuess;
    }
}