const { spawn } = require('child_process');

function start(name, file) {
    const child = spawn(process.execPath, [file], { stdio : 'inherit'});
    child.on('exit', (code) => {
        console.log(name + ' stopped, exit code : ' + code);
        process.exit(1);
    });
}


start('API', 'src/index.js');
start('Worker', 'src/workers/clickWorker.js');