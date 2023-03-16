var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var fsext = require("fs-extra");
var rimraf = require("rimraf");
const _7z = require('7zip-min');

var fileContent = JSON.parse(fs.readFileSync("version_config.json", {encoding:'utf8', flag:'r'}));
var arg_game = process.argv[2];
var arg_version = process.argv[3];

if(!arg_game) {
    console.log("Chua Nhap Ten Game");
    process.exit();
}

if(!arg_version) {
    console.log("Chua Nhap Version");
    process.exit();
}

if(!fileContent[arg_game]) {
    console.log("Sai Ten Game");
    process.exit();
}

var packageUrl = fileContent[arg_game].package_url;
var version = arg_version;
var sub_version = arg_version;

var manifest = {
    packageUrl: packageUrl,
    remoteManifestUrl: packageUrl + 'project.manifest',
    remoteVersionUrl: packageUrl + 'version.manifest',
    version: version,
    assets: {},
    searchPaths: []
};

var dest = './build/remote-assets/';
var src = './build/jsb-link/';

// Parse arguments
var i = 2;
while ( i < process.argv.length) {
    var arg = process.argv[i];

    switch (arg) {
    case '--url' :
    case '-u' :
        var url = process.argv[i+1];
        manifest.packageUrl = url;
        manifest.remoteManifestUrl = url + 'project.manifest';
        manifest.remoteVersionUrl = url + 'version.manifest';
        i += 2;
        break;
    case '--version' :
    case '-v' :
        manifest.version = process.argv[i+1];
        i += 2;
        break;
    case '--src' :
    case '-s' :
        src = process.argv[i+1];
        i += 2;
        break;
    case '--dest' :
    case '-d' :
        dest = process.argv[i+1];
        i += 2;
        break;
    default :
        i++;
        break;
    }
}

rimraf.sync(dest);

function readDir (dir, obj, src) {
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
    for (var i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = path.join(dir, subpaths[i]);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDir(subpath, obj, src);
        }
        else if (stat.isFile()) {
            // Size in Bytes
            size = stat['size'];
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(src, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);
            obj[relative] = {
                'size' : size,
                'md5' : md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}

var mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
    }
}

fs.access(path.join(src, 'res/import.zip'), fs.F_OK, (err) => {
    if (err) {
        fsext.copy(path.join(src, 'res/import'), "import", (err) => {
            _7z.pack("import", path.join(src, 'res/import.zip'), err => {
                console.log("Compressed");  
                rimraf.sync(path.join(src, 'res/import'));
                rimraf.sync("import");
        
                start();
            });
        });

      return;
    }
    
    start();
});

function start() {
    // Iterate assets and src folder
    readDir(path.join(src, 'src'), manifest.assets, src);
    readDir(path.join(src, 'res'), manifest.assets, src);

    var destManifest = path.join(dest, 'project.manifest');
    var destVersion = path.join(dest, 'version.manifest');

    mkdirSync(dest);

    fs.writeFile(destManifest, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Manifest successfully generated');
    });

    delete manifest.assets;
    delete manifest.searchPaths;
    fs.writeFile(destVersion, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Version successfully generated');
    });

    fsext.copy(path.join(src, 'src'), path.join(dest, 'src'), (err) => {
        if (err) throw err;
        console.log('./src was copied successfully');
    });

    fsext.copy(path.join(src, 'res'), path.join(dest, 'res'), (err) => {
        if (err) throw err;
        console.log('./res was copied successfully');
    });

    //////////////////////// subpackages

    var source_subpackages = "./build/jsb-link/subpackages/";
    var dest_subpackages = "./build/remote-assets/subpackages/";

    mkdirSync(dest_subpackages);

    var listDirs = fs.readdirSync(source_subpackages);

    listDirs.forEach(dir => {
        var base_sub_package = packageUrl + "subpackages/" + dir + "/";
        
        var sub_dir = source_subpackages + "/" + dir;
        var dest_dir = dest_subpackages + "/" + dir;

        var sub_dest_manifest = dest_dir + "/project.manifest";
        var sub_dest_version = dest_dir + "/version.manifest";

        var sub_manifest = {
            packageUrl: base_sub_package,
            remoteManifestUrl: base_sub_package + 'project.manifest',
            remoteVersionUrl: base_sub_package + 'version.manifest',
            version: sub_version,
            assets: {},
            searchPaths: []
        };

        mkdirSync(dest_dir);

        readDir(sub_dir, sub_manifest.assets, sub_dir);

        fs.writeFile(sub_dest_manifest, JSON.stringify(sub_manifest), (err) => {
            if (err) throw err;
            console.log('SubPackages Manifest successfully generated');
        });

        delete sub_manifest.assets;
        delete sub_manifest.searchPaths;

        fs.writeFile(sub_dest_version, JSON.stringify(sub_manifest), (err) => {
            if (err) throw err;
            console.log('SubPackages Version successfully generated');
        });

        fsext.copy(sub_dir, dest_dir, (err) => {
            if (err) throw err;
            console.log('SubPackages was copied successfully');
        });
    });
}