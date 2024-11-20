import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { BASE_URI } from "./api/constant";

interface Blog {
    _id: string;
    title: string;
    content: string;
    authorId: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

interface BlogPageProps {
    initialBlogs: Blog[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { search = "", category = "" } = context.query;

    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", String(search));
    if (category) queryParams.append("category", String(category));

    const response = await fetch(
        `${BASE_URI}/blogs/getBlogsSearch?${queryParams.toString()}`
    );

    const data = await response.json();

    return {
        props: {
            initialBlogs: data.data || [],
        },
    };
};

export default function BlogPage({ initialBlogs }: BlogPageProps) {
    const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<string>("");
    const [editName, setEditName] = useState<string>("");
    const [editCategory, setEditCategory] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>("");

    useEffect(() => {
        const storedUserId = localStorage.getItem("loguserId");
        console.log("storedUserId", storedUserId);
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    const toggleContent = (id: string) => {
        setExpanded((prev) => (prev === id ? null : id));
    };

    const handleEditClick = (blog: Blog) => {
        setEditingBlogId(blog._id);
        setEditContent(blog.content);
        setEditName(blog.title);
        setEditCategory(blog.category);
    };

    const handleSaveClick = async (id: string) => {
        const token = localStorage.getItem("logToken");
        if (!token) {
            setError("User is not authenticated");
            return;
        }
        try {
            const response = await fetch(`${BASE_URI}/blogs/updateBlog/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
                body: JSON.stringify({
                    content: editContent,
                    title: editName,
                    category: editCategory,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update blog");
            }

            setBlogs((prev) =>
                prev.map((blog) =>
                    blog._id === id
                        ? { ...blog, content: editContent, title: editName, category: editCategory }
                        : blog
                )
            );
            setEditingBlogId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const handleCancelClick = () => {
        setEditingBlogId(null);
        setEditContent("");
        setEditName("");
        setEditCategory("");
    };

    const handleDeleteClick = async (id: string) => {
        const token = localStorage.getItem("logToken");
        if (!token) {
            setError("User is not authenticated");
            return;
        }
        try {
            const response = await fetch(`${BASE_URI}/blogs/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete blog");
            }

            setBlogs((prev) => prev.filter((blog) => blog._id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const handleSearch = async () => {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append("search", searchQuery);
        if (selectedCategory) queryParams.append("category", selectedCategory);

        const response = await fetch(
            `${BASE_URI}/blogs/getBlogsSearch?${queryParams.toString()}`
        );
        const data = await response.json();
        setBlogs(data.data || []);
    };

    return (
        <div className="p-6 bg-white h-full">
            <div className="mb-6 flex flex-between items-center gap-4">
                <div className="flex gap-2 w-full">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 w-full sm:w-1/2 lg:w-1/3"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Search
                    </button>
                </div>
                <div className="w-full flex justify-end">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 text-gray-700 rounded-lg px-6 py-2 w-full sm:w-1/3 lg:w-1/4"
                    >
                        <option value="">Select category</option>
                        <option value="Sports">Sports</option>
                        <option value="Nature">Nature</option>
                        <option value="Technology">Technology</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs?.map((blog) => (
                    <div
                        key={blog._id}
                        className="border border-gray-300 rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition-shadow duration-300"
                    >
                        {editingBlogId === blog._id ? (
                            <>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full border text-gray-700 border-gray-300 rounded-lg p-2 mb-2"
                                    placeholder="Edit title"
                                />
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-full border text-gray-700 border-gray-300 rounded-lg p-2 mb-2"
                                >
                                    <option value="Sports">Sports</option>
                                    <option value="Nature">Nature</option>
                                    <option value="Technology">Technology</option>
                                </select>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full border text-gray-700 border-gray-300 rounded-lg p-2"
                                />
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl text-gray-700 font-semibold mb-2">
                                    {blog.title}
                                </h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    <span className="font-medium">Category:</span> {blog.category}
                                </p>
                                <p className="text-gray-700">
                                    {expanded === blog._id
                                        ? blog.content
                                        : `${blog.content.substring(0, 100)}...`}
                                </p>
                            </>
                        )}

                        {editingBlogId === blog._id ? (
                            <div className="flex gap-2 mt-4">
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                    onClick={() => handleSaveClick(blog._id)}
                                >
                                    Save
                                </button>
                                <button
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                    onClick={handleCancelClick}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div>
                                <button
                                    className="mt-4 text-blue-500 hover:underline"
                                    onClick={() => toggleContent(blog._id)}
                                >
                                    {expanded === blog._id ? "Read Less" : "Read More"}
                                </button>
                                {userId && userId === blog.authorId && (
                                    <>
                                        <button
                                            className="mt-4 ml-2 text-yellow-500 hover:underline"
                                            onClick={() => handleEditClick(blog)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="mt-4 ml-2 text-red-500 hover:underline"
                                            onClick={() => handleDeleteClick(blog._id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-6 text-red-500 font-medium">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}
