import React, { useState } from "react";
import { Rating, Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import api from "../api"; // Ensure your Axios instance is set up correctly

interface PostRatingProps {
  postId: number;
  rating: number;  // Accept the rating prop here
}

const labels: { [index: string]: string } = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};

function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

const PostRating: React.FC<PostRatingProps> = ({ postId, rating }) => {
  const [hover, setHover] = useState(-1); // Hover state
  const [error, setError] = useState<string>("");

  const handleRatingChange = async (_event: any, newValue: number | null) => {
    if (newValue === null || newValue < 0 || newValue > 5) {
      return;  
    }

    // Optimistically update the rating in the UI
    try {
       await api.post(`/rate/${postId}`, { value: newValue }, {
        withCredentials: true, // Ensures cookies are sent with the request
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`Rating for post ${postId} updated to ${newValue}`);
    } catch (err) {
      setError("Failed to submit rating. Please log in");
      console.error("Error submitting rating:", err);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 2,
        p: 2,
        width: "100%",
        maxWidth: "400px",
      }}
    >

      {/* MUI Rating Component with hover feedback */}
      <Rating
        name={`rating-post-${postId}`}
        value={rating}
        onChange={handleRatingChange}
        precision={0.5}
        size="large"
        onChangeActive={(_event, newHover) => setHover(newHover)}
        getLabelText={getLabelText}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
        sx={{ cursor: "pointer" }}
      />

      {/* Display the label text */}
      {rating !== null && (
        <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : rating]}</Box>
      )}

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default PostRating;
