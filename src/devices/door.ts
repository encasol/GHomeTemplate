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
    

    
    updateDevice(execution) {
        const {params, command} = execution;
        let state;
        console.log(params);
        console.log(command);
        switch (command) {
            case 'action.devices.commands.OpenClose':
                state = {on: true};
                console.log('OpenClose');
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
    execute(executions): Promise<SmartHomeV1ExecuteResponseCommands> {
        
        const promise = new Promise<SmartHomeV1ExecuteResponseCommands>((resolve) => {
            for (const execution of executions) {
                this.updateDevice(execution);
            }

            resolve({
                ids: [],
                status: 'SUCCESS',
                states: {
                    openPercent: 100,
                },
            });
        });
        return promise;
    }
}