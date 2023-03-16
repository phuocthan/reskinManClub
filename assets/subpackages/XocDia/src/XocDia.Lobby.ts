import Configs from "../../../scripts/common/Configs";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import Utils from "../../../scripts/common/Utils";
import XocDiaNetworkClient from "./XocDia.XocDiaNetworkClient";
import cmd from "./XocDia.Cmd";
import InPacket from "../../../scripts/networks/Network.InPacket";
import App from "../../../scripts/common/App";
import XocDiaController from "./XocDia.XocDiaController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Lobby extends cc.Component {

    @property(cc.Label)
    lblNickname: cc.Label = null;
    @property(cc.Label)
    lblCoin: cc.Label = null;

    @property(cc.Node)
    listItems: cc.Node = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null;

    private inited = false;
    private listRoom: any[] = null;

    // onLoad () {}

    start() {

    }

    public init() {
        if (this.inited) return;
        this.inited = true;

        this.lblNickname.string = Configs.Login.Nickname;
        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            if (!this.node.active) return;
            this.lblCoin.string = Utils.formatNumber(Configs.Login.Coin);
        }, this);
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);

        XocDiaNetworkClient.getInstance().addListener((data) => {
            if (!this.node.active) return;
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmd.Code.LOGIN:
                    {
                        XocDiaNetworkClient.getInstance().send(new cmd.SendReconnect());
                    }
                    break;
                case cmd.Code.GETLISTROOM:
                    {
                        let res = new cmd.ReceiveGetListRoom(data);
                        console.log(res);
                        let bigBet = 0;
                        res.list.sort((a, b) => a.moneyBet - b.moneyBet);
                        this.listRoom = res.list;
                        for (let i = 0; i < res.list.length; i++) {
                            this.scheduleOnce(() => {
                                let itemData = res.list[i];
                                let item = cc.instantiate(this.itemTemplate);
                                item.parent = this.listItems;
                                item.getChildByName("lblBet").getComponent(cc.Label).string = Utils.formatNumber(itemData["moneyBet"]);
                                item.getChildByName("lblMin").getComponent(cc.Label).string = Utils.formatNumber(itemData["requiredMoney"]);
                                item.getChildByName("lblPlayers").getComponent(cc.Label).string = itemData["userCount"] + "/" + itemData["maxUserPerRoom"];
                                item.getChildByName("sprPlayers").getComponent(cc.Sprite).fillRange = itemData["userCount"] / itemData["maxUserPerRoom"];
                                if (itemData["maxUserPerRoom"] == 500) {
                                    item.setSiblingIndex(0);
                                }
                                item.active = true;

                                item.on("click", () => {
                                    App.instance.showLoading(true);
                                    XocDiaNetworkClient.getInstance().send(new cmd.SendJoinRoomById(itemData["id"]));
                                });
                                    
                                item.opacity = 0;
                                item.runAction(cc.fadeIn(0.5));
                            }, i*0.05);                          
                        }

                        this.itemTemplate.active = false;

                        this.joinFirstRoom();
                    }
                    break;
                case cmd.Code.JOIN_ROOM_FAIL:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceiveJoinRoomFail(data);
                        console.log(res);
                        let msg = "Lỗi " + res.getError() + ", không xác định.";
                        switch (res.getError()) {
                            case 1:
                                msg = "Lỗi kiểm tra thông tin!";
                                break;
                            case 2:
                                msg = "Không tìm được phòng thích hợp. Vui lòng thử lại sau!";
                                break;
                            case 3:
                                msg = "Bạn không đủ tiền vào phòng chơi này!";
                                break;
                            case 4:
                                msg = "Không tìm được phòng thích hợp. Vui lòng thử lại sau!";
                                break;
                            case 5:
                                msg = "Mỗi lần vào phòng phải cách nhau 10 giây!";
                                break;
                            case 6:
                                msg = "Hệ thống bảo trì!";
                                break;
                            case 7:
                                msg = "Không tìm thấy phòng chơi!";
                                break;
                            case 8:
                                msg = "Mật khẩu phòng chơi không đúng!";
                                break;
                            case 9:
                                msg = "Phòng chơi đã đủ người!";
                                break;
                            case 10:
                                msg = "Bạn bị chủ phòng không cho vào bàn!"
                        }
                        App.instance.alertDialog.show3(msg, () => {
                            this.actBack();
                        });
                    }
                    break;
                case cmd.Code.JOIN_ROOM_SUCCESS:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceiveJoinRoomSuccess(data);
                        console.log(res);
                        this.node.active = false;
                        XocDiaController.instance.play.show(res);
                    }
                    break;
                default:
                    console.log("--inpacket.getCmdId(): " + inpacket.getCmdId());
                    break;
            }
        }, this);

        this.itemTemplate.active = false;
    }

    public show() {
        this.node.active = true;
        this.actRefesh();
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
    }

    public actRefesh() {
        for (let i = 0; i < this.listItems.childrenCount; i++) {
            if (this.listItems.children[i] != this.itemTemplate) {
                this.listItems.children[i].destroy();
            }
        }
        XocDiaNetworkClient.getInstance().send(new cmd.SendGetListRoom());
    }

    public actBack() {
        XocDiaNetworkClient.getInstance().close();
        App.instance.loadScene("lobby");
    }

    public actCreateTable() {
        App.instance.alertDialog.showMsg("Không thể tạo bàn trong game này.");
    }

    public actQuickPlay() {
        if (this.listRoom == null) {
            App.instance.alertDialog.showMsg("Không tìm thấy bàn nào phù hợp với bạn.");
            return;
        }
        //find all room bet < coin
        if (this.listRoom.length <= 0) {
            App.instance.alertDialog.showMsg("Không tìm thấy bàn nào phù hợp với bạn.");
            return;
        }
        let randomIdx = Utils.randomRangeInt(0, this.listRoom.length);
        let room = this.listRoom[randomIdx];
        XocDiaNetworkClient.getInstance().send(new cmd.SendJoinRoomById(room["id"]));
    }

    private joinFirstRoom() {
        if (this.listRoom == null) {
            App.instance.alertDialog.show3("Không có bàn nào để chơi", () => {
                this.actBack();
            });
            return;
        }

        if (this.listRoom.length <= 0) {
            App.instance.alertDialog.show3("Không có bàn nào để chơi", () => {
                this.actBack();
            });
            return;
        }

        let room = this.listRoom[0];
        XocDiaNetworkClient.getInstance().send(new cmd.SendJoinRoomById(room["id"]));
    }

    actComming() {
        App.instance.alertDialog.showMsg(Configs.LANG.COOMING_SOON);
    }

    // update (dt) {}
}
