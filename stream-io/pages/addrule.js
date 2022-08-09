import { useState, useEffect } from 'react';
import { useInput } from "../components/hooks";
import io from 'socket.io-client'

export default function Index() {  
    const [socket, setSocket] = useState()

    useEffect(() => {
        const _socket = io('/addrule')

        _socket.on('addrule', result => {
            alert(JSON.stringify(result))
        })

        setSocket(_socket)
        return () => socket?.close()
    }, [])

    function onAddRule(rule, tag) {
        socket.emit('addrule',{rule: rule, tag: tag})
    }

    return (
        <section class="hero is-size-7">
        <div class="hero-body">
            <AddRuleForm onAddRule={onAddRule} />    
        </div>
        </section>        
    )
}

function AddRuleForm({onAddRule = f => f}) {
    const [ruleProps, resetRule] = useInput("");
    const [tagProps, resetTag] = useInput("");
    
    const submit = e => {
        e.preventDefault();
        onAddRule(ruleProps.value, tagProps.value);
        resetRule();
        resetTag();
    };

    return (
      <form onSubmit={submit}>
        <div class="field">
            <input class="input"
              {...ruleProps}
              type="text"
              placeholder="Rule..."
              required
            />
        </div>
        <div class="field">
            <input class="input"
              {...tagProps}
              type="text"
              placeholder="Tag..."
              required
            />
        </div>
        <button class="button">Add Rule</button>
      </form>
    );
}