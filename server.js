const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { response } = require('express');
const ObjectId = require('mongodb').ObjectId;
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

async function run() {
    try {
        await client.connect();
        // create database
        const database = client.db('EidCollectionDb');
        const productsCollections = database.collection('products');
        const ordersCollections = database.collection('orders');
        const usersCollections = database.collection('users');

        app.post('/addedProduct', async (req, res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })

        // store users orders
        app.post('/order', async (req, res) => {
            const product = req.body;
            const result = await ordersCollections.insertOne(product);
            // console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })
        // saved user database;
        app.post('/registerUsers', async (req, res) => {
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            console.log(result);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })

        // 
        app.put('/registerUsers', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: { user }
            }
            const result = await usersCollections.updateOne(filter, updateDoc, options);
            console.log('user added', result);
            res.json(result);
        })

        // update user orders information
        app.put('/orderUpdate/:email', async (req, res) => {
            const email = req.params.email;
            const filter = {email};
            const options = {upsert:true};

            // const updateDoc = {
            //     $set
            // }
        })
        // cancel api create
        app.delete('/remove/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = ordersCollections.find(query);
            res.json(result);
        })

        app.get('/products', async (req, res) => {
            const cursor = productsCollections.find({});
            const result = await cursor.toArray();
            // console.log(result);
            res.json(result);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollections.findOne(query);
            // console.log(result);
            res.json(result)
        })
        // show all orders
        app.get('/usersOrders', async (req, res) => {
            const cursor = ordersCollections.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })

        // get all users orders
        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollections.find({});
            const result = await cursor.toArray();
            // res.send('Hello')
            res.json(result);
        });

        // find specific user orders
        app.get('/myOrders/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = ordersCollections.find({ email });
            const orders = await cursor.toArray();
            res.json(orders);
        })
        
        // update user orders information
        app.get('/orderUpdate/:id',async(req,res) => {
           const id = req.params.id;
           const query = {_id: ObjectId(id)};
           const result = await ordersCollections.findOne(query);
           console.log('user update data',result);
           res.json(result);
        });

        // admin route
        app.put('/admin',async(req,res) => {
            const email = req.body.email;
            const filter = {email: email};
            console.log('filter = ',filter);
            const options = {upsert:true};
            const updateDoc = {
                $set:{
                    role:'admin'
                },
            };
            const result = await usersCollections.updateOne(filter,updateDoc,options);
            console.log(`email update =`,result);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Eid Server is running');
})

app.listen(port, () => {
    console.log('Running on port', port);
})