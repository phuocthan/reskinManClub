import SPUtils from "./SPUtils";
import Http from "./Http";
import VersionConfig from "./VersionConfig";

namespace Configs {
    export class Login {
        static UserId: number = 0;
        static Username: string = "";
        static Password: string = "";
        static Nickname: string = "";
        static Avatar: string = "";
        static Coin: number = 0;
        static IsLogin: boolean = false;
        static IsLoginFB: boolean = false;
        static AccessToken: string = "";
        static SessionKey: string = "";
        static LuckyWheel: number = 0;
        static CreateTime: string = "";
        static Birthday: string = "";
        static IpAddress: string = "";
        static VipPoint: number = 0;
        static VipPointSave: number = 0;
        static MailCount: number = 0;

        static CoinFish: number = 0;
        static UserIdFish: number = 0;
        static UsernameFish: string = "";
        static PasswordFish: string = "";
        static FishConfigs: any = null;
        static BitcoinToken: string = "";

        static IsShowEvent: boolean = false;
        static mobile: string = "";
        static isMuteInvite: boolean = false;

        static clear() {
            this.UserId = 0;
            this.Username = "";
            this.Password = "";
            this.Nickname = "";
            this.Avatar = "";
            this.Coin = 0;
            this.IsLogin = false;
            this.IsLoginFB = false;
            this.AccessToken = "";
            this.SessionKey = "";
            this.CreateTime = "";
            this.Birthday = "";
            this.IpAddress = "";
            this.VipPoint = 0;
            this.VipPointSave = 0;
            this.MailCount = 0;

            this.CoinFish = 0;
            this.UserIdFish = 0;
            this.UsernameFish = "";
            this.PasswordFish = "";
            this.BitcoinToken = "";

            this.IsShowEvent = false;
            this.mobile = "";
            this.isMuteInvite = false;

            SPUtils.setUserPass("");
        }

        static readonly VipPoints = [80, 800, 4500, 8600, 12000, 50000, 1000000];
        static readonly VipPointsName = ["Đá", "Đồng", "Bạc", "Vàng", "BẠCH KIM", "KIM CƯƠNG"];
        static getVipPointName(): string {
            for (let i = this.VipPoints.length - 1; i >= 0; i--) {
                if (Configs.Login.VipPoint > this.VipPoints[i]) {
                    return this.VipPointsName[i];
                }
            }
            return this.VipPointsName[0];
        }
        static getVipPointNextLevel(): number {
            for (let i = this.VipPoints.length - 1; i >= 0; i--) {
                if (Configs.Login.VipPoint > this.VipPoints[i]) {
                    if (i == this.VipPoints.length - 1) {
                        return this.VipPoints[i];
                    }
                    return this.VipPoints[i + 1];
                }
            }
            return this.VipPoints[0];
        }
        static getVipPointIndex(): number {
            for (let i = this.VipPoints.length - 1; i >= 0; i--) {
                if (Configs.Login.VipPoint > this.VipPoints[i]) {
                    return i;
                }
            }
            return 0;
        }
    }

    export class App {
        static HOT_UPDATE_URL = "";
        static SUBPACKAGE_URL = "";
        static STORAGE_FOLDER = "remote_assets";
        static DOMAIN: string = "";
        static API: string = "";
        static MONEY_TYPE = 1;
        static LINK_DOWNLOAD = "";
        static LINK_EVENT = "";
        static LINK_SUPPORT = "";
        static LINK_TELE_GROUP = "";
        static LINK_FACEBOOK = "";
        static PAY_URL = "";
        static GATEWAY_URL = "";
        static LINK_TELE_VERIFY_PHONE = "";
        static EVENTS = [];
        static USE_WSS = true;
        static readonly MONEY_TRIAL = 10000000;
        static readonly JACKPOT_TRIAL = 10000000;
        static DEVICE_RESOLUTION: cc.Size = cc.size(1280, 720);
        static DESIGN_RESOLUTION: cc.Size = cc.size(1280, 720);
        static readonly AVATAR_SIZE_SO_SMALL = cc.size(75, 75);
        static readonly AVATAR_SIZE_SMALL = cc.size(90, 90);
        static readonly AVATAR_SIZE_TLMN = cc.size(140, 140);
        static readonly AVATAR_SIZE_CARD = cc.size(97.4, 99.3);
        static readonly AVATAR_SIZE_LARGE = cc.size(180, 180);

        // hna add
        static X3PROGRESS: any = {};
        static LIST_LEFT_NOTIFY_LOBBY = [];
        static X3_GUIDE_CONTENT = '';
        // end

        static readonly HOST_MINIGAME = {
            host: "6d69.r99.bar",
            port: 80
        };
        static readonly HOST_TAI_XIU_MINI2 = {
            host: "overunder.r99.bar",
            port: 80
        };
        static readonly HOST_SLOT = {
            host: "736c.r99.bar",
            port: 80
        };
        static readonly HOST_TLMN = {
            host: "746c.r99.bar",
            port: 80
        };
        static readonly HOST_SHOOT_FISH = {
            host: "6132.r99.bar",
            port: 2083
        };
        static readonly HOST_SAM = {
            host: "sam.xxeng.vip",
            port: 80
        };
        static readonly HOST_XOCDIA = {
            host: "xocdia.xxeng.vip",
            port: 80
        };
        static readonly HOST_BACAY = {
            host: "bacay.xxeng.vip",
            port: 80
        };
        static readonly HOST_BAICAO = {
            host: "baicao.xxeng.vip",
            port: 80
        };
        static readonly HOST_POKER = {
            host: "poker.xxeng.vip",
            port: 80
        };
        static readonly HOST_MAUBINH = {
            host: "binh.xxeng.vip",
            port: 80
        };
        static readonly HOST_XIDZACH = {
            host: "xzdzach.xxeng.vip",
            port: 80
        };
        static readonly HOST_LIENG = {
            host: "lieng.xxeng.vip",
            port: 80
        };

        static IS_GOT_CONFIG = false;

        static readonly SERVER_CONFIG = {
            ratioNapThe: 1,
            ratioTransfer: 0.98,
            ratioTransferDL: 1,
            ratioNapTienNH: 0.83,
            ratioMuaThe: 1.2,
            ratioRutNH: 1.2,
            ratioNapMomo: 1.2,
            ratioRutMomo: 1.2,
            listTenNhaMang: ["Viettel", "Vinaphone", "Mobifone"],
            listIdNhaMang: [0, 1, 2],
            listMenhGiaNapThe: [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000],
            listMenhGiaMuaThe: [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 30000, 300000],
            listIdMenhGiaMuaThe: [],
            listMenhGiaNapMomo: [],
            listMenhGiaRutMomo: [],
            listMenhGiaNapBank: [],
            listMenhGiaRutBank: [],

            percentNapThe: 1,
            percentNapMomo: 1,
            percentNapBank: 1,

            isOpenNapThe: true,
            isOpenNapMomo: false,
            isOpenNapBank: false,
            isOpenRutThe: true,
            isOpenRutMomo: false,
            isOpenRutBank: false,

            listNapTelco: [],
            listRutTelco: [],
        };

        static getServerConfig() {
            Http.get(Configs.App.API, { "c": 130 }, (err, res) => {
                if (err == null) {
                    console.log(res);

                    App.SERVER_CONFIG.ratioTransferDL = res["ratio_transfer_dl_1"];
                    App.SERVER_CONFIG.ratioTransfer = res["ratio_chuyen"];

                    App.SERVER_CONFIG.ratioNapThe = res["ratio_nap_the"];
                    App.SERVER_CONFIG.ratioNapTienNH = res["ratio_nap_vin_nh"];
                    App.SERVER_CONFIG.ratioRutNH = res["ratio_cashout_bank"];

                    App.SERVER_CONFIG.ratioNapMomo = res["ratio_nap_momo"];
                    App.SERVER_CONFIG.ratioRutMomo = res["ratio_cashout_momo"];
                    App.SERVER_CONFIG.ratioMuaThe = res["ratio_mua_the"];

                    App.SERVER_CONFIG.listIdMenhGiaMuaThe = res["list_card_exchange"];
                    App.SERVER_CONFIG.listIdMenhGiaMuaThe.sort((a, b) => {
                        if (a == 9)
                            a = 1.5;
                        if (b == 9)
                            b = 1.5;
                        if (a == 10)
                            a = 4.5;
                        if (b == 10)
                            b = 4.5;

                        return a - b;
                    });

                    App.SERVER_CONFIG.listMenhGiaNapMomo = res["menhgia_nap_momo"];
                    App.SERVER_CONFIG.listMenhGiaRutMomo = res["menhgia_rut_momo"];
                    App.SERVER_CONFIG.listMenhGiaNapBank = res["menhgia_nap_bank"];
                    App.SERVER_CONFIG.listMenhGiaRutBank = res["menhgia_rut_bank"];

                    App.SERVER_CONFIG.isOpenNapThe = res["is_nap_the"] == 0;
                    App.SERVER_CONFIG.isOpenNapMomo = res["is_nap_momo"] == 0;
                    App.SERVER_CONFIG.isOpenNapBank = res["is_nap_vin_nh"] == 0;

                    App.SERVER_CONFIG.isOpenRutThe = res["is_mua_the"] == 0;
                    App.SERVER_CONFIG.isOpenRutMomo = res["is_mua_momo"] == 0;
                    App.SERVER_CONFIG.isOpenRutBank = res["is_mua_bank"] == 0;

                    // if (typeof res["ratio_rut_nh"] == "number") App.SERVER_CONFIG.ratioRutNH = res["ratio_rut_nh"];

                    App.SERVER_CONFIG.percentNapThe = Math.round((App.SERVER_CONFIG.ratioNapThe - 1) * 100);
                    App.SERVER_CONFIG.percentNapMomo = Math.round((App.SERVER_CONFIG.ratioNapMomo - 1) * 100);
                    App.SERVER_CONFIG.percentNapBank = Math.round((App.SERVER_CONFIG.ratioNapTienNH - 1) * 100);

                    App.SERVER_CONFIG.listNapTelco = res["nap_the"];
                    App.SERVER_CONFIG.listRutTelco = res["rut_the"];

                    console.log("Ratio Card " + App.SERVER_CONFIG.percentNapThe);
                    console.log("Ratio Momo " + App.SERVER_CONFIG.percentNapMomo);
                    console.log("Ratio Bank " + App.SERVER_CONFIG.percentNapBank);

                    Configs.App.IS_GOT_CONFIG = true;
                }
            });
        }

        static getServerConfigNapRut(cb) {
            Http.get(Configs.App.API, { "c": 130 }, (err, res) => {
                if (err == null) {
                    console.log(res);

                    App.SERVER_CONFIG.ratioTransferDL = res["ratio_transfer_dl_1"];
                    App.SERVER_CONFIG.ratioTransfer = res["ratio_chuyen"];

                    App.SERVER_CONFIG.ratioNapThe = res["ratio_nap_the"];
                    App.SERVER_CONFIG.ratioNapTienNH = res["ratio_nap_vin_nh"];
                    App.SERVER_CONFIG.ratioRutNH = res["ratio_cashout_bank"];

                    App.SERVER_CONFIG.ratioNapMomo = res["ratio_nap_momo"];
                    App.SERVER_CONFIG.ratioRutMomo = res["ratio_cashout_momo"];
                    App.SERVER_CONFIG.ratioMuaThe = res["ratio_mua_the"];

                    App.SERVER_CONFIG.listIdMenhGiaMuaThe = res["list_card_exchange"];
                    App.SERVER_CONFIG.listIdMenhGiaMuaThe.sort((a, b) => {
                        if (a == 9)
                            a = 1.5;
                        if (b == 9)
                            b = 1.5;
                        if (a == 10)
                            a = 4.5;
                        if (b == 10)
                            b = 4.5;

                        return a - b;
                    });

                    App.SERVER_CONFIG.listMenhGiaNapMomo = res["menhgia_nap_momo"];
                    App.SERVER_CONFIG.listMenhGiaRutMomo = res["menhgia_rut_momo"];
                    App.SERVER_CONFIG.listMenhGiaNapBank = res["menhgia_nap_bank"];
                    App.SERVER_CONFIG.listMenhGiaRutBank = res["menhgia_rut_bank"];

                    App.SERVER_CONFIG.isOpenNapThe = res["is_nap_the"] == 0;
                    App.SERVER_CONFIG.isOpenNapMomo = res["is_nap_momo"] == 0;
                    App.SERVER_CONFIG.isOpenNapBank = res["is_nap_vin_nh"] == 0;

                    App.SERVER_CONFIG.isOpenRutThe = res["is_mua_the"] == 0;
                    App.SERVER_CONFIG.isOpenRutMomo = res["is_mua_momo"] == 0;
                    App.SERVER_CONFIG.isOpenRutBank = res["is_mua_bank"] == 0;

                    // if (typeof res["ratio_rut_nh"] == "number") App.SERVER_CONFIG.ratioRutNH = res["ratio_rut_nh"];

                    App.SERVER_CONFIG.percentNapThe = Math.round((App.SERVER_CONFIG.ratioNapThe - 1) * 100);
                    App.SERVER_CONFIG.percentNapMomo = Math.round((App.SERVER_CONFIG.ratioNapMomo - 1) * 100);
                    App.SERVER_CONFIG.percentNapBank = Math.round((App.SERVER_CONFIG.ratioNapTienNH - 1) * 100);

                    App.SERVER_CONFIG.listNapTelco = res["nap_the"];
                    App.SERVER_CONFIG.listRutTelco = res["rut_the"];

                    console.log("Ratio Card " + App.SERVER_CONFIG.percentNapThe);
                    console.log("Ratio Momo " + App.SERVER_CONFIG.percentNapMomo);
                    console.log("Ratio Bank " + App.SERVER_CONFIG.percentNapBank);

                    Configs.App.IS_GOT_CONFIG = true;
                    cb(true);
                } else {
                    cb(false);
                }
            });
        }

        static getPlatformName() {
            if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) return "android";
            if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) return "ios";
            return "web";
        }

        static getLinkFanpage() {
            return Configs.App.LINK_FACEBOOK;
        }

        static getLinkTelegram() {
            return "";
        }

        static getLinkTelegramGroup() {
            return "";
        }

        static init() {
            let baseURL = "lala52.xyz";

            this.USE_WSS = true;
            this.HOT_UPDATE_URL = "";
            this.SUBPACKAGE_URL = "";
            this.DOMAIN = "https://" + baseURL + "/";
            this.API = "https://portal." + baseURL + "/api";
            this.PAY_URL = "https://wspay." + baseURL;
            this.GATEWAY_URL = "https://gatewayapi." + baseURL;
            this.MONEY_TYPE = 1;
            this.LINK_DOWNLOAD = "";
            this.LINK_EVENT = "";
            this.LINK_SUPPORT = "";

            this.HOST_MINIGAME.host = "minigame." + baseURL;
            this.HOST_TAI_XIU_MINI2.host = "overunder." + baseURL;
            this.HOST_SLOT.host = "slot." + baseURL;
            this.HOST_TLMN.host = "tlmn." + baseURL;
            this.HOST_SHOOT_FISH.host = "banca2." + baseURL;
            this.HOST_SAM.host = "sam." + baseURL;
            this.HOST_XOCDIA.host = "xocdia." + baseURL;
            this.HOST_BACAY.host = "bacay." + baseURL;
            this.HOST_BAICAO.host = "baicao." + baseURL;
            this.HOST_POKER.host = "poker." + baseURL;
            this.HOST_MAUBINH.host = "binh." + baseURL;
            this.HOST_XIDZACH.host = "xzdzach." + baseURL;
            this.HOST_LIENG.host = "lieng." + baseURL;
        }
    }

    export class GameId {
        static readonly MiniPoker = 1;
        static readonly TaiXiu = 2;
        static readonly BauCua = 3;
        static readonly CaoThap = 4;
        static readonly Slot3x3 = 5;
        static readonly VQMM = 7;
        static readonly Sam = 8;
        static readonly BaCay = 9;
        static readonly MauBinh = 10;
        static readonly TLMN = 11;
        static readonly TaLa = 12;
        static readonly Lieng = 13;
        static readonly XiTo = 14;
        static readonly XocXoc = 15;
        static readonly BaiCao = 16;
        static readonly Poker = 17;
        static readonly Bentley = 19;
        static readonly RangeRover = 20;
        static readonly MayBach = 21;
        static readonly RollsRoyce = 22;

        static getGameName(gameId: number): string {
            switch (gameId) {
                case this.MiniPoker:
                    return "MiniPoker";
                case this.TaiXiu:
                    return "Tài xỉu";
                case this.BauCua:
                    return "Bầu cua";
                case this.CaoThap:
                    return "Cao thấp";
                case this.Slot3x3:
                    return "ManSlots";
                case this.VQMM:
                    return "VQMM";
                case this.Sam:
                    return "Sâm";
                case this.MauBinh:
                    return "Mậu binh";
                case this.TLMN:
                    return "TLMN";
                case this.TaLa:
                    return "Tá lả";
                case this.Lieng:
                    return "Liêng";
                case this.XiTo:
                    return "Xì tố";
                case this.XocXoc:
                    return "Xóc xóc";
                case this.BaiCao:
                    return "Bài cào";
                case this.Poker:
                    return "Poker";
                case this.Bentley:
                    return "BigCity Boy"; // Vương Quốc Đạp Hũ
                case this.RangeRover:
                    return "M.I.B Slots";
                case this.MayBach:
                    return "Burning Race"; // Truyền Nhân Samurai
                case this.RollsRoyce:
                    return "Diablo"; // tho san kho bau
            }
            return "Tài Xỉu";
        }
    }

    export class LANG {
        static readonly COOMING_SOON = "Chức năng sắp ra mắt";
        static readonly CANT_ACT = "Không thể thực hiện thao tác";
        static readonly ALERT_SLOT_TRIAL = "Không thể thực hiện chức năng khi đang quay thử";
        static readonly ALERT_SLOT_SPINING = "Không thể thực hiện chức năng khi đang quay";
        static readonly ALERT_EMPTY = "Dữ liệu trống";
    }
}
export default Configs;
Configs.App.init();