const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { Client: SelfbotClient } = require('discord.js-selfbot-v13');
const fs = require('fs').promises;

const GhoStyMainConfig = {
    mainToken: 'Main Manager Bot Token Here', // main manager bot token
    cashChannelId: 'Commands Channel Id Here For Worker Tokens', // token commands channel id
    ownerId: 'Owner Access Discord Account Id', // owner access id 
    owoBotId: '408785106942164992' // Do not change this
};

console.log("> GhoSty OwO Multi Manager\n> Made with ❤️  and 🧠 by GhoSty [Async Development]")

const GhoStyTokensTxt = 'tokens.txt';
const GhoStyStockDB = 'stock.json';
const GhoStyBalanceDB = 'balances.json';
const GhostyPaginatorItems = 10;

async function GhoStyinitFiles() {
    try {
        await fs.access(GhoStyStockDB);
    } catch {
        await fs.writeFile(GhoStyStockDB, JSON.stringify({}));
    }
    try {
        await fs.access(GhoStyBalanceDB);
    } catch {
        await fs.writeFile(GhoStyBalanceDB, JSON.stringify({}));
    }
    try {
        await fs.access(GhoStyTokensTxt);
    } catch {
        await fs.writeFile(GhoStyTokensTxt, '');
    }
}

const GhoStyMainManagerClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel] 
});

let GhoStySelfClients = [];
let GhoStyTokensList = [];

async function GhoStyLoadTokens() {
    try {
        const data = await fs.readFile(GhoStyTokensTxt, 'utf8');
        GhoStyTokensList = data.split('\n')
            .map(token => token.trim())
            .filter(token => token.length > 0);
        return GhoStyTokensList;
    } catch (error) {
        console.error('Error loading tokens:', error);
        return [];
    }
}

async function GhoStyLoadBalance() {
    try {
        const data = await fs.readFile(GhoStyBalanceDB, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading balances:', error);
        return {};
    }
}

async function GhoStySaveBalance(balances) {
    try {
        await fs.writeFile(GhoStyBalanceDB, JSON.stringify(balances, null, 4));
    } catch (error) {
        console.error('Error saving balances:', error);
    }
}

async function GhoStyLoadStockAvail() {
    try {
        const data = await fs.readFile(GhoStyStockDB, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading stock:', error);
        return {};
    }
}

async function GhoStySaveStockAvail(stock) {
    try {
        await fs.writeFile(GhoStyStockDB, JSON.stringify(stock, null, 4));
    } catch (error) {
        console.error('Error saving stock:', error);
    }
}

async function GhoStyUpdStock() {
    const stock = {};
    
    for (const GhoStySelfTokenWorker of GhoStySelfClients) {
        try {
            const channel = await GhoStySelfTokenWorker.channels.fetch(GhoStyMainConfig.cashChannelId);
            if (!channel) {
                console.log(`Channel not found for GhoStySelfTokenWorker ${GhoStySelfTokenWorker.user.tag}`);
                continue;
            }
            
            const message = await channel.send('owo cash');
            await new Promise(resolve => setTimeout(resolve, 3000));
        
            const messages = await channel.messages.fetch({ limit: 10 });
            
            let GhoStysCashAmt = 0;
            let GhoStysUsername = GhoStySelfTokenWorker.user.tag;
            
            for (const [, msg] of messages) {
                if (msg.author.id === GhoStyMainConfig.owoBotId && 
                    (msg.content.includes('cowoncy') || msg.content.includes('<:cowoncy:'))) {
                    const usernameMatch = msg.content.match(/\*\*\| ([^,]+),/);
                    if (usernameMatch) {
                        GhoStysUsername = usernameMatch[1];
                    }
                    const content = msg.content.toLowerCase();
                    
                    let cashMatch = content.match(/__([\d,]+)__/);
                    if (cashMatch) {
                        GhoStysCashAmt = parseInt(cashMatch[1].replace(/,/g, ''));
                    } else {
                        cashMatch = content.match(/([\d,]+) cowoncy/);
                        if (cashMatch) {
                            GhoStysCashAmt = parseInt(cashMatch[1].replace(/,/g, ''));
                        } else {
                            const parts = content.split(' ');
                            for (const part of parts) {
                                if (part.includes(',')) {
                                    const numStr = part.replace(/,/g, '').replace(/\D/g, '');
                                    if (numStr.length > 0) {
                                        GhoStysCashAmt = parseInt(numStr);
                                        break;
                                    }
                                } else if (parseInt(part) > 1000) { 
                                    GhoStysCashAmt = parseInt(part);
                                    break;
                                }
                            }
                        }
                    }
                    
                    break;
                }
            }
            
            stock[GhoStySelfTokenWorker.user.id] = {
                GhoStysUsername: GhoStysUsername,
                cash: GhoStysCashAmt
            };
            
            try {
                await message.delete();
            } catch (deleteError) {
                console.error('Error deleting message:', deleteError);
            }
        } catch (error) {
            console.error(`Error updating stock for ${GhoStySelfTokenWorker.user.tag}:`, error);
        }
    }
    
    await GhoStySaveStockAvail(stock);
    return stock;
}

async function GhoStyinitSelfWorkers() {
    const tokens = await GhoStyLoadTokens();
    GhoStySelfClients = [];
    
    for (const token of tokens) {
        try {
            const client = new SelfbotClient(); 
            client.on('ready', () => {
                console.log(`GhoStySelfTokenWorker ${client.user.tag} logged in`);
            });
            await client.login(token);
            GhoStySelfClients.push(client);
        } catch (error) {
            console.error(`Failed to login with token: ${error}`);
        }
    }
}

async function GhoStySendCashFromWorker(tokenIndex, amount, recipient) {
    const stock = await GhoStyLoadStockAvail();
    
    if (tokenIndex < 1 || tokenIndex > GhoStySelfClients.length) {
        throw new Error('Invalid token number');
    }
    
    const GhoStySelfTokenWorker = GhoStySelfClients[tokenIndex - 1];
    const botData = stock[GhoStySelfTokenWorker.user.id];
    
    if (!botData || botData.cash < amount) {
        throw new Error('Selected token has insufficient cash');
    }
    
    try {
        const channel = await GhoStySelfTokenWorker.channels.fetch(GhoStyMainConfig.cashChannelId);
        if (!channel) {
            throw new Error('Cash channel not found');
        }
        
        await channel.send(`owo send ${amount} <@${recipient}>`);

        await new Promise(resolve => setTimeout(resolve, 3000));
        const messages = await channel.messages.fetch({ limit: 10 });
        
        let confirmationMessage = null;
        for (const [, msg] of messages) {
            if (msg.author.id === GhoStyMainConfig.owoBotId && msg.embeds.length > 0) {
                const embed = msg.embeds[0];
                if (embed.description && embed.description.includes('To confirm this transaction')) {
                    confirmationMessage = msg;
                    break;
                }
            }
        } 
        if (!confirmationMessage) {
            throw new Error('Confirmation message not found');
        }
        const confirmButton = confirmationMessage.components[0].components.find(
            component => component.emoji && component.emoji.name === '✅'
        );
        if (!confirmButton) {
            throw new Error('Confirm button not found');
        }
        await confirmationMessage.clickButton(confirmButton.customId);

        const stockData = await GhoStyLoadStockAvail();
        if (stockData[GhoStySelfTokenWorker.user.id]) {
            stockData[GhoStySelfTokenWorker.user.id].cash -= amount;
            await GhoStySaveStockAvail(stockData);
        }
        return true;
    } catch (error) {
        console.error('Error sending cash:', error);
        throw new Error(`Failed to send cash: ${error.message}`);
    }
}

function GhoStyCreateBalEmbed(balances, page = 1) {
    const totalPages = Math.ceil(Object.keys(balances).length / GhostyPaginatorItems);
    const startIdx = (page - 1) * GhostyPaginatorItems;
    const endIdx = startIdx + GhostyPaginatorItems;
    
    const embed = new EmbedBuilder()
        .setTitle('User Balances')
        .setColor(0x0099FF)
        .setFooter({ text: `Page ${page} of ${totalPages} • Total Users: ${Object.keys(balances).length}` });

    let totalBalance = 0;
    Object.values(balances).forEach(user => {
        totalBalance += user.balance;
    });
    
    embed.setDescription(`Total Balance Across All Users: 💵 ${totalBalance.toLocaleString()}`);
    
    const users = Object.entries(balances).slice(startIdx, endIdx);
    users.forEach(([userId, userData], index) => {
        embed.addFields({
            name: `${startIdx + index + 1}. ${userData.GhoStysUsername}`,
            value: `💵 ${userData.balance.toLocaleString()}`,
            inline: true
        });
    });
    
    return embed;
}

function GhoStyCreatePageButtons(page, totalPages) {
    const row = new ActionRowBuilder();
    
    if (page > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('first')
                .setLabel('⏮️ First')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('◀️ Previous')
                .setStyle(ButtonStyle.Primary)
        );
    }
    
    if (page < totalPages) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next ▶️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('last')
                .setLabel('Last ⏭️')
                .setStyle(ButtonStyle.Primary)
        );
    }
    
    return row;
}

GhoStyMainManagerClient.on('ready', () => {
    console.log(`Main manager bot ${GhoStyMainManagerClient.user.tag} is ready`);
});

GhoStyMainManagerClient.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;
    
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    try {
        if (command === 'addbalance') {
            if (message.author.id !== GhoStyMainConfig.ownerId) {
                return message.reply('You must be the owner to use this command.');
            }
            
            if (message.mentions.users.size === 0) {
                return message.reply('Please mention a user to add balance to.');
            }
            
            const amount = parseInt(args[args.length - 1]);
            if (isNaN(amount) || amount <= 0) {
                return message.reply('Please provide a valid amount to add.');
            }
            
            const targetUser = message.mentions.users.first();
            const balances = await GhoStyLoadBalance();
            const userId = targetUser.id;
            
            if (!balances[userId]) {
                balances[userId] = {
                    GhoStysUsername: targetUser.tag,
                    balance: 0
                };
            }
            
            balances[userId].balance += amount;
            await GhoStySaveBalance(balances);
            
            message.reply(`Added ${amount} balance to ${targetUser.tag}. New balance: ${balances[userId].balance}`);
        }
        else if (command === 'stock') {
            const GhoStyLoadinStockEmb = new EmbedBuilder()
                .setTitle('OWO Cash Stock')
                .setDescription('Fetching Cash Stock. Please wait for a moment...')
                .setColor(0xFFFF00)
                .setFooter({ text: "Made with ❤️ and 🧠 by GhoSty [Async Development]" });
                
            const GhoStyLoadingMsgStockEdit = await message.reply({ embeds: [GhoStyLoadinStockEmb] });
            
            const stock = await GhoStyUpdStock();
            
            if (Object.keys(stock).length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('OWO Cash Stock')
                    .setDescription('No stock data available. Please wait for the next update.')
                    .setColor(0xFF0000);
                    
                return GhoStyLoadingMsgStockEdit.edit({ embeds: [errorEmbed] });
            }
            const embed = new EmbedBuilder()
                .setTitle('OWO Cash Stock')
                .setColor(0x00FF00);
            
            let totalCash = 0;
            let tokenNumber = 1;
            
            for (const [userId, data] of Object.entries(stock)) {
                embed.addFields({ 
                    name: `Token ${tokenNumber} - ${data.GhoStysUsername}`, 
                    value: `💵 ${data.cash.toLocaleString()}`,
                    inline: true 
                });
                totalCash += data.cash;
                tokenNumber++;
            }
            
            embed.setFooter({ text: `Total Cash: 💵 ${totalCash.toLocaleString()}` });
            await GhoStyLoadingMsgStockEdit.edit({ embeds: [embed] });
        }
        else if (command === 'sendcash') {
            if (args.length < 3) {
                return message.reply('Usage: !sendcash {token number} @user {amount}');
            }
            const tokenNumber = parseInt(args[0]);
            const targetUser = message.mentions.users.first();
            const amount = parseInt(args[args.length - 1]);
            
            if (isNaN(tokenNumber) || tokenNumber < 1 || tokenNumber > GhoStySelfClients.length) {
                return message.reply(`Invalid token number. Please use a number between 1 and ${GhoStySelfClients.length}.`);
            }
            if (!targetUser) {
                return message.reply('Please mention a user to send cash to.');
            }
            if (isNaN(amount) || amount <= 0) {
                return message.reply('Please provide a valid amount to send.');
            }
            const balances = await GhoStyLoadBalance();
            const userId = message.author.id;
            
            if (!balances[userId] || balances[userId].balance < amount) {
                return message.reply(`Insufficient balance. Your current balance is ${balances[userId]?.balance || 0}.`);
            }
            
            try {
                const sendingEmbed = new EmbedBuilder()
                    .setTitle('Sending OWO Cash')
                    .setDescription(`Sending 💵 ${amount} to ${targetUser.tag} using token ${tokenNumber}...`)
                    .setColor(0xFFFF00)
                    .setFooter({ text: "Made with ❤️ and 🧠 by GhoSty [Async Development]" });
                
                const sendingMessage = await message.reply({ embeds: [sendingEmbed] });
                
                await GhoStySendCashFromWorker(tokenNumber, amount, targetUser.id);

                balances[userId].balance -= amount;
                await GhoStySaveBalance(balances);
                
                const GhoStySentSuccessEmb = new EmbedBuilder()
                    .setTitle('Success!')
                    .setDescription(`✅ Successfully sent 💵 ${amount} to ${targetUser.tag}!`)
                    .setColor(0x00FF00)
                    .setFooter({ text: "Made with ❤️ and 🧠 by GhoSty [Async Development]" });

                await sendingMessage.edit({ embeds: [GhoStySentSuccessEmb] });
            } catch (error) {
                message.reply(`Failed to send cash: ${error.message}`);
            }
        }
        else if (command === 'balance') {
            const balances = await GhoStyLoadBalance();
            const userId = message.author.id;
            const userBalance = balances[userId]?.balance || 0;
            
            const embed = new EmbedBuilder()
                .setTitle('Your Balance')
                .setDescription(`💵 ${userBalance.toLocaleString()}`)
                .setColor(0x0099FF)
                .setFooter({ text: `User: ${message.author.tag} | Made with ❤️ and 🧠 by GhoSty [Async Development]` });
                
            message.reply({ embeds: [embed] });
        }
        else if (command === 'help') {
            const helpEmbed = new EmbedBuilder()
                .setTitle('GhoSty OwO Multi Manager')
                .setDescription('Here\'s a complete guide to all available commands')
                .setColor(0x6A0DAD)
                .addFields(
                    {
                        name: '💰 Balance Commands',
                        value: '```diff\n+ !balance\n- Check your current cowoncy balance\n\n+ !listbalance\n- [OWNER ONLY] View all user balances (paginated)\n```',
                        inline: false
                    },
                    {
                        name: '💸 Transaction Commands',
                        value: '```diff\n+ !sendcash {token} @user {amount}\n- Send cowoncy from specified token\n- Requires sufficient balance\n\n+ !addbalance @user {amount}\n- [OWNER ONLY] Add balance to user\n\n+ !removebalance @user {amount}\n- [OWNER ONLY] Remove balance from user\n```',
                        inline: false
                    },
                    {
                        name: '📊 Stock Management',
                        value: '```diff\n+ !stock\n- Check current cowoncy stock across all tokens\n- Updates in real-time\n```',
                        inline: false
                    },
                    {
                        name: 'ℹ️ Command Details',
                        value: '> **Token Number**: Position in token list (1-based index)\n' +
                              '> **Amount**: Must be positive integer\n' +
                              '> **Owner Commands**: Only usable by bot owner\n' +
                              '> **Balance Required**: User must have sufficient funds\n' +
                              '> **Stock Updates**: Automatically refreshes on !stock command',
                        inline: false
                    }
                )
                .setFooter({ 
                    text: 'GhoSty OwO Multi Manager • Made with ❤️ by Async Development', 
                })
                .setTimestamp();

            const commandGuide = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📌 Command Usage Examples')
                .addFields(
                    {
                        name: 'Sending Cowoncy',
                        value: '```!sendcash 3 @GhoSty 50000\n(Sends 50k from 3rd token to GhoSty)```',
                        inline: true
                    },
                    {
                        name: 'Checking Stock',
                        value: '```!stock\n(Shows all token balances)```',
                        inline: true
                    },
                    {
                        name: 'Checking Balance',
                        value: '```!balance```',
                        inline: true
                    }
                )
                .setFooter({ text: 'Type !help for this guide • Made with ❤️ by GhoSty [Async Development]' });

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Documentation')
                    .setURL('https://github.com/WannaBeGhoSt/GhoSty-OwO-Multi-Manager/blob/main/README.md')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setURL('https://discord.gg/SyMJymrV8x')
                    .setStyle(ButtonStyle.Link)
            );

            try {
                await message.author.send({ embeds: [helpEmbed, commandGuide], components: [actionRow] });
                if (message.channel.id !== GhoStyMainConfig.cashChannelId) {
                    await message.reply('📬 Help menu sent to your DMs! (Check spam folder if not received)');
                }
            } catch (error) {
                const dmErrorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🔒 DMs Disabled')
                    .setDescription('Please enable **Direct Messages** from server members to receive the help menu!\n\n> **How to fix:**\n> 1. Go to User Settings\n> 2. Navigate to "Privacy & Safety"\n> 3. Enable "Allow direct messages from server members"')
                    .setFooter({ text: 'This message will delete automatically in 30 seconds' });

                const errorMsg = await message.reply({ embeds: [dmErrorEmbed] });
                setTimeout(() => errorMsg.delete().catch(console.error), 30000);
            }
        }
        else if (command === 'removebalance') {
            if (message.author.id !== GhoStyMainConfig.ownerId) {
                return message.reply('You must be the owner to use this command.');
            }
            if (message.mentions.users.size === 0) {
                return message.reply('Please mention a user to remove balance from.');
            }
            const amount = parseInt(args[args.length - 1]);
            if (isNaN(amount) || amount <= 0) {
                return message.reply('Please provide a valid amount to remove.');
            }
            const targetUser = message.mentions.users.first();
            const balances = await GhoStyLoadBalance();
            const userId = targetUser.id;
            
            if (!balances[userId]) {
                return message.reply(`${targetUser.tag} doesn't have any balance.`);
            }
            const newBalance = Math.max(0, balances[userId].balance - amount);
            balances[userId].balance = newBalance;
            
            await GhoStySaveBalance(balances);
            
            message.reply(`Removed ${amount} balance from ${targetUser.tag}. New balance: ${newBalance}`);
        }
        else if (command === 'listbalance') {
            if (message.author.id !== GhoStyMainConfig.ownerId) {
                return message.reply('You must be the owner to use this command.');
            }
            
            const balances = await GhoStyLoadBalance();
            
            if (Object.keys(balances).length === 0) {
                return message.reply('No users have balances yet.');
            }
            
            const totalPages = Math.ceil(Object.keys(balances).length / GhostyPaginatorItems);
            let currentPage = 1;
            const embed = GhoStyCreateBalEmbed(balances, currentPage);
            const buttons = GhoStyCreatePageButtons(currentPage, totalPages);
            
            const listMessage = await message.reply({ 
                embeds: [embed], 
                components: buttons.components.length > 0 ? [buttons] : [] 
            });
            if (totalPages > 1) {
                const filter = i => i.user.id === message.author.id;
                const collector = listMessage.createMessageComponentCollector({ 
                    filter, 
                    componentType: ComponentType.Button, 
                    time: 60000 
                });
                
                collector.on('collect', async i => {
                    if (i.customId === 'first') {
                        currentPage = 1;
                    } else if (i.customId === 'previous') {
                        currentPage = Math.max(1, currentPage - 1);
                    } else if (i.customId === 'next') {
                        currentPage = Math.min(totalPages, currentPage + 1);
                    } else if (i.customId === 'last') {
                        currentPage = totalPages;
                    }
                    
                    const newEmbed = GhoStyCreateBalEmbed(balances, currentPage);
                    const newButtons = GhoStyCreatePageButtons(currentPage, totalPages);
                    
                    await i.update({ 
                        embeds: [newEmbed], 
                        components: newButtons.components.length > 0 ? [newButtons] : [] 
                    });
                });
                
                collector.on('end', () => {
                    listMessage.edit({ components: [] }).catch(console.error);
                });
            }
        }
    } catch (error) {
        console.error('Error processing command:', error);
        message.reply('An error occurred while processing your command.');
    }
});

async function start() {
    await GhoStyinitFiles();
    await GhoStyinitSelfWorkers();
    await GhoStyMainManagerClient.login(GhoStyMainConfig.mainToken);
}

process.on('SIGINT', async () => {
    console.log('Shutting down...');
    

    for (const GhoStySelfTokenWorker of GhoStySelfClients) {
        try {
            await GhoStySelfTokenWorker.destroy();
            console.log(`GhoStySelfTokenWorker ${GhoStySelfTokenWorker.user?.tag} logged out`);
        } catch (error) {
            console.error('Error logging out GhoStySelfTokenWorker:', error);
        }
    }

    await GhoStyMainManagerClient.destroy();
    console.log('Main bot logged out');
    
    process.exit(0);
});


start().catch(console.error);
