import startApp from '../src/app.js';
import config from "../src/config/config.js";

const connString = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}`;

startApp(config.server.port, connString);
