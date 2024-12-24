const fetch = require('node-fetch');
const { Telegraf, Markup } = require('telegraf');

// Inicializa el bot
const bot = new Telegraf('YOUR_BOT_TOKEN');

bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const messageText = ctx.message.text;

  // Envía el estado "typing"
  await ctx.telegram.sendChatAction(chatId, 'typing');

  // Codifica el texto del mensaje para la URL
  const encodedMessage = encodeURIComponent(messageText);
  const apiUrl = `https://teraboxvideodownloader.nepcoderdevs.workers.dev/?url=${encodedMessage}`;

  try {
    // Solicita datos desde la API de Terabox
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      const videoData = data.response[0];

      const resolutions = videoData.resolutions;
      const fastDownloadLink = resolutions['Fast Download'];
      const hdVideoLink = resolutions['HD Video'];
      const thumbnailUrl = videoData.thumbnail;
      const videoTitle = videoData.title;

      // Acorta los enlaces con TinyURL
      const tinyUrlApi = 'http://tinyurl.com/api-create.php?url=';
      const shortenedFastDownloadLink = await fetch(`${tinyUrlApi}${fastDownloadLink}`).then(res => res.text());
      const shortenedHdVideoLink = await fetch(`${tinyUrlApi}${hdVideoLink}`).then(res => res.text());

      // Crea el teclado en línea
      const markup = Markup.inlineKeyboard([
        [
          Markup.button.url('➡️ Fast Download', shortenedFastDownloadLink),
          Markup.button.url('▶️ HD Video', shortenedHdVideoLink)
        ],
        [Markup.button.url('Developer', 't.me/Privates_Bots')]
      ]);

      // Envía la respuesta con el título, miniatura y enlaces
      const messageText = `🎬 <b>Title:</b> ${videoTitle}\nMade with ❤️ by @Privates_Bots`;
      await ctx.telegram.sendPhoto(chatId, thumbnailUrl, {
        caption: messageText,
        parse_mode: 'HTML',
        reply_markup: markup
      });
    } else {
      // Error en la solicitud a la API
      await ctx.telegram.sendMessage(chatId, '❌ <b>Error fetching data from Terabox API</b>', {
        parse_mode: 'HTML'
      });
    }
  } catch (error) {
    // Manejo de excepciones
    await ctx.telegram.sendMessage(chatId, `❌ <b>Error:</b> ${error.message}`, {
      parse_mode: 'HTML'
    });
  }
});

// Inicia el bot
bot.launch().then(() => {
  console.log('Bot is running...');
});
