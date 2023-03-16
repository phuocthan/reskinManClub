import VersionConfig from "./VersionConfig";

const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Label)
export default class CPSprite extends cc.Component {

    @property
    strR99: string = "";
    @property
    strVip52: string = "";
    @property
    strXXeng: string = "";
    @property
    strManVip: string = "";

    onLoad() {
        this.getComponent(cc.Label).string = this.strR99;
    }
}
