import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Typography, Box, Stack, Paper, ThemeProvider, createTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#4caf50", // Green
    },
    secondary: {
      main: "#ff5722", // Deep Orange
    },
    background: {
      default: "#f0f0f0", // Light Gray
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
});

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { handleSubmit, control, reset } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await api.post("/createPost", data, {
        withCredentials: true,
      });
      
      reset();
      alert("Post created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 4, backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h4" gutterBottom color="primary">
            Create a New Post
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Title"
                    fullWidth
                    margin="normal"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    variant="outlined"
                  />
                )}
              />
              <Controller
                name="content"
                control={control}
                rules={{ required: "Content is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Content"
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    variant="outlined"
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  borderRadius: 20,
                  padding: "10px 20px",
                  fontWeight: "bold",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Submit Post
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default CreatePostPage;
