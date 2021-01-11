import express, {	Application}from "express";
import { Server as SocketIOServer}from "socket.io";
	import { createServer, Server as HTTPServer} from "http";
import cors from "cors";

let interval: NodeJS.Timeout
  
export class Server {
	private httpServer: HTTPServer;
	private app: Application;
	private io: SocketIOServer;
	private readonly DEFAULT_PORT = 5000;
	constructor() {
		this.initialize();
		this.handleRoutes();
		this.handleSocketConnection();
	}
	private initialize(): void {
		this.app = express();
		this.app.use(cors());
		this.httpServer = createServer(this.app);
		this.io = new SocketIOServer(this.httpServer,  { cors: {
    origin: '*',
  }});
	}
	private handleRoutes(): void {			
		this.app.get("/", (req, res) => {
			res.send(`<h1>Hello World</h1>`);
		});
	}
	private getApiAndEmit(socket: any): void {
		const response = new Date();
		// Emitting a new message. Will be consumed by the client
		socket.emit("FromAPI", response);
	};
	private handleSocketConnection(): void {
		this.io.on("connect", (socket: any) => {
			console.log("Socket connected.");
			if (interval) {
				clearInterval(interval);
			}
			interval = setInterval(() => this.getApiAndEmit(socket), 1000);
			socket.on("disconnect", () => {
				console.log("Client disconnected");
				clearInterval(interval);
			});
		});
	}
	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () => callback(this.DEFAULT_PORT));
	}
}