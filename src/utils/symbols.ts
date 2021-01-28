import { google, homegraph_v1 } from "googleapis";

export const options: homegraph_v1.Options = {
    version: "v1",
};
export const homegraph = google.homegraph(options);
export const USER_ID = "123";

export const Symbols = {
    DevicesProvider : Symbol.for("DevicesProvider"),
    Door : Symbol.for("Door"),
    SmartHomeManager : Symbol.for("SmartHomeManager"),
    SmartHomeProxy : Symbol.for("SmartHomeProxy"),
    ServerProxy : Symbol.for("ServerProxy"),
    AuthProvider: Symbol.for("AuthProvider"),
};
