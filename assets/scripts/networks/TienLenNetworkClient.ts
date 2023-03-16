import CardGameNetworkClient from "./CardGameNetworkClient";
import Configs from "../common/Configs";

export default class TienLenNetworkClient extends CardGameNetworkClient {
    public static IS_SOLO = false;
    public static INVITER = null;
    
    public static getInstance(): TienLenNetworkClient {
        if (this.instance == null) {
            this.instance = new TienLenNetworkClient();
        }
        return this.instance as TienLenNetworkClient;
    }

    constructor() {
        super();
    }

    _connect() {
        super.connect(Configs.App.HOST_TLMN.host, Configs.App.HOST_TLMN.port);
    }

    onOpen(ev: Event) {
        super.onOpen(ev);
        console.log("tlmn connected");
    }

    onClose(ev: Event) {
        super.onClose(ev);
        console.log("tlmn closed");
    }
}