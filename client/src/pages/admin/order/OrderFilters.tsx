// src/components/orders/OrderFilters.tsx
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';

interface OrderFiltersProps {
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function OrderFilters({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: OrderFiltersProps) {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm: mã đơn, khách hàng, email, sđt, mã chuyến..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Trạng thái</InputLabel>
          <Select value={statusFilter} label="Trạng thái" onChange={(e) => onStatusChange(e.target.value)}>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="paid">Đã thanh toán</MenuItem>
            <MenuItem value="pending">Chờ thanh toán</MenuItem>
            <MenuItem value="cancelled">Đã hủy</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Button variant="contained" fullWidth startIcon={<SearchIcon />}>
          Tìm kiếm
        </Button>
      </Grid>
    </Grid>
  );
}