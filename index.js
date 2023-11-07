const express = require("express");
require("dotenv").config();
const cors = require("cors");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rdcufd9.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const jobsCollection = client.db("JobDB").collection("Jobs");
    const appliedJobCollection = client.db("JobDB").collection("appliedJob");

    //  For all Job
    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get myJob
    app.get("/myJobs", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    // for individual job details
    app.get("/jobDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // update myJobs
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedJobs = req.body;

      const  job= {
        $set: {
          jobBanner: updatedJobs.jobBanner,
          jobTitle: updatedJobs.jobTitle,
          jobCategory: updatedJobs.jobCategory,
          salaryRange: updatedJobs.salaryRange,
          jobDescription: updatedJobs.jobDescription,
          jobPostingDate: updatedJobs.jobPostingDate,
          companyLogo: updatedJobs.companyLogo,
          applicationDeadline: updatedJobs.applicationDeadline,
          jobApplicants: updatedJobs.companyLogo,
        },
      };

      const result = await jobsCollection.updateOne(filter, job, options);
      res.send(result);
    });

    // delete myJobs
    app.delete("/myJobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      console.log(res.send(result));
    });

    // for applied job post
    app.post("/appliedJobs", async (req, res) => {
      const appliedJob = req.body;
      const result = await appliedJobCollection.insertOne(appliedJob);
      res.send(result);
    });

    // for job posting
    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job Searching.........");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
