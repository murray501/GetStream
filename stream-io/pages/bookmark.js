import React, { useState, useEffect } from "react";
import io from 'socket.io-client'

export default function Index() {
  const [socket, setSocket] = useState();
  const [data, setData] = useState();

  function remove(id) {
    const newData = data?.filter(item => item.id !== id);
    setData(newData);
  }

  useEffect(() => {
      const _socket = io('/get')
      
      _socket.on('bookmarks', res => {
        setData(res?.data)
      })

      setSocket(_socket)
      return () => socket?.close()
  }, [])

  if (!data) return;

  return (
    <div class="container">
        <section class="section">      
          {data.map(rule => <Item rule={rule} remove={remove}/>)}
        </section>
    </div>       
  )

  function Item({rule, remove = f => f}) {
    function onDeleteRule() {
      socket.emit('delete', {id: rule.id})
      remove(rule.id)
    }
  
    return (
      <div class="block level">
        <div class="level-left">
          <p class="panel-icon level-item">
            <i class="fas fa-book" aria-hidden="true"></i>
          </p>
          <p class="level-item">
            {rule.value} 
          </p>
        </div>
        <p class="level-item">
            {rule.tag}
        </p>
        <div class="level-right">
          <button class="delete is-small level-item" onClick={onDeleteRule}></button>
        </div>
      </div>
    )
  }
}

