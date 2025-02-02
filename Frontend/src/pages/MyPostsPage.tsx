import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]); // Holds the posts datai
  const [error, setError] = useState<string | null>(null); // Holds any error messages
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/my-posts", {
          withCredentials: true, // Ensures cookies are sent with the request
        });
        setPosts(response.data); // Set posts on successful response
      } catch (err: any) {
        console.error("Error fetching posts:", err.response || err);

        if (err.response) {
          // Handle specific status codes
          if (err.response.status === 401) {
            // Unauthorized: redirect to login
            alert("Session expired. Please log in again.");
            navigate("/login");
          } else {
            setError(err.response.data?.detail || "Failed to fetch posts.");
          }
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
      }
    };

    fetchPosts();
  }, [navigate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Posts</h1>
      {error ? (
        <p className="text-red-500">{error}</p> // Display error message
      ) : posts.length > 0 ? (
        posts.map((post: any) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content} 
            rating={post.rating}          />
        ))
      ) : (
        <p>No posts available.</p> // Display when no posts are available
      )}
    </div>
  );
};

export default MyPostsPage;
