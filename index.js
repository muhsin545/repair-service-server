const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();


// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.czzzy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri)


async function run() {
    try {
        await client.connect();

        const database = client.db("RepairService");
        const serviceCollection = database.collection("services");
        const reviewCollection = database.collection("reviews");
        const purchaseCollection = database.collection("orders");
        const usersCollection = database.collection("users");



        // // add services
        app.post("/services", async (req, res) => {
            const services = req.body;
            // console.log(services);
            const result = await serviceCollection.insertOne(services);
            res.json(result);
        });

        //  get all services
        app.get("/services", async (req, res) => {
            const result = await serviceCollection.find({}).toArray();
            res.json(result);
        });

        // get single package
        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.json(result);
        });


        // // Purchase products

        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await purchaseCollection.insertOne(order);
            // console.log(result);
            res.json(result);
        });

        // // get My orders  by email
        app.get("/orders/:email", async (req, res) => {
            const result = await purchaseCollection.find({ email: req.params.email }).toArray();
            res.json(result);
            // console.log(result);
        });

        // //delete order from the database
        app.delete("/deleteOrders/:id", async (req, res) => {
            const result = await purchaseCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            // console.log(result);
            res.json(result);
        });

        //   get all order
        app.get("/allOrders", async (req, res) => {
            const result = await purchaseCollection.find({}).toArray();
            res.json(result);
        });

        // //  update Product status
        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            // console.log('id ', id)
            const filter = { _id: ObjectId(id) };
            const result = await purchaseCollection.updateOne(filter, {
                $set: {
                    status: "Shifted",
                },
            });
            res.json(result);
        })
        // Add a review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })
        // get all reviews

        app.get("/reviews", async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.json(result);
        });

        // add user to db 
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })
        // saved google login user into database
        app.put("/users", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
            console.log(result);
        });


        // search admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        app.put("/users/admin", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
            // console.log(result);
        });


        //delete product from the database

        app.delete("/deleteProduct/:id", async (req, res) => {
            const result = await serviceCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });
    } finally {
        //   await client.close();
    }




}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World I am from sylhet!')
})

app.listen(port, () => {
    console.log(`listening on the port`, port)
});

