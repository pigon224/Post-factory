import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Collapse,
  Box,
} from "@mui/material";
import PostRating from "./StarRating"; // Import PostRating component for showing the post's rating

interface PostCardProps {
  id: number;
  title: string;
  content: string;
  rating: number;
}

const colors = [
  "#FFCDD2",
  "#E1BEE7",
  "#D1C4E9",
  "#C5CAE9",
  "#BBDEFB",
  "#B3E5FC",
  "#B2EBF2",
  "#B2DFDB",
  "#C8E6C9",
  "#DCEDC8",
  "#F0F4C3",
  "#FFECB3",
  "#FFE0B2",
  "#FFCCBC",
];

// Function to get a random color from the list
const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const PostCard: React.FC<PostCardProps> = ({ id, title, content, rating }) => {
  const [expanded, setExpanded] = useState(false); // State to control expansion
  const cardColor = getRandomColor(); // Get a random color for the card

  // Toggle the expanded state to show or hide content
  const toggleContent = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      sx={{
        marginBottom: 2,
        backgroundColor: cardColor, // Apply the random background color
        "&:hover": { boxShadow: 6 }, // Add hover effect
        transition: "0.3s",
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>
        {/* Collapse the content based on the expanded state */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, whiteSpace: "pre-wrap" }}
          >
            {content}
          </Typography>
        </Collapse>
        {/* Show a preview of content when collapsed */}
        {!expanded && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            {content.length > 100 ? `${content.substring(0, 100)}...` : content}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Single button to toggle content */}
        <Button
          size="small"
          onClick={toggleContent}
          sx={{
            backgroundColor: "#F8BBD0", // Custom background color
            color: "white", // Text color
            fontWeight: "bold", // Bold text
            textTransform: "none", // Prevent automatic text transformation (uppercase)
            "&:hover": {
              backgroundColor: "#FF8A65", // Hover background color
            },
          }}
        >
          {expanded ? "Show Less" : "Read More"}
        </Button>
      </CardActions>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          pb: 2,
        }}
      >
        <PostRating postId={id} rating={rating} /> {/* Display the rating */}
      </Box>
    </Card>
  );
};

export default PostCard;
