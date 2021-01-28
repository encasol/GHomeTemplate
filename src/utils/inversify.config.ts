import { Container } from "inversify";
import "reflect-metadata";
import { AuthProvider, IAuthProvider } from "../auth/auth-provider";
import { IDevice } from "../devices/device-interface";
import { DevicesProvider, IDevicesProvider } from "../devices/devices-provider";
import { Door } from "../devices/door";
import { IServerProxy, ServerProxy } from "../server/server-proxy";
import { ISmartHomeManager, SmartHomeManager } from "../smarthome/smarthome-manager";
import { ISmartHomeProxy, SmartHomeProxy } from "../smarthome/smarthome-proxy";
import { Symbols } from "./symbols";

const container = new Container();
container.bind<ISmartHomeManager>(Symbols.SmartHomeManager).to(SmartHomeManager);
container.bind<ISmartHomeProxy>(Symbols.SmartHomeProxy).to(SmartHomeProxy);
container.bind<IDevicesProvider>(Symbols.DevicesProvider).to(DevicesProvider);
container.bind<IDevice>(Symbols.Door).to(Door);
container.bind<IServerProxy>(Symbols.ServerProxy).toConstantValue(new ServerProxy());
container.bind<IAuthProvider>(Symbols.AuthProvider).to(AuthProvider);

export { container };
