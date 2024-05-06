import { getThemeWordSet } from "./DatabaseAccess";
import { reviverForMap, replacerForMap } from "./GeneralUtils";
import { WordData, WordSet } from "./WordConfig";

// Main state class for the hangman game
export class HangManGameState {
    public static STORAGE_KEY = "hangman_game_state";

    userName: string;

    currentMode: DifficultyMode;
    currentWord: string | null = null;

    guessResults: string = "";
    guessedLetters: Map<string, number> = new Map();

    numberOfGuesses: number = 0;

    selectedTheme: string | null = null;

    constructor(userName: string, currentMode : DifficultyMode){
        this.userName = userName;
        this.currentMode = currentMode;
    }

    // Check if the given word has been selected or not based on if its null
    public wordHasBeenSelected() : Boolean {
        return this.currentWord == null;
    }

    // Calculate guesses left based on the modes difficulty subtracted by the users guesses so far
    public guessesLeft() : number {
        return this.currentMode.maxNumberOfGuess - this.numberOfGuesses;
    }

    // return a number indicating if the letter has been guessed and if such is correct or not
    public getGuessedLetterState(letter: string) : number {
        return this.guessedLetters.has(letter) ? this.guessedLetters.get(letter)! : (this.getCurrentCondition() != 0 ? 1 : 0);
    }

    // return a number indicating the game state either if such has yet to be over either lose or win
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
    }

    private static lastDBWordSet: [string, Date, WordSet] | null = null;

    // Async function used to get the word set either from locally imported word data or from the datebase though the backend 
    public async getWordSet(): Promise<WordSet> {
        var wordData = WordData.fromStorage();

        if(this.selectedTheme != null) {
            if (wordData != null && wordData!.word_sets.has(this.selectedTheme)) {
                return wordData?.word_sets.get(this.selectedTheme)!;
            } 

            var lastDBWordSet = HangManGameState.lastDBWordSet;

            if(lastDBWordSet != null && lastDBWordSet[0] == this.selectedTheme) {
                //console.log(lastDBWordSet);

                var currentTime = new Date().getTime();

                if((currentTime - lastDBWordSet[1].getTime()) / 1000 < 60) {
                    var cachedDbWords = lastDBWordSet[2];

                    return cachedDbWords;
                }
            }

            console.log("Attempting to get themes from db instead of cache");

            var dbWords = await getThemeWordSet(this.selectedTheme);
        
            if (dbWords != null) {
                HangManGameState.lastDBWordSet = [this.selectedTheme, new Date(), dbWords];

                return dbWords;
            }
        }

        return WordSet.builtinSet
    }

    // Function used to set the word from the given selected theme from the main get word method
    public async setWordFromTheme() {
        var wordSet = await this.getWordSet();
        
        var words: Array<string> | null = null;
        var isEasy = this.currentMode == DifficultyMode.EASY;

        words = (isEasy) ? wordSet.easy :wordSet.hard;

        if (words == null || words.length == 0) words = wordSet.easy;
        if (words == null || words.length == 0) words = wordSet.hard;

        if(words == null || words.length == 0) {
            words = (isEasy) ? WordSet.builtinSet.easy : WordSet.builtinSet.hard;
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

    private static alphabet : string[] = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

    // Calculate the given score from the given game state
    public getCurrentWordScore() : number {
        if(this.getCurrentCondition() == 1 || this.currentWord == null) return 0;

        var selectedWord = this.currentWord!.toUpperCase();
        var isEasy = this.currentMode == DifficultyMode.EASY;

        var uniqueCharTotals = HangManGameState.alphabet.filter(char => selectedWord.includes(char)).length;
        
        return Math.round(uniqueCharTotals * (isEasy ? 5 : 9) * (this.guessesLeft() / this.currentMode.maxNumberOfGuess)) + (this.guessesLeft() * (isEasy ? 3 : 6));
    }

    // Delete the currently stored gamestate from localstorage
    public static deleteStorage() {
        localStorage.removeItem(HangManGameState.STORAGE_KEY);
    }

    // Get the currently stored gamestate from localstorage if it exists
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
        stateObject.guessedLetters = new Map(Object.entries(stateJson.guessedLetters));

        stateObject.numberOfGuesses = stateJson.numberOfGuesses;

        return stateObject;
    }

    // Save the given hangman state instance to local storage
    public toStorage() {
        localStorage.setItem(HangManGameState.STORAGE_KEY, JSON.stringify(this, replacerForMap));
    }
}

export class DifficultyMode {
    static EASY: DifficultyMode = new DifficultyMode("easy", 8);
    static HARD: DifficultyMode = new DifficultyMode("hard", 4);

    name: string;
    maxNumberOfGuess: number;

    constructor(name: string, maxNumberOfGuess: number){
        this.name = name;
        this.maxNumberOfGuess = maxNumberOfGuess;
    }

    public toString() : string {
        return this.name;
    }
}