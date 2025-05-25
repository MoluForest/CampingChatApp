//送出提示詞
async function sendPrompt() {
  const promptInput = document.getElementById('prompt');
  const prompt = promptInput.value.trim();

  if (!prompt) return;

  const usageTip = document.getElementById('usage-tip');
  if (usageTip) usageTip.remove();

  
  // ✅ 一送出就清空輸入框
  promptInput.value = '';

  const responseContainer = document.getElementById('response');
  const userMessage = document.createElement('div');
  userMessage.className = 'user-message';
  userMessageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  userMessage.innerText = '🔽 ' + userMessageTime  + ' 你輸入的提示詞：\n' + prompt;
  responseContainer.appendChild(userMessage);
  responseContainer.scrollTop = responseContainer.scrollHeight;

  // 顯示「載入中...」
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-indicator';
  loadingMessage.className = 'loading-overlay-text';
  loadingMessage.innerText = '⏳ 正在取得建議中...';

  // 插入浮動提示於 response 容器上方
  responseContainer.appendChild(loadingMessage);

  responseContainer.scrollTop = responseContainer.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    const newReply = document.createElement('div');
    newReply.className = 'chat-reply'; // ✅ 加上 class
    replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const exportBtn = document.createElement('button');
    exportBtn.innerText = '📄 匯出';
    exportBtn.className = 'export-btn';
    exportBtn.onclick = () => exportToDocx(stripMarkdown(data.reply));

    // 將內容與按鈕加入 chat-reply 框
    newReply.innerHTML = '🔽 ' + replyTime + ' 回應：<br>' + markdownToHTML(data.reply);
    newReply.appendChild(exportBtn);
    newReply.style.marginBottom = '1em';
    responseContainer.appendChild(newReply);
  } catch (error) {
    const errorMessage = document.createElement('div');
    errorMessage.innerText = '❌ 發生錯誤，請稍後再試。';
    errorMessage.style.color = 'red';
    responseContainer.appendChild(errorMessage);
  } finally {
    loadingMessage.remove();
    responseContainer.scrollTop = responseContainer.scrollHeight;
  }
}


  //按enter鍵送出
  document.getElementById('prompt').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 防止換行
      sendPrompt();
    }
    else if (e.key === 'Enter' && e.shiftKey) {
      promptInput.value += '\n'; // 允許換行
      return;
    }
  });

  function markdownToHTML(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')   // 加粗
    .replace(/\*(.*?)\*/g, '<em>$1</em>')               // 斜體
    .replace(/\n/g, '<br>');                             // 換行
}

function exportToDocx(text) {
  const blob = new Blob(
    [`<html><head><meta charset="utf-8"></head><body><pre>${text}</pre></body></html>`],
    { type: 'application/msword' }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '小露亂裝_行程推薦.doc';
  a.click();
  URL.revokeObjectURL(url);
}

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // 去除粗體標記
    .replace(/\*(.*?)\*/g, '$1')      // 去除斜體標記
    .replace(/`(.*?)`/g, '$1')        // 去除行內程式碼標記
    .replace(/!\[.*?\]\(.*?\)/g, '')  // 去除圖片
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 去除連結，只保留文字
    .replace(/#+\s?(.*)/g, '$1')      // 去除標題符號
    .replace(/>\s?(.*)/g, '$1')       // 去除引用符號
    .replace(/[-*]\s+/g, '')           // 去除列表符號
    .replace(/\n{2,}/g, '\n')         // 多重換行合併為一個
    .trim();
}