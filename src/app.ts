import bodyParser from "body-parser";
import express from "express";
import http from "http";
import "reflect-metadata";
import { IAuthProvider } from "./auth/auth-provider";
import { IServerProxy } from "./server/server-proxy";
import { ISmartHomeProxy } from "./smarthome/smarthome-proxy";
import { container } from "./utils/inversify.config";
import { Symbols } from "./utils/symbols";

const authProv: IAuthProvider = container.get<IAuthProvider>(Symbols.AuthProvider);
authProv.init();
const smartHome: ISmartHomeProxy = container.get<ISmartHomeProxy>(Symbols.SmartHomeProxy);
smartHome.init();
const serverProxy: IServerProxy = container.get<IServerProxy>(Symbols.ServerProxy);
serverProxy.listen();
