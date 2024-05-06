import { DifficultyMode, HangManGameState } from "./GameState";
import { getTimeDiffCurrent, reviverForMap } from "./GeneralUtils";
import { Theme, WordSet } from "./WordConfig";

const serverTarget = require("./server_target.json").server_target;

//Below is code to have a time based cache for a given value with the ability for the given passed functions to be scaled dynamically 
type ASYNC_DYNAMIC_FN<RETURN_TYPE extends any> = (...args: any[]) => Promise<RETURN_TYPE>;
type ASYNC_DYNAMIC_FN_WITH_PARAM<PARAM_1 extends any, PARENT_FN extends ASYNC_DYNAMIC_FN<any>, RETURN_TYPE extends any> = (param1: PARAM_1, ...args: Parameters<PARENT_FN>) => RETURN_TYPE;

const makeApiCall = <F extends ASYNC_DYNAMIC_FN<any>>(apiCall: F, ...params: Parameters<F>): Promise<ReturnType<F>> => apiCall(...params)

// Class used to store a cache value of a given type for a specified amount in seconds 
class CachableValue<fn extends ASYNC_DYNAMIC_FN<any | null>, T extends Awaited<ReturnType<fn>>> {
    timeDelay: number;
    
    lookupDate: Date = new Date();
    value: T | null = null;

    validationMethod: ASYNC_DYNAMIC_FN_WITH_PARAM<T, fn, Boolean>;
    databaseGetterCall: fn;

    constructor(timeDelay: number, databaseGetterCall: fn, validationMethod?: ASYNC_DYNAMIC_FN_WITH_PARAM<T, fn, Boolean>){
        this.timeDelay = timeDelay;

        this.databaseGetterCall = databaseGetterCall;
        this.validationMethod = validationMethod == undefined ?  (v: T, ...params: Parameters<fn>) => {return true} : validationMethod;
    }

    private useCacheData(currentValue: T, ...params: Parameters<fn>) {
        if(this.validationMethod != undefined) {
            if(this.value != null && !this.validationMethod(currentValue, ...params)) return false;
        }

        return (getTimeDiffCurrent(this.lookupDate) < this.timeDelay);
    }

    public async getData(...params: Parameters<fn>) : Promise<T | null>{
        if(this.value != null && this.useCacheData(this.value, ...params)) return this.value;

        this.value = await makeApiCall(this.databaseGetterCall, ...params);

        return this.value;
    }
}

//--

var wordSetValue = new CachableValue(60, getThemeSetFromDB, (v: [string, WordSet], key: string) => v[0] == key);

// Function to either get the given wordset from cache(if was in the last 60 seconds of getting such) or from the database using the the provided themekey
export async function getThemeWordSet(themeKey: string)  {
    var wordSet = (await wordSetValue.getData(themeKey));

    return wordSet != null ? wordSet?.[1] : null;
}

async function getThemeSetFromDB(themeKey: string) : Promise<[string, WordSet] | null> {
    try {
        let result = await fetch(
            `${serverTarget}/get_words`, {
                method: "post",
                body: JSON.stringify({ themeKey }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
        return [themeKey, await result.json()];
    } catch(e: any) {
        console.log(e);
    }

    return null;
}

//--

// Function to either get the given themes from cache(if was in the last 60 seconds of getting such) or from the database
export async function getThemes() {
    return (await themesValue.getData());
}

var themesValue = new CachableValue(60, getThemesFromDB);

// Function used to get the themes from the database though the backend script using a post request
async function getThemesFromDB() : Promise<Map<string, Theme>> {
    try {
        let result = await fetch(
            `${serverTarget}/get_themes`, {
                method: "post",
                body: "{}",
                headers: { 'Content-Type': 'application/json' }
            });

        var data = JSON.parse(await result.text(), reviverForMap);

        return new Map(Object.entries(data));
    } catch(e: any) {
        console.log(e);
    }

    return new Map();
}

//--

// Function to either get the given scores from cache(if was in the last 15 seconds of getting such) the  or from the database
export async function getScores() {
    return (await scoreValues.getData());
}

var scoreValues = new CachableValue(0, getScoresFromDB);

// Function used to get the scores from the database though the backend script using a post request
export async function getScoresFromDB() : Promise<[string, number][]> {
    try {
        let result = await fetch(
            `${serverTarget}/get_top_scores`, {
                method: "post",
                body: "{}",
                headers: { 'Content-Type': 'application/json' }
            });

        var text = await result.text();

        //console.log(text);

        var data = JSON.parse(text, reviverForMap);

        //console.log(new Map(Object.entries(data.scores)))

        return Object.entries(data.scores);
    } catch(e: any) {
        console.log(e);
    }

    return [];
}

var scoreLookupDate: Date | null = null;

// Function used to set the given user score with the username and score using the backend script with a post request
export async function setUserScoreInDB(username: string, highscore: number) : Promise<Boolean> {
    if(scoreLookupDate == null) scoreLookupDate = new Date();

    if(getTimeDiffCurrent(scoreLookupDate) < 5) return false;

    try {
        let result = await fetch(
            `${serverTarget}/set_user_score`, {
                method: "post",
                body: JSON.stringify({ username: username, highscore: highscore }),
                headers: { 'Content-Type': 'application/json' }
            });

        var setScoreResults = JSON.parse(await result.text());

        if(setScoreResults.hasUpdatedScore) {
            var currentScores = scoreValues.value;

            userScore.value = setScoreResults.highscore as number;

            if(currentScores != null) {
                for (let index = 0; index < currentScores.length; index++) {
                    const element = currentScores[index];

                    if(userScore.value > element[1]) {
                        scoreValues.value = null;

                        break;
                    }
                }
            }
        }

        return setScoreResults.hasUpdatedScore;
    } catch(e: any) {
        console.log(e);
    }

    return false;
}

var userScore = new CachableValue(5, getUserScoreFromDB);

export async function getUser(username: string) {
    return (await userScore.getData(username)) ?? -1;
}
// Function used to get the specific user score from the database though the backend script using a post request
export async function getUserScoreFromDB(username: string) : Promise<number> {
    try {
        let result = await fetch(
            `${serverTarget}/get_user_score`, {
                method: "post",
                body: JSON.stringify({ username: username}),
                headers: { 'Content-Type': 'application/json' }
            });

        return JSON.parse(await result.text()).highscore;
    } catch(e: any) {
        console.log(e);
    }

    return -1;
}

//--

