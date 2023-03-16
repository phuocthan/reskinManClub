namespace common {
    export class BroadcastListener {
        action: string;
        target: cc.Component;
        callback: (data: any) => void;

        constructor(action: string, callback: (data: any) => void, target: cc.Component) {
            this.action = action;
            this.target = target;
            this.callback = callback;
        }
    }

    export class BroadcastReceiver {
        public static UPDATE_NICKNAME_SUCCESS = "UPDATE_NICKNAME_SUCCESS";
        public static LOGINED = "LOGINED";
        public static USER_INFO_UPDATED = "USER_INFO_UPDATED";
        public static USER_LOGOUT = "USER_LOGOUT";
        public static USER_UPDATE_COIN = "USER_UPDATE_COIN";
        public static ON_AUDIO_CHANGED = "ON_AUDIO_CHANGED";
        public static UPDATE_MAIL_COUNT = "UPDATE_MAIL_COUNT";
        public static ON_SWITCH_COIN = "ON_SWITCH_COIN";

        public static ON_ENTER_GAME_SCENE = "ON_ENTER_GAME_SCENE";
        public static ON_LEAVE_GAME_SCENE = "ON_LEAVE_GAME_SCENE";
        public static ON_MUTE_INVITE = "ON_MUTE_INVITE";
        public static ON_GO_INVITE = "ON_GO_INVITE";

        public static ON_UPDATE_MARQUEE = "ON_UPDATE_MARQUEE";
        public static ON_REQUEST_UPDATE_MARQUEE = "ON_REQUEST_UPDATE_MARQUEE";

        public static ON_UPDATE_TAXIU_ITEM = "ON_UPDATE_TAXIU_ITEM";
        public static ON_X2_SLOT = "ON_X2_SLOT";

        private static listeners: Array<BroadcastListener> = new Array<BroadcastListener>();

        public static register(action: string, callback: (data: any) => void, target: cc.Component) {
            this.listeners.push(new BroadcastListener(action, callback, target));
        }

        public static unRegisterByAction(action: string){
            for(var i = 0; i < this.listeners.length; i++){
                if(this.listeners[i].action == action){
                    this.listeners.splice(i--, 1);
                }
            }
        }

        public static unRegisterByTarget(target: cc.Component){
            for(var i = 0; i < this.listeners.length; i++){
                if(this.listeners[i].target == target){
                    this.listeners.splice(i--, 1);
                }
            }
        }

        public static send(action: string, data: any = null){
            for(var i = 0; i < this.listeners.length; i++){
                let listener = this.listeners[i];
                if(listener.action == action){
                    if (listener.target && listener.target instanceof Object && listener.target.node) {
                        listener.callback(data);
                    } else {
                        this.listeners.splice(i--, 1);
                    }
                }
            }
        }
    }
}

export default common.BroadcastReceiver;