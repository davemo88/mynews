(async () => {
  chrome.runtime.onMessage.addListener(
    async function(_request, _sender, _sendResponse) {
      await rewritePage();
    }
  );
  await rewritePage();
})();

const classes = {
  "www.politico.com" : {
    headline: ".headline",
    fragment: ".story-text__paragraph"
  },
  "www.foxnews.com" : {
    headline: ".headline",
    fragment: ".article-body"
  },
  "www.cnn.com" : {
    headline: ".headline__text",
    fragment: ".paragraph"
  },
};

async function rewritePage() {
  const a = await audience();
  const h = hostname();
  await rewriteHeadline(a, h);
  await rewriteArticle(a, h);
}

async function rewriteHeadline(audience, hostname) {
  let hl = headline(hostname);
  hl.textContent = await newHeadline(hl, audience);
}

async function rewriteArticle(audience, hostname) {
  await Promise.all([...article(hostname)].map(async fragment => {
// TODO: accumulate (rewritten?) fragments and send them along, include them in the prompt 
// or as previous messages so it doesn't keep going "Listen up!" at the beginning of each
// fragment
    console.log(fragment.textContent);
    fragment.textContent = await newFragment(fragment, audience);
  }));
}

const headline = (hostname) => document.querySelector(classes[hostname].headline);

const article = (hostname) => document.querySelectorAll(classes[hostname].fragment);

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

const hostname = () => new URL(location).hostname;
