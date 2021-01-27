import { SmartHomeV1SyncDevices, SmartHomeV1ExecuteResponseCommands } from 'actions-on-google';

export interface IDevice {

    getDeviceId(): string;
    getOnSync(): SmartHomeV1SyncDevices;
    getOnQuery(): Promise<any>;
    execute(): SmartHomeV1ExecuteResponseCommands;

}