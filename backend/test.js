require("dotenv").config();
const mongoose = require("mongoose");

console.log("Connecting to:");
console.log(process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ Connected Successfully");
    process.exit(0);
})
.catch((err) => {
    console.log("FULL ERROR:");
    console.log(err);
    process.exit(1);
});
