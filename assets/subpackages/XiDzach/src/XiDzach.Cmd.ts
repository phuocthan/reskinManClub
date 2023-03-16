import OutPacket from "../../../scripts/networks/Network.OutPacket";
import InPacket from "../../../scripts/networks/Network.InPacket";
import Configs from "../../../scripts/common/Configs";

export namespace cmd {
    export class Code {
        static LOGIN = 1;
        static TOPSERVER = 1001;
        static CMD_PINGPONG = 1050;

        static CMD_JOIN_ROOM = 3001;
        static CMD_RECONNECT_ROOM = 3002;
        static MONEY_BET_CONFIG = 3003;
        static JOIN_ROOM_FAIL = 3004;
        static CHAT_ROOM = 3008;

        static CREATE_ROOM = 3013;
        static GET_LIST_ROOM = 3014;
        static JOIN_GAME_ROOM_BY_ID = 3015;

        static SELECT_DEALER = 3100;

        static MO_BAI = 3101;
        static BUY_IN = 3102;
        static KET_THUC = 3103;
        static CHIA_BAI = 3105;
        static TU_DONG_BAT_DAU = 3107;
        static REQUEST_SHOW_CARD = 3108;
        static REQUEST_BUY_IN = 3109;
        static THONG_TIN_BAN_CHOI = 3110;
        static DANG_KY_THOAT_PHONG = 3111;
        static DOI_CHUONG = 3113;
        static CHEAT_CARDS = 3115;
        static DANG_KY_CHOI_TIEP = 3116;
        static JOIN_ROOM_SUCCESS = 3118;
        static LEAVE_GAME = 3119;
        static NOTIFY_KICK_FROM_ROOM = 3120;
        static NEW_USER_JOIN = 3121;
        static NOTIFY_USER_GET_JACKPOT = 3122;
        static UPDATE_MATCH = 3123;

        static NOTIFY_CHUYEN_GIAI_DOAN_2 = 3124;
        static NOTIFY_CHUYEN_GIAI_DOAN_3 = 3125;
        static SO_BAI = 3126;
        static RUT_BAI = 3128;
        static DAN_BAI = 3129;
        static XET_BAI_ONE = 3130;
        static XET_BAI_ALL = 3131;
        static NOTIFY_NO_CHUONG = 3132;
        static RUT_BAI_TU_DONG = 3133;
        static NOTIFY_XIZACH = 3134;

        static PLAYER_STATUS_OUT_GAME = 0;
        static PLAYER_STATUS_VIEWER = 1;
        static PLAYER_STATUS_SITTING = 2;
        static PLAYER_STATUS_PLAYING = 3;

        static MAX_PLAYER = 6;
    }

    // OutPacket
    export class CmdLogin extends OutPacket {
        constructor(a: string, b: string) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.LOGIN);
            this.packHeader();
            this.putString(a); // nickname
            this.putString(b); // accessToken
            this.updateSize();
        }
    }

    export class CmdJoinRoom extends OutPacket {
        constructor(a: number, b: number, c: number) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.CMD_JOIN_ROOM);
            this.packHeader();
            this.putInt(a);
            this.putInt(b);
            this.putLong(c);
            this.putInt(0);
            this.updateSize();
        }
    }

    export class CmdReconnectRoom extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.CMD_RECONNECT_ROOM);
            this.packHeader();
            this.updateSize();
        }
    }

    export class CmdSendRequestLeaveGame extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.DANG_KY_THOAT_PHONG);
            this.packHeader();
            this.updateSize();
        }
    }

    export class CmdSendHoldRoom extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.DANG_KY_CHOI_TIEP);
            this.packHeader();
            this.updateSize();
        }
    }

    export class SendGetGameConfig extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.MONEY_BET_CONFIG);
            this.packHeader();
            this.updateSize();
        }
    }

    export class SendGetTopServer extends OutPacket {
        constructor(a: number) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.TOPSERVER);
            this.packHeader();
            this.putByte(a);
            this.updateSize();
        }
    }

    export class SendCreateRoom extends OutPacket {
        constructor(a: number, b: number, c: number, d: number, e: number, f: string, g: string, h: number) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.CREATE_ROOM);
            this.packHeader();
            this.putInt(a);
            this.putInt(b);
            this.putLong(c);
            this.putInt(d);
            this.putInt(e);
            this.putString(f);
            this.putString(g);
            this.putLong(h);
            this.updateSize();
        }
    }

    export class SendCardCheat extends OutPacket {
        constructor(a: number, b: []) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.CHEAT_CARDS);
            this.packHeader();
            this.putByte(a);
            this.putByte(0);
            this.putShort(b.length);
            if (a)
                for (var c = 0; c < b.length; c++) this.putByte(b[c]);
            this.updateSize();
        }
    }

    export class CmdSendMoBai extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.MO_BAI);
            this.packHeader();
            this.updateSize();
        }
    }

    export class CmdSendPing extends OutPacket {
        constructor(a: number) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.CMD_PINGPONG);
            this.packHeader();
            this.updateSize();
        }
    }

    // old Xoc Dia
    export class SendGetListRoom extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.GET_LIST_ROOM);
            this.packHeader();
            this.putInt(Configs.App.MONEY_TYPE);//money type
            this.putInt(Code.MAX_PLAYER);//maxplayer
            this.putLong(-1);//khong xac dinh
            this.putInt(0);//khong xac dinh
            this.putInt(0);//CARD_FROM
            this.putInt(50);//CARD_TO
            this.updateSize();
        }
    }

    export class SendJoinRoomById extends OutPacket {
        constructor(id: number) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.JOIN_GAME_ROOM_BY_ID);
            this.packHeader();
            this.putInt(id);
            this.putString("");//mat khau
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

    export class SendBuyIn extends OutPacket {
        constructor(a: number, b: number) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.BUY_IN);
            this.packHeader();
            this.putLong(a);
            this.putByte(b);
            this.updateSize();
        }
    }

    export class SendShowCard extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.REQUEST_SHOW_CARD);
            this.packHeader();
            this.updateSize();
        }
    }

    export class sendDanBai extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.DAN_BAI);
            this.packHeader();
            this.updateSize();
        }
    }

    export class sendRutBai extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.RUT_BAI);
            this.packHeader();
            this.updateSize();
        }
    }

    export class sendXetBaiOne extends OutPacket {
        constructor(a: number) {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.XET_BAI_ONE);
            this.packHeader();
            this.putByte(a);
            this.updateSize();
        }
    }

    export class sendXetBaiAll extends OutPacket {
        constructor() {
            super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(Code.XET_BAI_ALL);
            this.packHeader();
            this.updateSize();
        }
    }

    // InPacket
    export class ReceivedLogin extends InPacket {
        constructor(data: Uint8Array) {
            super(data);
            cc.log("____");
        }
    }

    export class ReceivedGetListRoom extends InPacket {
        list: any[] = [];

        constructor(data: Uint8Array) {
            super(data);
            let listSize = this.getShort();
            this.list = [];
            for (var i = 0; i < listSize; i++) {
                let item: any = {};
                item["id"] = this.getInt();
                item["userCount"] = this.getByte();
                item["limitPlayer"] = this.getByte();
                item["maxUserPerRoom"] = this.getInt();
                item["moneyType"] = this.getByte();
                item["moneyBet"] = this.getInt();
                item["requiredMoney"] = this.getInt();
                item["rule"] = this.getByte();
                item["nameRoom"] = this.getString();
                item["key"] = this.getBool();
                item["quyban"] = this.getLong();
                this.list.push(item)
            }
        }
    }

    export class ReceivedJoinRoomSucceed extends InPacket {
        myChair: number;
        chuongChair: number;
        moneyBet: number;
        roomId: number;
        gameId: number;
        moneyType: number;
        rule: number;
        playerSize: number;
        playerStatus: any[];
        playerInfos: any[];
        gameAction: number;
        countDownTime: number;
        hasChuong: number;

        constructor(data: Uint8Array) {
            super(data);
            var a: number;
            this.myChair = this.getByte();
            this.chuongChair = this.getByte();
            this.hasChuong = this.getByte();
            this.moneyBet = this.getLong();
            this.roomId = this.getInt();
            this.gameId = this.getInt();
            this.moneyType = this.getByte();
            this.rule = this.getByte();
            this.playerSize = this.getShort();
            this.playerStatus = [];
            for (a = 0; a < this.playerSize; a++) this.playerStatus.push(this.getByte());
            this.playerSize = this.getShort();
            this.playerInfos = [];
            for (a =
                0; a < this.playerSize; a++) {
                var b = {};
                b["nickName"] = this.getString();
                b["avatar"] = this.getString();
                b["money"] = this.getLong();
                this.playerInfos.push(b);
            }
            this.gameAction = this.getByte();
            this.countDownTime = this.getByte();
        }
    }

    export class ReceivedAutoStart extends InPacket {
        isAutoStart: boolean;
        timeAutoStart: number;
        constructor(data: Uint8Array) {
            super(data);
            this.isAutoStart = this.getBool();
            this.timeAutoStart = this.getByte();
        }
    }

    export class ReceivedChiaBai extends InPacket {
        playerStatusList: any[];
        sizeCard: number;
        myCards: any[];
        gameId: number;
        chuongChair: number;
        timeChiaBai: number;
        boBaiId: string;
        constructor(data: Uint8Array) {
            super(data);
            this.playerStatusList = [];
            var a: any = this.getShort();
            cc.log("statusList: " + a);
            for (var a: any = "", b = 0; b < cmd.Code.MAX_PLAYER; b++) this.playerStatusList.push(this.getByte()), a += " " + this.playerStatusList[b];
            cc.log("status List server: " + a);
            this.sizeCard = this.getShort();
            this.myCards = [];
            for (b = 0; b < this.sizeCard; b++) this.myCards.push(this.getByte());
            this.gameId = this.getInt();
            this.chuongChair = this.getByte();
            this.timeChiaBai = this.getByte();
            cc.log("Bo bai server tra: " + this.boBaiId)
        }
    }

    export class ReceivedUserLeaveRoom extends InPacket {
        chair: number;
        nickName: string;
        constructor(data: Uint8Array) {
            super(data);
            this.chair = this.getByte();
            this.nickName = this.getString();
        }
    }

    export class ReceivedUserJoinRoom extends InPacket {
        info: {};
        uChair: number;
        uStatus: number;
        constructor(data: Uint8Array) {
            super(data);
            this.info = {};
            this.info["nickName"] = this.getString();
            this.info["avatar"] = this.getString();
            this.info["money"] = this.getLong();
            this.uChair = this.getByte();
            this.uStatus = this.getByte();
        }
    }

    export class ReceivedUpdateMatch extends InPacket {
        myChair: number;
        hasInfo: any[];
        infos: any[];
        constructor(data: Uint8Array) {
            super(data);
            this.myChair = this.getByte();
            var a = this.getShort();
            this.hasInfo = [];
            for (var b = 0; b < a; b++) this.hasInfo.push(this.getBool());
            this.infos = [];
            for (b = 0; b < a; b++) {
                var c = {};
                this.hasInfo[b] && (c["nickName"] = this.getString(), c["avatar"] = this.getString(), c["money"] = this.getLong(), c["status"] = this.getInt());
                this.infos.push(c);
            }
        }
    }

    export class ReceivedXiDzachConfig extends InPacket {
        listSize: number;
        list: any[];
        constructor(data: Uint8Array) {
            super(data);
            this.listSize = this.getShort();
            this.list = [];
            for (var a = 0; a < this.listSize; a++) {
                var b = {};
                b["maxUserPerRoom"] = this.getByte();
                b["moneyType"] = this.getByte();
                b["moneyBet"] = this.getLong();
                b["moneyRequire"] = this.getLong();
                b["nPersion"] = this.getInt();
                this.list.push(b);
            }
        }
    }

    export class ReceivedNotifyRegOutRoom extends InPacket {
        outChair: number;
        isOutRoom: boolean;
        constructor(data: Uint8Array) {
            super(data);
            this.outChair = this.getByte();
            this.isOutRoom = this.getBool();
        }
    }

    export class ReceivedKickOff extends InPacket {
        reason: number;
        constructor(data: Uint8Array) {
            super(data);
            this.reason = this.getByte();
        }
    }

    export class ReceivedMoBai extends InPacket {
        chairMoBai: number;
        cardSize: number;
        cards: any[];
        constructor(data: Uint8Array) {
            super(data);
            this.chairMoBai = this.getByte();
            this.cardSize = this.getShort();
            this.cards = [];
            for (var a = 0; a < this.cardSize; a++) {
                this.cards.push(this.getByte());
            }
        }
    }

    export class ReceivedEndGame extends InPacket {
        playerStatusList: any[];
        listCards: any[];
        tongTienThangThua: number;
        winMoneyList: any[];
        currentMoneyList: any[];
        needShowWinLostMoney: any[];
        constructor(data: Uint8Array) {
            super(data);
            this.playerStatusList = [];
            this.listCards = [];
            for (var a = this.getShort(), b: any = " ", c = 0; c < a; c++) this.playerStatusList.push(this.getInt()), b += " " + this.playerStatusList[c];
            for (c = 0; c < a; c++) {
                if (this.playerStatusList[c] == cmd.Code.PLAYER_STATUS_PLAYING) {
                    for (var b: any = [], d = this.getShort(), e = " ", f = 0; f < d; f++) b.push(this.getByte()), e += " " + b[f];
                } else b = [];
                this.listCards.push(b)
            }
            this.tongTienThangThua = this.getLong();
            this.winMoneyList = [];
            a = this.getShort();
            for (c = 0; c < a; c++) this.winMoneyList.push(this.getLong()), cc.log("Index: " + this.winMoneyList[c]);
            this.currentMoneyList = [];
            a = this.getShort();
            for (c = 0; c < a; c++) this.currentMoneyList.push(this.getLong()), cc.log("Index: " + this.currentMoneyList[c]);
            a = this.getShort();
            this.needShowWinLostMoney = [];
            for (c = 0; c < a; c++) this.needShowWinLostMoney.push(this.getByte()), cc.log("Index: i" + this.needShowWinLostMoney[c])
        }
    }

    export class ReceivedDoiChuong extends InPacket {
        chuongChair: number;
        constructor(data: Uint8Array) {
            super(data);
            this.chuongChair = this.getByte();
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

    export class ReceivedGameInfo extends InPacket {
        myChair: number;
        chuongChair: number;
        gameServerState: number;
        isAutoStart: number;
        gameAction: number;
        countDownTime: number;
        moneyType: number;
        moneyBet: number;
        gameId: number;
        roomId: number;
        playerStatusSize: number;
        playerStatusList: any[];
        playerInfoList: any[];
        cardPlayerList: any[];

        constructor(data: Uint8Array) {
            super(data);
            this.myChair = this.getByte();
            this.chuongChair = this.getByte();
            this.gameServerState = this.getByte();
            this.isAutoStart = this.getByte();
            this.gameAction = this.getByte();
            this.countDownTime = this.getByte();
            this.moneyType = this.getByte();
            this.moneyBet = this.getLong();
            this.gameId = this.getInt();
            this.roomId = this.getInt();
            var a: any = " ";
            this.playerStatusSize = this.getShort();
            this.playerStatusList = [];
            for (var b = 0; b < this.playerStatusSize; b++) this.playerStatusList.push(this.getInt()), a = a + " " + this.playerStatusList[b];
            this.playerInfoList = [];
            for (b = 0; b < Code.MAX_PLAYER; b++) 0 < this.playerStatusList[b] ? (a = {}, a["status"] = this.getByte(), a["currentMoney"] = this.getLong(), a["avatarUrl"] = this.getString(), a["nickName"] = this.getString()) : (a = {}, a["currentMoney"] = 0, a["status"] = 0, a["avatarUrl"] = "", a["nickName"] = ""), this.playerInfoList.push(a);
            this.cardPlayerList = [];
            for (b = 0; b < Code.MAX_PLAYER; b++) {
                var a: any = [], c = " ";
                if (this.playerStatusList[b] == Code.PLAYER_STATUS_PLAYING) {
                    var d = this.getShort();
                    for (var e = 0; e < d; e++) a.push(this.getByte())
                }
                this.cardPlayerList.push(a);
                if (0 < a.length) {
                    for (d = 0; d < a.length; d++) c += " " + a[d];
                }
            }
            for (b = 0; b < Code.MAX_PLAYER; b++) this.playerInfoList[b].hasDanBai = this.playerStatusList[b] == Code.PLAYER_STATUS_PLAYING ? this.getByte() : !1
        }
    }

    export class ReceivedTopServer extends InPacket {
        rankType: number;
        topDay_money: string;
        topWeek_money: string;
        topMonth_money: string;
        topDay_number: string;
        topWeek_number: string;
        topMonth_number: string;
        constructor(data: Uint8Array) {
            super(data);
            this.rankType = this.getByte();
            this.topDay_money = this.getString();
            this.topWeek_money = this.getString();
            this.topMonth_money = this.getString();
            this.topDay_number = this.getString();
            this.topWeek_number = this.getString();
            this.topMonth_number = this.getString();
        }
    }

    export class ReceivedJoinRoomFail extends InPacket {
        constructor(data: Uint8Array) {
            super(data);
        }
    }

    export class ReceivedChuyenGiaiDoan2 extends InPacket {
        countDownTime: number;
        constructor(data: Uint8Array) {
            super(data);
            this.countDownTime = this.getByte();
        }
    }

    export class ReceivedChuyenGiaiDoan3 extends InPacket {
        countDownTime: number;
        sizeCard: number;
        chuongCards: any[];
        constructor(data: Uint8Array) {
            super(data);
            this.countDownTime = this.getByte();
            this.sizeCard = this.getShort();
            this.chuongCards = [];
            for (var a = 0; a < this.sizeCard; a++) this.chuongCards.push(this.getByte())
        }
    }

    export class ReceivedRutCard extends InPacket {
        chair: number;
        card: number;
        constructor(data: Uint8Array) {
            super(data);
            this.chair = this.getByte();
            this.card = this.getByte();
        }
    }

    export class ReceivedDanBai extends InPacket {
        chair: number;
        constructor(data: Uint8Array) {
            super(data);
            this.chair = this.getByte();
        }
    }

    export class ReceivedRutBaiTuDong extends InPacket {
        chair: number;
        cardSize: number;
        cards: any[];
        constructor(data: Uint8Array) {
            super(data);
            this.chair = this.getByte();
            this.cardSize = this.getShort();
            cc.log("rutBaiTuDong size: " + this.cardSize);
            this.cards = [];
            for (var a = "", b = 0; b < this.cardSize; b++) this.cards.push(this.getByte()), a += " " + this.cards[b];
            cc.log("card rut tu dong: " + a)
        }
    }

    export class ReceivedSoBai extends InPacket {
        chair1: number;
        chair2: number;
        winMoney1: number;
        winMoney2: number;
        currentMoney1: number;
        currentMoney2: number;
        hasCard1: number;
        card1: any[];
        hasCard2: number;
        card2: any[];
        cardSize1: number;
        cardSize2: number;
        constructor(data: Uint8Array) {
            super(data);
            this.chair1 = this.getByte();
            cc.log("chair1: " + this.chair1);
            this.chair2 = this.getByte();
            cc.log("chair2: " + this.chair2);
            this.winMoney1 = this.getLong();
            cc.log("winMoney1: " + this.winMoney1);
            this.winMoney2 = this.getLong();
            cc.log("winMoney2: " + this.winMoney2);
            this.currentMoney1 = this.getLong();
            cc.log("currentMoney1: " + this.currentMoney1);
            this.currentMoney2 = this.getLong();
            cc.log("currentMoney2: " +
                this.currentMoney2);
            this.hasCard1 = this.getByte();
            cc.log("hasCard1: " + this.hasCard1);
            this.card1 = [];
            this.hasCard2 = this.getByte();
            cc.log("hasCard2: " + this.hasCard2);
            this.card2 = [];
            if (this.hasCard1) {
                var a = "";
                this.cardSize1 = this.getShort();
                for (var b = 0; b < this.cardSize1; b++) this.card1.push(this.getByte()), a = a + " " + this.card1[b];
                cc.log("card1: " + a)
            }
            if (this.hasCard2) {
                a = "";
                this.cardSize2 = this.getShort();
                for (b = 0; b < this.cardSize2; b++) this.card2.push(this.getByte()), a = a + " " + this.card2[b];
                cc.log("card2: " + a)
            }
        }
    }

    export class ReceivedKetQuaXiZach extends InPacket {
        needShowList: any[];
        needUpdateMoneyList: any[];
        currentMoneyList: any[];
        winMoneyList: any[];
        listCards: any[];
        constructor(data: Uint8Array) {
            super(data);
            var a = this.getShort();
            cc.log(a);
            var b: any = "";
            this.needShowList = [];
            for (var c = 0; c < a; c++) this.needShowList.push(this.getByte()), b += " " + this.needShowList[c];
            cc.log(b);
            a = this.getShort();
            cc.log(a);
            this.needUpdateMoneyList = [];
            b = "";
            for (c = 0; c < a; c++) this.needUpdateMoneyList.push(this.getByte()), b += " " + this.needUpdateMoneyList[c];
            this.currentMoneyList = [];
            this.winMoneyList = [];
            this.listCards = [];
            for (c = 0; c < cmd.Code.MAX_PLAYER; c++)
                if (this.needShowList[c]) {
                    for (var b: any = [], a = this.getShort(), d = 0; d < a; d++) b.push(this.getByte());
                    this.listCards.push(b)
                } else this.listCards.push([]);
            b = this.getShort();
            for (c = 0; c < b; c++) this.winMoneyList.push(this.getLong());
            b = this.getShort();
            for (c = 0; c < b; c++) this.currentMoneyList.push(this.getLong())
        }
    }

    export class ReceivedKetQuaSoBai extends InPacket {
        chair: number;
        chair1: number;
        chair2: number;
        chair1WinMoney: number;
        chair2WinMoney: number;
        chair1CurrentMoney: number;
        chair2CurrentMoney: number;
        hasCard1: number;
        hasCard2: number;
        card1Size: number;
        card1: any[];
        card2Size: number;
        card2: any[];
        isXiZach: number;
        constructor(data: Uint8Array) {
            super(data);
            this.chair1 = this.getByte();
            this.chair2 = this.getByte();
            this.chair1WinMoney = this.getLong();
            this.chair2WinMoney = this.getLong();
            this.chair1CurrentMoney = this.getLong();
            this.chair2CurrentMoney = this.getLong();
            this.hasCard1 = this.getByte();
            cc.log("so bai hasCard1: " + this.hasCard1);
            this.hasCard2 = this.getByte();
            cc.log("so bai hasCard2: " + this.hasCard2);
            this.card1Size = this.getShort();
            this.card1 = [];
            for (var a =
                0; a < this.card1Size; a++) this.card1.push(this.getByte());
            this.card2Size = this.getShort();
            this.card2 = [];
            for (a = 0; a < this.card2Size; a++) this.card2.push(this.getByte());
            this.isXiZach = this.getByte();
            cc.log("so Bai: " + this.isXiZach)
        }
    }
}
export default cmd;
















