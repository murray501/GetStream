import {useEffect, useState} from "react";
import {loadJSON, saveJSON, SearchForm, createChunks} from ".";
import { useInput2 } from "./hooks";

export function Query({renderResult}) {
    const [queries, setQueries] = useState();
    const [sentence, setSentence] = useState();
    const [query, setQuery] = useState();

    function reset() {
        setQueries(null);
    }

    function addQuery(word) {
        if (queries) {
            setQueries([...queries, word])
        } else {
            setQueries([word]);
        }
    }   

    function addSymbol(word) {
        if (sentence) {
            setSentence([...sentence, word]);
        } else {
            setSentence([word]);
        }
    }

    return (
    <div class="container">
        <section class="section">
            <div class="level box">
                <div class="level-left">
                    <div class="level-item">
                        <SearchForm onNewSearch={addQuery} />
                    </div>
                </div>
                <div class="level-right">
                    <button class="button level-item is-small" onClick={reset}>Reset</button>
                </div>
            </div>
            <DisplayQueries queries={queries} build={addSymbol}/>
            <DisplaySymbols build={addSymbol}/>
            <DisplayStorage build={addSymbol}/>
            <BuildQuery sentence={sentence} setSentence={setSentence} query={query} setQuery={setQuery} />
            {renderResult(query, setQuery)}
        </section>
    </div>
    )
}

function BuildQuery({sentence, setSentence= f=>f, query, setQuery= f=>f}) {
    const [isInit, setInit] = useState(true);
    const [isSolid, setIsSolid] = useState(true);
    const [titleProps, setTitle] = useInput2();

    function undo() {
        setInit(true);
    }

    function reset() {
        setSentence(null);
        setQuery(null);
    }

    function remove() {
        const removed = sentence?.slice(0,-1);
        setSentence(removed); 
        setQuery(null);
    }

    function build() {
        setInit(false);
        const str = buildQuery("", 0);
        setQuery(str);
    }

    function buildQuery(str, index) {
        let current = index;
    
        if (current === sentence.length) {
            return str;
        }    
        const word = sentence[current++];
    
        switch(word) {
            case "EXACT": {
                const next = sentence[current++];
                const newstr = str + " " + "\"" + next + "\"";
                return buildQuery(newstr, current);
            }
            case "NOT": {
                const next = sentence[current++];
                const newstr = str + " " + "-" + next;
                return buildQuery(newstr, current);
            }
            default: {
                const newstr = str + " " + word;
                return buildQuery(newstr, current);
            }
        }
    }
    
    function saveQuery() {
        const previous = loadJSON('query');
        if (previous?.includes(query)) {
            return;
        }
        previous?.unshift(query);
        saveJSON('query', previous ? previous : [query]);
    }

    function modify() {
       const init_value =  sentence?.join(" ");
       setTitle(init_value);
       setIsSolid(false);
    }

    function makeSolid() {
        const value = titleProps.value;
        setSentence(value.split(" "));
        setIsSolid(true);
    }

    if (!sentence) return;
    
    if (isInit && isSolid) {
        return (
        <div class="level box">
            <div class="level-left">
                <div class="level-item">
                    {sentence?.join(" ")}
                </div>
            </div>
            <div class="level-right">
                <a onClick={modify}><span class="icon">
                        <i class="fas fa-solid fa-pencil"></i>
                </span></a>
                <button class="button level-item is-small" onClick={remove}>Remove</button>
                <button class="button level-item is-small" onClick={reset}>Reset</button>
                <button class="button level-item is-small" onClick={build}>Build Query</button>
            </div>
        </div>
        )
    }
    
    if (isInit && !isSolid) {
        return (
            <div class="field has-addons">
                <p class="control is-expanded">
                    <input {...titleProps} class="input" type="text"/>
                </p>
                <p class="control">
                    <a class="button is-info" onClick={makeSolid}>
                        Save
                    </a>
                </p>
            </div>    
        )
    }

    return (
    <div class="level notification">
        <div class="level-left">
            <div class="level-item">
                {query}
            </div>
        </div>
        <div class="level-right">
            <button class="button level-item is-small" onClick={undo}>Undo</button>
            <button class="button level-item is-small" onClick={saveQuery}>Save Query</button>
        </div>
    </div>
    )
}

function DisplayQueries({queries, build = f => f}) {
    
    function save() {
        const previous = loadJSON('words');
        if (!previous) {
            if (queries) {
                saveJSON('words', queries);
            }
        } else {
            const words = [...queries, ...previous];
            const current = [...new Set(words)];
            saveJSON('words', current);
        }
    }

    if (!queries || queries.length === 0) return;
    
    return (
        <div class="level box">
            <div class="level-left">
                {queries?.map(query => <DisplayQuery query={query} build = {build} />)}
            </div>
            <div class="level-right">
                <button class="button level-item is-small" onClick={save}>Save</button>
            </div>
        </div>
    )
}

function DisplayStorage({build = f => f}) {
    const num_of_rows = 10;
    const [active, setActive] = useState(false);
    const [queries, setQueries] = useState();

    useEffect(() => {
        setQueries(loadJSON('words'));
    }, [])

    if (!active) {
        return (
            <div class="level box">
                <div class="level-left">
                    <button class="button level-item is-small" onClick={() => setActive(true)}>Show</button>
                </div>
            </div>
        )
    }

    const rows = createChunks(queries, num_of_rows);

    return (
        <div class="box">
            <div class="columns">
            {
                rows.map(row => 
                    <div class="column">
                        {row.map(query => <DisplayQuery query={query} build = {build} />)}
                    </div>    
                )
            }
            </div>
            <button class="button level-item is-small" onClick={() => setActive(false)}>Hide</button>
        </div>
    )
}

function DisplayQuery({query, build = f => f }) {
    return (
        <button class="button level-item is-small" onClick={() => build(query)}>{query}</button>
    )
}

function DisplaySymbols({build = f => f}) {
    const symbols = ["OR","NOT","EXACT","(",")","-is:retweet","is:retweet",
                    "is:reply","is:quote","is:verified",
                    "has:hastags","has:links","has:mentions","has:media",
                    "has-images","has:videos","lang:en"
                    ]
    
    const half = symbols.length / 2;
    return (
        <div class="box">
        <div class="level">
            <div class="level-left">
                {symbols.slice(0,half).map(symbol => <DisplaySymbol symbol={symbol} build={build} />)}
            </div>
        </div>
        <div class="level">
            <div class="level-left">
                {symbols.slice(half).map(symbol => <DisplaySymbol symbol={symbol} build={build} />)}
            </div>
        </div>
        </div>
    )
}

function DisplaySymbol({symbol, build = f => f}) {
    return (
        <button class="button level-item is-small" onClick={() => build(symbol)}>{symbol}</button>
    )
}

