const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_KEY}@cluster0.gq6gqcm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('SuperHeroToys').collection('ToysCollection');

    app.get('/toys', async (req,res)=>{
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/toys/:id', async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      
    const options = {
      projection: { picture_url: 1,  name : 1, sub_category:1,rating : 1, available_quantity:1,description:1, price: 1 ,},
    };
      const result = await toysCollection.findOne(query,options);
      res.send(result);
   })

   app.post('/toys', async(req,res)=>{
    const toy = req.body;
    const result = await toysCollection.insertOne(toy);
    res.send(result)
   })

   app.delete('/mytoys/:id', async(req,res)=>{
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const result = await toysCollection.deleteOne(query);
    res.send(result);
   })

app.get('/mytoys/:email', async (req,res)=>{
  console.log(req.params.email);
  const result = await toysCollection.find({sellerEmail: req.params.email}).toArray();
  res.send (result);
})  



app.put('/mytoys/:id', async (req, res) => {
  const { id } = req.params;

  const filter = { _id: new ObjectId(id) };
  const updateToyData = req.body;
  console.log(updateToyData);
  const updatDoc = {
    $set: {
     price: updateToyData.price,
     description:updateToyData.description,
     available_quantity:updateToyData.available_quantity
    }
  };

  try {
    const result = await toysCollection.updateOne(filter, updatDoc);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req,res)=>{
    res.send('SuperHero Toys running')
})

app.listen(port,()=>{
    console.log(
        'SuperHero server is running'
    );
})