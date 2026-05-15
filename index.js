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
const { jwtVerify, createRemoteJWKSet } = require("jose-cjs");
const port = process.env.PORT
const uri = process.env.MONGODB_URI;



const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`))



const verifyToken = async (req, res, next) => {
    const header = req?.headers?.authorization;
    console.log(req.headers);
    console.log('Authorization header:', header);
    if (!header) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = header.split(' ')[1]
    console.log('Token:', token);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { payload } = await jwtVerify(token, JWKS);
        console.log('Payload:', payload);
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({ message: 'Forbidden' });
    }

};



async function run() {
    try {
        // await client.connect();

        const db = client.db("wanderlust");
        const destinationsCollection = db.collection("destinations");
        const bookingCollection = db.collection("bookings");


        app.get('/bookings/:userId', verifyToken, async (req, res) => {
            const { userId } = req.params;
            const result = await bookingCollection.find({ userId: userId }).toArray();
            console.log('Bookings found:', result);
            res.send(result);
        });

        app.delete('/bookings/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
            console.log('Bookings deleted:', result);
            res.send(result);
        });


        app.post('/bookings', verifyToken, async (req, res) => {
            const bookingData = req.body;
            const result = await bookingCollection.insertOne(bookingData);
            console.log('Booking created:', result);
            res.send(result);
        })

        app.post('/destinations', verifyToken, async (req, res) => {
            const destinations = req.body;
            console.log(destinations);
            const result = await destinationsCollection.insertOne(destinations);
            console.log(result);
            res.send(result);
        })

        app.get('/destinations', async(req, res) => {
            const result = await destinationsCollection.find().toArray();
            console.log('Destinations found:', result);
            res.send(result);
        })

        app.get('/destinations/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const result = await destinationsCollection.findOne({ _id: new ObjectId(id) });
            console.log('Destination found:', result);
            res.send(result);
        })


        app.patch('/destinations/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            const result = await destinationsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
            console.log(result);
            res.send(result);
        })


        app.delete('/destinations/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const result = await destinationsCollection.deleteOne({ _id: new ObjectId(id) });
            console.log(result);
            res.send(result);
        })

        

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('server is run')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
