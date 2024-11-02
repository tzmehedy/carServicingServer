const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const jwt = require("jsonwebtoken")

const cookieParser = require("cookie-parser")

const cors = require("cors")

const app = express();

const port = process.env.PORT || 5000;


app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true
  })
);
app.use(express.json())

app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Car servicing data is coming");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k8aq9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifiedAccess = async(req, res, next)=>{
  const token = req.cookies?.token
  console.log(token)
  if(!token){
    return res.status(401).send({message:"No Authorized"})
  }
  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN,(err,decoded)=>{
    if(err){
      return res.status(401).send({message:'unauthorized'})
    }
    req.user= decoded
    next();
  })
  
}



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();


    const serviceCollections = client.db("carServicing").collection("servicingCollections");

    const bookingsCollections = client.db("carServicing").collection("bookingsCollections")


    // Api for token

    app.post("/jwt", async(req,res)=>{
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "1h",
      });

      res
      .cookie('token', token, {
        httpOnly:true,
        secure:false,
      })
      .send({success:true})
    })


    app.get("/services", async(req,res)=>{
        const result = await serviceCollections.find().toArray()
        res.send(result)
    })

    app.get("/services/:id", async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await serviceCollections.findOne(query)
      res.send(result)
    })

    app.get("/bookings", verifiedAccess, async(req,res)=>{
      
      let query = {}

      if(req.query.email !== req.user.email){
        return res.status(403).send({message:"forbidden"})
      }
      
      if(req.query?.email){
        query = {email:req.query.email}
      }
      const result = await bookingsCollections.find(query).toArray()
      res.send(result)
      
    })

    app.post("/bookings", async(req,res)=>{
      const bookingInfo = req.body
      const result = await bookingsCollections.insertOne(bookingInfo)
      res.send(result)
    })


    app.delete("/bookings/:id", async(req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await bookingsCollections.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection

    client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    
    



    

    



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("The port is running 5000");
});
