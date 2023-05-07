document.addEventListener('DOMContentLoaded', documentEvents  , false);

function myAction(input) { 
    console.log("input value is : " + input.value);
    chrome.storage.local.set({"audience": input.value});
    window.close();
}

function documentEvents() {    
  document.getElementById('ok_btn').addEventListener('click', 
    function() { myAction(document.getElementById('audience_input'));
  });

  // you can add listeners for other objects ( like other buttons ) here 
}
