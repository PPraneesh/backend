import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { corsOptions } from './utils/cors';
import { env } from './config/env';
import { middleware } from './utils/middleware';
import expressAsyncHandler from 'express-async-handler';
import { hit } from './controllers/hit.controller';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.get("/hit", middleware, expressAsyncHandler(hit));


app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send('Not Found');
})

app.listen(env.PORT, () => {
    console.log('Server is running on port 3000');
});