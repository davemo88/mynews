(async () => {
  chrome.runtime.onMessage.addListener(
    async function(_request, _sender, _sendResponse) {
      await rewriteHeadline();
    }
  );
  await rewriteHeadline();
})();

async function rewriteHeadline() {
  const a = (await chrome.storage.local.get("audience")).audience ?? "Medieval Peasant";
  let hl = headline();
  hl.textContent = await getAudienceHeadline(hl, a);
}

const headline = () => document.querySelector(".headline");

async function getAudienceHeadline(headline, audience) {
  const response = await fetch(
    "http://localhost:3000/mynews",
    request(headline, audience)
  );
  const body = await response.json();
  return unquote(body);
}

const request = (headline, audience) => ({
  method: "POST",
  headers: {
    "Content-type": "application/json"
  },
  body: JSON.stringify({
    "content": headline.textContent,
    "audience": audience
  })
})

const unquote = (s) => s.replace(/["\\]+/g, '');

const getCurrentDomain = (tab) => new Url(tab.url).hostname;
