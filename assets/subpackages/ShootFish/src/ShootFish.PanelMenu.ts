import SPUtils from "../../../scripts/common/SPUtils";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PanelMenu extends cc.Component {

    @property(cc.Node)
    arrow: cc.Node = null;

    @property(cc.Button)
    btnSound: cc.Button = null;
    @property(cc.SpriteFrame)
    sfSoundOn: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfSoundOff: cc.SpriteFrame = null;
    @property(cc.Button)

    btnMusic: cc.Button = null;
    @property(cc.SpriteFrame)
    sfMusicOn: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfMusicOff: cc.SpriteFrame = null;

    private isShow = false;

    show(isShow: boolean) {
        this.isShow = isShow;
        if (this.isShow) {
            this.node.runAction(cc.moveTo(0.3, cc.v2(-115, 0)));
            this.arrow.runAction(cc.rotateTo(0.3, 0));
        } else {
            this.node.runAction(cc.moveTo(0.3, cc.v2(0, 0)));
            this.arrow.runAction(cc.rotateTo(0.3, 180));
        }

        this.btnSound.getComponent(cc.Sprite).spriteFrame = SPUtils.getSoundVolumn() > 0 ? this.sfSoundOn : this.sfSoundOff;
        this.btnMusic.getComponent(cc.Sprite).spriteFrame = SPUtils.getMusicVolumn() > 0 ? this.sfMusicOn : this.sfMusicOff;
    }

    toggleShow() {
        this.show(!this.isShow);
    }

    toggleSound() {
        SPUtils.setSoundVolumn(SPUtils.getSoundVolumn() > 0 ? 0 : 1);
        this.btnSound.getComponent(cc.Sprite).spriteFrame = SPUtils.getSoundVolumn() > 0 ? this.sfSoundOn : this.sfSoundOff;
        BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
    }

    toggleMusic() {
        SPUtils.setMusicVolumn(SPUtils.getMusicVolumn() > 0 ? 0 : 1);
        this.btnMusic.getComponent(cc.Sprite).spriteFrame = SPUtils.getMusicVolumn() > 0 ? this.sfMusicOn : this.sfMusicOff;
        BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
    }
}
