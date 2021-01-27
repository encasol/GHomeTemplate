import { smarthome, Headers, SmartHomeV1ExecuteResponse, SmartHomeV1ExecuteResponseCommands, SmartHomeV1SyncDevices } from 'actions-on-google';
import { Express } from 'express';
import { google, homegraph_v1 } from 'googleapis';
import { IDevice } from '../devices/device-interface';
import { Door } from '../devices/door';

export interface ISmartHomeProvider {
    init(): void;
}

export class SmartHomeProvider implements ISmartHomeProvider {
    private app: Express;

    constructor(app: Express) {
        this.app = app;
    }

    init(): void {
        const options: homegraph_v1.Options = {
            version: 'v1'
        };
        const homegraph = google.homegraph(options);
        const USER_ID = '123';

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
            
            for (const device of intent.payload.devices) {
                const deviceId = device.id;
                // Add response to device payload
                queryPromises.push(devices.get(deviceId).getOnQuery().then((data) => {
                    payload.devices[deviceId] = data;
                }));
            }
            // Wait for all promises to resolve
            await Promise.all(queryPromises);
            return {
                requestId: requestId,
                payload: payload,
            };
        });


        smartHome.onExecute(async (body): Promise<SmartHomeV1ExecuteResponse> => {
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
                    executePromises.push(
                        devices.get(device.id).execute(command.execution).then((data) => {
                            result.ids.push(device.id);
                            Object.assign(result.states, data.states);
                        }).catch(() => console.error('EXECUTE', device.id))
                    );
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

        this.app.get('/smarthome', smartHome);
        this.app.post('/smarthome', smartHome);

        this.app.get('/requestsync', async (request, response) => {
            
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

        this.app.get('/reportstate', (request, response) => {
            console.log('report state')
        });
    }
}