import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";


// Define form field types
type SignupFormFields = {
  username: string;
  password: string;
};

const Signup: React.FC = () => {
  const { handleSubmit, control, setError } = useForm<SignupFormFields>();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<SignupFormFields> = async (data) => {
    try {
      await api.post("/signup",data);
      alert("Signup successful! Redirecting to login...");
      navigate("/login");
    } catch (err: any) {
      if (err.response?.data.detail === "Username already registered") {
        setError("username", { type: "manual", message: "Username already exists" });
      } else {
        alert("An error occurred during signup. Please try again.");
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="username"
          control={control}
          defaultValue=""
          rules={{
            required: "Username is required",
            minLength: { value: 3, message: "Must be at least 3 characters" },
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Username"
              fullWidth
              margin="normal"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          defaultValue=""
          rules={{
            required: "Password is required",
            minLength: { value: 6, message: "Must be at least 6 characters" },
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Button type="submit" variant="contained" fullWidth>
          Sign Up
        </Button>
      </form>
    </Box>
  );
};

export default Signup;
