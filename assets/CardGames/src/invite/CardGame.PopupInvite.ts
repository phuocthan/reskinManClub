import App from "../../../scripts/common/App";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Dialog from "../../../scripts/common/Dialog";
import ListView from "../../../scripts/customui/listview/ListView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupInvite extends Dialog {
    @property(ListView)
    listView: ListView = null;

    public static readonly INVITE_TIMEOUT = 15000;

    public static instance: PopupInvite;
    private static initing: boolean = false;

    public static createAndShow(parent: cc.Node, onShow: Function = () => {}) {
        if (!PopupInvite.initing) {
            if (PopupInvite.instance == null || this.instance.node == null) {
                PopupInvite.initing = true;
                App.instance.loadPrefab("cardgame/PopupInvite", (err, prefab) => {
                    PopupInvite.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    PopupInvite.instance = go.getComponent(PopupInvite);
                    PopupInvite.instance.show();
                    onShow();
                });
            } else {
                PopupInvite.instance.node.parent = parent;
                PopupInvite.instance.show();
                onShow();
            }
        }
    }

    private dataSet: any[] = null;
    private listener: Function = null;

    onLoad() {
        this.listView.init([], this.listView.itemTemplate.name);
    }

    start() {
        this.refresh();
    }

    refresh() {
        this.listView.clearState();
        this.listView.notifyUpdate();
    }

    reloadData(dataSet: any[]) {
        if(dataSet || dataSet.length > 0) {
            this.dataSet = dataSet;
            this.listView.adapter.setDataSet(dataSet, this.listView.itemTemplate.name);
        }
        this.listView.clearState();
        this.listView.notifyUpdate();
    }
    
    public onCancelBtnClick() {
        PopupInvite.instance.dismiss();
    } 

    public onSendBtnClick() {
        var listNickName = [];
        for(var i=0; i<this.dataSet.length; i++) {
            if(this.dataSet[i].isCheck) {
                listNickName.push(this.dataSet[i].name);
            }
        }

        console.log(listNickName);
        if(this.listener)
            this.listener(listNickName);

        if(listNickName.length > 0) {
            setTimeout(() => {
                App.instance.showToast("Lời mời đã được gửi đi, xin chờ chút nha!");   
            }, 1000);
        }

        PopupInvite.instance.dismiss();
    }

    public setListener(listener: (listNickNames: string[]) => void) {
        this.listener = listener;
    }
}
