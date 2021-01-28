import { SmartHomeV1ExecuteResponseCommands, SmartHomeV1SyncDevices } from "actions-on-google";
import { IDevice } from "./device-interface";

export class Door implements IDevice {

    public getDeviceId(): string {
        return "washer";
    }

    public getOnSync(): SmartHomeV1SyncDevices {
        return {
            deviceInfo: {
                hwVersion: "1.0",
                manufacturer: "Enric Co",
                model: "enric-door",
                swVersion: "1.0.1",
            },
            id: this.getDeviceId(),
            name: {
                defaultNames: ["My Door"],
                name: "Door",
                nicknames: ["Door"],
            },
            traits: [
                "action.devices.traits.OpenClose",
            ],
            type: "action.devices.types.VALVE",
            willReportState: true,
        };
    }

    public getOnQuery(): any {

        return {
            isJammed: false,
            isLocked: true,
            online: true,
            openPercent: 0,
            status: "SUCCESS",
        };
    }

    public updateDevice(execution) {
        const {params, command} = execution;
        let state;
        console.log(params);
        console.log(command);
        switch (command) {
            case "action.devices.commands.OpenClose":
                state = {on: true};
                console.log("OpenClose");
                break;
            case "action.devices.commands.StartStop":
                state = {isRunning: true};
                console.log("StartStop");
                break;
            case "action.devices.commands.PauseUnpause":
                state = {isPaused: false};
                console.log("StartStop");
                break;
        }

        return state;
    }

    public execute(executions): SmartHomeV1ExecuteResponseCommands {
        for (const execution of executions) {
            this.updateDevice(execution);
        }

        return {
            ids: [],
            states: {
                openPercent: 100,
            },
            status: "SUCCESS",
        };
    }
}
