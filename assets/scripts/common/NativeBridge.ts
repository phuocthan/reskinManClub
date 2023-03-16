// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export class NativeBridge {

    public static copyToClipBoard(content: string) {
        if (cc.sys.isNative) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "setClipboard", "(Ljava/lang/String;)V", content);
            } else if (cc.sys.os == cc.sys.OS_IOS) {
                jsb.copyTextToClipboard(content);
                // jsb.reflection.callStaticMethod("AppController", "copyToClipboard:andContent:", content);
            }
        } else {
            let handler = (event) => {
                event.clipboardData.setData('text/plain', content);
                event.preventDefault();
                document.removeEventListener('copy', handler, true);
            }
            document.addEventListener('copy', handler, true);
            document.execCommand('copy');
        }
    }

    public static getPackageName(): string {
        if (cc.sys.platform === cc.sys.ANDROID) {
            var pkg = jsb.reflection.callStaticMethod("org/cocos2dx/lib/Cocos2dxHelper", "getPackageName", "()Ljava/lang/String;");
            console.log("PackageName: " + pkg);
            return pkg;
        }
        if (cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD) {
            console.log("===GGG getPackageName : ", jsb.reflection.callStaticMethod("AppController", "getBundleId:andContent:", ""));
            return jsb.reflection.callStaticMethod("AppController", "getBundleId:andContent:", "");
        }

        return "Browser";
    }

    public static getPlatform(): string {
        if (cc.sys.platform == cc.sys.ANDROID)
            return "Android";

        if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD)
            return "IOS";

        return "Web";
    }
}
