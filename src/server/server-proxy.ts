import bodyParser from "body-parser";
import { Express } from "express";
import express from "express";
import http from "http";
import { injectable } from "inversify";

export interface IServerProxy {
    get(path: string, ...handlers: any): void;
    post(path: string, ...handlers: any): void;
    listen(): void;
}

@injectable()
export class ServerProxy implements IServerProxy {
    private app: Express;
    private port: number = 3000;
    constructor() {
        this.app = express();
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
    }

    public get(path: string, ...handlers: any) {
        this.app.get(path, handlers);
    }

    public post(path: string, ...handlers: any) {
        this.app.post(path, handlers);
    }

    public listen(): void {
        console.log("Started");
        const httpServer = http.createServer(this.app);
        httpServer.listen(this.port);
    }
}
