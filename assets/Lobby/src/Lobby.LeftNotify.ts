// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import Configs from "../../scripts/common/Configs";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Marquee extends cc.Component {
    @property(cc.Node)
    itemTemplate: cc.Node = null;
    @property(cc.Node)
    listView: cc.Node = null;

    private cursor = 0;

    start() {
        for (var i = 0; i < this.listView.childrenCount; i++) {
            let node = this.listView.children[i];
            node.active = false;
        }
        this.init();
    }

    init() {
        let displayNext = () => {
            let _this = this;
            _this.listView.active = true;
            _this.itemTemplate.active = true;
            this.itemTemplate.runAction(cc.sequence( 
                cc.fadeOut(1.0), 
                cc.callFunc(function () {
                    if(!Configs.App.LIST_LEFT_NOTIFY_LOBBY) return;
                    _this.itemTemplate.getComponent(cc.Label).string = Configs.App.LIST_LEFT_NOTIFY_LOBBY[_this.cursor] ? Configs.App.LIST_LEFT_NOTIFY_LOBBY[_this.cursor] : "";
                    _this.itemTemplate.runAction(cc.sequence(
                        cc.fadeIn(1.0),
                        cc.callFunc(() => {
                            _this.itemTemplate.opacity = 255;
                            _this.cursor++;
                            if(_this.cursor === Configs.App.LIST_LEFT_NOTIFY_LOBBY.length) {
                                _this.cursor = 0;
                            }
                        })
                    ))
                }),
                cc.delayTime(3),
                cc.callFunc(() => {
                    displayNext();
                })
            ))
        };

        displayNext();
    }
}
