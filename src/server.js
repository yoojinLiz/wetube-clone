import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo"
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import { localsMiddleware, cors } from "./middlewares.js";
import apiRouter from "./routers/apiRouter"

const app = express();
const logger = morgan("dev");
app.use(logger);

app.set("view engine","pug");
app.set("views",process.cwd()+"/src/views");
app.use(express.urlencoded({extended: true}));
app.use(express.text()); 
app.use(express.json()); //string을 받아서 json으로 바꿔주는 middleware (JSON.parse를 해준다고 생각하면 됨  )

app.use(session({
    secret: process.env.COOKIE_SECRET, 
     resave:false, 
     saveUninitialized:false,
     store: MongoStore.create({mongoUrl: process.env.DB_URL})
    }));

app.use(flash());
app.use(localsMiddleware);
app.use(cors);
app.use("/uploads", express.static("uploads")) //static files serving
app.use("/static", express.static("assets")) //static files serving
app.use("/ffmpeg", express.static("node_modules/@ffmpeg/core/dist"))

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
