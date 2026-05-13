const express = require('express')
const app = express()
const PORT = process.env.PORT || 8000
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()
app.use(cors())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        app.get('/', (req, res) => {
            res.send('Hello World!')
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
