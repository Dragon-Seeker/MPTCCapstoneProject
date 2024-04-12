export class HangManGameState {
    public static SESSION_STORAGE_KEY = "hangman_game_state";

    userName: String;

    currentMode: DifficultyMode;
    currentWord: String | null = null;

    guessResults: string = "";
    guessedLetters: String[] = [];

    numberOfGuesses: number = 0;

    constructor(userName: String, currentMode : DifficultyMode){
        this.userName = userName;
        this.currentMode = currentMode;
    }

    public wordHasBeenSelected() : Boolean {
        return this.currentWord == null;
    }

    public static fromSession() : HangManGameState | null {
        var stateData = sessionStorage.getItem(HangManGameState.SESSION_STORAGE_KEY);

        if(stateData == null) return null;

        var stateJson = JSON.parse(stateData);

        var stateObject = new HangManGameState(stateJson.userName, stateJson.currentMode);

        stateObject.currentWord = stateJson.currentWord;

        return stateObject;
    }

    public toSession() {
        sessionStorage.setItem(HangManGameState.SESSION_STORAGE_KEY, JSON.stringify(this));
    }
}

export enum DifficultyMode {
    EASY,
    HARD
}