const { MongoClient, ServerApiVersion } = require("mongodb");
const loginCredentials = require("./login_data.json")

const uri = `mongodb+srv://${loginCredentials.username}:${loginCredentials.password}@${loginCredentials.cluster_target}/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

client.connect();

// Method used to get a given word set using a specific themekey from the database
async function getThemeSetFromDB(themeKey) {
    try {
        // Get db_hangman from the given client connection
        var db = await client.db("db_hangman");

        // Get the words collection from the database
        var collection = await db.collection("words");

        // Get both the easy and hard variants form the given collection
        var easyWords = await collection.find({ theme: themeKey, difficulty: "easy" }).map((entry) => entry.word).toArray();
        var hardWords = await collection.find({ theme: themeKey, difficulty: "hard" }).map((entry) => entry.word).toArray();

        return { easy: easyWords, hard: hardWords }
    } catch(e) {
        console.log(e);
    }

    return { easy: [], hard: [] }
}

// Method used to get all themes from the database if possible or return empty object value
async function getThemesFromDB() {
    try {
        // Get db_hangman from the given client connection
        var db = await client.db("db_hangman");

        // Get the themes collection from the database and then collect all themes found
        var entries = await db.collection("themes").find()
            .map((entry) => [entry.key, { name: entry.name, description: entry.description}])
            .toArray();

        return new Map(entries);
    } catch(e) {
        console.log(e);
    }

    return new Map();
}

// Method used to get the top 10 scores from the databases users collection
async function getTopScoresFromDB() {
    try {    
        // Get db_hangman from the given client connection    
        var db = await client.db("db_hangman");

        // Get the users collection to then query and find all top 10 scores within teh database
        var entries = await db.collection("users").find().sort( { highscore: -1 } ).limit(10)
            .map((entry) => [entry.username, entry.highscore])
            .toArray();

        return new Map(entries);
    } catch(e) {
        console.log(e);
    }

    return new Map();
}

// Method used to set the given passed username with the supplied highscore within the database
async function setScoreInDB(username, highscore) {
    try {
        // Get db_hangman from the given client connection
        var db = await client.db("db_hangman");

        // Get users DB Connection
        var collection = await db.collection("users");

        // Query to get the initial data of the user if it exists
        var oldUserData = (await collection.find({ username: username }).limit(1).toArray())[0];

        // Either use the old user data to update such within the db or insert such within the db
        if(oldUserData != undefined) {
            await collection.updateOne({ _id: oldUserData._id }, { $set: { username: username, highscore: highscore}}, { upsert: true });

            var newUserData = (await collection.find({ username: username }).limit(1).toArray())[0];

            return { hasUpdatedScore: oldUserData.highscore != newUserData.highscore, highscore: newUserData.highscore };
        } else {
            (await collection.insertOne({ username: username, highscore: highscore}));

            return { hasUpdatedScore: true, highscore: highscore };
        }
    } catch(e) {
        console.log(e);
    }

    return { hasUpdatedScore: false, highscore: -1 };
}


async function getScoreFromDB(username) {
    try {
        // Get db_hangman from the given client connection
        var db = await client.db("db_hangman");

        // Get users DB Connection
        var collection = await db.collection("users");

        // Get user from collection to get their highscore
        return (await collection.find({ username: username }).limit(1).toArray())[0].highscore;
    } catch(e) {
        console.log(e);
    }

    return -1;
}

// For backend and express
const express = require('express');
const app = express();
const cors = require("cors");

console.log("App listen at port 5000");

app.use(express.json());
app.use(cors());
app.get("/", (req, resp) => {
    resp.send("App is Working");
    // You can check backend is working or not by 
    // entering http://loacalhost:5000
    // If you see App is working means
    // backend working properly
});

app.post("/get_words", async (req, resp) => {
    try {
        resp.send(JSON.stringify(await getThemeSetFromDB(req.body.themeKey), replacerForMap))
    } catch(e){
        console.log("Error when attempting to getting words: ");
        console.log(e);
        resp.status(400).send("Error occured");
    }
});

app.post("/get_themes", async (req, resp) => {
    try {
        resp.send(JSON.stringify(await getThemesFromDB(), replacerForMap));
    } catch(e){
        console.log("Error when attempting to getting themes: ");
        console.log(e);
        resp.status(400).send("Error occured");
    }
});

app.post("/get_top_scores", async (req, resp) => {
    try {
        resp.send(JSON.stringify({scores: await getTopScoresFromDB()}, replacerForMap));
    } catch(e){
        console.log("Error when attempting to getting themes: ");
        console.log(e);
        resp.status(400).send("Error occured");
    }
});

app.post("/get_user_score", async (req, resp) => {
    try {
        resp.send(JSON.stringify({ highscore: await getScoreFromDB(req.body.username)}));
    } catch(e){
        console.log("Error when attempting to getting themes: ");
        console.log(e);
        resp.status(400).send("Error occured");
    }
});

app.post("/set_user_score", async (req, resp) => {
    try {
        resp.send(JSON.stringify(await setScoreInDB(req.body.username, req.body.highscore)))
    } catch(e){
        console.log("Error when attempting to getting words: ");
        console.log(e);
        resp.status(400).send("Error occured");
    }
});

app.listen(5000);

function replacerForMap(key, value) {
    if(value instanceof Map) {
        return Object.fromEntries(value.entries());
    }

    return value;
}

function reviverForMap(key, value) {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            console.log(`Map Parsed [Key=${key}]: `);
            return new Map(Object.entries<any>(value.values)/* .map(tuple => [tuple[0], decode(key, tuple[1])]) */);
        }
    }

    return value;
}