import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDriverAPISchema, type CreateDriverAPIFormData } from "@schemas/driverSchema";
import callApi from "@utils/apiCaller";
import { useNavigate } from "react-router-dom";

const DriverCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDriverAPIFormData>({
    resolver: zodResolver(createDriverAPISchema),
    defaultValues: {
      fullname: "",
      phoneNumber: "",
      licenseNumber: "",
      licenseCategory: "",
      licenseIssueDate: "",
      licenseExpiryDate: "",
      issuingAuthority: "",
      hiredAt: "",
      isActive: true,
      isSuspended: false,
      avatar: "",
    },
  });

  const onSubmit = async (data: CreateDriverAPIFormData) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Convert empty strings to null for optional fields
      const submitData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ])
      ) as CreateDriverAPIFormData;

      const response = await callApi({
        method: "POST",
        url: "/drivers",
        data: submitData,
      });

      if (response) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/driver"); // Quay lại danh sách driver
        }, 1500);
      }
    } catch (err: any) {
      console.error("Failed to create driver:", err);
      setErrorMessage(
        err.message ?? "Không thể tạo tài xế. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#2E7D32", mb: 3 }}
      >
        Thêm tài xế mới
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Thêm tài xế thành công! Đang chuyển hướng về danh sách...
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* === THÔNG TIN CƠ BẢN === */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1565c0" }}
            >
              Thông tin cơ bản
            </Typography>

            <Controller
              name="fullname"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Họ và tên *"
                  fullWidth
                  error={!!errors.fullname}
                  helperText={errors.fullname?.message}
                />
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số điện thoại"
                    fullWidth
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message || "VD: 0901234567"}
                  />
                )}
              />

              <Controller
                name="issuingAuthority"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cơ quan cấp"
                    fullWidth
                    error={!!errors.issuingAuthority}
                    helperText={errors.issuingAuthority?.message}
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* === BẰNG LÁI === */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1565c0" }}
            >
              Giấy phép lái xe
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="licenseNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số bằng lái"
                    fullWidth
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber?.message}
                  />
                )}
              />

              <Controller
                name="licenseCategory"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.licenseCategory}>
                    <InputLabel>Hạng bằng lái</InputLabel>
                    <Select {...field} label="Hạng bằng lái">
                      <MenuItem value="B1">B1</MenuItem>
                      <MenuItem value="B2">B2</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                      <MenuItem value="E">E</MenuItem>
                    </Select>
                    <FormHelperText>
                      {errors.licenseCategory?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="licenseIssueDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ngày cấp"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.licenseIssueDate}
                    helperText={errors.licenseIssueDate?.message}
                  />
                )}
              />

              <Controller
                name="licenseExpiryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ngày hết hạn"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.licenseExpiryDate}
                    helperText={errors.licenseExpiryDate?.message}
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* === THÔNG TIN TUYỂN DỤNG === */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1565c0" }}
            >
              Thông tin tuyển dụng
            </Typography>

            <Controller
              name="hiredAt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ngày tuyển dụng"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.hiredAt}
                  helperText={errors.hiredAt?.message}
                />
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.isActive}>
                    <InputLabel>Trạng thái hoạt động</InputLabel>
                    <Select {...field} label="Trạng thái hoạt động">
                      <MenuItem value={true}>Hoạt động</MenuItem>
                      <MenuItem value={false}>Không hoạt động</MenuItem>
                    </Select>
                    <FormHelperText>{errors.isActive?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              <Controller
                name="isSuspended"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.isSuspended}>
                    <InputLabel>Trạng thái đình chỉ</InputLabel>
                    <Select {...field} label="Trạng thái đình chỉ">
                      <MenuItem value={false}>Không đình chỉ</MenuItem>
                      <MenuItem value={true}>Đình chỉ</MenuItem>
                    </Select>
                    <FormHelperText>
                      {errors.isSuspended?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Stack>

            <Controller
              name="avatar"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ảnh đại diện (URL)"
                  fullWidth
                  error={!!errors.avatar}
                  helperText={errors.avatar?.message}
                />
              )}
            />

            <Divider />

            {/* === HÀNH ĐỘNG === */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                disabled={loading}
                onClick={() => navigate("/dashboard/trip")}
              >
                Hủy
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Đang lưu..." : "Thêm tài xế"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverCreate;
