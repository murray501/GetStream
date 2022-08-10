import { useEffect, useState } from 'react'
import io from 'socket.io-client'

import { Form, Checkbox } from '../components/hooks';
import { removeHashtag, convertToHtml } from '../components';

export default function Index() {
    const [tweets, setTweets] = useState()
    const [rules, setRules] = useState()
    const [buffersize, setBufferSize] = useState(10)
    const [CheckboxHashtag, checkedHashtag] = Checkbox("remove #@ ");

    function setBuffSize(value) {
        setBufferSize(parseInt(value))
    }

    useEffect(() => {
        const socket = io('/getrules')
        
        socket.on('rules', res => {
          setRules(res?.data)
        })
  
        return () => socket?.close()
    }, [])

    useEffect(() => {
        const socket = io('/tweets')
        const buffer = []

        socket.on('tweet', tweet => {
            buffer.unshift(tweet)
            if (buffer.length > buffersize) {
                buffer.pop()
            } 
            setTweets([...buffer])
        })

        return () => socket.close()

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
                </div>
            </article>
        )
    }
}

