import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import GlobalLoader from "../components/GlobalLoader";
import { getUsers, updateUserStatus, updateUserCoins } from "../api/users";
import { getBrokers } from "../api/brokerApi";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function UserList() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchUsers = async (page = 1) => {
    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getUsers(token, page, 10, "id", "desc");

      if (result.success) {
        setUsers(result.data.users);
        setPagination({
          currentPage: result.data.current_page,
          totalPages: result.data.total_pages,
          totalUsers: result.data.total_users,
          hasNext: result.data.has_next,
          hasPrevious: result.data.has_previous,
        });
        setError(null);
      } else {
        setError(result.message);
        setUsers([]);
      }
    } catch (err) {
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchBrokersList = async () => {
      try {
        const res = await getBrokers();
        if (res.success) {
          setBrokers(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch brokers list:", err);
      }
    };
    fetchBrokersList();
  }, [token]);

  const resolveBrokerName = (brokerId) => {
    if (!brokerId) return null;
    const found = brokers.find(b => b.id === brokerId);
    return found ? found.display_name : null;
  };

  useEffect(() => {
    if (window.DataTable && users.length > 0) {
      // Destroy existing DataTable if it exists
      if ($.fn.DataTable.isDataTable("#example")) {
        $("#example").DataTable().destroy();
      }
      // Initialize new DataTable
      setTimeout(() => {
        window.DataTable("#example", {
          pageLength: 10,
          ordering: true,
          searching: true,
        });
      }, 100);
    }
  }, [users]);

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const confirmText = newStatus
      ? "Are you sure you want to activate this user?"
      : "Are you sure you want to deactivate this user?";

    const result = await Swal.fire({
      title: "Confirm Status Change",
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    });

    if (result.isConfirmed) {
      try {
        const updateResult = await updateUserStatus(token, userId, newStatus);

        // Update the user in the local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId ? { ...user, is_active: newStatus } : user,
          ),
        );

        // Display success message from API response
        Swal.fire({
          icon: "success",
          title: "Success",
          text:
            updateResult.message ||
            `User ${newStatus ? "activated" : "blocked"} successfully`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while updating user status",
        });
      }
    }
  };

  const handleCoinUpdate = async (userId, currentCoins) => {
    const { value: coinsToAdd } = await Swal.fire({
      title: "Add User Coins",
      input: "number",
      inputLabel: "Enter the number of coins to add",
      inputValue: 0,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    if (coinsToAdd !== undefined && coinsToAdd !== null && coinsToAdd !== "") {
      try {
        const result = await updateUserCoins(token, userId, coinsToAdd);
        if (result.success) {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.user_id === userId
                ? { ...user, coins: (user.coins || 0) + parseInt(coinsToAdd) }
                : user,
            ),
          );
          Swal.fire({
            icon: "success",
            title: "Success",
            text: result.message || "Coins added successfully",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.message || "Failed to add coins",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while adding coins",
        });
      }
    }
  };


  const getStatusBadge = (isActive, userId) => {
    return (
      <div className="d-flex align-items-center gap-2">
        <div
          className="form-check form-switch mb-0"
          title={`Click to ${isActive ? "deactivate" : "activate"} user`}
        >
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={isActive}
            onChange={() => handleStatusToggle(userId, isActive)}
            style={{ cursor: "pointer", width: "40px", height: "20px" }}
          />
        </div>
        <span className={`badge ${isActive ? "bg-success" : "bg-danger"}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    );
  };

  const getSubscriptionBadge = (subscription) => {
    if (!subscription) return <span className="badge bg-secondary">None</span>;
    
    const { status, plan_type } = subscription;
    let badgeClass = "bg-secondary";
    if (status === "active") badgeClass = "bg-success";
    else if (status === "expired") badgeClass = "bg-warning text-dark";
    else if (status === "pending") badgeClass = "bg-info";

    return (
      <div className="d-flex flex-column align-items-start gap-1">
        <span className={`badge ${badgeClass}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {plan_type && (
          <span className="small text-muted font-monospace" style={{ fontSize: "11px" }}>
            {plan_type.toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  const getBrokerSubscriptionBadge = (brokerSub) => {
    if (!brokerSub) return <span className="badge bg-secondary">None</span>;
    
    const { status, account_number, broker_id } = brokerSub;
    const broker_name = brokerSub.broker?.name || brokerSub.broker_name || resolveBrokerName(broker_id);
    let badgeClass = "bg-secondary";
    
    switch (status) {
      case "matched":
      case "active":
        badgeClass = "bg-success";
        break;
      case "pending":
        badgeClass = "bg-warning text-dark";
        break;
      case "suspicious":
        badgeClass = "bg-danger";
        break;
      case "rejected":
        badgeClass = "bg-secondary";
        break;
      case "revoked":
        badgeClass = "bg-dark";
        break;
      default:
        badgeClass = "bg-light text-dark border";
    }

    return (
      <div className="d-flex flex-column align-items-start gap-1">
        <span className={`badge ${badgeClass}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {(broker_name || account_number) && (
          <span className="small text-muted" style={{ fontSize: "11px" }}>
            {broker_name || "Account"}: {account_number || "N/A"}
          </span>
        )}
      </div>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return `${date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return "N/A";
    }
  };

  const handleViewSubscription = (subscription) => {
    if (!subscription) return;
    
    const { status, plan_type, start_at, end_at } = subscription;
    
    Swal.fire({
      title: '<h4 class="fw-bold text-primary mb-0"><i class="fas fa-gem me-2"></i>Subscription Details</h4>',
      html: `
        <div class="text-start mt-3">
          <table class="table table-bordered table-striped small">
            <tbody>
              <tr>
                <th class="w-40 py-2">Status</th>
                <td class="py-2"><span class="badge bg-${status === 'active' ? 'success' : 'secondary'}">${status.toUpperCase()}</span></td>
              </tr>
              <tr>
                <th class="py-2">Plan Type</th>
                <td class="py-2"><span class="fw-semibold text-dark">${plan_type ? plan_type.toUpperCase() : 'N/A'}</span></td>
              </tr>
              <tr>
                <th class="py-2">Start Date</th>
                <td class="py-2 text-muted">${formatDateTime(start_at)}</td>
              </tr>
              <tr>
                <th class="py-2">End Date</th>
                <td class="py-2 text-muted">${formatDateTime(end_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      confirmButtonText: "Close",
      confirmButtonColor: "#3085d6",
      customClass: {
        popup: 'rounded-3 shadow'
      }
    });
  };

  const handleViewBrokerSubscription = (brokerSub) => {
    if (!brokerSub) return;
    
    const { status, account_number, submitted_at, end_at, broker_id } = brokerSub;
    const broker_name = brokerSub.broker?.name || brokerSub.broker_name || resolveBrokerName(broker_id) || 'N/A';
    
    Swal.fire({
      title: '<h4 class="fw-bold text-primary mb-0"><i class="fas fa-handshake me-2"></i>Broker Subscription Details</h4>',
      html: `
        <div class="text-start mt-3">
          <table class="table table-bordered table-striped small">
            <tbody>
              <tr>
                <th class="w-40 py-2">Status</th>
                <td class="py-2">
                  <span class="badge bg-${
                    status === 'matched' || status === 'active' ? 'success' : 
                    status === 'pending' ? 'warning text-dark' : 
                    status === 'suspicious' ? 'danger' : 'secondary'
                  }">${status.toUpperCase()}</span>
                </td>
              </tr>
              <tr>
                <th class="py-2">Broker Name</th>
                <td class="py-2"><span class="fw-semibold text-dark">${broker_name}</span></td>
              </tr>
              <tr>
                <th class="py-2">Account Number</th>
                <td class="py-2"><span class="font-monospace text-dark">${account_number || 'N/A'}</span></td>
              </tr>
              <tr>
                <th class="py-2">Submitted At</th>
                <td class="py-2 text-muted">${formatDateTime(submitted_at)}</td>
              </tr>
              ${status !== 'pending' ? `
              <tr>
                <th class="py-2">End At</th>
                <td class="py-2 text-muted">${end_at ? formatDateTime(end_at) : 'N/A'}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      `,
      confirmButtonText: "Close",
      confirmButtonColor: "#3085d6",
      customClass: {
        popup: 'rounded-3 shadow'
      }
    });
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>User Management</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <div
                      className="dropdown dropdown-action"
                      data-bs-placement="bottom"
                      data-bs-original-title="Download"
                    >
                      <div className="dropdown-menu dropdown-menu-end">
                        <ul className="d-block">
                          <li>
                            <a
                              className="d-flex align-items-center download-item"
                              href="javascript:void(0);"
                              download=""
                            >
                              <i className="far fa-file-text me-2"></i>Excel
                            </a>
                          </li>
                          <li>
                            <a
                              className="d-flex align-items-center download-item"
                              href="javascript:void(0);"
                              download=""
                            >
                              <i className="far fa-file-pdf me-2"></i>PDF
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link className="btn btn-primary" to="/add-user">
                      <i className="fa fa-plus-circle me-2"></i>Add User
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table id="example" className="table table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Coins</th>
                          <th>Status</th>
                          <th>Last Login Reward</th>
                          <th>Date of Joining</th>
                          <th>Subscription</th>
                          <th>Broker Subscription</th>
                          {/* <th>Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="9" className="text-center py-4">
                              <div className="d-flex justify-content-center align-items-center flex-column">
                                <GlobalLoader visible={true} size="medium" />
                                <p className="mt-2 text-muted">
                                  Loading users...
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td colSpan="9" className="text-center text-danger">
                              {error}
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.user_id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {user.profile_image ? (
                                    <img
                                      src={user.profile_image}
                                      alt={user.name}
                                      className="rounded-circle me-2"
                                      width="32"
                                      height="32"
                                      style={{ objectFit: "cover" }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        fontSize: "14px",
                                        color: "white",
                                      }}
                                    >
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  {user.name}
                                </div>
                              </td>
                              <td>{user.email}</td>
                              <td>
                                {user.country_code} {user.phone_number}
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge bg-info">
                                    <i className="fas fa-coins me-1"></i>
                                    {user.coins}
                                  </span>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      handleCoinUpdate(user.user_id, user.coins)
                                    }
                                    title="Update Coins"
                                    style={{
                                      padding: "2px 6px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                </div>
                              </td>
                              <td>
                                {getStatusBadge(user.is_active, user.user_id)}
                              </td>
                              <td>{formatDate(user.last_login_reward)}</td>
                              <td>{formatDate(user.created_at)}</td>
                              <td>
                                {!user.subscription ? (
                                  <span className="text-muted small">None</span>
                                ) : (
                                  <div className="d-flex flex-column align-items-start gap-1">
                                    {getSubscriptionBadge(user.subscription)}
                                    <button
                                      className="btn btn-sm btn-outline-primary mt-1"
                                      onClick={() => handleViewSubscription(user.subscription)}
                                      title="View Details"
                                      style={{
                                        padding: "2px 6px",
                                        fontSize: "11px",
                                      }}
                                    >
                                      <i className="fas fa-eye me-1"></i> View
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td>
                                {!user.broker_subscription ? (
                                  <span className="text-muted small">None</span>
                                ) : (
                                  <div className="d-flex flex-column align-items-start gap-1">
                                    {getBrokerSubscriptionBadge(user.broker_subscription)}
                                    <button
                                      className="btn btn-sm btn-outline-primary mt-1"
                                      onClick={() => handleViewBrokerSubscription(user.broker_subscription)}
                                      title="View Details"
                                      style={{
                                        padding: "2px 6px",
                                        fontSize: "11px",
                                      }}
                                    >
                                      <i className="fas fa-eye me-1"></i> View
                                    </button>
                                  </div>
                                )}
                              </td>
                              {/* <td>
                                <button className="btn btn-sm btn-outline-primary me-1" title="Edit">
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-danger" title="Delete">
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td> */}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="row">
              <div className="col-sm-12">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(
                      pagination.currentPage * 10,
                      pagination.totalUsers,
                    )}{" "}
                    of {pagination.totalUsers} users
                  </div>
                  <div className="pagination">
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrevious}
                    >
                      <i className="bi bi-chevron-left"></i> Previous
                    </button>
                    <span className="mx-2">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNext}
                    >
                      Next <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
