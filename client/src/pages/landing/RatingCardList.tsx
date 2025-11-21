// src/components/user/RatingCardList.tsx
import { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Rating,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { format } from "date-fns";
import type { UserRating } from "@my-types/rating";

type Props = {
  ratings: UserRating[];
  onDelete?: (ratingId: string) => void; // Optional: để xử lý xóa thật sau này
};

export default function RatingCardList({ ratings, onDelete }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<UserRating | null>(null);

  const handleOpenDelete = (rating: UserRating) => {
    setRatingToDelete(rating);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ratingToDelete) {
      console.log("Đã xóa đánh giá:", ratingToDelete.id);
      onDelete?.(ratingToDelete.id);
      // Có thể thêm logic xóa khỏi state ở đây nếu dùng state toàn cục
    }
    setDeleteDialogOpen(false);
    setRatingToDelete(null);
  };

  const handleClose = () => {
    setDeleteDialogOpen(false);
    setRatingToDelete(null);
  };

  if (ratings.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography color="text.secondary" variant="h6">
          Bạn chưa có đánh giá nào
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {ratings.map((r) => {
          const trip = r.trip;
          const date = new Date(trip.departureTime);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  overflow: "hidden386",
                  backgroundColor: "#fff",
                  boxShadow: 1,
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                {/* Header xanh */}
                <Box sx={{ backgroundColor: "#1976d2", color: "white", p: 2 }}>
                  <Typography fontWeight="bold" noWrap>
                    {trip.fromShort || trip.from.split(",")[0]} to {trip.toShort || trip.to.split(",")[0]}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {trip.from} to {trip.to}
                  </Typography>
                </Box>

                {/* Body */}
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Trip Date
                      </Typography>
                      <Typography fontWeight="medium">
                        {format(date, "EEE, dd MMM yyyy")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Departure: {format(date, "HH:mm")}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Driver
                      </Typography>
                      <Typography fontWeight="medium">{trip.driverName}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Vehicle
                      </Typography>
                      <Typography fontWeight="medium">
                        {trip.vehiclePlate} • {trip.vehicleType}
                      </Typography>
                    </Box>

                    <Box textAlign="center" pt={1}>
                      <Rating value={r.rating} readOnly size="large" />
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {r.rating}.0
                      </Typography>
                    </Box>

                    {r.comment && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Your Comment
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontStyle: "italic",
                            backgroundColor: "#f5f5f5",
                            p: 1.5,
                            borderRadius: 1,
                            mt: 0.5,
                          }}
                        >
                          "{r.comment}"
                        </Typography>
                      </Box>
                    )}

                    {/* Nút hành động */}
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        component={Link}
                        to={`/rating/${r.id}/edit`}
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        fullWidth
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDelete(r)}
                        fullWidth
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Modal xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: "#d32f2f", color: "white", pb: 2 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to <strong>delete your review</strong> for:
          </Typography>
          <Typography fontWeight="bold" color="primary" sx={{ mt: 1 }}>
            {ratingToDelete?.trip.from} to {ratingToDelete?.trip.to}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ minWidth: 120 }}
          >
            Delete Review
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}