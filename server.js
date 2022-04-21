const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware 
app.use(cors());
app.use(express.json());

// connection string with mongodb 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5bitd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// main functionally start here

async function run () {
    try{
        await client.connect();
        // create database
        const database = client.db('EidCollectionDb');
        const ShoesCollections = database.collection('shoes');
        const manCollections = database.collection('manCloths');
        const ladiesCollections = database.collection('womanCloths');

        app.post('/Products',async(req,res) => {
            const product = req.body;
            console.log(product);
        })


    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/',(req,res) => {
    res.send('Eid Server is running');
})

app.listen(port, () => {
    console.log('Running on port',port);
})