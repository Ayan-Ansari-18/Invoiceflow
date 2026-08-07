const mongoose = require('mongoose');

const uri = "mongodb+srv://ayan:Ayan%401234@cluster0.e8eedlo.mongodb.net/invoiceflow?appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILED: Could not connect to MongoDB Atlas");
    console.error(err);
    process.exit(1);
  });
