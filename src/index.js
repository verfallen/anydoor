const yargs = require('yargs');
const Server = require('./app');

const argv = yargs
  .usage('anydoor [option]')
  .option('p',{
    alias:'port',
    describe: '端口号',
    default:9527
  })
  .option('h',{
    alias:'host',
    describe:'主机名',
    default:'127.0.0.1'
  })
  .option('d',{
    alias:'root',
    describe:'根路径',
    default: process.cwd()
  })
  .version()
  .alias('v','version')
  .help()
  .argv;

const server = new Server(argv);
server.start();
