require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");

const connectDB = require("./server/config/db");

const app = express();
const PORT = 5000 || process.env.PORT;

// Connect to Database
connectDB();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

// Template Engine
app.set("view engine", "ejs");
app.use(expressLayout);
app.set("layout", "./layouts/main");

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));
// app.use("/", require("./server/routes/subscriber"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/login`);
});
