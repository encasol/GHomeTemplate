import { injectable } from "inversify";
import { container } from "../utils/inversify.config";
import { Symbols } from "../utils/symbols";
import { IDevice } from "./device-interface";

export interface IDevicesProvider {
    getDevices(): Map<string, IDevice>;
}

@injectable()
export class DevicesProvider implements IDevicesProvider {
    private devices: Map<string, IDevice>;

    constructor() {
        const door: IDevice = container.get<IDevice>(Symbols.Door);

        this.devices = new Map([
            [door.getDeviceId(), door],
        ]);
    }

    public getDevices(): Map<string, IDevice> {
        return this.devices;
    }
}
