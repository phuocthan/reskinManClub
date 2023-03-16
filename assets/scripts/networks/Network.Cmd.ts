import OutPacket from "./Network.OutPacket";
import InPacket from "./Network.InPacket";

export namespace cmd {
    export class Code {
        static readonly LOGIN = 1;
        static readonly GET_MONEY_USE = 20051;
    }

    export class Login extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.LOGIN);
        }

        putData(nickname: string, accessToken: string) {
            this.packHeader();
            this.putString(nickname);
            this.putString(accessToken);
            this.updateSize()
        }
    }

    export class SendLogin extends OutPacket {
        constructor(nickname: string, accessToken: string) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.LOGIN);
            this.packHeader();
            this.putString(nickname);
            this.putString(accessToken);
            this.updateSize();
        }
    }

    export class ReqGetMoneyUse extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.GET_MONEY_USE);
            this.packHeader();
            this.updateSize();
        }
    }
    
    export class ResGetMoneyUse extends InPacket {
        moneyUse = 0;

        constructor(data: Uint8Array) {
            super(data);
            this.moneyUse = this.getLong();
        }
    }
}
export default cmd;
