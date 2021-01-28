import { smarthome } from "actions-on-google";
import { inject, injectable } from "inversify";
import { IServerProxy } from "../server/server-proxy";
import { container } from "../utils/inversify.config";
import { homegraph, Symbols, USER_ID } from "../utils/symbols";
import { ISmartHomeManager } from "./smarthome-manager";

export interface ISmartHomeProxy {
    init(): void;
}

@injectable()
export class SmartHomeProxy implements ISmartHomeProxy {
    private homeApp: ISmartHomeManager = container.get<ISmartHomeManager>(Symbols.SmartHomeManager);

    constructor(@inject(Symbols.ServerProxy) private app: IServerProxy) {
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
