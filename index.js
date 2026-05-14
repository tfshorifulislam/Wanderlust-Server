const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')

const app = express()
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT
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

        const db = client.db("wanderlust-server");
        const destinationsCollection = db.collection("destinations");
        const bookingCollection = db.collection("bookings");

        app.post('/bookings', async (req, res) => {
            const bookingData = req.body;
            const result = await bookingCollection.insertOne(bookingData);
            console.log('Booking created:', result);
            res.send(result);
        })

        app.post('/destinations', async (req, res) => {
            const destinations = req.body;
            console.log(destinations);

            const result = await destinationsCollection.insertOne(destinations);
            console.log(result);
            res.send(result);
        })

        app.get('/destinations', async (req, res) => {
            const result = await destinationsCollection.find().toArray();
            console.log('Destinations found:', result);
            res.send(result);
        })

        app.get('/destinations/:id', async (req, res) => {
            const { id } = req.params;
            const result = await destinationsCollection.findOne({ _id: new ObjectId(id) });
            console.log('Destination found:', result);
            res.send(result);
        })


        app.patch('/destinations/:id', async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            const result = await destinationsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
            console.log(result);
            res.send(result);
        })


        app.delete('/destinations/:id', async (req, res) => {
            const { id } = req.params;
            const result = await destinationsCollection.deleteOne({ _id: new ObjectId(id) });
            console.log(result);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
