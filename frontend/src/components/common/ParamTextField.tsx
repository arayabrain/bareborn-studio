import { Box, FormHelperText, TextField, TextFieldProps } from "@mui/material"
import { styled } from "@mui/material/styles"

export const ParamTextField = styled((props: TextFieldProps) => (
  <Box marginBottom={2}>
    <TextField
      variant="outlined"
      fullWidth
      {...props}
      helperText={
        <span>
          CaImAn documentation #1{" "}
          <a
            href="https://caiman.readthedocs.io/en/latest/"
            target="_blank"
            rel="noreferrer"
          >
            Link
          </a>
        </span>
      }
    />
    <FormHelperText>
      CaImAn documentation #2{" "}
      <a
        href="https://caiman.readthedocs.io/en/latest/"
        target="_blank"
        rel="noreferrer"
      >
        Link
      </a>
    </FormHelperText>
  </Box>
))(({ theme }) => ({
  "& .MuiInputLabel-root": {
    "&.MuiInputLabel-formControl": {
      position: "static",
      transform: "none",
      transition: "none",
      fontWeight: "bold",
      fontSize: "0.95rem",
      color: theme.palette.text.secondary,
    },
  },
  "& .MuiOutlinedInput-root": {
    marginTop: 0,
  },
  "& .MuiOutlinedInput-input": {
    paddingTop: "10px",
    paddingBottom: "8px",
    height: "auto",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    top: 0,
    "& legend": {
      display: "none",
    },
  },
}))
