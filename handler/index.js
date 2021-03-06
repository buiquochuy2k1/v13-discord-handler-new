const { glob } = require("glob");
const { promisify } = require("util");
const { Client, MessageEmbed } = require("discord.js");
const { mongooseConnectionString } = require("../config.json");
const mongoose = require("mongoose");

const globPromise = promisify(glob);

const {readdirSync} = require('fs');
const ascii = require('ascii-table')
let table = new ascii("Commands");
table.setHeading('Command', ' Tinh trang');

const { ERROR_LOGS_CHANNEL } = require('../config.json')

/**
 * @param {Client} client
 */
module.exports = async(client) => {
    /// TABLE \\\
    readdirSync('./commands/').forEach(dir => {
        const commands = readdirSync(`./commands/${dir}/`).filter(file => file.endsWith('.js'));
        for(let file of commands){
            let pull = require(`../commands/${dir}/${file}`);
            if(pull.name){
                client.commands.set(pull.name, pull);
                table.addRow(file,'✅')
            } else {
                table.addRow(file, '❌ -> Missing a help.name, or help.name is not a string.')
                continue;
            }if(pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name))
        }
    });
    console.log(table.toString());

    // Commands
    const commandFiles = await globPromise(`${process.cwd()}/commands/**/*.js`);
    commandFiles.map((value) => {
        const file = require(value);
        const splitted = value.split("/");
        const directory = splitted[splitted.length - 2];

        if (file.name) {
            const properties = { directory, ...file };
            client.commands.set(file.name, properties);
        }
    });

    // Events
    const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
    eventFiles.map((value) => require(value));

    // Slash Commands
    const slashCommands = await globPromise(
        `${process.cwd()}/SlashCommands/*/*.js`
    );

    const arrayOfSlashCommands = [];
    slashCommands.map((value) => {
        const file = require(value);
        if (!file?.name) return;
        client.slashCommands.set(file.name, file);

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        arrayOfSlashCommands.push(file);
    });
    client.on("ready", async() => {
        /* Register for a single guild
        await client.guilds.cache
            .get("replace this with your guild id")
            .commands.set(arrayOfSlashCommands);
          */
        // Register for all the guilds the bot is in
        await client.application.commands.set(arrayOfSlashCommands);
    });

    // mongoose
    const { mongooseConnectionString } = require('../config.json')
    if (!mongooseConnectionString) return;

    mongoose.connect(mongooseConnectionString, {
        useFindAndModify: true,
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }).then(() => console.log('Connected to mongodb'));


    // Error Handling

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception: " + err);
  
    const exceptionembed = new MessageEmbed()
    .setTitle("Uncaught Exception")
    .setDescription(`${err}`)
    .setColor("RED")
    client.channels.cache.get(ERROR_LOGS_CHANNEL).send({ embeds: [exceptionembed] })
  });
  
  process.on("unhandledRejection", (reason, promise) => {
    console.log(
      "[FATAL] Possibly Unhandled Rejection at: Promise ",
      promise,
      " reason: ",
      reason.message
    );
  
     const rejectionembed = new MessageEmbed()
    .setTitle("Unhandled Promise Rejection")
    .addField("Promise", `${promise}`)
    .addField("Reason", `${reason.message}`)
    .setColor("RED")
    client.channels.cache.get(ERROR_LOGS_CHANNEL).send({ embeds: [rejectionembed] })
  });
};
