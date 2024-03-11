import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import 'dotenv/config';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import sessionMiddleware from './middleware/session.js';
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from "cookie-parser"
import bodyParser from 'body-parser'
import { router as apiRoutes } from './routes/api/index.js';

const app = express();

// global variabel
global.__appdir = path.dirname(fileURLToPath(import.meta.url));
global.__basedir = process.cwd();

// cors
app.use(cors(corsOptions));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// middleware for cookie
app.use(cookieParser());

// middleware for session
app.use(sessionMiddleware);

// get static contents
app.use(express.static(path.join(__basedir,'/public')));
// routes
app.use(apiRoutes);

// middleware to handler errors
app.all('*',(req,res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__appdir,'views','404.html'));
    }else if(req.accepted('json')) {
        res.json({error : '404'});
    }else {
        res.type('txt').send('not found bro');
    }
});
app.use(errorHandler);
export default app;
