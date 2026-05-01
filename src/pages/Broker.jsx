import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import GlobalLoader from "../components/GlobalLoader";
import { useNavigate } from "react-router-dom";
import { getBrokers, deleteBroker } from "../api/brokerApi";
import Swal from "sweetalert2";

export default function Brokers() {
  const [brokers, setBrokers] = useState([]);
  const [filteredBrokers, setFilteredBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const res = await getBrokers();

      if (res.success) {
        setBrokers(res.data);
        setFilteredBrokers(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DELETE FUNCTION
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This broker will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deleteBroker(id);

      if (res.success) {
        Swal.fire("Deleted!", "Broker removed successfully", "success");
        fetchBrokers(); // refresh
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const getStatusBadge = (status) => {
    return status ? (
      <span className="badge bg-success">Active</span>
    ) : (
      <span className="badge bg-danger">Inactive</span>
    );
  };

  const indexOfLastBroker = currentPage * entriesPerPage;
  const indexOfFirstBroker = indexOfLastBroker - entriesPerPage;
  const currentBrokers = filteredBrokers.slice(
    indexOfFirstBroker,
    indexOfLastBroker,
  );

  const totalPages = Math.ceil(filteredBrokers.length / entriesPerPage);

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">

          {/* Table */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h3 className="card-title mb-0">All Brokers</h3>

              <div className="d-flex align-items-center gap-2 flex-nowrap">
                {/* 🔍 Search */}
                <div className="input-group" style={{ width: "220px" }}>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Search..."
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();

                      setFilteredBrokers(
                        brokers.filter(
                          (broker) =>
                            broker.display_name
                              ?.toLowerCase()
                              .includes(value) ||
                            broker.code?.toLowerCase().includes(value),
                        ),
                      );
                    }}
                  />
                </div>

                {/* Entries */}
                <select
                  className="form-select"
                  style={{ width: "80px" }}
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>

                {/* Add Button */}
                <button
                  className="btn btn-primary px-3"
                  onClick={() => navigate("/broker/add")}
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="card-body">
              <table className="table table-bordered align-middle">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        <GlobalLoader visible={loading} />
                      </td>
                    </tr>
                  ) : currentBrokers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No Data
                      </td>
                    </tr>
                  ) : (
                    currentBrokers.map((broker) => (
                      <tr key={broker.id}>
                        <td>
                          <img
                            src={broker.logo_url}
                            width="60"
                            className="rounded"
                          />
                        </td>

                        <td>{broker.display_name}</td>
                        <td>{broker.code}</td>

                        <td>
                          <span className="badge bg-info text-dark">
                            {broker.data_source_type}
                          </span>
                        </td>

                        <td>{getStatusBadge(broker.is_active)}</td>

                        {/* 🔥 ACTION BUTTONS */}
                        <td>
                          <div className="d-flex gap-2">
                            {/* Visit */}
                            <a
                              href={broker.affiliate_link_template}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-primary text-white"
                            >
                              View
                            </a>

                            {/* Edit */}
                            <button
                              className="btn btn-sm btn-warning text-white"
                              onClick={() =>
                                navigate(`/broker/edit/${broker.id}`)
                              }
                            >
                              Edit
                            </button>

                            {/* Delete */}
                            <button
                              className="btn btn-sm btn-danger text-white"
                              onClick={() => handleDelete(broker.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-end mt-3">
                  <ul className="pagination">
                    <li
                      className={`page-item ${currentPage === 1 && "disabled"}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Prev
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i + 1 && "active"
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        currentPage === totalPages && "disabled"
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
