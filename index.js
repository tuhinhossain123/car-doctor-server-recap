const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser= require('cookie-parser')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  // 4th
  origin:['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())

// 1st a jwt.io install korte hbe then const jwt = require('jsonwebtoken') bosate hbe

// 2nd access token ber korar code
// require('crypto').randomBytes(64).toString('hex')

// 3rd a express cookie-parser install korte hbe then require korte hbe and middleware hisebe use korte hbe

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.taymcgi.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const serviceCollection = client.db("carsDoctors").collection('services');
    const bookingCollection = client.db("carsDoctors").collection('bookings');


// auth related api
// 1st
app.post('/jwt', async(req, res)=>{
  const user = req.body;
  console.log(user);
  // res.send(user)

// 2nd
  const token =jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
  console.log(token)
  // res.send(token)

  res
  // 3rd
  .cookie('token', token,{

    httpOnly: true,
    secure: true,
    sameSite: 'none'
  })
  .send({success: true})
})




    // services related api
    // sob gola data load kore
    app.get("/services", async(req, res)=>{
        const result =await serviceCollection.find().toArray()
        res.send(result)
    })


    // sodu 1 ta data load kore
    app.get("/services/:id", async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const options = {
            projection: {title: 1, price: 1, service_id: 1, img:1 },
          };
        const result = await serviceCollection.findOne(query, options);
        res.send(result)
    })


    // 1 email a joto data ace sodhu ei gola load kore
    app.get('/bookings', async(req, res)=>{
      console.log(req.query.email)
      console.log('tok  tok token', req.cookies.token)
      let query ={}
      if(req.query?.email){
        query={email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    })

    // server a data post kore
    app.post('/bookings', async(req,res)=>{
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result)
    })

    // data update
    app.patch('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)}
      const updateBooking = req.body;
      console.log(updateBooking);
      const updateDoc ={
        $set:{
          status: updateBooking.status
        }
      }
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    // data delete
    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('doctor is running')
  })

  app.listen(port, () => {
    console.log(`car doctor server is running on port ${port}`)
  })