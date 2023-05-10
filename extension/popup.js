document.addEventListener('DOMContentLoaded', documentEvents  , false);

function setAudience(input) {
  chrome.storage.local.set({"audience": input.value});
  window.close();
}

function documentEvents() {
  document.getElementById('ok_btn').addEventListener('click', 
    async function() {
      setAudience(document.getElementById('audience_input'));
      const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      chrome.tabs.sendMessage(tab.id, {});
    }
  );
}
