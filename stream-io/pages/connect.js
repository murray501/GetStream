import { useEffect, useState } from 'react'
import io from 'socket.io-client'

import { Form, Checkbox, Bookmark } from '../components/hooks'
import { removeHashtag, convertToHtml } from '../components'

export default function Index() {
    const [tweets, setTweets] = useState()
    const [rules, setRules] = useState()
    const [buffersize, setBufferSize] = useState(100)
    const [CheckboxHashtag, checkedHashtag] = Checkbox("remove #@ ");
    const [socket, setSocket] = useState()
    const [bookmarked, setBookmarked] = useState([])

    function setBuffSize(value) {
        setBufferSize(parseInt(value))
    }

    useEffect(() => {
        const _socket = io('/getrules')
        
        _socket.on('rules', res => {
          setRules(res?.data)
        })
  
        return () => _socket.close()
    }, [])

    useEffect(() => {
        const _socket = io('/tweets')
        const buffer = []

        _socket.on('tweet', tweet => {
            buffer.unshift(tweet)
            if (buffer.length > buffersize) {
                buffer.pop()
            } 
            setTweets([...buffer])
        })

        setSocket(_socket)
        return () => _socket.close()

    }, [])
    
    if (!rules) return
    if (!tweets || tweets.length === 0) return
    
    return (
        <div class="section">
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <Form title="enter buffer size..." onSubmit={setBuffSize} />
                    </div>
                    <div class="level-item">
                        <p>{buffersize}</p>
                    </div>
                </div>
                <div class="level-item">
                    <CheckboxHashtag />
                </div>
            </div>
            <div class="columns">
                {rules.map(rule => <ShowRow rule={rule} tweets={tweets} top={tweets[0]} />)}
            </div>
        </div>
    )

    function ShowRow({rule, tweets, top}) {
        const filtered = tweets.filter(tweet => tweet.matching_rules[0].id === rule.id)
        return (
            <div class="column">
                <div class="notification is-info">
                    {rule.tag}
                </div>
                {filtered.map(tweet => <DisplayTweet tweet={tweet} top={top} />)}
            </div>
        )
    }

    function DisplayTopTweet({tweet}) {
        const text = checkedHashtag ? removeHashtag(tweet.data.text) : tweet.data.text
        return (
            <article class="media box">
                <div class="media-content">
                    <div class="content notification">
                        <p><small>{convertToHtml(text)}</small></p>        
                    </div>
                </div>
                <nav class="level is-mobile">
                    <div class="level-left">
                        <Bookmark tweet={tweet} />
                    </div>
                </nav>
            </article>
        )
    }

    function DisplayTweet({tweet, top}) {
        if (tweet.data.id === top.data.id) {
            return <DisplayTopTweet tweet={tweet} />
        }

        const text = checkedHashtag ? removeHashtag(tweet.data.text) : tweet.data.text
        
        return (
            <article class="media box">
                <div class="media-content">
                    <div class="content">
                        <p><small>{convertToHtml(text)}</small></p>
                    </div>
                    <nav class="level is-mobile">
                        <div class="level-left">
                            <Bookmark tweet={tweet} />
                        </div>
                    </nav>
                </div>
            </article>
        )
    }

    function Bookmark({tweet}) {
        
        function add() {
          socket?.emit('save', tweet)
          setBookmarked([tweet.data.id, ...bookmarked])
        }
      
        if (bookmarked.includes(tweet.data.id)) {
            return
        }

        return (
          <div class="level-item">
              <a onClick={add}><span class="icon"><i class="fas fa-solid fa-bookmark"></i></span></a> 
          </div>
        )
    }
}

