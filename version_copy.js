var fsext = require("fs-extra");
var rimraf = require("rimraf");
var fs = require('fs');

var fileContent = JSON.parse(fs.readFileSync("version_config.json", {encoding:'utf8', flag:'r'}));

var arg_game = process.argv[2];

if(!arg_game) {
    console.log("Chua Nhap Ten Game");
    process.exit();
}

if(!fileContent[arg_game]) {
    console.log("Sai Ten Game");
    process.exit();
}

var source = './build/remote-assets/';
var dest = fileContent[arg_game].folder;
rimraf.sync(dest);

fsext.copy(source, dest, (err) => {
    if (err) throw err;
    console.log('Copied Successfully');
});