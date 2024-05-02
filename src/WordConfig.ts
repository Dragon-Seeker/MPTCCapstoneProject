import { reviverForMap, replacerForMap } from "./GeneralUtils";

export class WordData {
    themes: Map<string, Theme> = new Map();
    word_sets: Map<string, WordSet> = new Map();

    constructor(themes: Map<string, Theme>, wordSets: Map<string, WordSet>) {
        this.themes = themes;
        this.word_sets = wordSets;
    }

    public static STORAGE_KEY = "word_data_state";

    public static deleteStorage() {
        localStorage.removeItem(WordData.STORAGE_KEY);
    }

    public static fromStorage() : WordData | null {
        return this.fromString(localStorage.getItem(WordData.STORAGE_KEY));
    }

    public static fromString(stateData: string | null) : WordData | null {
        if(stateData == null) return null;

        try {
            var stateJson = JSON.parse(stateData, reviverForMap);

            return new WordData(new Map(Object.entries(stateJson.themes)), new Map(Object.entries(stateJson.word_sets)));     
        } catch(e: any) {
            console.log("Unable to parse WordData: " + e.message);

            return null;
        }
    }

    public toJSONString() : string {
        try {
            return JSON.stringify(this, replacerForMap);
        } catch(e: any) {
            console.log("Unable to stringify WordData: " + e.message);

            return "{}";
        }
    }

    public toStorage() {
        localStorage.setItem(WordData.STORAGE_KEY, this.toJSONString());
    }
}

export class Theme {
    name: string;
    description: string;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    public static fromObject(themeData: any) : Theme {
        try {
            return new Theme(themeData.name, themeData.description);
        } catch(e: any) {
            console.log("Unable to parse WordData: " + e.message);
            //console.log("Copy of data: " + themeData);

            throw e;
        }
    }
}

export class WordSet {
    static builtinSet: WordSet = new WordSet(
        [ "test", "name", "free", "cool", "book", "caller", "random", "tall", "move" ],
        [ "mouse", "tiger", "keyboard", "calculator", "controller", "computer", "marker", "monitor" ]
    );

    easy: string[] = [];
    hard: string[] = [];

    constructor(easy: Array<string>, hard: Array<string>) {
        this.easy = easy;
        this.hard = hard;
    }

    public static fromObject(wordSetData: any) : WordSet {
        try {
            return new WordSet(wordSetData.easy, wordSetData.hard);
        } catch(e: any) {
            console.log("Unable to parse WordData: " + e.message);
            //console.log("Copy of data: " + wordSetData);

            throw e;
        }
    }
}