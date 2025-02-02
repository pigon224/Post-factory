import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useState } from "react";

const SearchContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  width: "100%",
  maxWidth: 400,
  marginLeft: theme.spacing(3),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  flex: 1,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1),
    transition: theme.transitions.create("width"),
  },
}));

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState("");

  // Type annotation for onChange (React.ChangeEvent)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Type annotation for onKeyDown (React.KeyboardEvent)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSearch = () => {
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    onSearch(""); // Clears the search results
  };

  return (
    <SearchContainer>
      <StyledInputBase
        placeholder="Search…"
        inputProps={{ "aria-label": "search" }}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {query && (
        <IconButton onClick={handleClear} aria-label="clear search" color="inherit">
          <ClearIcon />
        </IconButton>
      )}
      <IconButton onClick={handleSearch} aria-label="search" color="inherit">
        <SearchIcon />
      </IconButton>
    </SearchContainer>
  );
};

export default SearchBar;
