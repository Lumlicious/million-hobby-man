import { Head } from "next/document";
import Link from "next/link";
import { Fragment } from "react";
import { getBlocks, getDatabase, getPost } from "../../lib/notion";
import { databaseId } from "../index";

export const Text = ({ text }) => {
    if (!text) {
        return null;
    }
    return text.map((value) => {
        const {
            annotations: { bold, code, color, italic, strikethrough, underline },
            text,
        } = value;
        return (
            <span
                className={[
                    bold ? "font-bold" : "",
                    // code ? styles.code : "",
                    italic ? "italic" : "",
                    strikethrough ? "line-through" : "",
                    underline ? "underline" : "",
                ].join(" ")}
                style={color !== "default" ? { color } : {}}
            >
                {text.link ? <a href={text.link.url}>{text.content}</a> : text.content}
            </span>
        );
    });
};

const renderBlock = (block) => {
    const { type, id } = block;
    const value = block[type];

    switch (type) {
        case "paragraph":
            return (
                <p>
                    <Text text={value.text} />
                </p>
            );
        case "heading_1":
            return (
                <h1>
                    <Text text={value.text} />
                </h1>
            );
        case "heading_2":
            return (
                <h2>
                    <Text text={value.text} />
                </h2>
            );
        case "heading_3":
            return (
                <h3>
                    <Text text={value.text} />
                </h3>
            );
        case "bulleted_list_item":
        case "numbered_list_item":
            return (
                <li>
                    <Text text={value.text} />
                </li>
            );
        case "to_do":
            return (
                <div>
                    <label htmlFor={id}>
                        <input type="checkbox" id={id} defaultChecked={value.checked} />{" "}
                        <Text text={value.text} />
                    </label>
                </div>
            );
        case "toggle":
            return (
                <details>
                    <summary>
                        <Text text={value.text} />
                    </summary>
                    {value.children?.map((block) => (
                        <Fragment key={block.id}>{renderBlock(block)}</Fragment>
                    ))}
                </details>
            );
        case "child_page":
            return <p>{value.title}</p>;
        case "image":
            const src =
                value.type === "external" ? value.external.url : value.file.url;
            const caption = value.caption ? value.caption[0].plain_text : "";
            return (
                <figure>
                    <img src={src} alt={caption} />
                    {caption && <figcaption>{caption}</figcaption>}
                </figure>
            );
        case "divider":
            return <hr key={id} />;
        case "quote":
            return <blockquote key={id}>{value.text[0].plain_text}</blockquote>;
        case 'callout':
            return (
                <div className="flex space-x-4 bg-gray-50 dark:bg-midnight rounded-lg p-3">
                    {value.icon && <span>{value.icon.emoji}</span>}
                    <div>
                        <Text text={value.text} />
                    </div>
                </div>
            );
        case 'code':
            return (
                <div>
                    {/* <CodeBlock
                        language={value.language}
                        code={value.text[0].text.content}
                    /> */}
                    {value.text[0].text.content}
                </div>
            );
        case 'video':
            // return <YoutubeEmbed url={value.external.url} />;
            { value.external.url }
        case 'quote':
            return (
                <blockquote className="p-4 rounded-r-lg">
                    <Text text={value.text} />
                </blockquote>
            );
        default:
            return `❌ Unsupported block (${type === "unsupported" ? "unsupported by Notion API" : type
                })`;
    }
};

export default function Post({ page, blocks }) {
    if (!page || !blocks) {
        return <div />;
    }
    return (
        <div>
            {/* <Head>
                <title>{page.properties.post.title[0].plain_text}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head> */}
            <article >
                <h1 >
                    <Text text={page.properties.post.title} />
                </h1>
                <section>
                    {blocks.map((block) => (
                        <Fragment key={block.id}>{renderBlock(block)}</Fragment>
                    ))}
                    <Link href="/">
                        <a >← Go home</a>
                    </Link>
                </section>
            </article>
        </div>
    );
}

export const getStaticPaths = async () => {
    const database = await getDatabase(databaseId);
    return {
        paths: database.map((page) => ({ params: { id: page.id } })),
        fallback: true,
    };
};

export const getStaticProps = async ({ params: { id } }) => {
    const page = await getPost(id);
    const blocks = await getBlocks(id);

    // Retrieve block children for nested blocks (one level deep), for example toggle blocks
    // https://developers.notion.com/docs/working-with-page-content#reading-nested-blocks
    const childBlocks = await Promise.all(
        blocks
            .filter((block) => block.has_children)
            .map(async (block) => {
                return {
                    id: block.id,
                    children: await getBlocks(block.id),
                };
            })
    );
    const blocksWithChildren = blocks.map((block) => {
        // Add child blocks if the block should contain children but none exists
        if (block.has_children && !block[block.type].children) {
            block[block.type]["children"] = childBlocks.find(
                (x) => x.id === block.id
            )?.children;
        }
        return block;
    });

    return {
        props: {
            page,
            blocks: blocksWithChildren,
        },
        revalidate: 1,
    };
};