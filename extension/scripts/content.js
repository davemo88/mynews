(async () => {
  chrome.runtime.onMessage.addListener(
    async function(_request, _sender, _sendResponse) {
      await rewritePage();
    }
  );
  await rewritePage();
})();

async function rewritePage() {
  const a = await audience();
  await rewriteHeadline(a);
  await rewriteArticle(a);
}

async function rewriteHeadline(audience) {
  let hl = headline();
  hl.textContent = await newHeadline(hl, audience);
}

async function rewriteArticle(audience) {
  await Promise.all([...article()].map(async fragment => {
    fragment.textContent = await newFragment(fragment, audience);
  }));
}

const headline = () => document.querySelector(".headline");

const article = () => document.querySelectorAll(".story-text__paragraph");

async function newHeadline(headline, audience) {
  return await request("headline", headline, audience);
}

async function newFragment(fragment, audience) {
  return await request("fragment", fragment, audience);
}

async function request(endpoint, headline, audience) {
  const response = await fetch(
    "http://localhost:3000/" + endpoint,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        "content": headline.textContent,
        "audience": audience
      })
    }
  );
  const body = await response.json();
  return unquote(body);
}

async function audience() {
  const a = (await chrome.storage.local.get("audience")).audience ?? "Medieval Peasant";
  return a;
}

const unquote = (s) => s.replace(/["\\]+/g, '');

const getCurrentDomain = (tab) => new Url(tab.url).hostname;
