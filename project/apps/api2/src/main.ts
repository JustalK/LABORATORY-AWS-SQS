require('dotenv').config();
import * as express from 'express';

const app = express();
app.use(express.json());

app.use('/', require('./app/experience'));

const port = process.env.port || 3334;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
