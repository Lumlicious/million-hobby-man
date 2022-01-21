import CodeBlock from "@/components/Codeblock";
import { Fragment } from "react";

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
                    code
                        ? 'bg-indigo-200 dark:bg-indigo-900 dark:bg-opacity-50 text-indigo-500 dark:text-indigo-200 py-0.5 px-2 rounded mx-1 inline-block align-middle tracking-tight text-base'
                        : null,
                    italic ? "italic" : "",
                    strikethrough ? "line-through" : "",
                    underline ? "underline" : "",
                ].join(" ")}
                style={color !== "default" ? { color } : {}}
            >
                {text && text.link ? <a href={text.link.url}>{text.content}</a> : text && text.content}
            </span>
        );
    });
};

export const renderBlock = (block) => {
    const { type, id } = block;
    const value = block[type];
    let firstVal = true;

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
                    <CodeBlock
                        language={value.language}
                        code={value.text[0].text.content}
                    />
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