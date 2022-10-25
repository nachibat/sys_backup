const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron');

process.env.DB_NAME = process.env.DB_NAME || 'test';

cron.schedule('0 1 * * *', () => backupMongoDB());

function backupMongoDB() {
    const ARCHIVE_PATH = path.join(__dirname, 'public', `${process.env.DB_NAME}_${new Date().getTime()}.gzip`);
    const args = [
        `--db=${process.env.DB_NAME}`,
        `--archive=${ARCHIVE_PATH}`,
        `--gzip`
    ];
    
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