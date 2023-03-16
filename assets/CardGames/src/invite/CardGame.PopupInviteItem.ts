// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Utils from "../../../scripts/common/Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupInviteItem extends cc.Component {
    @property(cc.Label)
    userName: cc.Label = null;

    @property(cc.Label)
    coin: cc.Label = null;

    @property(cc.Toggle)
    check: cc.Toggle = null;

    dataSet: any[] = [];
    data: any = null;

    setData(data: {name: string, coin: number, isCheck: boolean, dataSet: any[]}) {
        this.userName.string = data.name;
        this.coin.string = Utils.formatNumber(data.coin);
        this.check.isChecked = data.isCheck;
        this.dataSet = data.dataSet;
        this.data = data;
    }

    onCheck(toggle, customEventData) {
        let index = this.dataSet.indexOf(this.data);
        if(index >= 0) {
            this.dataSet[index].isCheck = !this.dataSet[index].isCheck
        }
    }
}
