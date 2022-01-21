import { Head } from "next/document";
import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { getBlocks, getDatabase, getPost } from "../../lib/notion";
import { databaseId } from "../index";
import { renderBlock, Text } from "@/lib/notionRender";
import SectionContainer from "@/components/SectionContainer";
import Date from "@/components/Date";

export default function Post({ page, blocks }: any) {
    if (!page || !blocks) {
        return <div />;
    }
    const cover = page.cover.type === "external" ? page.cover.external.url : page.cover.file.url
    console.log(page)
    return (
        <SectionContainer>
            <Image src={cover}
                className="rounded-xl"
                layout="responsive"
                objectFit="cover"
                width={1200}
                height={800} />
            <br />

            <article className="prose md:prose-lg lg:prose-xl dark:prose-invert mx-auto ">
                <h1>
                    <Text text={page.properties.post.title} />
                </h1>
                <Date dateString={page.properties.published.date.start}></Date>
                <section>
                    {blocks.map((block: any) => (
                        <Fragment key={block.id}>{renderBlock(block)}</Fragment>
                    ))}
                    <Link href="/">
                        <a >← Go home</a>
                    </Link>
                </section>
            </article>
        </SectionContainer>
        // <div className="flex content-center">
        //     {/* <Head>
        //         <title>{page.properties.post.title[0].plain_text}</title>
        //         <link rel="icon" href="/favicon.ico" />
        //     </Head> */}




        // </ div>
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