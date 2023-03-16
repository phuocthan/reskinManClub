import Configs from "./Configs";
import { NativeBridge } from "./NativeBridge";
import VersionConfig from "./VersionConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Http {
    static post(url: string, params: object, onFinished: (err: any, json: any) => void, headers = {}) {
        var xhr = new XMLHttpRequest();
        var _params = "";
        if (params !== null) {
            var count = 0;
            var paramsLength = Object.keys(params).length;
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    _params += key + "=" + params[key];
                    if (count < paramsLength - 1) {
                        _params += "&";
                    }
                }
                count++;
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var data = null;
                    var e = null;
                    try {
                        data = JSON.parse(xhr.responseText);
                    } catch (ex) {
                        e = ex;
                    }
                    onFinished(e, data);
                } else {
                    onFinished(xhr.status, null);
                }
            }
        };

        xhr.onerror = function() {
            onFinished(xhr.readyState, null);
        }

        xhr.ontimeout = function() {
            onFinished("timeout", null);
        }

        xhr.open("POST", encodeURI(url), true);
        
        for (var key in headers) {
            if(headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.send(_params);
    }

    static get(url: string, params: object, onFinished: (err: any, json: any) => void, headers = {}) {
        var xhr = new XMLHttpRequest();
        var _params = "";
        params = params || {};
        
        params["utm_source"] = NativeBridge.getPackageName();

        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
            params["pf"] = "ad";
        } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
            params["pf"] = "ios";
        } else if (!cc.sys.isNative) {
            params["pf"] = "web";
        } else {
            params["pf"] = "other";
        }
        params["at"] = Configs.Login.AccessToken;
        if (params !== null) {
            var count = 0;
            var paramsLength = Object.keys(params).length;
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    _params += key + "=" + params[key];
                    if (count++ < paramsLength - 1) {
                        _params += "&";
                    }
                }
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var data = null;
                    var e = null;
                    try {
                        data = JSON.parse(xhr.responseText);
                    } catch (ex) {
                        e = ex;
                    }
                    onFinished(e, data);
                } else {
                    onFinished(xhr.status, null);
                }
            }
        };

        xhr.onerror = function() {
            onFinished(xhr.readyState, null);
        }

        xhr.ontimeout = function() {
            onFinished("timeout", null);
        }
        xhr.timeout = 10000;
        
        xhr.open("GET", encodeURI(url + "?" + _params), true);
        
        for (var key in headers) {
            if(headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }

        console.log("XHR_URL : "+ url + "?" + _params);

        xhr.send();
    }

    static getGoogleApis(url: string, onFinished: (err: any, json: any) => void, headers = {}) {
        var xhr = new XMLHttpRequest();
        var _params = "?t=" + new Date().getTime();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var data = null;
                    var e = null;
                    try {
                        data = JSON.parse(xhr.responseText);
                    } catch (ex) {
                        e = ex;
                    }
                    onFinished(e, data);
                } else {
                    onFinished(xhr.status, null);
                }
            }
        };

        xhr.onerror = function() {
            onFinished(xhr.readyState, null);
        }

        xhr.ontimeout = function() {
            onFinished("timeout", null);
        }
        xhr.timeout = 10000;
        
        xhr.open("GET", encodeURI(url + "?" + _params), true);
        
        for (var key in headers) {
            if(headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }

        console.log("XHR_URL : "+ url + "?" + _params);

        xhr.send();
    }
}
