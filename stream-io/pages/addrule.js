import { useState, useEffect } from 'react';
import { useInput } from "../components/hooks";
import io from 'socket.io-client'
import { Query } from '../components/advance';

export default function Index() {
    return (
        <Query renderResult={(query, setQuery) => 
            <AddRule query={query} setQuery={setQuery} />} />  
    )
}

function AddRule({query, setQuery = f => f}) {  
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
            <AddRuleForm />    
        </div>
        </section>        
    )

    function AddRuleForm() {
        const [tagProps, resetTag] = useInput("");
        
        const submit = e => {
            e.preventDefault();
            onAddRule(query, tagProps.value);
            setQuery(null);
            resetTag();
        };
    
        return (
          <form onSubmit={submit}>
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
}


