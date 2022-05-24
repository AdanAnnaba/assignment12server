const express = require('express');
const cors = require('cors');
require('dotenv').config();
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
        app.put('/product/:id',async(req,res)=>{
            const id = req.params.id;
            const qty = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: qty
                    
            };
            const result =await dbcollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(console.dir)

app.listen(port,()=>{
    console.log('Server is working');
})