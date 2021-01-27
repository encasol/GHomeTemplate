
import { 
    SmartHomeV1QueryRequest, 
    SmartHomeV1QueryResponse, 
    SmartHomeV1SyncRequest, 
    SmartHomeV1SyncResponse, 
    SmartHomeV1SyncDevices,
    SmartHomeV1ExecuteRequest, 
    SmartHomeV1ExecuteResponse,
    SmartHomeV1ExecuteResponseCommands
} from 'actions-on-google';
import { google, homegraph_v1 } from 'googleapis';
import { IDevice } from '../devices/device-interface';
import { Door } from '../devices/door';

export interface ISmartHomeManager {
    onSyncResponder(body: SmartHomeV1SyncRequest): SmartHomeV1SyncResponse;
    onQueryResponder(body:SmartHomeV1QueryRequest): SmartHomeV1QueryResponse;
    onExecuteResponderasync(body: SmartHomeV1ExecuteRequest): SmartHomeV1ExecuteResponse;
}

export class SmartHomeManager implements ISmartHomeManager {
    devices: Map<string, IDevice>;
    
    constructor(private USER_ID) {
        let door: Door = new Door();
        this.devices = new Map([
            [door.getDeviceId(), door],
        ]);
    }

    onSyncResponder(body: SmartHomeV1SyncRequest): SmartHomeV1SyncResponse {
        console.log('OnSync');
        let devicesPayload: SmartHomeV1SyncDevices[] = Array.from(this.devices).map(([key, device]) => device.getOnSync());

        return {
            requestId: body.requestId,
            payload: {
                agentUserId: this.USER_ID,
                devices: devicesPayload,
            },
        };
    }

    onQueryResponder(body:SmartHomeV1QueryRequest): SmartHomeV1QueryResponse {
        console.log('onQuery');
        const {requestId} = body;
        const payload = {
            devices: {},
        };
        const intent = body.inputs[0];
        
        for (const device of intent.payload.devices) {
            const deviceId = device.id;
            // Add response to device payload
            let data = this.devices.get(deviceId).getOnQuery();
            payload.devices[deviceId] = data;            
        }

        // Wait for all promises to resolve
        return {
            requestId: requestId,
            payload: payload,
        };
    }

    onExecuteResponderasync(body: SmartHomeV1ExecuteRequest): SmartHomeV1ExecuteResponse {
        console.log('onExecute ' + this);
        const {requestId} = body;
        // Execution results are grouped by status
        const result: SmartHomeV1ExecuteResponseCommands = {
            ids: [],
            status: 'SUCCESS',
            states: {
                online: true,
            },
        };

        const intent = body.inputs[0];
        const myDevices = this.devices;
        for (const command of intent.payload.commands) {
            for (const device of command.devices) {
                let data = myDevices.get(device.id).execute(command.execution);
                result.ids.push(device.id);
                Object.assign(result.states, data.states);
            }
        }

        return {
            requestId: requestId,
            payload: {
                commands: [result],
            },
        };
    }
}