import NetworkClient from "../../../scripts/networks/Network.NetworkClient";
import NetworkListener from "../../../scripts/networks/Network.NetworkListener";
import Configs from "../../../scripts/common/Configs";
import OutPacket from "../../../scripts/networks/Network.OutPacket";

export default class XiDzachNetworkClient extends NetworkClient {
    private static instance: XiDzachNetworkClient;

    private listeners: Array<NetworkListener> = new Array<NetworkListener>();

    public static getInstance(): XiDzachNetworkClient {
        if (this.instance == null) {
            this.instance = new XiDzachNetworkClient();
        }
        return this.instance;
    }

    constructor() {
        super();
        this.isUseWSS = Configs.App.USE_WSS;
    }

    public connect() {
        super.connect(Configs.App.HOST_XIDZACH.host, Configs.App.HOST_XIDZACH.port);
    }

    protected onOpen(ev: Event) {
        super.onOpen(ev);
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
}
