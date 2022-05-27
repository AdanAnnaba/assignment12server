const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l32d5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const dbcollections = client.db('manufacturer').collection('products');
        const usercollections = client.db('manufacturer').collection('user');

        app.get('/product',async(req,res)=>{
            const query = {}
            const cursor =  dbcollections.find(query);
            const product = await cursor.toArray();
            res.send(product);
        })

        app.get('/product/:id',async(req,res)=>{
            const id =req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await dbcollections.findOne(query);
            res.send(result);
        })

        app.post('/product',async(req,res)=>{
            const addproduct = req.body;
            const result = await dbcollections.insertOne(addproduct);
            res.send(result)
        })

        app.delete('/product/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result =await dbcollections.deleteOne(query);
            res.send(result);
        })
        app.put('/user/:email',async(req,res)=>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email:email};
            const options = { upsert: true };
            const updatedDoc = {
                $set: user,
                    
            };
            const result =await usercollections.updateOne(filter, updatedDoc, options);
            const token = jwt.sign({email:'email'},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
            res.send({result, token});
        })
    }
    finally{

    }
}
run().catch(console.dir)

app.listen(port,()=>{
    console.log('Server is working');
})