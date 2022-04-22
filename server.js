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
        const productsCollections = database.collection('products')
        const ShoesCollections = database.collection('shoes');
        const manCollections = database.collection('manCloths');
        const ladiesCollections = database.collection('womanCloths');
        const shartCollections = database.collection('shart');

        app.post ('/addedProduct',async(req,res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);

        })

        app.get('/products',async(req,res) => {
            const cursor = productsCollections.find({});
            const result = await cursor.toArray();
            console.log(result);
            res.json(result);
        })

        // app.post('/ladiesProduct',async(req,res) => {
        //     const product = req.body;
        //     const result = await ladiesCollections.insertOne(product);
        //     console.log(`A document was inserted with the _id: ${result.insertedId}`);
        //     res.json(result);
        // })
        // app.post('/manProducts',async(req,res) => {
        //     const product = req.body;
        //     const result = await manCollections.insertOne(product);
        //     console.log(`A document was inserted with the _id: ${result.insertedId}`);
        //     res.json(result);
        // })

        // app.post('/shoes',async(req,res) => {
        //     const shoe = req.body;
        //     // console.log(shoe);
        //     const result = await ShoesCollections.insertOne(shoe);
        //     console.log(`A document was inserted with the _id: ${result.insertedId}`);
        //     res.json(result);
        // })

        // app.post('/shart',async(req,res) => {
        //     const shart = req.body;
        //     const result = await shartCollections.insertOne(shart);
        //     console.log(`A document was inserted with the _id: ${result.insertedId}`);
        //     res.json(result);
        // })

        app.get('/allProducts',async(req,res) => {
           const cursor = ladiesCollections.find({});
           const ladiesProducts = await cursor.toArray();
            console.log(ladiesProducts)
            res.json(ladiesProducts);
        })

        app.get('/shoes',async(req,res) => {
            const cursor = ShoesCollections.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        app.get('/shart',async(req,res) => {
            const cursor = shartCollections.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        app.get('/manProducts',async(req,res) => {
            const cursor = manCollections.find({});
            const result = await cursor.toArray();
            res.json(result);
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