const {ccclass, property} = cc._decorator;

@ccclass
export default class LobbyScene extends cc.Component {
    onEnable() {
        LobbyScene.lobbyNode = LobbyScene.pool.get();
        this.node.addChild(LobbyScene.lobbyNode);
    }

    onDisable() {
        LobbyScene.pool.put(LobbyScene.lobbyNode);
        LobbyScene.lobbyNode = null;
    }

    //////////////////////////////////////////////////////////////////////

    private static lobbyNode: cc.Node = null;
    private static lobbyPrefab: cc.Prefab = null;
    private static pool: cc.NodePool = null;

    public static setup(prefab: cc.Prefab) {
        LobbyScene.lobbyPrefab = prefab;

        LobbyScene.pool = new cc.NodePool();
        LobbyScene.pool.put(cc.instantiate(LobbyScene.lobbyPrefab));
    }
}
