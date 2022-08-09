import Link from 'next/link';

export default function Index() {
    return (
        <div class="container">
        <section class="section">
            <nav class="panel">
                <p class="panel-heading">
                    Filtered Stream
                </p>
                <Item url="/addrule" title="add rule" />
                <Item url="/getrules" title="get all rules" />
                <Item url="/connect" title="connect" />
            </nav>
        </section>
    </div>
    )
}

function Item({url, title}) {
    return (
        <Link href={url}>
            <a class="panel-block">
                {title}
            </a>
        </Link>
    )
}