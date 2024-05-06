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

async function getThemeSetFromDB(themeKey) {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //await client.connect();
        // Send a ping to confirm a successful connection
        var db = await client.db("db_hangman");

        var collection = await db.collection("words");

        var easyWords = await collection.find({ theme: themeKey, difficulty: "easy" }).map((entry) => entry.word).toArray();
        var hardWords = await collection.find({ theme: themeKey, difficulty: "hard" }).map((entry) => entry.word).toArray();

        return { easy: easyWords, hard: hardWords }
    } catch(e) {
        console.log(e);
    } /* finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }  */

    return { easy: [], hard: [] }
}

async function getThemesFromDB() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //await client.connect();
        // Send a ping to confirm a successful connection
        var db = await client.db("db_hangman");

        var entries = await db.collection("themes").find()
            .map((entry) => [entry.key, { name: entry.name, description: entry.description}])
            .toArray();

        return new Map(entries);
    } catch(e) {
        console.log(e);
    } /* finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    } */

    return new Map();
}

async function getTopScoresFromDB() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //await client.connect();
        // Send a ping to confirm a successful connection
        var db = await client.db("db_hangman");

        var entries = await db.collection("users").find().sort( { score: -1 } ).limit(10)
            .map((entry) => [entry.username, entry.highscore])
            .toArray();

        return new Map(entries);
    } catch(e) {
        console.log(e);
    } /* finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    } */

    return new Map();
}

async function setScoreInDB(username, highscore) {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //await client.connect();
        // Send a ping to confirm a successful connection
        var db = await client.db("db_hangman");

        var collection = await db.collection("users");

        var oldUserData = (await collection.find({ username: username }).limit(1).toArray())[0];

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
    } /* finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    } */

    return { hasUpdatedScore: false, highscore: -1 };
}


async function getScoreFromDB(username) {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //await client.connect();
        // Send a ping to confirm a successful connection
        var db = await client.db("db_hangman");

        var collection = await db.collection("users");

        return (await collection.find({ username: username }).limit(1).toArray())[0].highscore;
    } catch(e) {
        console.log(e);
    } /* finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    } */

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