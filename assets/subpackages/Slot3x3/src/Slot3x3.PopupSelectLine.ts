import Dialog from "../../../scripts/common/Dialog";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupSelectLine extends Dialog {
    @property(cc.Node)
    buttonsLine: cc.Node = null;
    @property(cc.Button)
    btnClose: cc.Button = null;

    // hna add
    @property(cc.SpriteFrame)
    sfChanUntick: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfChanTick: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfLeUntick: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfLeTick: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfTatCaUntick: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfTatCaTick: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfHuyUntick: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfHuyTick: cc.SpriteFrame = null;

    @property(cc.Node)
    btnChan: cc.Node = null;
    @property(cc.Node)
    btnLe: cc.Node = null;
    @property(cc.Node)
    btnTatCa: cc.Node = null;
    @property(cc.Node)
    btnHuy: cc.Node = null;
    // end

    onSelectedChanged: (lines: Array<number>) => void = null;
    private readonly SELECTED = "selected";
    private BUTTON_SELECTED = "selected";

    start() {
        for (let i = 0; i < this.buttonsLine.childrenCount; i++) {
            let node = this.buttonsLine.children[i];
            node[this.SELECTED] = true;
            node.on("click", () => {
                node[this.SELECTED] = !node[this.SELECTED];
                node.opacity = node[this.SELECTED] ? 255 : 80;
                if (this.onSelectedChanged != null) this.onSelectedChanged(this.getSelectedLines());
                this.btnClose.interactable = this.getSelectedLines().length > 0;
            });
        }
        this.selectGroupButton(this.BUTTON_SELECTED);
    }

    actSelectAll() {
        for (let i = 0; i < this.buttonsLine.childrenCount; i++) {
            let node = this.buttonsLine.children[i];
            node[this.SELECTED] = true;
            node.opacity = node[this.SELECTED] ? 255 : 80;
        }
        if (this.onSelectedChanged != null) this.onSelectedChanged(this.getSelectedLines());
        this.btnClose.interactable = true;
        this.BUTTON_SELECTED = "tatca";
        this.selectGroupButton(this.BUTTON_SELECTED);
    }

    actSelectEven() {
        for (let i = 0; i < this.buttonsLine.childrenCount; i++) {
            let node = this.buttonsLine.children[i];
            node[this.SELECTED] = i % 2 != 0;
            node.opacity = node[this.SELECTED] ? 255 : 80;
        }
        if (this.onSelectedChanged != null) this.onSelectedChanged(this.getSelectedLines());
        this.btnClose.interactable = true;
        this.BUTTON_SELECTED = "chan";
        this.selectGroupButton(this.BUTTON_SELECTED);
    }

    actSelectOdd() {
        for (let i = 0; i < this.buttonsLine.childrenCount; i++) {
            let node = this.buttonsLine.children[i];
            node[this.SELECTED] = i % 2 == 0;
            node.opacity = node[this.SELECTED] ? 255 : 80;
        }
        if (this.onSelectedChanged != null) this.onSelectedChanged(this.getSelectedLines());
        this.btnClose.interactable = true;
        this.BUTTON_SELECTED = "le";
        this.selectGroupButton(this.BUTTON_SELECTED);
    }

    actDeselectAll() {
        for (let i = 0; i < this.buttonsLine.childrenCount; i++) {
            let node = this.buttonsLine.children[i];
            node[this.SELECTED] = false;
            node.opacity = node[this.SELECTED] ? 255 : 80;
        }
        if (this.onSelectedChanged != null) this.onSelectedChanged(this.getSelectedLines());
        this.btnClose.interactable = false;
        this.BUTTON_SELECTED = "huy";
        this.selectGroupButton(this.BUTTON_SELECTED);
    }

    private getSelectedLines() {
        let lines = new Array<number>();
        for (let i = 0; i < this.buttonsLine.childrenCount; i++) {
            let node = this.buttonsLine.children[i];
            if (typeof node[this.SELECTED] == "undefined" || node[this.SELECTED]) {
                lines.push(i + 1);
            }
        }
        return lines;
    }

    // hna add
    private selectGroupButton(btn: string) {
        this.btnChan.getComponent(cc.Sprite).spriteFrame = this.sfChanUntick;
        this.btnLe.getComponent(cc.Sprite).spriteFrame = this.sfLeUntick;
        this.btnTatCa.getComponent(cc.Sprite).spriteFrame = this.sfTatCaUntick;
        this.btnHuy.getComponent(cc.Sprite).spriteFrame = this.sfHuyUntick;

        switch(btn) {
            case "chan":
                this.btnChan.getComponent(cc.Sprite).spriteFrame = this.sfChanTick;
                break;
            case "le":
                this.btnLe.getComponent(cc.Sprite).spriteFrame = this.sfLeTick;
                break;
            case "tatca":
                this.btnTatCa.getComponent(cc.Sprite).spriteFrame = this.sfTatCaTick;
                break;
            case "huy":
                this.btnHuy.getComponent(cc.Sprite).spriteFrame = this.sfHuyTick;
                break;
            default:
                this.btnTatCa.getComponent(cc.Sprite).spriteFrame = this.sfTatCaTick;
        }
    }
    // end

    dismiss() {
        if (this.getSelectedLines().length > 0) {
            super.dismiss();
        }
        // this.node.destroy();
    }
}