import express from "express";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser"; 
import expressSession from 'express-session';
import flash from 'connect-flash';
import MS from "connect-mongodb-session"
const MongoDBSession = MS(expressSession);
import mainRoutes from "./controller/mainRoutes.js";
import routes from "./controller/routes.js";
dotenv.config({ path: ".env" });
const app = express();

(async () => {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB");
})();

app.use(express.json());
app.use(bodyParser.urlencoded())
app.use(express.static(path.join(path.resolve(), 'static')));



app.use(cookieParser('random'));

const store = new MongoDBSession({
    uri: process.env.MONGO_URL,
    collection: "mySessions",
    expires: 1000 * 60 * 60 * 24
})

app.use(expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000,
    store: store,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



app.get("/", (req, res) => {
    res.sendFile(path.resolve(path.resolve() + "/views/index.html"));
})
app.use(routes);
app.use(mainRoutes);

app.listen(80, () => console.log("server starts"));