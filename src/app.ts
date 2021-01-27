import express from 'express';
import { smarthome, Headers, SmartHomeV1ExecuteResponse, SmartHomeV1ExecuteResponseCommands, SmartHomeV1SyncDevices } from 'actions-on-google';
import { google, homegraph_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import util from 'util';
import bodyParser from 'body-parser';
import http from 'http';
import https from 'https';
import { IDevice } from './devices/device-interface';
import { Door } from './devices/door';
import fs from 'fs';

const privateKey  = fs.readFileSync('/home/pi/sslCert/host.key', 'utf8');
const certificate = fs.readFileSync('/home/pi/sslCert/host.cert', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/homegraph'],
});
const options: homegraph_v1.Options = {
    version: 'v1'
};

const homegraph = google.homegraph(options);

const USER_ID = '123';

app.get('/login', (request, response) => {
    console.log('login');
    if (request.method === 'GET') {
        // console.log('Requesting login page ' + request.query.responseurl);
        response.send(`
        <html>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <body>
            <form action="/login" method="post">
            <input type="hidden"
                name="responseurl" value="${request.query.responseurl}" />
            <button type="submit" style="font-size:14pt">
                Link this service to Google
            </button>
            </form>
        </body>
        </html>
        `);
    } else {
        // Unsupported method
        response.status(405).send('Method Not Allowed');
    }
});

app.post('/login', (request, response) => {
    console.log('login');
    if (request.method === 'POST') {
        // Here, you should validate the user account.
        // In this sample, we do not do that.
        const responseurl = decodeURIComponent(request.body.responseurl);
        // console.log(`Redirect to ${responseurl}`);
        return response.redirect(responseurl);
    } else {
        // Unsupported method
        response.status(405).send('Method Not Allowed');
    }
});

app.get('/fakeauth', (request, response) => {
    console.log('fakeauth');
    const responseurl = util.format('%s?code=%s&state=%s',
        decodeURIComponent(request.query.redirect_uri as string), 'xxxxxx',
        request.query.state);
    console.log(`Set redirect as ${responseurl}`);
    return response.redirect(
        `/login?responseurl=${encodeURIComponent(responseurl)}`);
});

app.post('/faketoken', (request, response) => {
    console.log('/faketoken');
    const grantType = request.query.grant_type ?
      request.query.grant_type : request.body.grant_type;
    const secondsInDay = 86400; // 60 * 60 * 24
    const HTTP_STATUS_OK = 200;
    console.log(`Grant type ${grantType}`);
  
    let obj;
    if (grantType === 'authorization_code') {
        obj = {
            token_type: 'bearer',
            access_token: '123access',
            refresh_token: '123refresh',
            expires_in: secondsInDay,
        };
    } else if (grantType === 'refresh_token') {
        obj = {
            token_type: 'bearer',
            access_token: '123access',
            expires_in: secondsInDay,
        };
    }
    response.status(HTTP_STATUS_OK)
        .json(obj);
});

let door: Door = new Door();
let devices: Map<string, IDevice> = new Map([
    [door.getDeviceId(), door],
]);

const smartHome = smarthome();

smartHome.onSync((body) => {
    console.log('OnSync');
    let devicesPayload: SmartHomeV1SyncDevices[] = Array.from(devices).map(([key, device]) => device.getOnSync());

    return {
        requestId: body.requestId,
        payload: {
            agentUserId: USER_ID,
            devices: devicesPayload,
        },
    };
});

smartHome.onQuery(async (body) => {
    console.log('onQuery');
    const {requestId} = body;
    const payload = {
        devices: {},
    };
    const queryPromises = [];
    const intent = body.inputs[0];
    console.log(intent)
    for (const device of intent.payload.devices) {
        const deviceId = device.id;
        console.log('query: ' + deviceId)
        // Add response to device payload
        queryPromises.push(devices[deviceId].getOnQuery().then((data) => {
            payload.devices[deviceId] = data;
            console.log(payload);
        }));
    }
    // Wait for all promises to resolve
    await Promise.all(queryPromises);
    return {
        requestId: requestId,
        payload: payload,
    };
});

const updateDevice = async (execution, deviceId) => {
    const {params, command} = execution;
    let state; let ref;
    console.log(params);
    console.log(command);
    switch (command) {
      case 'action.devices.commands.OpenClose':
        state = {on: true};
        console.log('OpenClose');

        http.get('http://localhost:4321/open', (resp) => {
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
        break;
      case 'action.devices.commands.StartStop':
        state = {isRunning: true};
        console.log('StartStop');
        break;
      case 'action.devices.commands.PauseUnpause':
        state = {isPaused: false};
        console.log('StartStop');
        break;
    }
  
    return state;
};

smartHome.onExecute(async (body, headers: Headers): Promise<SmartHomeV1ExecuteResponse> => {
    console.log('onExecute');
    const {requestId} = body;
    // Execution results are grouped by status
    const result: SmartHomeV1ExecuteResponseCommands = {
        ids: [],
        status: 'SUCCESS',
        states: {
            online: true,
        },
    };
  
    const executePromises = [];
    const intent = body.inputs[0];
    for (const command of intent.payload.commands) {
        for (const device of command.devices) {
            for (const execution of command.execution) {
                executePromises.push(
                    updateDevice(execution, device.id)
                        .then((data) => {
                            result.ids.push(device.id);
                            Object.assign(result.states, data);
                        })
                        .catch(() => console.error('EXECUTE', device.id)));
            }
        }
    }
  
    await Promise.all(executePromises);
    return {
        requestId: requestId,
        payload: {
            commands: [result],
        },
    };
});
  
smartHome.onDisconnect((body, headers) => {
    console.log('User account unlinked from Google Assistant');
    // Return empty response
    return {};
});

app.get('/smarthome', smartHome);
app.post('/smarthome', smartHome);

app.get('/requestsync', async (request, response) => {
    
    console.log('RequestSync');
    response.set('Access-Control-Allow-Origin', '*');
    console.info(`Request SYNC for user ${USER_ID}`);
    try {
        const res = await homegraph.devices.requestSync({
            requestBody: {
                agentUserId: USER_ID,
            },
        });
        console.info('Request sync response:', res.status, res.data);
        response.json(res.data);
    } catch (err) {
        console.error(err);
        response.status(500).send(`Error requesting sync: ${err}`);
    }
});

app.get('/reportstate', (request, response) => {
    console.log('report state')
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(port);
httpsServer.listen(port + 1);