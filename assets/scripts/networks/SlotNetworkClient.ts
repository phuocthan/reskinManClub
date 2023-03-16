import NetworkClient from "./Network.NetworkClient";
import OutPacket from "./Network.OutPacket";
import NetworkListener from "./Network.NetworkListener";
import Configs from "../common/Configs";
import cmd from "./Network.Cmd";
import InPacket from "./Network.InPacket";

export default class SlotNetworkClient extends NetworkClient {
    private static instance: SlotNetworkClient;

    private listeners: Array<NetworkListener> = new Array<NetworkListener>();
    private isLogin = false;
    private onLogined: () => void = null;

    public static getInstance(): SlotNetworkClient {
        if (this.instance == null) {
            this.instance = new SlotNetworkClient();
        }
        return this.instance;
    }

    constructor() {
        super();
        this.isUseWSS = Configs.App.USE_WSS;
    }

    public checkConnect(onLogined: () => void) {
        this.onLogined = onLogined;
        if (this.ws != null && this.ws.readyState == WebSocket.CONNECTING) {
            console.log("SlotNetworkClient: Đang Kết Nối" +  WebSocket.CONNECTING);
            return;
        } 
        if (!this.isConnected()) {
            console.log("SlotNetworkClient: Kết Nối Lại");
            this.connect();
            return;
        }

        console.log("SlotNetworkClient:OK Vào Game"); 

        if (this.isLogin && this.onLogined != null) {
            this.onLogined();
            this.onLogined = null;
        } 
    }

    public connect() {
        super.connect(Configs.App.HOST_SLOT.host, Configs.App.HOST_SLOT.port);
    }

    protected onOpen(ev: Event) {
        super.onOpen(ev);
        this.send(new cmd.SendLogin(Configs.Login.Nickname, Configs.Login.AccessToken));
        console.log("slot connected");

        if (this.isLogin && this.onLogined != null) {
            this.onLogined();
            this.onLogined = null;
        } 
    }

    protected onClose(ev: Event) {
        super.onClose(ev);

        console.log("slot closed");
    }

    protected onMessage(ev: MessageEvent) {
        var data = new Uint8Array(ev.data);
        for (var i = 0; i < this.listeners.length; i++) {
            var listener = this.listeners[i];
            if (listener.target && listener.target instanceof Object && listener.target.node) {
                listener.callback(data);
            } else {
                this.listeners.splice(i, 1);
                i--;
            }
        }

        let inpacket = new InPacket(data);
        switch (inpacket.getCmdId()) {
            case cmd.Code.LOGIN:
                this.isLogin = true;
                if (this.onLogined != null) {
                    this.onLogined();
                }
                break;
        }
    }

    public addListener(callback: (data: Uint8Array) => void, target: cc.Component) {
        this.listeners.push(new NetworkListener(target, callback));
    }

    public send(packet: OutPacket) {
        for (var b = new Int8Array(packet._length), c = 0; c < packet._length; c++)
            b[c] = packet._data[c];
        if (this.ws != null && this.isConnected())
            this.ws.send(b.buffer);
    }

    public sendCheck(packet: OutPacket) {
        this.checkConnect(() => {
            this.send(packet);
        });
    }
}
