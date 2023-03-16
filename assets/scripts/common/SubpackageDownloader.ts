import Configs from "./Configs";
import FacebookTracking from "./FacebookTracking";

const { ccclass, property } = cc._decorator;

namespace common {
    @ccclass
    export class SubpackageDownloader {
        private static instancesMap = {}

        private isDownloading = false;
        private _storagePath: string = "";
        private _am: any;
        private failCount = 0;

        constructor() {
        }

        static getInstance(name: string): SubpackageDownloader {
            if(!SubpackageDownloader.instancesMap.hasOwnProperty(name)) {
                SubpackageDownloader.instancesMap[name] = new SubpackageDownloader();
            }
            return SubpackageDownloader.instancesMap[name];
        }

        private _downloadSubpackage(name: string, callbacks: (err: string, progress: number) => void) {
            if (this.isDownloading) return;
            console.log("CC_JSB: " + CC_JSB);
            console.log("CC_DEBUG: " + CC_DEBUG);
            console.log("CC_DEV: " + CC_DEV);
            console.log("CC_EDITOR: " + CC_EDITOR);
            console.log("CC_PREVIEW: " + CC_PREVIEW);
            console.log("CC_TEST: " + CC_TEST);
            console.log("CC_BUILD: " + CC_BUILD);
            if (CC_JSB && !CC_DEBUG && Configs.App.SUBPACKAGE_URL) {
                this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + Configs.App.STORAGE_FOLDER + '/subpackages/' + name;
                console.log('Storage path for remote asset : ' + this._storagePath);
                if (jsb.fileUtils.isFileExist(this._storagePath + "/project.manifest")) {
                    // console.log("project.manifest existed");
                    cc.loader.load(this._storagePath + "/project.manifest", (err, json) => {
                        json = JSON.parse(json);
                        // console.log("json old: " + JSON.stringify(json, null, "\t"));
                        var t = Date.now();
                        if (json.hasOwnProperty("remoteVersionUrl")) {
                            var rvu = json['remoteVersionUrl'].split("?t=");
                            json['remoteVersionUrl'] = rvu[0] + "?t=" + t;
                        }
                        if (json.hasOwnProperty("remoteManifestUrl")) {
                            var rmu = json['remoteManifestUrl'].split("?t=");
                            json['remoteManifestUrl'] = rmu[0] + "?t=" + t;
                        }
                        let saved = jsb.fileUtils.writeStringToFile(JSON.stringify(json, null, "\t"), this._storagePath + "/project.manifest");
                        console.log("SubpackageDownloader json new saved: " + saved);
                        // console.log("json new: " + JSON.stringify(json, null, "\t"));

                        this.preCheckUpdate(name, callbacks);
                    });
                } else {
                    this.preCheckUpdate(name, callbacks);
                }
            } else {
                if (CC_BUILD && CC_JSB) {
                    if(jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + Configs.App.STORAGE_FOLDER + '/subpackages/' + name + "/index.jsc")) {
                        cc.loader.downloader.loadSubpackage(name, (err: Error) => {
                            if (err) {
                                console.log(err.stack);
                                callbacks("Lỗi: " + err.stack, 0);
                            } else {
                                callbacks(null, 0);
                            }
                        });
                    } else {
                        callbacks("Không tìm thấy resource!", 0);
                    }
                } else {
                    callbacks("showLoading", 0);
                    callbacks(null, 0);
                }
            }
        }

        private preCheckUpdate(name: string, callbacks: (err: string, progress: number) => void) {
            let tempManifest = this._storagePath + "_temp/project.manifest.temp"; 
            console.log("SubpackageDownloader PreCheckUpdate " + jsb.fileUtils.isFileExist(tempManifest));
            if(jsb.fileUtils.isFileExist(tempManifest)) {
                cc.loader.load(tempManifest, (err, json) => {
                    try {
                        json = JSON.parse(json);
                    
                        if (json.hasOwnProperty("version")) {
                            json['version'] = "-1";
                        }
                        let saved = jsb.fileUtils.writeStringToFile(JSON.stringify(json, null, "\t"), tempManifest);
                        console.log("SubpackageDownloader PreCheckUpdate saved: " + saved);
                        console.log("SubpackageDownloader PreCheckUpdate json: " + JSON.stringify(json, null, "\t"));  

                        this.checkUpdate(name, callbacks);
                    } catch(e) {
                        this.checkUpdate(name, callbacks);
                        console.log("FacebookTracking Err");
                    }

                    FacebookTracking.openGameWithHotUpdateInterupt(name);
                });
            } else {
                this.checkUpdate(name, callbacks);
            }
        }

        private checkUpdate(name: string, callbacks: (err: string, progress: number) => void) {
            var versionCompareHandle = (versionA: any, versionB: any) => {
                console.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
                var vA = versionA.split('.');
                var vB = versionB.split('.');
                for (var i = 0; i < vA.length; ++i) {
                    var a = parseInt(vA[i]);
                    var b = parseInt(vB[i] || 0);
                    if (a === b) {
                        continue;
                    }
                    else {
                        return a - b;
                    }
                }
                if (vB.length > vA.length) {
                    return -1;
                }
                else {
                    return 0;
                }
            };

            let t = Date.now();
            var customManifestStr = JSON.stringify({
                "packageUrl": Configs.App.SUBPACKAGE_URL + "subpackages/" + name + "/",
                "remoteManifestUrl": Configs.App.SUBPACKAGE_URL + "subpackages/" + name + "/project.manifest?t=" + t,
                "remoteVersionUrl": Configs.App.SUBPACKAGE_URL + "subpackages/" + name + "/version.manifest?t=" + t,
                "version": "0"
            });
            console.log(customManifestStr);

            this._am = new jsb.AssetsManager('', this._storagePath, versionCompareHandle)
            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                var manifest = new jsb.Manifest(customManifestStr, this._storagePath);
                this._am.loadLocalManifest(manifest, this._storagePath);
            }

            this._am.setEventCallback((event) => {
                switch (event.getEventCode()) {
                    //check callback
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        console.log("No local manifest file found, hot update skipped.");
                        callbacks("No local manifest file found, hot update skipped. ", 0);
                        FacebookTracking.openGameHotUpdateFailedManifest(name);
                        break;
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                        console.log("Fail to download manifest file, hot update skipped.");
                        callbacks("Fail to download manifest file, hot update skipped." + event.getMessage(), 0);
                        FacebookTracking.openGameHotUpdateFailedManifest(name);
                        break;
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        console.log("Fail to parse manifest file, hot update skipped.");
                        callbacks("Fail to parse manifest file, hot update skipped." + event.getMessage(), 0);
                        FacebookTracking.openGameHotUpdateFailedManifest(name);
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        console.log("Already up to date with the latest remote version 1.");
                        cc.loader.downloader.loadSubpackage(name, (err: Error) => {
                            if (err) {
                                console.log(err.stack);
                                callbacks("Lỗi: " + err.stack, 0);
                            } else {
                                callbacks(null, 0);
                            }
                        });
                        callbacks("showLoading", 0);

                        FacebookTracking.openGameHotUpdateNormal(name);
                        break;
                    case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                        console.log("New version found, please try to update.");
                        this._am.update();
                        FacebookTracking.openGameHotUpdateStart(name);
                        break;
                    //download callback
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        console.log("files: " + event.getDownloadedFiles() + ' / ' + event.getTotalFiles());
                        console.log("bytes: " + event.getTotalBytes() + ' / ' + event.getDownloadedBytes());
                        console.log("event.getPercent(): " + event.getPercent());
                        var progress = Number(event.getDownloadedFiles() / event.getTotalFiles());
                        callbacks("progress", progress);
                        break;
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.loader.downloader.loadSubpackage(name, (err: Error) => {
                            if (err) {
                                console.log(err.stack);
                                callbacks("Lỗi: " + err.stack, 0);
                            } else {
                                callbacks(null, 0); 
                            }
                        });
                        callbacks("showLoading", 0);

                        FacebookTracking.openGameHotUpdateFinish(name);
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        console.log('Update failed. ' + event.getMessage());
                        if (this.failCount < 3) {
                            this._am.downloadFailedAssets();
                            console.log("Update Failed Count: " + this.failCount);
                            FacebookTracking.openGameHotUpdateError(name);
                        } else {
                            callbacks('Update failed. ' + event.getMessage(), 0);
                            FacebookTracking.openGameHotUpdateFailed(name);
                        }
                        this.failCount++;
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        console.log('Asset update error: ' + event.getAssetId() + ', ' + event.getMessage());
                        // callbacks('Asset update error: ' + event.getAssetId() + ', ' + event.getMessage(), 0);
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        console.log('Decompress error: ' + event.getMessage());
                        callbacks('Decompress error: ' + event.getMessage(), 0);
                        break;
                    default:
                        return;
                }
            });
            this._am.checkUpdate();
        }

        static downloadSubpackage(name: string, callbacks: (err: string, progress: number) => void) {
            this.getInstance(name)._downloadSubpackage(name, callbacks);
        }
    }
}

export default common.SubpackageDownloader;
