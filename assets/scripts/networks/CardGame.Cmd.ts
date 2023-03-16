import OutPacket from "./Network.OutPacket";
import InPacket from "./Network.InPacket";

const { ccclass } = cc._decorator;

export namespace CardGameCmd {
    export class Code {
        static LOGIN = 1;
        static NOTIFY_DISCONNECT = 37;
        static PING_PONG = 50;
        static JOIN_ROOM = 3001;
        static RECONNECT_GAME_ROOM = 3002;
        static JOIN_ROOM_FAIL = 3004;
        static HOLD = 3116;
        static MONEY_BET_CONFIG = 3003;
        static GET_LIST_ROOM = 3014;
        static TOP_SERVER = 1001;
        static CHEAT_CARD = 3115;
        static PING_TEST = 1050;
        static CHAT_ROOM = 3008;
        static NO_HU_VANG = 3007;
        static THONG_TIN_HU_VANG = 3009;
        static REQUEST_INFO_MOI_CHOI = 3010;
        static MOI_CHOI = 3011;
        static ACCEPT_MOI_CHOI = 3012;
        static CREATE_ROOM = 3013;
        static JOIN_GAME_ROOM_BY_ID = 3015;
        static FIND_ROOM_LOBBY = 3016;
        static GET_XOCDIA_CONFIG = 3017;
        static CREATE_ROOM_FAIL = 3018;
        static GET_INFO_INVITE = 3010;
        static INVITE = 3011;
        static ACCEPT_INVITE = 3012;
    }

    export class SendMoneyBetConfig extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.MONEY_BET_CONFIG);
            this.packHeader();
            this.updateSize();
        }
    }

    export class ResMoneyBetConfig extends InPacket {
        list = [];
        rules = [];
        constructor(data: Uint8Array) {
            super(data);
            let listSize = this.getShort();
            for (var a = 0; a < listSize; a++) {
                var b = {
                    maxUserPerRoom: this.getInt(),
                    moneyType: this.getByte(),
                    moneyBet: this.getLong(),
                    moneyRequire: this.getLong(),
                    nPersion: this.getInt(),
                };
                this.list.push(b);
            }
            for (a = 0; a < listSize; a++) this.rules.push(this.getByte());
        }
    }

    export class SendGetListRoom extends OutPacket {
        constructor(moneyType: number, maxPlayer: number, param3: number, param4: number, cardFrom: number, cardTo: number) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.GET_LIST_ROOM);
            this.packHeader();
            this.putByte(moneyType);
            this.putByte(maxPlayer);
            this.putByte(param3);
            this.putByte(param4);
            this.putByte(cardFrom);
            this.putByte(cardTo);
            this.updateSize();
        }
    }

    export class SendJoinRoom extends OutPacket {
        constructor(type: number, max: number, bet: number, rule: number) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.JOIN_ROOM);
            this.packHeader();
            this.putInt(type);
            this.putInt(max);
            this.putLong(bet);
            this.putInt(rule);
            this.updateSize();
        }
    }

    export class ReceivedJoinRoomFail extends InPacket {
        error = 0;

        constructor(data: Uint8Array) {
            super(data);
            this.error = this.getError();
        }
    }

    export class SendGetInfoInvite extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.GET_INFO_INVITE);
            this.packHeader();
            this.updateSize();
        }
    }

    export class ReceivedGetInfoInvite extends InPacket {
        listUserName = [];
        listUserMoney = [];

        constructor(data: Uint8Array) {
            super(data);

            let len1 = this.getShort();
            for(var i=0; i<len1; i++) {
                this.listUserName.push(this.getString());
            }
            // console.log(this.listUserName);

            let len2 = this.getShort();
            for(var i=0; i<len2; i++) {
                this.listUserMoney.push(this.getLong());
            }
            // console.log(this.listUserMoney);
        }
    }

    export class SendInvite extends OutPacket {
        constructor(listData: any[]) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.INVITE);
            this.packHeader();

            var len = listData.length;
            this.putShort(len);

            for(var i=0; i<listData.length; i++) {
                this.putString(listData[i]);
            }

            this.updateSize();
        }
    }

    export class ReceivedInvite extends InPacket {
        roomId: number;
        maxPlayer: number;
        bet: number;
        inviter: string;
        rule: number;

        constructor(data: Uint8Array) {
            super(data);

            this.roomId = this.getInt();
            this.maxPlayer = this.getByte();
            this.bet = this.getLong();
            this.inviter = this.getString();
            this.rule = this.getInt();
        }
    }

    export class SendAcceptInvite extends OutPacket {
        constructor(inviter: string) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.ACCEPT_INVITE);
            this.packHeader();

            this.putString(inviter);

            this.updateSize();
        }
    }

    export class SendChatRoom extends OutPacket {
        constructor(a: number, b: string) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.CHAT_ROOM);
            this.packHeader();
            this.putByte(a ? 1 : 0);
            this.putString(encodeURI(b));
            this.updateSize();
        }
    }

    export class ReceivedChatRoom extends InPacket {
        chair: number;
        isIcon: boolean;
        content: string;
        nickname: string;
        constructor(data: Uint8Array) {
            super(data);
            this.chair = this.getByte();
            this.isIcon = this.getBool();
            this.content = decodeURI(this.getString());
            this.nickname = this.getString()
        }
    }
}
export default CardGameCmd;