import { PostData } from "@/lib/notion";
import Card from "./Card";

const PostList = ({ posts }: any) => {
    return (
        <section className="text-gray-600 body-font">
            <div className="container px-5 py-24 mx-auto">
                <div className="flex flex-wrap -m-4">
                    {
                        posts.map((post: PostData) => {
                            return (<Card key={post.id} {...post} />)
                        })
                    }
                </div>
            </div>
        </section>
    )
}

export default PostList;