import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import { IAuthProvider, AuthProvider } from './auth/auth-provider'
import { ISmartHomeProvider, SmartHomeProvider } from './smarthome/smarthome-provider';

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authProv: IAuthProvider = new AuthProvider(app);
authProv.init();

const smartHome: ISmartHomeProvider = new SmartHomeProvider(app);
smartHome.init();

console.log('Started');
let httpServer = http.createServer(app);
httpServer.listen(port);