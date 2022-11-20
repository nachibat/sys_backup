require('./config/general');

const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron');

// https://crontab.guru/#0_1_*_*_*`
// cron.schedule('*/5 * * * * *', () => backupMongoDB()); // Cada 5 segundos
cron.schedule('0 1 * * *', () => backupMongoDB()); // Todos los dias a las 1 am

function backupMongoDB() {
    const ARCHIVE_PATH = path.join(__dirname, 'public', `${process.env.DB_NAME}_${new Date().getTime()}.gzip`);
    console.log(`Saving backup at: `, ARCHIVE_PATH);
    let args;
    if (process.env.NODE_ENV === 'dev') {
        args = [
            `--db=${process.env.DB_NAME}`,
            `--archive=${ARCHIVE_PATH}`,
            `--gzip`
        ];
    } else {
        args = [
            `--port=${process.env.DB_PORT}`,
            `--username=${process.env.USER_NAME}`,
            `--password=${process.env.USER_PASS}`,
            '--authenticationDatabase=admin',
            `--db=${process.env.DB_NAME}`,
            `--archive=${ARCHIVE_PATH}`,
            '--gzip'
        ];
    }
    
    const child = spawn('mongodump', args);
    child.stdout.on('data', (data) => console.log('stdout: ', data));
    child.stderr.on('data', (data) => console.error('stdout: ', Buffer.from(data).toString()));
    child.on('error', (err) => console.error('error: ', err));
    child.on('exit', (code, signal) => {
        if (code) console.log('Process exit with code: ', code);
        else if (signal) console.error('Process killed with signal: ', signal);
        else console.log('Backup is successfull ✅');
    });
}