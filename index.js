const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const cors = require("cors")

const app = express();

const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())

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



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();


    const serviceCollections = client.db("carServicing").collection("servicingCollections");


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
