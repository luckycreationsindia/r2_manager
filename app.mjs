import './config.mjs';
import express from 'express';
import logger from 'morgan';
import indexRouter from './routes/index.mjs';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

export default app;