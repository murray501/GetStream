import { useEffect, useState } from 'react'
import io from 'socket.io-client'

export default function Index() {
    const [socket, setSocket] = useState()
    const [tweets, setTweets] = useState([])

    useEffect(() => {
        const _socket = io('/tweets')
        let chunk = []
        _socket.on('tweet', tweet => {
            chunk = [...chunk, tweet];
            setTweets(chunk)
        })
        setSocket(_socket)
        return () => socket?.close()
    }, [])
    
    return (
        <div class="container">
            <section class="section">
                {tweets.map(tweet => <ShowTweet tweet={tweet} />)}
            </section>
        </div>
    )
}

function ShowTweet({tweet}) {
    return (
        <div class="box">
            <p>{tweet.text}</p>
        </div>
    )
}