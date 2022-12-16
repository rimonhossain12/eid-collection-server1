const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
var admin = require("firebase-admin");
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

// firebase jwt token function

async function verifyToken(req,res,next){
    if(req.headers?.authorization?.startsWith('Bearer ')){
        const idToken = req.headers.authorization.split('Bearer ')[1];
        try{
            const decodedUser = await admin.auth().verifyIdToken(idToken);
           req.decodedUserEmail = decodedUser.email;
        }
        catch{
            // console.log('Not found user');
        }
    }
    next();
}


// main functionally start here
async function run() {
    try {
        await client.connect();
        // create database
        const database = client.db('EidCollectionDb');
        const productsCollections = database.collection('products');
        const ordersCollections = database.collection('orders');
        const usersCollections = database.collection('users');
        const userReview = database.collection('review');
        const subscribedUser = database.collection('subscribed');

        app.post('/addedProduct', async (req, res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })
        // store users orders
        app.post('/order', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await ordersCollections.insertOne(product);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })
        // saved user database;
        app.post('/registerUsers', async (req, res) => {
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            // console.log(result);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })

        // store user review
        app.post('/review', async (req, res) => {
            const data = req.body;
            const result = await userReview.insertOne(data);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })

        // subscribed user store
        app.post('/subscribed', async (req, res) => {
            const body = req.body;
            console.log('subs user', body);
            const result = await subscribedUser.insertOne(body);
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
            res.json(result);
        })

        // update user orders information
        app.put('/updateInfo/:id', async (req, res) => {
            const id = req.params.id;
            const updateUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateUser.name,
                    quantity: updateUser.quantity,
                    mobile: updateUser.mobile,
                    District: updateUser.District,
                    Present_Address: updateUser.Present_Address
                }
            }
            const result = await ordersCollections.updateOne(filter, updateDoc, options);
            console.log(`A document was updated with the _id: ${result.insertedId}`)
            res.json(result)
        })

        // cancel api create
        app.delete('/remove/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollections.deleteOne(query);
            console.log(result);
            res.json(result);
        })
        // delete products
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollections.deleteOne(query);
            console.log(result);
            res.json(result);
        })
        // find 10 products
        app.get('/productsLimit', async (req, res) => {
            const cursor = productsCollections.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await productsCollections.estimatedDocumentCount();
            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }
            res.json({
                count,
                products
            });
        })
        // find all the products
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
        // subscriber user
        app.get('/subscribers', async (req, res) => {
            const cursor = subscribedUser.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        // get all users orders
        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollections.find({});
            const result = await cursor.toArray();
            // res.send('Hello')
            res.json(result);
        });

        // find specific user orders
        app.get('/myOrders/:email', verifyToken, async  (req, res) => {
            const email = req.params.email;

            if(req.decodedUserEmail == email){
                const query = { email };
                const cursor = ordersCollections.find(query);
                const result = await cursor.toArray();
                res.json(result);
            }
            else{
                res.status(401).json({message:"user not authorized"});
            }           
        })

        // update user orders information
        app.get('/orderUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollections.findOne(query);
            //    console.log('user update data',result);
            res.json(result);
        });

        // admin route
        app.put('/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'Admin'
                }
            }
            const result = await usersCollections.updateOne(filter, updateDoc, options);
            // console.log('make admin',result);
        });

        // get admin api create;
        app.get('/foundAdmin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollections.findOne(query);
            // console.log('admin api users',user);
            let isAdmin = false;
            if (user?.role === 'Admin') {
                isAdmin = true;
            }
            // console.log('found result',isAdmin);
            res.json({ admin: isAdmin });
        })

        // get all review collection
        app.get('/userReview', async (req, res) => {
            const cursor = userReview.find({});
            const result = await cursor.toArray();
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