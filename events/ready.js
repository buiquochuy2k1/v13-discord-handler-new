const client = require("../index");
const prefix = require('../config.json').prefix
const chalk = require('chalk')


client.on('ready', () => {
    var activities = [`${client.guilds.cache.size} servers`, `Template by Bui Quoc Huy`],
        i = 0;
    setInterval(() => client.user.setActivity(`${activities[i++ % activities.length]} | ${prefix}help`, { type: "WATCHING" }), 5000)

    console.log(chalk.red.bold("——————————[BOT]——————————"))
    console.log(chalk.green("Đã đăng nhập"), chalk.yellow(`${client.user.tag}`));
    console.log("")
    console.log(chalk.red.bold("——————————[Thông Tin]——————————"))
    console.log(chalk.cyan(`Chạy phiên bản [Node] ${process.version} trên ${process.platform} phiên bản ${process.arch}bit`))
    console.log(chalk.cyan(`Memory: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB RSS\n${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`))
    console.log(chalk.red(`Template by Bui Quoc Huy`))
})
