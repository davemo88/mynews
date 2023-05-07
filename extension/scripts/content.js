const article = document.querySelector(".headline");
if (article) {
  const content = article.textContent;
  const req = new XMLHttpRequest();
  const baseUrl = "http://localhost:3000/mynews";

  chrome.storage.local.get("audience", function (item) {
    if (item.audience) {
      audience = item.audience;
    } else {
      audience = "Medieval Knight";
    }
    console.log("audience", audience);
    req.open("POST", baseUrl, true);
    req.setRequestHeader("Content-type", "application/json");
    const body = {
      "content": content.replace("\"","").replace("\n",""),
      "audience": audience,
    };
    console.log(body);
    req.send(JSON.stringify(body));

    req.onreadystatechange = function() { // Call a function when the state changes.
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        article.textContent = this.responseText.replaceAll("\\\"","").replaceAll("\"","");
      }
    }
  });
}
