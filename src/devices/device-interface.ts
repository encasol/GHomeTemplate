import { SmartHomeV1ExecuteResponseCommands, SmartHomeV1SyncDevices } from "actions-on-google";

export interface IDevice {
    getDeviceId(): string;
    getOnSync(): SmartHomeV1SyncDevices;
    getOnQuery(): any;
    execute(execution): SmartHomeV1ExecuteResponseCommands;
}
