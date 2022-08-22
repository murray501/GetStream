import parse from 'html-react-parser'
import { useInput } from './hooks';

export function removeHashtag(str) {
    const stringArray = str?.split(/\s+/);
    const filtered = stringArray?.filter(x => x[0] !== '#' && x[0] !== ' ' && !x.includes('@'));
    return filtered?.join(' ');
}

export function convertToHtml(str) {
    const stringArray = str?.split(/\s+/);
    const chunks = stringArray?.map(x => x.startsWith("https://") ? `<a href=${x}>${x}</a>` : x)
    const converted = chunks?.join(' ')
    return parse(converted)
}

export const loadJSON = key => key && JSON.parse(localStorage.getItem(key));
export const saveJSON = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export function SearchForm({ onNewSearch = f => f }) {
  const [titleProps, resetTitle] = useInput("");

  const submit = e => {
    e.preventDefault();
    onNewSearch(titleProps.value);
    resetTitle();
  };

  return (
    <form onSubmit={submit}>
      <input
        {...titleProps}
        type="text"
        placeholder="search word..."
        required
      />
      <button>Word</button>
    </form>
  );
}

export function createChunks(data, num_of_rows) {
    const arr = [];
    for (let i = 0; i < num_of_rows; i++) {
        arr.push([]);
    }
    data?.map((item, index) => {
        const seq = index % num_of_rows;
        arr[seq].push(item);
    })
    return arr;
}