import parse from 'html-react-parser'

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