import { smarthome } from "actions-on-google";
import { Express } from "express";
import { google, homegraph_v1 } from "googleapis";
import { ISmartHomeManager, SmartHomeManager } from "./smarthome-manager";

export interface ISmartHomeProvider {
    init(): void;
}

const options: homegraph_v1.Options = {
    version: "v1",
};
const homegraph = google.homegraph(options);
const USER_ID = "123";

export class SmartHomeProvider implements ISmartHomeProvider {
    private homeApp: ISmartHomeManager;

    constructor(private app: Express) {
        this.homeApp = new SmartHomeManager(USER_ID);
    }

    public init(): void {
        const smartHome = smarthome();
        smartHome.onSync((body) => this.homeApp.onSyncResponder(body));
        smartHome.onQuery(async (body) => this.homeApp.onQueryResponder(body));
        smartHome.onExecute(async (body) => this.homeApp.onExecuteResponderasync(body));

        smartHome.onDisconnect((body, headers) => {
            console.log("User account unlinked from Google Assistant");
            return {};
        });

        this.app.get("/smarthome", smartHome);
        this.app.post("/smarthome", smartHome);

        this.app.get("/requestsync", async (request, response) => {
            console.log("RequestSync");
            response.set("Access-Control-Allow-Origin", "*");
            console.info(`Request SYNC for user ${USER_ID}`);
            try {
                const res = await homegraph.devices.requestSync({
                    requestBody: {
                        agentUserId: USER_ID,
                    },
                });
                console.info("Request sync response:", res.status, res.data);
                response.json(res.data);
            } catch (err) {
                console.error(err);
                response.status(500).send(`Error requesting sync: ${err}`);
            }
        });

        this.app.get("/reportstate", (request, response) => {
            console.log("report state");
        });
    }
}
