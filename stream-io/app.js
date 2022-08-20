'use strict'
const http = require('http')
const next = require('next')
const Server = require('socket.io')
const axios = require('axios')

const mongoose = require('mongoose')
const uri = "mongodb://localhost:27017/tweets"

mongoose.connect(uri);
const connection = mongoose.connection
connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

const tweetSchema = new mongoose.Schema({
    id: String,
    text: String,
    tag: String,
    tagid: String
})

const Tweet = mongoose.model('Tweet', tweetSchema)

function saveTweet(json) {
    const tweet = new Tweet({id: json.data.id, text: json.data.text, 
            tagid: json.matching_rules[0].id, tag: json.matching_rules[0].tag})
    
    tweet.save().then(function(err, result) {
        console.log('tweet created')
    });
}

const token = process.env.BEARER_TOKEN;
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';
const baseURL = "https://api.twitter.com/2/";

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })

nextApp.prepare().then(
  async () => {
    const server = http.createServer(nextApp.getRequestHandler()).listen(3000)
    const io = Server(server)
    const ioTweets = io.of('/tweets')
    ioTweets.on('connection', socket => {
        socket.on('save', (data) => {
            saveTweet(data)
        })
    })
    await streamConnect(0, ioTweets)

    const ioAddRule = io.of('/addrule')
    ioAddRule.on('connection', socket => {
        socket.on('addrule', async (data) => {
            const result = await addRule(data.rule, data.tag)
            socket.emit('addrule', result)
        })
    })

    const ioGetRules = io.of('/getrules')
    ioGetRules.on('connection', async (socket) => {
        const result = await getAllRules()
        socket.emit('rules', result)
        
        socket.on('delete', data => {
            deleteRule(data.id)
        })
    })
  },
  err => {
    console.error(err)
    process.exit(1)
  }
)

async function streamConnect(retryAttempt, io) {
    
  const response = await axios.get(streamURL, {
      headers: {
          "User-Agent": "v2FilterStreamJS",
          "Authorization": `Bearer ${token}`,
      },
      responseType: 'stream',
      timeout: 20000,
  })

  const stream = response.data
  
  stream.on('data', data => {
      try {
          const json = JSON.parse(data);
          //console.log(json)
          io.emit('tweet', json)

          // A successful connection resets retry count.
          retryAttempt = 0
      } catch (e) {
          if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
              console.log(data.detail)
              process.exit(1)
          } else {
              // Keep alive signal received. Do nothing.
          }
      }
  }).on('err', error => {
      if (error.code !== 'ECONNRESET') {
          console.log(error.code)
          process.exit(1)
      } else {
          // This reconnection logic will attempt to reconnect when a disconnection is detected.
          // To avoid rate limits, this logic implements exponential backoff, so the wait time
          // will increase if the client cannot reconnect to the stream. 
          setTimeout(() => {
              console.warn("A connection error occurred. Reconnecting...")
              streamConnect(++retryAttempt)
          }, 2 ** retryAttempt)
      }
  })
}

function create_headers() {
    return {'authorization': `Bearer ${token}`, 'content-type': 'application/json'};
}
   
function create_get_config(url, headers) { 
    return {method: 'get', baseURL: baseURL, url: url, headers: headers};
}

function create_post_config(url, data, headers) { 
    return {method: 'post', baseURL: baseURL, url: url, data: data, headers: headers};
}

async function getAllRules() {
    const headers = create_headers();
    const config = create_get_config('/tweets/search/stream/rules', headers);
    return await request(config)
}

async function addRule(value, tag) {
    const headers = create_headers();
    const rules = [{value, tag}]
    const data = {
        "add": rules
    }
    const config = create_post_config('/tweets/search/stream/rules', data, headers);
    return await request(config)
}

async function deleteRule(id) {
    const headers = create_headers();
    const data = {
        "delete": {
            "ids": [id]
        }
    }
    const config = create_post_config('/tweets/search/stream/rules', data, headers);
    return await request(config)
}

async function request(config) {
    const res = await axios.request(config);
    return res.data;
}