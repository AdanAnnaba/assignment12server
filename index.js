const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l32d5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if(!authHeader){
        return res.status(401).send({message: 'Unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err,decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        await client.connect();
        const dbcollections = client.db('manufacturer').collection('products');
        const usercollections = client.db('manufacturer').collection('user');
        const usersbooking = client.db('manufacturer').collection('booking');

        app.get('/product',async(req,res)=>{
            const query = {}
            const cursor =  dbcollections.find(query);
            const product = await cursor.toArray();
            res.send(product);
        })

        app.post('/product',async(req,res)=>{
            const addproduct = req.body;
            const result = await dbcollections.insertOne(addproduct);
            res.send(result)
        })

        app.get('/booking',verifyJWT, async(req,res)=>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email === decodedEmail){
            const query = {email:email};
            const booking = await usersbooking.find(query).toArray();
            res.send(booking);
            }
            else{
                return res.status(403).send({message: 'forbidden access'});
            }
        })


        app.post('/booking',async(req,res)=>{
            const booking = req.body;
            const query = {productName: booking.productName, email: booking.email }
            const exists = await usersbooking.findOne(query);
            if(exists){
                return res.send({success: false, productName:exists })
            }
            const result = await usersbooking.insertOne(booking);
            return res.send({success: true, result})
        })

        app.delete('/booking/:id',async(req,res)=>{
                const id = req.params.id;
                const query = {_id: ObjectId(id)};
                const result =await usersbooking.deleteOne(query);
                res.send(result); 
            })

            app.get('/user',verifyJWT, async(req,res)=>{
                const query = {}
                const cursor =  usercollections.find(query);
                const product = await cursor.toArray();
                res.send(product);
            });

            app.get('/admin/:email', async(req,res)=>{
                const email = req.params.email;
                const user = await usercollections.findOne({email:email});
                const isAdmin = user.role === 'admin'
                res.send({admin: isAdmin})
            })


            app.put('/user/admin/:email', verifyJWT, async(req,res)=>{
                const email = req.params.email;
                const adminCreator =  req.decoded.email;
                const realAdmin = await usercollections.findOne({email: adminCreator});
                if(realAdmin.role === 'admin'){
                    const filter = {email:email};
                const updatedDoc = {
                    $set:{role: 'admin'}, 
                };
                const result = await usercollections.updateOne(filter, updatedDoc);
                res.send(result);

                }
                else{
                    res.status(403).send({message: 'forbidden'})
                }
                
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
            const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'5000h'});
            res.send({result,token});
        })
    }
    finally{

    }
}
run().catch(console.dir)

app.listen(port,()=>{
    console.log('Server is working');
})


123
