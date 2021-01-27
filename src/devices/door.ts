import { IDevice } from './device-interface';
import { SmartHomeV1SyncDevices, SmartHomeV1ExecuteResponseCommands } from 'actions-on-google';

export class Door implements IDevice {
    
    getDeviceId(): string {
        return 'washer';
    }

    getOnSync(): SmartHomeV1SyncDevices {
        return {
            id: this.getDeviceId(),
            type: 'action.devices.types.VALVE',
            traits: [
                'action.devices.traits.OpenClose',
            ],
            name: {
                defaultNames: ['My Door'],
                name: 'Door',
                nicknames: ['Door'],
            },
            deviceInfo: {
                manufacturer: 'Enric Co',
                model: 'enric-door',
                hwVersion: '1.0',
                swVersion: '1.0.1',
            },
            willReportState: true,
        };
    }
    
    getOnQuery(): Promise<any> {
        const promise = new Promise((resolve) => {
            resolve({
                status: "SUCCESS",
                online: true,
                openPercent: 0,
                isLocked: true,
                isJammed: false
            });
        });
        return promise;
    }
    
    execute(): SmartHomeV1ExecuteResponseCommands {
        return null;
    }
}