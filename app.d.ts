declare function md5(v:string);
declare class base64 {
    static encode(v:string);
    static decode(v:string);
}

declare class msgpack {
    static encode(v:string):Uint8Array;
    static encode(v:any):Uint8Array;
    static decode(v:any):any;
}

namespace SAT {
    declare class Polygon {
        angle: number;
        pos: Vector;
        setAngle(radian: number): void;
        translate(x: number, y: number);
    }

    declare class Box {
        angle: number;
        w: number;
        h: number;
        pos: Vector;
        constructor(pos: Vector, width: number, height: number);
        toPolygon(): Polygon;
    }

    declare class Circle {
        radius: number;
        pos: Vector;
        constructor(pos: Vector, radius: number);
    }

    declare class Vector {
        x: number;
        y: number;
        constructor(x: number, y: number);
    }

    declare class Response {

    }
}

declare class SAT {
    static testPolygonPolygon(a: SAT.Polygon, b: SAT.Polygon): boolean;
    static testPolygonPolygon(a: SAT.Polygon, b: SAT.Polygon, response: SAT.Response): boolean;
    static testCirclePolygon(circle: SAT.Circle, polygon: SAT.Polygon): boolean;
    static testCirclePolygon(circle: SAT.Circle, polygon: SAT.Polygon, response: SAT.Response): boolean;
}

namespace jsb {
    declare class AssetsManager {
        constructor(localManifest: string, storagePath: string, versionCompareHandle: (versionA: any, versionB: any) => void);
        public getState(): number;
        public getLocalManifest(): Manifest;
        public getRemoteManifest(): Manifest;
        public setEventCallback(cb: (event: any) => void);
        public loadLocalManifest(manifest: Manifest, storagePath: string);
        public checkUpdate();
        public update();
        public downloadFailedAssets();
    }
    declare namespace AssetsManager {
        declare class State {
            static UNINITED: number;
        }
    }
    declare class EventAssetsManager {
        static ERROR_NO_LOCAL_MANIFEST: number;
        static UPDATE_PROGRESSION: number;
        static ERROR_DOWNLOAD_MANIFEST: number;
        static ERROR_PARSE_MANIFEST: number;
        static ALREADY_UP_TO_DATE: number;
        static UPDATE_FINISHED: number;
        static UPDATE_FAILED: number;
        static ERROR_UPDATING: number;
        static ERROR_DECOMPRESS: number;
        static NEW_VERSION_FOUND: number;
    }
    declare class Manifest {
        constructor(customManifest: string, storagePath: string);
        public getLocalManifest(): string;
        public getSearchPaths(): string[];
        public getVersionFileUrl(): string;
    }

    export module fileUtils {
        export function getSearchPaths(): Array<string>;
        export function getWritablePath(): string;
        export function isFileExist(p: string): boolean;
        export function writeStringToFile(content: string, p: string): boolean;
        export function setSearchPaths(p: string[]);
    }
}