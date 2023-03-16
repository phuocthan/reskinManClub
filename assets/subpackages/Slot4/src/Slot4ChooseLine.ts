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

const { ccclass, property } = cc._decorator;

@ccclass
export default class Slot4ChooseLine extends Dialog {

    @property(cc.Button)
    btnClose: cc.Button = null;
    @property(cc.Node)
    lineParent: cc.Node = null;

    onSelectedChanged: (lines: Array<number>) => void = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
 
    }


    getLineSelected() {
        let lines = new Array<number>();
        for (let i = 0; i < this.lineParent.childrenCount; i++) {
            let node = this.lineParent.children[i];
            console.log(" i : " + i + " - " + node.getComponent(cc.Toggle).isChecked);
            if (node.getComponent(cc.Toggle).isChecked) {
                lines.push(i + 1);
            }
        }
        // this.btnClose.interactable = lines.length > 0;
        return lines;
    }

    selectAll() {
        for (let i = 0; i < this.lineParent.childrenCount; i++) {
            this.lineParent.children[i].getComponent(cc.Toggle).isChecked = true;
        }
        if (this.onSelectedChanged != null) this.onSelectedChanged(this.getLineSelected());
    }

    deSelectAll() {
        for (let i = 0; i < this.lineParent.childrenCount; i++) {
            this.lineParent.children[i].getComponent(cc.Toggle).isChecked = false;
        }
        if (this.onSelectedChanged != null) this.onSelectedChanged(this.getLineSelected());
    }

    selectEven() {
        for (let i = 0; i < this.lineParent.childrenCount; i++) {
            this.lineParent.children[i].getComponent(cc.Toggle).isChecked = i % 2 !== 0;
        }
        if (this.onSelectedChanged != null) this.onSelectedChanged(this.getLineSelected());
    }

    selectOdd() {
        for (let i = 0; i < this.lineParent.childrenCount; i++) {
            this.lineParent.children[i].getComponent(cc.Toggle).isChecked = i % 2 == 0;
        }

        if (this.onSelectedChanged != null) this.onSelectedChanged(this.getLineSelected());
    }

    show() {
        super.show();
        for (let i = 0; i < this.lineParent.childrenCount; i++) {
            let node = this.lineParent.children[i];
            node.on('click', () => {
                if (this.onSelectedChanged != null) this.onSelectedChanged(this.getLineSelected());
            });
        }
    }

    hide() {
        let isThereActive = false;
        for (let i = 0; i < this.lineParent.childrenCount; i++) {
            let node = this.lineParent.children[i];
            if (node.getComponent(cc.Toggle).isChecked) {
                isThereActive = true;
            }
        }

        if(isThereActive) {
            super.dismiss();
        } else {
            App.instance.showToast("Bạn cần phải chọn ít nhất một dòng");
        }
    }



    // update (dt) {}
}
