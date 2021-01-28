
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
import { IDevice } from "../devices/device-interface";
import { DeviceProvider, IDeviceProvider } from "../devices/device-provider";

export interface ISmartHomeManager {
    onSyncResponder(body: SmartHomeV1SyncRequest): SmartHomeV1SyncResponse;
    onQueryResponder(body: SmartHomeV1QueryRequest): SmartHomeV1QueryResponse;
    onExecuteResponderasync(body: SmartHomeV1ExecuteRequest): SmartHomeV1ExecuteResponse;
}

export class SmartHomeManager implements ISmartHomeManager {
    public devices: Map<string, IDevice>;

    constructor(private USER_ID) {
        const devProvider: IDeviceProvider = new DeviceProvider();
        this.devices = devProvider.getDevices();
    }

    public onSyncResponder(body: SmartHomeV1SyncRequest): SmartHomeV1SyncResponse {
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
