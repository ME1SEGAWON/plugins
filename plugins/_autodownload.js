const { igdl, twitter, pin } = require('../lib/scrape')
const { servers, yta, ytv } = require('../lib/y2mate')
let yts = require('yt-search')
const fetch = require('node-fetch')

let handler = m => m

handler.all = async function (m, { isPrems }) {
    let chat = db.data.chats[m.chat]
    let user = db.data.users[m.sender]
    let set = db.data.settings[this.user.jid]
    if (m.chat.endsWith('broadcast')) return
    if (chat.isBanned || user.banned || !chat.download || m.isBaileys) return

    if (/https?:\/\/(www\.|v(t|m)\.|t\.)?tiktok\.com/i.test(m.text)) {
        await m.reply(wait)
        await this.send2ButtonVid(m.chat, `https://api.lolhuman.xyz/api/tiktokwm?apikey=9b817532fadff8fc7cb86862&url=${ m.text.match(/https?:\/\/(www\.|v(t|m)\.|t\.)?tiktok\.com\/.*/i)[0].split(/\n| /i)[0] }` , '', wm, `No Wm`, `.tiktoknowm ${m.text.match(/https?:\/\/(www\.|v(t|m)\.|t\.)?tiktok\.com\/.*/i)[0].split(/\n| /i)[0] }`, `Audio`, `.tiktokaudio ${m.text.match(/https?:\/\/(www\.|v(t|m)\.|t\.)?tiktok\.com\/.*/i)[0].split(/\n| /i)[0] }`, m)
    }

    if (/https?:\/\/i\.coco\.fun\//i.test(m.text)) {
        let res = await fetch(API('jojo', '/api/cocofun-no-wm', { url: m.text.match(/https?:\/\/i\.coco\.fun\/.*/i)[0].split(/\n| /i)[0] }))
        if (!res.ok) return m.reply(eror)
        let json = await res.json()
        await m.reply(wait)
        await this.sendFile(m.chat, json.download, '', wm, m)
    }

    if (/https?:\/\/(fb\.watch|(www\.|web\.|m\.)?facebook\.com)/i.test(m.text)) {
        let res = await fetch(API('neoxr', '/api/download/fb', { url: m.text.match(/https?:\/\/(fb\.watch|(www\.|web\.|m\.)?facebook\.com)\/.*/i)[0].split(/\n| /i)[0] }, 'apikey'))
        if (!res.ok) return m.reply(eror)
        let json = await res.json()
        if (!json.status) return m.reply(this.format(json))
        await m.reply(wait)
        await conn.sendFile(m.chat, json.data.sd.url, '', `HD: ${json.data.hd.url}\nUkuran: ${json.data.hd.size}\n\n` + wm, m)
    }

    if (/https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)/i.test(m.text)) {
        igdl(m.text.match(/https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/.*/i)[0].split(/\n| /i)[0]).then(async res => {
            let json = JSON.parse(JSON.stringify(res))
            await m.reply(wait)
            for (let { downloadUrl, type } of json) {
                this.sendFile(m.chat, downloadUrl, 'ig' + (type == 'image' ? '.jpg' : '.mp4'), wm, m)
            }
        }).catch(_ => _)
    }

    if (/https?:\/\/(www\.)?(pinterest\.com\/pin|pin\.it)/i.test(m.text)) {
        pin(m.text.match(/https?:\/\/(www\.)?(pinterest\.com\/pin|pin\.it).*/i)[0].split(/\n| /i)[0]).then(async res => {
            let json = JSON.parse(JSON.stringify(res))
            if (!json.status) return m.reply(eror)
            await m.reply(wait)
            this.sendFile(m.chat, json.data[0].url, json.data[0].url, wm, m)
        }).catch(_ => _)
    }

    if (/https?:\/\/(www\.)?twitter\.com\/.*\/status/i.test(m.text)) {
        twitter(m.text.match(/https?:\/\/(www\.)?twitter\.com\/.*\/status\/.*/i)[0].split(/\n| /i)[0]).then(async res => {
            let json = JSON.parse(JSON.stringify(res))
            let pesan = json.data.map((v) => `Link: ${v.url}`).join('\n------------\n')
            await m.reply(wait)
            for (let { url } of json.data) {
                this.sendFile(m.chat, url, 'tw' + (/mp4/i.test(url) ? '.mp4' : '.jpg'), wm, m)
            }
        }).catch(_ => _)
    }

    if (/^https?:\/\/.*youtu/i.test(m.text)) {
        let results = await yts(url)
        let vid = results.all.find(video => video.seconds < 3600)
        if (!vid) return m.reply('Video/Audio Tidak ditemukan')
        await m.reply('*Downloading Video From Youtube*')
        let yt = false
        let usedServer = servers[0]
        for (let i in servers) {
            let server = servers[i]
            try {
                yt = await yta(vid.url, server)
                yt2 = await ytv(vid.url, server)
                usedServer = server
                break
            } catch (e) {
                m.reply(`Server ${server} error!${servers.length >= i + 1 ? '' : '\nmencoba server lain...'}`)
            }
        }
        if (yt === false) return m.reply(eror)
        if (yt2 === false) return m.reply(eror)
        let { dl_link, thumb, title, filesize, filesizeF } = yt
        await this.send2ButtonImg(m.chat, await (await fetch(thumb)).buffer(), `
*Judul:* ${title}
*Ukuran File Audio:* ${filesizeF}
*Ukuran File Video:* ${yt2.filesizeF}
*Server y2mate:* ${usedServer}
`.trim(), wm, 'Audio', `.yta ${vid.url}`, 'Video', `.yt ${vid.url}`)
    }
}

module.exports = handler