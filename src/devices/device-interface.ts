import { SmartHomeV1SyncDevices, SmartHomeV1ExecuteResponseCommands } from 'actions-on-google';

export interface IDevice {

    getDeviceId(): string;
    getOnSync(): SmartHomeV1SyncDevices;
    getOnQuery(): any;
    execute(execution): SmartHomeV1ExecuteResponseCommands;
}