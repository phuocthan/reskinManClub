// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Configs from "./Configs";
import Http from "./Http";

const { ccclass, property } = cc._decorator;

let EventFacebook = {
    EVENT_LOGIN: "fb_mobile_complete_login",
    EVENT_LOGIN_FB: "fb_login",
    EVENT_HIT_LOGIN_FB: "hit_fb_login",
    EVENT_LOGIN_BUTTON: "button_login",
    EVENT_HIT_LOGIN_BUTTON: "hit_button_login",
    EVENT_LOGIN_TOKEN: "token_login",

    EVENT_LOGOUT: "EVENT_LOGOUT",

    EVENT_REGISTER: "normal_registration",
    EVENT_REGISTER_FB: "facebook_registration",
    EVENT_REGISTER_SUCCESS: "fb_mobile_complete_registration",

    EVENT_APP_LAUNCHED: "ON_APP_LAUNCHED",
    EVENT_APP_OPEN: "ON_APP_OPEN",
    EVENT_FINISH_LOADING: "ON_APP_FINISH",
    EVENT_START_HOTUPDATE: "ON_APP_START_HOTUPDATE",
    EVENT_DONE_HOTUPDATE: "ON_APP_DONE_HOTUPDATE",
    EVENT_ERR_HOTUPDATE: "ON_APP_ERR_HOTUPDATE",
    EVENT_FAILED_HOTUPDATE: "ON_APP_FAILED_HOTUPDATE",

    EVENT_OPEN_CHARGE: "fb_mobile_initiated_checkout",
    EVENT_ADD_TO_CART: "fb_mobile_add_to_cart",
    EVENT_OPEN_WITHDRAW: "WITHDRAW_OPEN",
    EVNET_HIT_WITHDRAW: "WITHDRAW_SENT",

    EVENT_OPEN_GIFTCODE: "GIFTCODE_OPEN",
    EVENT_HIT_GIFCODE: "GIFTCODE_SENT",
    EVENT_GOT_GIFTCODE: "GIFTCODE_ACCEPT",

    EVENT_OPEN_VERIFY: "HIT_BTN_VERIFY",
    EVENT_OPEN_LSGD: "HIT_BTN_LSGD",
    EVENT_OPEN_HOTLINE: "HIT_BTN_HOTLINE",
    EVENT_OPEN_FANPAGE: "HIT_BTN_FANPAGE",
    EVENT_OPEN_MAIL: "HIT_BTN_MAIL",
    EVENT_OPEN_BTN_MINIGAME: "HIT_BTN_BTN_MINIGAME",
    EVENT_OPEN_TOPHU: "HIT_BTN_TOPHU",

    EVENT_OPEN_GAME_ID: "_GAME_OPEN",
    EVENT_OPEN_GAME_ID_SUCCESS: "_GAME_OPEN_SUCCESS",
    EVENT_OPEN_GAME_ID_INACTIVE: "_GAME_OPEN_INACTIVE",
    EVENT_OPEN_GAME_ID_ERROR_POPUP: "_GAME_OPEN_ERR_POPUP",

    EVENT_OPEN_GAME_ID_HOTUPDATE: "_GAME_UPDATE_OPEN",
    EVENT_OPEN_GAME_ID_HOTUPDATE_PASS: "_GAME_UPDATE_PASS",
    EVENT_OPEN_GAME_ID_HOTUPDATE_SUCCESS: "_GAME_UPDATE_SUCCESS",
    EVENT_OPEN_GAME_ID_HOTUPDATE_NORMAL: "_GAME_UPDATE_NORMAL",
    EVENT_OPEN_GAME_ID_HOTUPDATE_INTERUPT: "_GAME_UPDATE_INTERUPT",
    EVENT_OPEN_GAME_ID_HOTUPDATE_START: "_GAME_UPDATE_START",
    EVENT_OPEN_GAME_ID_HOTUPDATE_FINISH: "_GAME_UPDATE_FINISH",
    EVENT_OPEN_GAME_ID_HOTUPDATE_ERROR: "_GAME_UPDATE_ERR",
    EVENT_OPEN_GAME_ID_HOTUPDATE_FAILED: "_GAME_UPDATE_FAIL",
    EVENT_OPEN_GAME_ID_HOTUPDATE_FAILED_MANIFEST: "_GAME_UPDATE_MNF",

    EVENT_BET_LOTO: "EVN_LOTO_BET",
    EVENT_BET_LOTO_SUCCESS: "EVN_LOTO_BET_SUCCESSED",

    EVENT_SPIN_SLOT4: "EVN_SLOT4_SPIN",
    EVENT_SPIN_SLOT4_CLICK: "EVN_SLOT4_CLICK",
    EVENT_SPIN_SLOT4_AUTO: "EVN_SLOT4_SPIN_AUTO",
    EVENT_SPIN_SLOT4_FAST: "EVN_SLOT4_SPIN_FAST",
    EVENT_SPIN_SLOT4_SUCCESS: "EVN_SLOT4_SPIN_SUCCESSED",
    EVENT_SPIN_SLOT4_TRIAL: "EVN_SLOT4_SPIN_TRIAL",

    EVENT_SPIN_SLOT2: "EVN_SLOT2_SPIN",
    EVENT_SPIN_SLOT2_CLICK: "EVN_SLOT2_CLICK",
    EVENT_SPIN_SLOT2_AUTO: "EVN_SLOT2_SPIN_AUTO",
    EVENT_SPIN_SLOT2_FAST: "EVN_SLOT2_SPIN_FAST",
    EVENT_SPIN_SLOT2_SUCCESS: "EVN_SLOT2_SPIN_SUCCESSED",
    EVENT_SPIN_SLOT2_TRIAL: "EVN_SLOT2_SPIN_TRIAL",

    EVENT_SPIN_SLOT9: "EVN_SLOT9_SPIN",
    EVENT_SPIN_SLOT9_CLICK: "EVN_SLOT9_CLICK",
    EVENT_SPIN_SLOT9_AUTO: "EVN_SLOT9_SPIN_AUTO",
    EVENT_SPIN_SLOT9_FAST: "EVN_SLOT9_SPIN_FAST",
    EVENT_SPIN_SLOT9_SUCCESS: "EVN_SLOT9_SPIN_SUCCESSED",
    EVENT_SPIN_SLOT9_BET_VAL: "EVN_BET_VAL_SLOT9",
    EVENT_SPIN_SLOT9_TRIAL: "EVN_SLOT9_SPIN_TRIAL",

    EVENT_SPIN_SLOT5: "EVN_SLOT5_SPIN",
    EVENT_SPIN_SLOT5_CLICK: "EVN_SLOT5_CLICK",
    EVENT_SPIN_SLOT5_AUTO: "EVN_SLOT5_SPIN_AUTO",
    EVENT_SPIN_SLOT5_FAST: "EVN_SLOT5_SPIN_FAST",
    EVENT_SPIN_SLOT5_SUCCESS: "EVN_SLOT5_SPIN_SUCCESSED",
    EVENT_SPIN_SLOT5_TRIAL: "EVN_SLOT5_SPIN_TRIAL",

    EVENT_BET_TAIXIU: "EVN_TAIXIU_BET",
    EVENT_BET_TAIXIU_SUCCESS: "EVN_TAIXIU_BET_SUCCESSED",

    EVENT_BET_BAUCUA: "EVN_BAUCUA_BET",
    EVENT_BET_BAUCUA_SUCCESS: "EVENT_BET_BAUCUA_SUCCESSED",

    EVENT_BET_CAOTHAP: "EVN_CAOTHAP_BET",
    EVENT_BET_CAOTHAP_SUCCESS: "EVN_CAOTHAP_BET_SUCCESSED",
    EVENT_CAOTHAP_BET_VAL: "EVN_BET_VAL_CAOTHAP",

    EVENT_SPIN_3x3: "EVN_SLOT3x3_SPIN",
    EVENT_SPIN_3x3_CLICK: "EVN_SLOT3x3_SPIN_CLICK",
    EVENT_SPIN_3x3_AUTO: "EVN_SLOT3x3_SPIN_AUTO",
    EVENT_SPIN_3x3_FAST: "EVN_SLOT3x3_SPIN_FAST",
    EVENT_SPIN_3x3_SUCCESS: "EVN_SLOT3x3_SPIN_SUCCESSED",
    EVENT_SPIN_3x3_BET_VAL: "EVN_BET_VAL_SLOT3x3",

    EVENT_BET_XOCDIA: "EVN_XOCDIA_BET",
    EVENT_BET_XOCDIA_SUCCESS: "EVN_XOCDIA_BET_SUCCESSED",

    EVENT_SPIN_MINI_POKER: "EVN_MINIPOKER_SPIN",
    EVENT_SPIN_MINI_POKER_CLICK: "EVN_MINIPOKER_CLICK",
    EVENT_SPIN_MINI_POKER_AUTO: "EVN_MINIPOKER_SPIN_AUTO",
    EVENT_SPIN_MINI_POKER_FAST: "EVN_MINIPOKER_SPIN_FAST",
    EVENT_SPIN_MINI_POKER_SUCCESS: "EVN_MINIPOKER_SPIN_SUCCESSED",
    EVENT_SPIN_MINI_POKER_BET_VAL: "EVN_BET_VAL_MINIPOKER",

    EVENT_COUNT_TLMN: "EVENT_COUNT_TLMN",
    EVENT_COUNT_SAM: "EVENT_COUNT_SAM",
    EVENT_COUNT_MAUBINH: "EVENT_COUNT_MAUBINH",
    EVENT_COUNT_XOCDIA: "EVENT_COUNT_XOCDIA",
    EVENT_CATCHED_PURCHASE: "EVENT_CATCHED_PURCHASE",
    EVENT_COUNT_BACAY: "EVENT_COUNT_BACAY",
    EVENT_COUNT_LIENG: "EVENT_COUNT_LIENG",
    EVENT_COUNT_XIDZACH: "EVENT_COUNT_XIDZACH",

    EVENT_BET_TLMN: "EVN_TLMN_BET",
    EVENT_BET_SAM: "EVN_SAM_BET",
    EVENT_BET_MAUBINH: "EVN_MAUBINH_BET",

    EVENT_SPEND_MONEY: "fb_mobile_spent_credits",
    EVENT_NAME_VIEWED_CONTENT: "fb_mobile_content_view",

    EVENT_SHOOTFISH_SUCCESS: "EVEN_SHOOTFISH_SUCCESSED",
    EVENT_SHOOTFISH_DISCONNECTED: "EVENT_SHOOTFISH_DISCONNECTED",

    EVENT_INVITE_SHOW_LOBBY: "EVENT_INVITE_SHOW_LOBBY",
    EVENT_INVITE_CLOSE_LOBBY: "EVENT_INVITE_CLOSE_LOBBY",
    EVENT_INVITE_ACCEPT_LOBBY: "EVENT_INVITE_ACCEPT_LOBBY",
    EVENT_INVITE_CANCEL_LOBBY: "EVENT_INVITE_CANCEL_LOBBY",
    EVENT_INVITE_ACCEPT_ROOM: "EVENT_INVITE_ACCEPT_ROOM",
    EVENT_INVITE_CANCEL_ROOM: "EVENT_INVITE_CANCEL_ROOM",
    EVENT_INVITE_NOTIFY: "EVENT_INVITE_NOTIFY",
    EVENT_INVITE_NOTIFY_CLICK: "EVENT_INVITE_NOTIFY_CLICK",

    EVENT_NO_SIM: "EVENT_NO_SIM",

    MINI_GAMES_DOWNLOAD_START: "DOWNLOAD_START",
    MINI_GAMES_DOWNLOAD_ERROR: "DOWNLOAD_ERROR",
    MINI_GAMES_DOWNLOAD_SUCCESS: "DOWNLOAD_SUCCESS",
    MINI_GAMES_LOAD_PREFAB_ERROR: "LOAD_PREFAB_ERROR",
    MINI_GAMES_LOAD_PREFAB_SUCCESS: "OAD_PREFAB_SUCCESS",

    MINI_GAMES_OPEN_SUCCESS: "OPEN_SUCCESS",
    MINI_GAMES_NEED_REDOWNLOAD: "NEED_REDOWNLOAD",
};

@ccclass
export default class FacebookTracking {
    public static logCheckSim() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_NO_SIM);
    }

    public static logInviteNotify() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_INVITE_NOTIFY);
    }

    public static logInviteNotifyClick() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_INVITE_NOTIFY_CLICK);
    }

    public static logInviteShowLobby() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_INVITE_SHOW_LOBBY);
    }

    public static logInviteCloseLobby() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_INVITE_CLOSE_LOBBY);
    }

    public static logInviteAcceptLobby() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_INVITE_ACCEPT_LOBBY);
    }

    public static logInviteCancelLobby() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_INVITE_CANCEL_LOBBY);
    }

    public static logInviteAcceptRoom() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_INVITE_ACCEPT_ROOM);
    }

    public static logInviteCancelRoom() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_INVITE_CANCEL_ROOM);
    }

    public static logAppOpen() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_APP_OPEN);
    }

    public static logStartHotupdate() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_START_HOTUPDATE);
    }

    public static logFinishHotupdate() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_DONE_HOTUPDATE);
    }

    public static logErrHotupdate() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_ERR_HOTUPDATE);
    }

    public static logFailedHotupdate() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_FAILED_HOTUPDATE);
    }

    public static logFinishLoading() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_FINISH_LOADING);
    }

    public static logRegister() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_REGISTER);
    }

    public static logRegisterFB() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_REGISTER_FB);
    }

    public static logRegisterSuccess() {
        FacebookTracking.logStandardEvent(EventFacebook.EVENT_REGISTER_SUCCESS);
    }

    public static logLogout() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_LOGOUT);
    }

    public static logLogin() {
        FacebookTracking.logStandardEvent(EventFacebook.EVENT_LOGIN);
    }

    public static logHitLoginFb() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_HIT_LOGIN_FB);
    }

    public static logLoginFB() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_LOGIN_FB);
        FacebookTracking.logLogin();
    }

    public static logHitLoginButton() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_HIT_LOGIN_BUTTON);
    }

    public static logLoginBtn() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_LOGIN_BUTTON);
        FacebookTracking.logLogin();
    }

    public static logLoginToken() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_LOGIN_TOKEN);
        FacebookTracking.logLogin();
    }

    public static logOpenPopupNap() {
        FacebookTracking.logStandardEvent(EventFacebook.EVENT_OPEN_CHARGE);
    }

    public static logAddToCard() {
        FacebookTracking.logStandardEvent(EventFacebook.EVENT_ADD_TO_CART);
    }

    public static logPurchase() {
        if (!cc.sys.isNative)
            return;

        Http.get(Configs.App.GATEWAY_URL + "/api/v1/marketing/tracking-charge", { nick_name: Configs.Login.Nickname }, (err, json) => {
            if (err == null) {
                try {
                    if (json["code"] == 0) {
                        let data = json["data"];
                        if (data && data.length > 0) {
                            for (let i = 0; i < data.length; i++) {
                                if (data[i]["money"]) {
                                    FacebookTracking.logFacebookPurchase(data[i]["money"], "VND");
                                    FacebookTracking.logStandardEvent("fb_mobile_purchase");
                                }
                            }
                        }
                    }
                } catch (e) {
                    FacebookTracking.logFacebookEvent(EventFacebook.EVENT_CATCHED_PURCHASE);
                }
            }
        });
    }

    public static appLaunched() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_APP_LAUNCHED);
    }

    public static logOpenWithdraw() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_OPEN_WITHDRAW);
    }

    public static logHitWithdraw() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVNET_HIT_WITHDRAW);
    }

    public static logOpenVerify() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_OPEN_VERIFY);
    }

    public static logOpenGiftCode() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_OPEN_GIFTCODE);
    }

    public static logHitGiftCode() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_HIT_GIFCODE);
    }

    public static logGotGiftCode() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_GOT_GIFTCODE);
    }

    public static logLSGD() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_OPEN_LSGD);
    }

    public static logHotLine() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_OPEN_HOTLINE);
    }

    public static logFanpage() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_OPEN_FANPAGE);
    }

    public static logMail() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_OPEN_MAIL);
    }

    public static logBtnMiniGame() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_OPEN_BTN_MINIGAME);
    }

    public static logTopHu() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_OPEN_TOPHU);
    }

    public static openGame(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID);
    }

    public static openGameSuccess(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_SUCCESS);
        FacebookTracking.logViewContent();
    }

    public static logViewContent() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_NAME_VIEWED_CONTENT);
    }

    public static openGameInactive(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_INACTIVE);
    }

    public static openGameErrorPopup(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_ERROR_POPUP);
    }

    public static openGameWithHotUpdate(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE);
    }

    public static openGameWithHotUpdatePass(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE_PASS);
    }

    public static openGameWithHotUpdateSuccess(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE_SUCCESS);
    }

    public static openGameWithHotUpdateInterupt(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE_INTERUPT);
    }

    public static openGameHotUpdateStart(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE_START);
    }

    public static openGameHotUpdateFinish(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE_FINISH);
    }

    public static openGameHotUpdateError(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE_ERROR);
    }

    public static openGameHotUpdateFailed(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE_FAILED);
    }

    public static openGameHotUpdateFailedManifest(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE_FAILED_MANIFEST);
    }

    public static openGameHotUpdateNormal(gameId: string) {
        FacebookTracking.logFacebookEvent(gameId + EventFacebook.EVENT_OPEN_GAME_ID_HOTUPDATE_NORMAL);
    }

    public static betLoto() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_LOTO);
    }

    public static betLotoSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_LOTO_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static betTaiXiu() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_TAIXIU);
    }

    public static betTaiXiuSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_TAIXIU_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static betBauCua() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_BAUCUA);
    }

    public static betBauCuaSuccess(amount) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_BAUCUA_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static betCaoThap() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_CAOTHAP);
    }

    public static betCaoThapSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_CAOTHAP_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static betCaoThapVal(val: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_CAOTHAP_BET_VAL + "_" + val);
    }

    public static logDisconnect() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SHOOTFISH_DISCONNECTED);
    }

    public static betBanCaSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SHOOTFISH_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static betTLMNSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_TLMN, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static betSamSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_SAM, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static betBinhSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_MAUBINH, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static betXocDiaSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_BET_XOCDIA_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static spinSlot4() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT4);
    }

    public static spinSlot4Click() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT4_CLICK);
    }

    public static spinSlot4Auto() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT4_AUTO);
    }

    public static spinSlot4Fast() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT4_FAST);
    }

    public static spinSlot4Success(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT4_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static spinSlot4Trial() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT4_TRIAL);
    }

    public static spinSlot9() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT9);
    }

    public static spinSlot9Click() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT9_CLICK);
    }

    public static spinSlot9Auto() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT9_AUTO);
    }

    public static spinSlot9Fast() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT9_FAST);
    }

    public static spinSlot9Success(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT9_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static spinSlot9Trial() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT9_TRIAL);
    }

    public static spinSlot9Bet(val: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT9_BET_VAL + "_" + val);
    }

    public static spinSlot2() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT2);
    }

    public static spinSlot2Click() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT2_CLICK);
    }

    public static spinSlot2Auto() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT2_AUTO);
    }

    public static spinSlot2Fast() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT2_FAST);
    }

    public static spinSlot2Success(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT2_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static spinSlot2Trial() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT2_TRIAL);
    }

    public static spinSlot5() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT5);
    }

    public static spinSlot5Click() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT5_CLICK);
    }

    public static spinSlot5Auto() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT5_AUTO);
    }

    public static spinSlot5Fast() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT5_FAST);
    }

    public static spinSlot5Success(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT5_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static spinSlot5Trial() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_SLOT5_TRIAL);
    }

    public static spinSkyForce() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_3x3);
    }

    public static spinSkyForceClick() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_3x3_CLICK);
    }

    public static spinSkyForceFast() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_3x3_FAST);
    }

    public static spinSkyForceAuto() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_3x3_AUTO);
    }

    public static spinSkyForceSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_3x3_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static spinSkyForceBet(val: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_3x3_BET_VAL + "_" + val);
    }

    public static spinMinipoker() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_MINI_POKER);
    }

    public static spinMinipokerClick() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_MINI_POKER_CLICK);
    }

    public static spinMinipokereFast() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_MINI_POKER_FAST);
    }

    public static spinMinipokerAuto() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_MINI_POKER_AUTO);
    }

    public static spinMinipokerBet(val: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_MINI_POKER_BET_VAL + "_" + val);
    }

    public static spinMinipokerSuccess(amount: number) {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_SPIN_MINI_POKER_SUCCESS, amount);
        FacebookTracking.logSpendMoney(amount);
    }

    public static logCountTLMN() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_COUNT_TLMN);
    }

    public static logCountSam() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_COUNT_SAM);
    }

    public static logCountMauBinh() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_COUNT_MAUBINH);
    }

    public static logCountXocDia() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_COUNT_XOCDIA);
    }

    public static logCountBaCay() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_COUNT_BACAY);
    }

    public static logCountLieng() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_COUNT_LIENG);
    }

    public static logCountXidzach() {
        FacebookTracking.logFacebookEvent(EventFacebook.EVENT_COUNT_XIDZACH);
    }

    public static logSpendMoney(amount: number) {
        FacebookTracking.logStandardEvent(EventFacebook.EVENT_SPEND_MONEY, amount);
    }

    private static logFacebookEvent(name: string, value: number = 1) {
        if (!cc.sys.isNative)
            return;

        if (typeof sdkbox == "undefined") {
            console.log("SDKBOX is not defined");
            return;
        }

        if (typeof sdkbox.PluginFacebook == "undefined") {
            console.log("Facebook is not defined");
            return;
        }

        try {
            sdkbox.PluginFacebook.logEvent(name, value);
            console.log("FacebookTracking Event: " + name);
        } catch (e) {
            console.log("FacebookTracking Err");
        }
    }

    private static logStandardEvent(name: string, value?: number) {
        if (!cc.sys.isNative)
            return;

        if (typeof sdkbox == "undefined") {
            console.log("SDKBOX is not defined");
            return;
        }

        if (typeof sdkbox.PluginFacebook == "undefined") {
            console.log("Facebook is not defined");
            return;
        }

        try {
            if (value) {
                sdkbox.PluginFacebook.logEvent(name, value);
            } else {
                sdkbox.PluginFacebook.logEvent(name);
            }

            console.log("FacebookTracking Standard Event: " + name);
        } catch (e) {
            console.log("FacebookTracking Err");
        }
    }

    private static logFacebookPurchase(amount: number, unit: string) {
        if (!cc.sys.isNative)
            return;

        if (typeof sdkbox == "undefined") {
            console.log("SDKBOX is not defined");
            return;
        }

        if (typeof sdkbox.PluginFacebook == "undefined") {
            console.log("Facebook is not defined");
            return;
        }

        try {
            sdkbox.PluginFacebook.logPurchase(amount, unit);
            console.log("Purchased: " + amount + " " + unit);
        } catch (e) {
            console.log("FacebookTracking Err");
        }
    }

    public static logMiniGameDownloadStart(gameName: string) {
        FacebookTracking.logFacebookEvent(gameName + " " + EventFacebook.MINI_GAMES_DOWNLOAD_START);
    }

    public static logMiniGameDownloadError(gameName: string) {
        FacebookTracking.logFacebookEvent(gameName + " " + EventFacebook.MINI_GAMES_DOWNLOAD_ERROR);
    }

    public static logMiniGameDownloadSuccess(gameName: string) {
        FacebookTracking.logFacebookEvent(gameName + " " + EventFacebook.MINI_GAMES_DOWNLOAD_SUCCESS);
    }

    public static logMiniGameLoadPrefabError(gameName: string) {
        FacebookTracking.logFacebookEvent(gameName + " " + EventFacebook.MINI_GAMES_LOAD_PREFAB_ERROR);
    }

    public static logMiniGameLoadPrefabSuccess(gameName: string) {
        FacebookTracking.logFacebookEvent(gameName + " " + EventFacebook.MINI_GAMES_LOAD_PREFAB_SUCCESS);
    }

    public static logMiniGameOpenSuccess(gameName: string) {
        FacebookTracking.logFacebookEvent(gameName + " " + EventFacebook.MINI_GAMES_OPEN_SUCCESS);
    }

    public static logMiniGameNeedRedownload(gameName: string) {
        FacebookTracking.logFacebookEvent(gameName + " " + EventFacebook.MINI_GAMES_NEED_REDOWNLOAD);
    }
}
