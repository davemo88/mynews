### proof of concept
show AI can easily tailor news articles to suit a target audience by modifying headlines with chat gpt via a browser extension

### howto
1. get an openai api key
2. [load the extension into chrome](https://bashvlas.com/blog/install-chrome-extension-in-developer-mode/)
3. run the server from within `server/`:  
`OPENAI_API_KEY=$OPENAI_API_KEY cargo run`
4. go to [politico.com](https://www.politico.com/) and read some articles. watch the headlines get swapped out
5. tweak content.js `audience` value to change the headline flavor
6. reload extension
7. goto 4

### next features
- entire articles instead of just headlines
- modify target audience in the browser
- more websites besides politico
- learn target audience from user behavior
