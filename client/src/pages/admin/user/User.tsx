import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  Stack,
  Button,
  Chip,
  TableSortLabel,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import { Error as ErrorIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import callApi from "@utils/apiCaller";
import type { UserRecord, UserFromServer } from "@my-types/types";

const currency = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

type Order = "asc" | "desc";
type OrderBy = keyof Pick<
  UserRecord,
  "username" | "fullName" | "email" | "phone"
>;

// Transform server data to client format
const transformUserData = (users: UserFromServer[]): UserRecord[] => {
  return users.map((user) => ({
    id: user.id,
    username: user.userName,
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
    email: user.email,
    phone: user.phoneNumber,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : undefined,
    address: user.address || undefined,
    emailVerified: user.emailConfirmed,
    ticketsTotal: 0, // Placeholder - would need separate API call or join
    totalSpentVnd: 0, // Placeholder - would need separate API call or join
    role: user.role.toLowerCase() as "admin" | "user",
    status: "active", // Placeholder - derived from other fields if needed
    avatar: user.avatar || undefined,
  }));
};

// Helper function to extract users array from API response
const extractUsersFromResponse = (response: any): UserFromServer[] => {
  if (response && typeof response === 'object') {
    // Direct response format: { users: [...] }
    if ('users' in response && Array.isArray(response.users)) {
      return response.users;
    }
    // Wrapped response format: { data: { users: [...] } }
    if ('data' in response && response.data && 'users' in response.data && Array.isArray(response.data.users)) {
      return response.data.users;
    }
  }
  return [];
};

const User: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all"); // LỌC THEO ROLE
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeUser, setActiveUser] = useState<UserRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<OrderBy>("username");

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await callApi({
          method: "GET",
          url: "/users",
        });

        const serverUsers = extractUsersFromResponse(response);
        const transformedUsers = transformUserData(serverUsers);
        setUsers(transformedUsers);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setErrorMessage(
          err.message ?? "Failed to load users. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // === LỌC THEO SEARCH + ROLE ===
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !term ||
        [u.username, u.fullName, u.email, u.phone, u.role, u.status].some((f) =>
          f?.toLowerCase().includes(term)
        );

      const matchesRole =
        roleFilter === "all" || u.role.toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // === SẮP XẾP ===
  const sorted = useMemo(() => {
    const comparator = (a: UserRecord, b: UserRecord) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    };

    return [...filtered].sort(comparator);
  }, [filtered, order, orderBy]);

  const handleSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleOpenMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    user: UserRecord
  ) => {
    setActiveUser(user);
    setMenuAnchor(e.currentTarget);
  };
  const handleCloseMenu = () => setMenuAnchor(null);

  // CRUD Handlers
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await callApi({
        method: "DELETE",
        url: `/users/${userId}`,
      });

      // Remove from local state
      setUsers(prev => prev.filter(u => u.id !== userId));
      handleCloseMenu();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleUpdateUser = async (userId: string, updateData: any) => {
    try {
      await callApi({
        method: "PUT",
        url: `/users/${userId}`,
        data: updateData,
      });

      // Refresh data from server
      const response = await callApi({
        method: "GET",
        url: "/users",
      });
      const serverUsers = extractUsersFromResponse(response);
      const transformedUsers = transformUserData(serverUsers);
      setUsers(transformedUsers);
      handleCloseMenu();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      alert("Failed to update user. Please try again.");
    }
  };

  const refreshUsers = async () => {
    try {
      const response = await callApi({
        method: "GET",
        url: "/users",
      });
      const serverUsers = extractUsersFromResponse(response);
      const transformedUsers = transformUserData(serverUsers);
      setUsers(transformedUsers);
    } catch (err: any) {
      console.error("Failed to refresh users:", err);
    }
  };

  const openDetails = (user: UserRecord) => {
    setActiveUser(user);
    setDrawerOpen(true);
    handleCloseMenu();
  };

  const visibleRows =
    rowsPerPage > 0
      ? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : sorted;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#2E7D32", mb: 2 }}
      >
        Quản lý người dùng
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        {errorMessage && <Alert icon={<ErrorIcon />} severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

        {/* === FILTER BAR === */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Hiển thị
            </Typography>
            <Chip
              size="small"
              label={rowsPerPage === -1 ? "Tất cả" : rowsPerPage}
              sx={{ mx: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              of {filtered.length} records
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {/* LỌC THEO ROLE */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={roleFilter}
                label="Vai trò"
                onChange={(e) => {
                  setRoleFilter(e.target.value as any);
                  setPage(0);
                }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            {/* TÌM KIẾM */}
            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 200 }}
            />
          </Stack>
        </Stack>

        {/* === BẢNG === */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <Typography>Loading users...</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "fullName"}
                      direction={orderBy === "fullName" ? order : "asc"}
                      onClick={() => handleSort("fullName")}
                    >
                      Full Name & Info
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "email"}
                      direction={orderBy === "email" ? order : "asc"}
                      onClick={() => handleSort("email")}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "phone"}
                      direction={orderBy === "phone" ? order : "asc"}
                      onClick={() => handleSort("phone")}
                    >
                      Phone Number
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRows.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: 14,
                              fontWeight: 600,
                              bgcolor: "#e0e0e0",
                              color: "#424242",
                            }}
                          >
                            {getInitials(u.fullName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {u.fullName}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              sx={{ mt: 0.5 }}
                            >
                              <Chip
                                label={u.role}
                                size="small"
                                color="default"
                                variant="outlined"
                                sx={{
                                  height: 20,
                                  fontSize: 11,
                                  "& .MuiChip-label": { px: 1 },
                                  bgcolor:
                                    u.role === "admin" ? "#f3e5f5" : "#e3f2fd",
                                  color: u.role === "admin" ? "#7b1fa2" : "#1565c0",
                                }}
                              />
                              <Chip
                                label={u.status}
                                size="small"
                                color={u.status === "active" ? "success" : "error"}
                                sx={{
                                  height: 20,
                                  fontSize: 11,
                                  "& .MuiChip-label": { px: 1 },
                                }}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{u.email}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{u.phone}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, u)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* === PHÂN TRANG === */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            pt: 1,
          }}
        >
          <Typography variant="caption">
            {filtered.length === 0
              ? "0 bản ghi"
              : `${page * rowsPerPage + 1} - ${Math.min(
                  filtered.length,
                  page * rowsPerPage +
                    (rowsPerPage > 0 ? rowsPerPage : filtered.length)
                )} trong tổng số ${filtered.length} bản ghi`}
          </Typography>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 9, 25, { label: "Tất cả", value: -1 }]}
            labelRowsPerPage="Số hàng mỗi trang:"
          />
        </Box>
      </Paper>

      {/* === MENU HÀNH ĐỘNG === */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => activeUser && openDetails(activeUser)}>
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={() => {
          if (activeUser) {
            const newRole = activeUser.role === "admin" ? "user" : "admin";
            handleUpdateUser(activeUser.id, { role: newRole });
          }
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Chuyển thành {activeUser?.role === "admin" ? "User" : "Admin"}
        </MenuItem>
        <MenuItem
          onClick={() => activeUser && handleDeleteUser(activeUser.id)}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa người dùng
        </MenuItem>
      </Menu>

      {/* === DRAWER CHI TIẾT === */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: 360, sm: 420, md: 520 } } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1e88e5", mb: 2 }}
          >
            Chi tiết người dùng
          </Typography>

          {activeUser && (
            <>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    fontSize: 18,
                    fontWeight: 600,
                    bgcolor: "#e3f2fd",
                    color: "#1565c0",
                  }}
                >
                  {getInitials(activeUser.fullName)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {activeUser.fullName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {activeUser.email}
                    </Typography>
                    <Chip
                      size="small"
                      label={activeUser.role}
                      color={
                        activeUser.role === "admin" ? "secondary" : "default"
                      }
                    />
                    <Chip
                      size="small"
                      label={activeUser.status}
                      color={
                        activeUser.status === "active" ? "success" : "error"
                      }
                    />
                  </Stack>
                </Box>
              </Stack>

              <Paper variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Thông tin cá nhân
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <EventRoundedIcon fontSize="small" />
                      <Typography variant="body2">
                        Ngày sinh: {activeUser.dateOfBirth ?? "-"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <HomeRoundedIcon fontSize="small" />
                      <Typography variant="body2">
                        Địa chỉ: {activeUser.address ?? "-"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Thông tin liên hệ
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PhoneIphoneRoundedIcon fontSize="small" />
                      <Typography variant="body2">
                        Số điện thoại: {activeUser.phone}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <MailOutlineRoundedIcon fontSize="small" />
                      <Typography variant="body2">
                        Email: {activeUser.email}
                      </Typography>
                      <Chip
                        size="small"
                        color={activeUser.emailVerified ? "success" : "default"}
                        label={
                          activeUser.emailVerified ? "Đã xác thực" : "Chưa xác thực"
                        }
                        sx={{ ml: 1 }}
                      />
                    </Stack>
                  </Stack>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, background: "#e3f2fd" }}>
                  <Typography sx={{ fontWeight: 700 }}>Tickets</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="body2">
                      Total Tickets: {activeUser.ticketsTotal}
                    </Typography>
                    <Typography variant="body2">
                      Total Spent: {currency(activeUser.totalSpentVnd)}
                    </Typography>
                  </Stack>
                </Box>
              </Paper>

              <Divider sx={{ my: 1 }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setDrawerOpen(false)}
                >
                  Back to List
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default User;
