// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import App from "../../../scripts/common/App";
import Dialog from "../../../scripts/common/Dialog";
import ListView from "../../../scripts/customui/listview/ListView";
import ShootFishNetworkClient from "../../../scripts/networks/ShootFishNetworkClient";
import LotoController from "./Loto.Controller";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupHistory extends Dialog {
    @property(cc.Prefab)
    prefabItemHistory: cc.Prefab = null;

    @property(ListView)
    listViewHistory: ListView = null;

    @property(cc.Node)
    popupHistoryDetail: cc.Node = null;
    @property(cc.Label)
    labelHistoryDetail: cc.Label = null;

    start() {
        this.listViewHistory.init([], LotoController.PREFAB_ITEM_HISOTRY);

        ShootFishNetworkClient.getInstance().request("LOTO4", null, (res) => {
            console.log("LOTO4 : ", res);
            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }
            // do something

            let data = res["data"];
            for (let index = 0; index < data.length; index++) {
                data[index]["index"] = index;
                data[index]["showDetailFunc"] = this.openPopupHistoryDetail.bind(this);
            }

            this.listViewHistory.adapter.setDataSet(data, LotoController.PREFAB_ITEM_HISOTRY);
            this.listViewHistory.clearState();
            this.listViewHistory.notifyUpdate();
        }, this);
    }

    closePopupHistoryDetail() {
        this.popupHistoryDetail.scaleY = 1;
        this.popupHistoryDetail.runAction(cc.sequence(cc.scaleTo(0.15, 1, 0), cc.callFunc(() => {
            this.popupHistoryDetail.active = false;
        })))
    }

    openPopupHistoryDetail(detail: string) {
        this.popupHistoryDetail.active = true;
        this.labelHistoryDetail.string = detail;

        this.popupHistoryDetail.scaleY = 0;
        this.popupHistoryDetail.runAction(cc.scaleTo(0.15, 1, 1));
    }

    closePopupHistory() {
        this.dismiss();
    }
}
