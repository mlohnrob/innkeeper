import Command from '../../Command'
import validator from 'validator'
import toInt = validator.toInt
import Transaction, { IncrementDecrementOptionsWithBy } from 'sequelize'
import Sequelize from 'sequelize'
import { GuildMember } from 'discord.js'
import { logger } from '@noodlewrecker7/logger'

const log = logger.Logger

const cmd = new Command(
    'award',
    [
        { name: 'user', optional: false, mention: 'user' },
        { name: 'amount', optional: true }
    ],
    async (message, bot, args) => {
        let amount
        try {
            amount = toInt(args['?amount'])
        } catch (e) {
            amount = 1
        }
        if (!message.member || !message.guild) {
            await message.reply('Error getting user guild information')
            return
        }
        const user = await bot.DB.getUserInServer(message.member.id, message.guild.id)

        const userCreds = <number>user?.credits
        // if (userCreds < amount) {
        //     await message.reply('You dont have enough credits for that :(')
        //     return
        // }

        const mentionedUser = await message.guild.members.fetch(args.user)
        if (mentionedUser.id == message.author.id) {
            await message.reply('Sorry you cant award yourself ;(')
            return
        }
        const mentionedUserEntry = await bot.DB.getUserInServer(mentionedUser.user.id, mentionedUser.guild.id)
        await user.decrement('credits', { by: amount })
        await mentionedUserEntry.increment('reputation', { by: amount })
        await user.save()
        await mentionedUserEntry.save()

        const text = `${mentionedUser} has received \`${amount}\` reputation. They now have \`${
            mentionedUserEntry.reputation + amount
        }\`` // using the current value of reputation gives the value form before it was incremented
        await message.channel.send(text)
    }
)

cmd.guildOnly = true
cmd.alias('a')
cmd.description = 'Awards the specified player some reputation points'

export default cmd