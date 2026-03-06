import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function UserList() {
  useEffect(() => {
    if (window.DataTable) {
      new window.DataTable('#example', {});
    }
  }, []);

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
                    <div className="dropdown dropdown-action" data-bs-placement="bottom" data-bs-original-title="Download">
                      <div className="dropdown-menu dropdown-menu-end">
                        <ul className="d-block">
                          <li>
                            <a className="d-flex align-items-center download-item" href="javascript:void(0);" download="">
                              <i className="far fa-file-text me-2"></i>Excel
                            </a>
                          </li>
                          <li>
                            <a className="d-flex align-items-center download-item" href="javascript:void(0);" download="">
                              <i className="far fa-file-pdf me-2"></i>PDF
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link className="btn btn-primary" to="/add-user"><i className="fa fa-plus-circle me-2"></i>Add User</Link>
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
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Amit Sharma</td>
                          <td>amit@gmail.com</td>
                          <td><span className="badge bg-primary">Learner</span></td>
                          <td><span className="badge bg-success">Active</span></td>
                          <td>01 Feb 2026</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil"></i></button>
                            <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                          </td>
                        </tr>
                        <tr>
                          <td>Rahul Verma</td>
                          <td>rahul@trade.com</td>
                          <td><span className="badge bg-info">Instructor</span></td>
                          <td><span className="badge bg-success">Active</span></td>
                          <td>29 Jan 2026</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil"></i></button>
                            <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                          </td>
                        </tr>
                        <tr>
                          <td>Sarah Lee</td>
                          <td>sarah@mail.com</td>
                          <td><span className="badge bg-primary">Learner</span></td>
                          <td><span className="badge bg-warning">Pending</span></td>
                          <td>28 Jan 2026</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil"></i></button>
                            <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                          </td>
                        </tr>
                        <tr>
                          <td>Admin</td>
                          <td>admin@platform.com</td>
                          <td><span className="badge bg-dark">Admin</span></td>
                          <td><span className="badge bg-success">Active</span></td>
                          <td>15 Jan 2026</td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary" disabled>
                              <i className="bi bi-shield-lock"></i>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td>John Carter</td>
                          <td>john@crypto.com</td>
                          <td><span className="badge bg-info">Instructor</span></td>
                          <td><span className="badge bg-danger">Blocked</span></td>
                          <td>12 Jan 2026</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil"></i></button>
                            <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
