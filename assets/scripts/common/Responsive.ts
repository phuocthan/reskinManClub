const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Canvas)
export default class CanvasResizer extends cc.Component {

    @property
    designResolution: cc.Size = new cc.Size(1280, 720);

    lastWitdh: number = 0;
    lastHeight: number = 0;
    canvas: cc.Canvas;

    onLoad() {
        this.canvas = this.node.getComponent(cc.Canvas);
        this.makeResponsive();
    }

    update(dt) {
        this.makeResponsive();
    }

    makeResponsive() {
        let canvas = this.node.getComponent(cc.Canvas);
        let deviceResolution = cc.view.getFrameSize();
        
        // calculte design ratio
        let desiredRatio = canvas.designResolution.width / canvas.designResolution.height;
        // calculte device ratio
        let deviceRatio = deviceResolution.width / deviceResolution.height;
    
        if (deviceRatio >= desiredRatio) {
            canvas.fitHeight = true;
            canvas.fitWidth = false;
        } else if (deviceRatio < desiredRatio) {
            canvas.fitHeight = false;
            canvas.fitWidth = true;
        }
    }
}
