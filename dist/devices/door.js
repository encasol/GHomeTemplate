"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Door {
    getDeviceId() {
        return 'washer';
    }
    getOnSync() {
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
    getOnQuery() {
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
    execute() {
        return null;
    }
}
exports.Door = Door;
//# sourceMappingURL=door.js.map