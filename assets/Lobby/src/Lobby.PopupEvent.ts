import App from "../../scripts/common/App";
import Configs from "../../scripts/common/Configs";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Dialog from "../../scripts/common/Dialog";
import Utils from "../../scripts/common/Utils";
import Http from "../../scripts/common/Http";
import LobbyController from "./Lobby.LobbyController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupEvent extends Dialog {
    @property(cc.Sprite)
    contents: cc.Sprite = null;

    @property(cc.Button)
    buttons: cc.Button[] = [];

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.Node)
    contentsX3: cc.Node = null;

    @property(cc.Label)
    lblX3BankDate: cc.Label = null;
    @property(cc.Label)
    lblX3CardDate: cc.Label = null;
    @property(cc.Label)
    lblX3MomoDate: cc.Label = null;

    @property(cc.Sprite)
    x3BankProgress: cc.Sprite = null;
    @property(cc.Sprite)
    x3CardProgress: cc.Sprite = null;
    @property(cc.Sprite)
    x3MomoProgress: cc.Sprite = null;

    @property(cc.Node)
    x3BankActive: cc.Node = null;
    @property(cc.Node)
    x3BankNormal: cc.Node = null;
    @property(cc.Node)
    x3CardActive: cc.Node = null;
    @property(cc.Node)
    x3CardNormal: cc.Node = null;
    @property(cc.Node)
    x3MomoActive: cc.Node = null;
    @property(cc.Node)
    x3MomoNormal: cc.Node = null;

    @property(cc.Node)
    x3BankStatus: cc.Node = null;
    @property(cc.Node)
    x3CardStatus: cc.Node = null;
    @property(cc.Node)
    x3MomoStatus: cc.Node = null;

    private static instance: PopupEvent;
    private static initing: boolean = false;

    public static createAndShow(parent: cc.Node) {
        if (!this.initing) {
            // if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupEvent", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupEvent);
                    this.instance.show();
                });
            // } else {
            //     this.instance.show();
            // }
        }
    }

    // hna add
    public static hidePopup() {
        if(this.instance) {
            this.instance.hide();
        }
    }
    hide() {
        super.dismiss();
    }
    // end

    start() {
        for(let i=0; i<this.buttons.length; i++) {
            this.buttons[i].node.active = false;
        }

        this.renderX3Event();
        
        if(Configs.App.EVENTS && Configs.App.EVENTS.length > 0) {
            for(let i=1; i<=Configs.App.EVENTS.length; i++) {
                let event = Configs.App.EVENTS[i-1];
                
                this.buttons[i].node.active = true;
                this.buttons[i].node.children[2].getComponent(cc.Label).string = event.title;
                // cc.loader.load(event.title, (err, texture) => {
                //     if(err)
                //         return;

                //     let frame = new cc.SpriteFrame();
                //     frame.setTexture(texture);
                //     this.buttons[i].node.children[1].getComponent(cc.Sprite).spriteFrame = frame;  
                // });
            }
        }

        this.select(0);

        this.loading.runAction(cc.repeatForever(cc.rotateBy(1, 360)));
        this.loading.active = false;
    }

    public renderX3Event() {
        this.buttons[0].node.active = true;
        this.buttons[0].node.children[2].getComponent(cc.Label).string = "X3 Nạp Lần Đầu";
    }

    public onBtnClick(event, data) {
        cc.audioEngine.play(this.soundClickBtn, false, 1);
        this.select(parseInt(data));
    }

    public select(index: number) {
        if(index < 0 || index >= this.buttons.length)
            return;

        for(var i=0; i<this.buttons.length; i++) {
            this.buttons[i].node.children[0].active = false;
        }
        this.buttons[index].node.children[0].active = true;

        this.loading.active = true;
        if(index === 0) { // x3 nap lan dau
            this.contents.node.active = false;
            this.contentsX3.active = true;
            this.loading.active = false;
            this.actBackToTienTrinhX3();
            let eventX3 = Configs.App.X3PROGRESS;

            this.setX3Status("bank", eventX3.x3BankStatus, eventX3.x3BankPrize);
            this.setX3Status("card", eventX3.x3CardStatus, eventX3.x3CardPrize);
            this.setX3Status("momo", eventX3.x3MoMoStatus, eventX3.x3MoMoPrize);

            switch(eventX3.x3BankStatus) {
                case 0:
                    this.x3BankActive.active = true;
                    this.x3BankNormal.active = false;
                    this.x3BankProgress.fillRange = eventX3.x3BankProgress;
                    this.lblX3BankDate.string = `Hạn nhận : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3BankOutDate))}`;
                    break;
                case 1:
                    this.x3BankActive.active = true;
                    this.x3BankNormal.active = false;
                    this.x3BankProgress.fillRange = 1;
                    this.lblX3BankDate.string = `Hạn dùng : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3BankOutDate))}`;
                    break;
                case 2:
                    this.x3BankActive.active = true;
                    this.x3BankNormal.active = false;
                    this.x3BankProgress.fillRange = eventX3.x3BankProgress;
                    this.lblX3BankDate.string = `Hạn nhận : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3BankOutDate))}`;
                    break;
                case 3:
                    this.x3BankActive.active = true;
                    this.x3BankNormal.active = false;
                    this.x3BankProgress.fillRange = 1;
                    this.lblX3BankDate.string = `Đã nhận : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3BankOutDate))}`;
                    break;
                default:
                    this.x3BankActive.active = false;
                    this.x3BankNormal.active = true;
                    break;
            }

            switch(eventX3.x3CardStatus) {
                case 0:
                    this.x3CardActive.active = true;
                    this.x3CardNormal.active = false;
                    this.x3CardProgress.fillRange = eventX3.x3CardProgress;
                    this.lblX3CardDate.string = `Hạn nhận : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3CardOutDate))}`;
                    break;
                case 1:
                    this.x3CardActive.active = true;
                    this.x3CardNormal.active = false;
                    this.x3CardProgress.fillRange = 1;
                    this.lblX3CardDate.string = `Hạn dùng : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3CardOutDate))}`;
                    break;
                case 2:
                    this.x3CardActive.active = true;
                    this.x3CardNormal.active = false;
                    this.x3CardProgress.fillRange = eventX3.x3CardProgress;
                    this.lblX3CardDate.string = `Hạn nhận : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3CardOutDate))}`;
                    break;
                case 3:
                    this.x3CardActive.active = true;
                    this.x3CardNormal.active = false;
                    this.x3CardProgress.fillRange = 1;
                    this.lblX3CardDate.string = `Đã nhận : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3CardOutDate))}`;
                    break;
                default:
                    this.x3CardActive.active = false;
                    this.x3CardNormal.active = true;
                    break;
            }

            switch(eventX3.x3MoMoStatus) {
                case 0:
                    this.x3MomoActive.active = true;
                    this.x3MomoNormal.active = false;
                    this.x3MomoProgress.fillRange = eventX3.x3MoMoProgress;
                    this.lblX3MomoDate.string = `Hạn nhận : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3MoMoOutDate))}`;
                    break;
                case 1:
                    this.x3MomoActive.active = true;
                    this.x3MomoNormal.active = false;
                    this.x3MomoProgress.fillRange = 1;
                    this.lblX3MomoDate.string = `Hạn dùng : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3MoMoOutDate))}`;
                    break;
                case 2:
                    this.x3MomoActive.active = true;
                    this.x3MomoNormal.active = false;
                    this.x3MomoProgress.fillRange = eventX3.x3MoMoProgress;
                    this.lblX3MomoDate.string = `Hạn nhận : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3MoMoOutDate))}`;
                    break;
                case 3:
                    this.x3MomoActive.active = true;
                    this.x3MomoNormal.active = false;
                    this.x3MomoProgress.fillRange = 1;
                    this.lblX3MomoDate.string = `Đã nhận : ${Utils.dateToddMMYYYYHI(new Date(eventX3.x3MoMoOutDate))}`;
                    break;
                default:
                    this.x3MomoActive.active = false;
                    this.x3MomoNormal.active = true;
                    break;
            }

        } else {
            this.contentsX3.active = false;
            this.contents.node.active = true;
            cc.loader.load(Configs.App.EVENTS[index - 1].image,  (err, texture) => {
                this.loading.active = false;
    
                if(err)
                    return;
    
                let frame = new cc.SpriteFrame();
                frame.setTexture(texture);
                this.contents.spriteFrame = frame; 
            });
        }
    }

    public setX3Status(type, status, prize) {
        switch(type) {
            case "bank":
                for(let i = 0; i < this.x3BankStatus.childrenCount; i++) {
                    this.x3BankStatus.children[i].active = false;
                }
                if(status === 0) {
                    this.x3BankStatus.getChildByName('DangChoi').active = true;
                    this.x3BankStatus.getChildByName('DangChoi').getChildByName('lblPrize').getComponent(cc.Label).string = "+" + Utils.formatNumber(prize);
                }
                if(status === 1) {
                    this.x3BankStatus.getChildByName('Nhan').active = true;
                }
                if(status === 2) {
                    this.x3BankStatus.getChildByName('HetHan').active = true;
                    this.x3BankStatus.getChildByName('HetHan').getChildByName('lblPrize').getComponent(cc.Label).string = "+" + Utils.formatNumber(prize);
                }
                if(status === 3) {
                    this.x3BankStatus.getChildByName('DaNhan').active = true;
                }
                break;
            case "card":
                for(let i = 0; i < this.x3CardStatus.childrenCount; i++) {
                    this.x3CardStatus.children[i].active = false;
                }
                if(status === 0) {
                    this.x3CardStatus.getChildByName('DangChoi').active = true;
                    this.x3CardStatus.getChildByName('DangChoi').getChildByName('lblPrize').getComponent(cc.Label).string = "+" + Utils.formatNumber(prize);
                    // this.x3CardStatus.getChildByName('Nhan').active = true;
                }
                if(status === 1) {
                    this.x3CardStatus.getChildByName('Nhan').active = true;
                }
                if(status === 2) {
                    this.x3CardStatus.getChildByName('HetHan').active = true;
                    this.x3CardStatus.getChildByName('HetHan').getChildByName('lblPrize').getComponent(cc.Label).string = "+" + Utils.formatNumber(prize);
                }
                if(status === 3) {
                    this.x3CardStatus.getChildByName('DaNhan').active = true;
                }
                break;
            case "momo":
                for(let i = 0; i < this.x3MomoStatus.childrenCount; i++) {
                    this.x3MomoStatus.children[i].active = false;
                }
                if(status === 0) {
                    this.x3MomoStatus.getChildByName('DangChoi').active = true;
                    this.x3MomoStatus.getChildByName('DangChoi').getChildByName('lblPrize').getComponent(cc.Label).string = "+" + Utils.formatNumber(prize);
                }
                if(status === 1) {
                    this.x3MomoStatus.getChildByName('Nhan').active = true;
                }
                if(status === 2) {
                    this.x3MomoStatus.getChildByName('HetHan').active = true;
                    this.x3MomoStatus.getChildByName('HetHan').getChildByName('lblPrize').getComponent(cc.Label).string = "+" + Utils.formatNumber(prize);
                }
                if(status === 3) {
                    this.x3MomoStatus.getChildByName('DaNhan').active = true;
                }
                break;
            default:
                break;
        }
    }

    public nhanX3(event, type_id) {
        App.instance.showLoading(true);
        Http.get(Configs.App.PAY_URL + '/x3_info', { "nickname": Configs.Login.Nickname, "get": "reward", type: type_id }, (err, json) => {
            App.instance.showLoading(false);
            if (err != null) {
                return;
            }

            if(json["code"] != 0) {
                App.instance.alertDialog.showMsg(json["msg"]);
            } else {
                App.instance.alertDialog.showMsg(json["msg"]);
            }
        });
    }

    public actShowGuideContent() {
        this.contentsX3.getChildByName('lblGuide').active = false;
        this.contentsX3.getChildByName('bank').active = false;
        this.contentsX3.getChildByName('card').active = false;
        this.contentsX3.getChildByName('momo').active = false;
        this.contentsX3.getChildByName('guideContent').active = true;
        this.loading.active = true;
        cc.loader.load(Configs.App.X3_GUIDE_CONTENT,  (err, texture) => {
            console.log("texture", texture)
            this.loading.active = false;

            if(err)
                return;

            let frame = new cc.SpriteFrame();
            frame.setTexture(texture);
            this.contentsX3.getChildByName('guideContent').getChildByName('content').getComponent(cc.Sprite).spriteFrame = frame; 
        });
    }

    public actBackToTienTrinhX3() {
        this.contentsX3.getChildByName('lblGuide').active = true;
        this.contentsX3.getChildByName('bank').active = true;
        this.contentsX3.getChildByName('card').active = true;
        this.contentsX3.getChildByName('momo').active = true;
        this.contentsX3.getChildByName('guideContent').active = false;
    }

    public gotoPopupShop() {
        LobbyController.instance.actAddCoin();
        LobbyController.instance.actHideEventMailBox();
    }
}
