// background.js - GMB Review AI v6

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === 'GEMINI') {
    callGemini(msg.key, msg.prompt)
      .then(function(t) { sendResponse({ ok: true, text: t }); })
      .catch(function(e) { sendResponse({ ok: false, error: e.message }); });
    return true;
  }
  if (msg.action === 'SAVE') {
    chrome.storage.local.set({ gmb6: msg.data }, function() { sendResponse({ ok: true }); });
    return true;
  }
  if (msg.action === 'LOAD') {
    chrome.storage.local.get('gmb6', function(r) { sendResponse(r.gmb6 || {}); });
    return true;
  }
});

async function callGemini(key, prompt) {
  if (!key) throw new Error('No Gemini API key. Open Settings tab to add one.');
  var res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    }
  );
  var data = await res.json();
  if (!res.ok) {
    var em = (data && data.error && data.error.message) || ('HTTP ' + res.status);
    if (res.status === 400) throw new Error('Invalid Gemini API key. Check Settings.');
    if (res.status === 429) throw new Error('Rate limited. Wait a moment and retry.');
    throw new Error(em);
  }
  var text = data &&
    data.candidates && data.candidates[0] &&
    data.candidates[0].content && data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error('Gemini returned empty response.');
  return text.trim();
}
