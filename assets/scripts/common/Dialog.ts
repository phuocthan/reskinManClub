import Configs from "./Configs";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dialog extends cc.Component {
    @property({ type: cc.AudioClip })
    soundClickBtn: cc.AudioClip = null;

    isAnimated: boolean = true;

    bg: cc.Node = null;
    container: cc.Node = null;
    phaseLong = 0.275;
    phaseShort = 0.15;
    shortDistance = 40;

    show(needSetTop: any = true): void {
        var _this = this;
        if (!this.bg) this.bg = this.node.getChildByName("Bg");
        if (!this.container) this.container = this.node.getChildByName("Container");
        if (needSetTop) {
            this.setTop();
        }

        this.node.active = true;
        this.isAnimated = false;

        this.bg.stopAllActions();
        this.bg.opacity = 0;
        this.bg.runAction(cc.fadeTo(0.2, 128));

        this.container.stopAllActions();
        this.container.opacity = 0;
        // this.container.y = Configs.App.DEVICE_RESOLUTION.height/2 + this.container.height/2; // hna comment
        this.container.x = 0;
        // this.container.x = Configs.App.DEVICE_RESOLUTION.width/2 + this.container.width/2;
        this.container.y = 0;

        this.container.runAction(cc.sequence(
            cc.spawn( 
                cc.fadeIn(this.phaseLong),
                cc.moveTo(this.phaseLong, cc.v2(0, 0)).easing(cc.easeOut(2.0))
                // cc.moveTo(this.phaseLong, cc.v2(this.container.x, 0)).easing(cc.easeOut(2.0))
                ),
            cc.moveTo(this.phaseShort, cc.v2(0, 0)),
            cc.callFunc(_this._onShowed.bind(this))
        ));
        this.container.scale = 0.5;
        cc.tween(this.container)
        .to(0.15, {scale : 1.1})
        .to(0.1, {scale : 1})
        .start();
    }

    showRight(needSetTop: any = true, needAutoScale: any = false): void {
        var _this = this;
        if (!this.bg) this.bg = this.node.getChildByName("Bg");
        if (!this.container) this.container = this.node.getChildByName("Container");
        if (needSetTop) {
            this.setTop();
        }

        // hna add
        if(needAutoScale) {
            // this.autoScale();
        }
        // end
        this.node.active = true;
        this.isAnimated = false;

        this.bg.stopAllActions();
        this.bg.opacity = 0;
        this.bg.runAction(cc.fadeTo(0.2, 128));

        this.container.stopAllActions();
        this.container.opacity = 0;
        // this.container.y = Configs.App.DEVICE_RESOLUTION.height/2 + this.container.height/2; // hna comment
        this.container.x = 0;
        // this.container.x = Configs.App.DEVICE_RESOLUTION.width/2 + this.container.width * this.container.scaleX/2;
        this.container.y = 0;

        this.container.runAction(cc.sequence(
            cc.spawn( 
                cc.fadeIn(this.phaseLong),
                cc.moveTo(this.phaseLong, cc.v2(0, 0)).easing(cc.easeOut(2.0))
                ),
            cc.moveTo(this.phaseShort, cc.v2(0, 0)),
            cc.callFunc(_this._onShowed.bind(this))
        ));
        this.container.scale = 0.5;
        cc.tween(this.container)
        .to(0.15, {scale : 1.1})
        .to(0.1, {scale : 1})
        .start();
    }

    dismiss() {
        if(this.soundClickBtn) {
            cc.audioEngine.play(this.soundClickBtn, false, 1);
        }
        if (!this.bg) this.bg = this.node.getChildByName("Bg");
        if (!this.container) this.container = this.node.getChildByName("Container");
        var _this = this;
        this.isAnimated = false;

        this.node.active = false; // hna add

        this.bg.stopAllActions();
        this.bg.opacity = 128;
        this.bg.runAction(cc.fadeOut(0.2));

        this.container.stopAllActions();
        this.container.opacity = 255;
        this.container.scale = 1;
        this.container.runAction(cc.sequence(
            cc.moveTo(this.phaseShort, cc.v2(this.container.x, this.shortDistance)),
            cc.spawn(
                cc.moveTo(this.phaseLong, cc.v2(this.container.x, -Configs.App.DEVICE_RESOLUTION.height/2 - this.container.height/2)).easing(cc.easeIn(2.0)),
                cc.fadeOut(this.phaseLong)
            ),
            cc.callFunc(_this._onDismissed.bind(this))
        ));
    }

    _onShowed() {
        this.isAnimated = true;
    }

    _onDismissed() {
        this.node.active = false;
        this.isAnimated = true;
    }

    setTop() {
        cc.log("==== : ", this.node.parent);
        this.node.setSiblingIndex(this.node.parent.children.length - 1);
        // let length = this.node.parent.children.length;
        // let idx = 0;
        // for (let i = 0; i < length; i++) {
        //     let node = this.node.parent.children[i];
        //     if (node != this.node) {
        //         node.setSiblingIndex(idx++);
        //     }
        // }
        // this.node.setSiblingIndex(length);
    }

    // hna add
    autoScale() {
        this.container.scaleX = this.container.width/Configs.App.DEVICE_RESOLUTION.width;
        this.container.scaleY = this.container.height/Configs.App.DEVICE_RESOLUTION.height;
    }
    // end
}
