import React, { useState, useEffect } from "react";
import io from 'socket.io-client'
import { removeHashtag, convertToHtml } from '../components'
import { Checkbox } from '../components/hooks'

export default function Index() {
  const [socket, setSocket] = useState();
  const [data, setData] = useState();
  const [CheckboxHashtag, checkedHashtag] = Checkbox("remove #@ ");

  function remove(id) {
    socket.emit('delete', {id: id})
    const newData = data?.filter(item => item.id !== id);
    setData(newData);
  }

  useEffect(() => {
      const _socket = io('/bookmarks')
      
      _socket.on('tweets', result => {
        setData(result)
      })

      setSocket(_socket)
      return () => socket?.close()
  }, [])

  if (!data) return;

  return (
    <div class="section">
        <div class="level">
          <div class="level-left">
            <div class="level-item">
                <CheckboxHashtag />
            </div>
          </div>
        </div>
        {data.map(tweet => <DisplayTweet tweet={tweet} />)}
    </div>
  )  

  function DisplayTweet({tweet}) {
    const text = checkedHashtag ? removeHashtag(tweet.text) : tweet.text
    return (
      <article class="media box">
          <div class="media-content">
              <div class="content notification">
                  <p><small>{convertToHtml(text)}</small></p>        
              </div>
          </div>
          <nav class="level is-mobile">
              <div class="level-left">
                <p class="level-item"><small>{tweet.tag}</small></p>
                <button class="delete is-small level-item" onClick={() => remove(tweet.id)}></button>
              </div>
          </nav>
      </article>
    )
  }
}

