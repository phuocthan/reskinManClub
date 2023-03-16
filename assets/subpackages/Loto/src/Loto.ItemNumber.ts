import LotoController from "./Loto.Controller";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemNumber extends cc.Component {

    @property(cc.Label)
    labelValue: cc.Label = null;

    private itemInfo = null;

    private data = null;
    private isInit = false;

    setData(data: any, subSetIndex, index) {
        this.isInit = true;
        this.initItem(data['numCount'], data['value']);
        this.node.getComponent(cc.Toggle).isChecked = data['isChecked'];
        this.data = data;
        this.isInit = false;
    }

    initItem(numCount, data) {
        this.itemInfo = data;
        this.formatName(numCount);
    }

    formatName(numCount) {
        var text = this.itemInfo;
        if (numCount == 10) {

        } else if (numCount == 100) {
            if (this.itemInfo < 10) {
                text = "0" + this.itemInfo;
            }
        } else {
            if (this.itemInfo < 10) {
                text = "00" + this.itemInfo;
            } else if (this.itemInfo < 100) {
                text = "0" + this.itemInfo;
            }
        }
        this.labelValue.string = text;
    }

    choose() {
        if(this.isInit)
            return;
            
        let isChecked = this.node.getComponent(cc.Toggle).isChecked;
        LotoController.instance.updateRecentNumberPick(parseInt(this.labelValue.string), isChecked, this.data);
    }
}
