// src/components/user/PendingRatingBanner.tsx
import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";

type Props = {
  count: number;
};

export default function PendingRatingBanner({ count }: Props) {
  return (
    <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
      <AlertTitle>
        You have {count} trip{count > 1 ? "s" : ""} waiting for your review!
      </AlertTitle>
      Your feedback helps us improve service quality. Please take a moment to rate your recent trip.
      {" "}
      <Button component={Link} to="/rate-trip" variant="contained" size="small" color="inherit" sx={{ ml: 2 }}>
        Review Now
      </Button>
    </Alert>
  );
}