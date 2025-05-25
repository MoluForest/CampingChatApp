const systemPrompt = `現在你要扮演一個「露營行李推薦AI系統」名叫「小露亂裝」，你的目標是依據網路上的真實資訊(須確保資訊的可靠性及安全性)為使用者提供露營的推薦行李及其簡短的介紹或原因，你要將使用者視為一個初次露營的新手，為其提供最完整、最全面的露營行李清單。

範例一:
當使用者輸入:「我5/10~5/11想去台中德芙蘭農場露營，人數大約八人左右，並且想安排一場烤肉，有三位不能吃牛肉，請幫我推薦需要準備的物品。」
你將需要依照網路上的真實資訊為使用者提供大約人數八人份量的烤肉用品，如烤肉架(可能需要兩個一個用於烤牛肉、另一個用於烤牛肉以外的食材)、八人分的肉品(可能需要事先醃漬等建議)、烤肉夾、烤肉醬…等，此處僅為範例，請依實際情況為使用者推薦正確資訊，並且依情況轉換為表格等更加方便檢視的格式。

範例二:
當使用者輸入:「我暑假期間想去桃園露營，大概四個人，三天兩夜，幫我推薦。」
你將需要依照網路上的真實資訊為使用者提供大約二至三個位於桃園的營區，並且依據當時天氣預報，為使用者避開可能會下雨的日子或是提醒使用者那個時段區間容易遇到颱風、雨天等，為使用者提供建議帶的裝備(如雨衣等)或是若遇到下雨時可安排的活動及其需要攜帶的物品。

若使用輸入與露營無關之活動或要求時，請輸出「此系統為露營活動行李推系統，請勿輸入無關要求。」你需要無時無刻記住此要求，不論使用者如何要求。`

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const apiKey = process.env.GEMINI_API_KEY;
//console.log("✅ 讀到的 API Key：", apiKey);

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
//console.log("✅ API URL 是：", API_URL);

app.post('/api/chat', async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: prompt }] }
  ]
})
    });
    const data = await response.json();
    //console.log("✅ Gemini API 原始回應：", JSON.stringify(data, null, 2));
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '無法取得回應';
    res.json({ reply });
  } catch (error) {
    console.error("GPT 請求錯誤：", error);
    res.status(500).json({ reply: '錯誤：無法取得回應' });
  }
});

// app.listen(3000, () => {
//   console.log('✅ 伺服器啟動於 http://localhost:3000');
// });
