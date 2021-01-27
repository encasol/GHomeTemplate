import { IDevice } from "./device-interface";
import { Door } from "./door";

export interface IDeviceProvider {
    getDevices(): Map<string, IDevice>;
}

export class DeviceProvider implements IDeviceProvider {
    private devices: Map<string, IDevice>;

    constructor() {
        const door: Door = new Door();

        this.devices = new Map([
            [door.getDeviceId(), door],
        ]);
    }

    public getDevices(): Map<string, IDevice> {
        return this.devices;
    }
}
