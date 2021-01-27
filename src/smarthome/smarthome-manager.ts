
import {
    SmartHomeV1ExecuteRequest,
    SmartHomeV1ExecuteResponse,
    SmartHomeV1ExecuteResponseCommands,
    SmartHomeV1QueryRequest,
    SmartHomeV1QueryResponse,
    SmartHomeV1SyncDevices,
    SmartHomeV1SyncRequest,
    SmartHomeV1SyncResponse,
} from "actions-on-google";
import { google, homegraph_v1 } from "googleapis";
import { IDevice } from "../devices/device-interface";
import { Door } from "../devices/door";

export interface ISmartHomeManager {
    onSyncResponder(body: SmartHomeV1SyncRequest): SmartHomeV1SyncResponse;
    onQueryResponder(body: SmartHomeV1QueryRequest): SmartHomeV1QueryResponse;
    onExecuteResponderasync(body: SmartHomeV1ExecuteRequest): SmartHomeV1ExecuteResponse;
}

export class SmartHomeManager implements ISmartHomeManager {
    public devices: Map<string, IDevice>;

    constructor(private USER_ID) {
        const door: Door = new Door();
        this.devices = new Map([
            [door.getDeviceId(), door],
        ]);
    }

    public onSyncResponder(body: SmartHomeV1SyncRequest): SmartHomeV1SyncResponse {
        console.log("OnSync");
        const devicesPayload: SmartHomeV1SyncDevices[] = Array.from(
            this.devices).map(([key, device]) => device.getOnSync());

        return {
            payload: {
                agentUserId: this.USER_ID,
                devices: devicesPayload,
            },
            requestId: body.requestId,
        };
    }

    public onQueryResponder(body: SmartHomeV1QueryRequest): SmartHomeV1QueryResponse {
        console.log("onQuery");
        const {requestId} = body;
        const payload = {
            devices: {},
        };
        const intent = body.inputs[0];

        for (const device of intent.payload.devices) {
            const deviceId = device.id;
            // Add response to device payload
            const data = this.devices.get(deviceId).getOnQuery();
            payload.devices[deviceId] = data;
        }

        // Wait for all promises to resolve
        return {
            payload,
            requestId,
        };
    }

    public onExecuteResponderasync(body: SmartHomeV1ExecuteRequest): SmartHomeV1ExecuteResponse {
        console.log("onExecute " + this);
        const {requestId} = body;
        // Execution results are grouped by status
        const result: SmartHomeV1ExecuteResponseCommands = {
            ids: [],
            states: {
                online: true,
            },
            status: "SUCCESS",
        };

        const intent = body.inputs[0];
        const myDevices = this.devices;
        for (const command of intent.payload.commands) {
            for (const device of command.devices) {
                const data = myDevices.get(device.id).execute(command.execution);
                result.ids.push(device.id);
                Object.assign(result.states, data.states);
            }
        }

        return {
            payload: {
                commands: [result],
            },
            requestId,
        };
    }
}
