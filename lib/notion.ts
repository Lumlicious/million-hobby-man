import { Client } from '@notionhq/client';

export interface PostData {
    id: string,
    title: string,
    tags: Tag[],
    coverImage: string,
    summary: string,
    publishedDate: string
}

export interface Tag {
    name: string,
    id: string
}

const notion = new Client({
    auth: process.env.NOTION_SECRET
});

export const getDatabase = async (databaseId: string) => {
    const response = await notion.databases.query({
        database_id: databaseId
    })
    return response.results;
}

export const getPostList = (tableData: any): PostData[] => {
    let tags: string[] = [];
    const posts: PostData[] = tableData.map((post: any) => {
        return {
            id: post.id,
            title: post.properties.post.title[0].plain_text,
            tags: post.properties.tags.multi_select.map((tag: any) => {
                if (!tags.includes(tag.name)) {
                    const newList = [...tags, tag.name];
                    tags = newList;
                }
                return { name: tag.name, id: tag.id }
            }),
            coverImage:
                post.properties?.coverImage?.files[0]?.file?.url ||
                post.properties.coverImage?.files[0]?.external?.url ||
                'https://via.placeholder.com/600x400.png',
            // publishedDate: post.properties.published.date.start,
            summary: post.properties?.summary.rich_text[0]?.plain_text,
            publishedDate: post.properties.published.date.start
        }
    })
    return posts;
}

export const getPost = async (postId) => {
    const response = await notion.pages.retrieve({ page_id: postId });
    return response;
};

export const getBlocks = async (blockId) => {
    const response = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 50,
    });
    return response.results;
};