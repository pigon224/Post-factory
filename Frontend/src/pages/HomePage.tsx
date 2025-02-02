import { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import api from "../api";  
import PostCard from "../components/PostCard";
import SearchBar from "../components/SearchBar";  

interface Post {
  id: number;
  title: string;
  content: string;
  average_rating: number;   
}

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch posts 
    api.get("/") 
      .then((response) => {
        setPosts(response.data);  
        setFilteredPosts(response.data); // Initially, show all posts
        setError(null);  // Reset error state on success
        setLoading(false); // End loading state
      })
      .catch((error) => {
        console.error("Failed to fetch posts", error);
        setError("Failed to load posts. Please log in and try again later .");
        setLoading(false); // End loading state even if error occurs
      });
  }, []);

  // Filter posts by title
  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      setFilteredPosts(posts); // Show all posts if the search query is empty
    } else {
      const filtered = posts.filter((post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) // Filter by title
      );
      setFilteredPosts(filtered); // Update filtered posts state
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Latest Posts
      </Typography>

      {error && (
        <Typography variant="body1" color="error" gutterBottom>
          {error}
        </Typography>
      )}

      {/* Search Bar Component */}
      <SearchBar onSearch={handleSearch} />

      <Grid container spacing={3}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <PostCard 
                id={post.id} 
                title={post.title} 
                content={post.content} 
                rating={post.average_rating}  // Pass the rating
              />
            </Grid>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
            No posts available.
          </Typography>
        )}
      </Grid>
    </Box>
  );
};

export default HomePage;
