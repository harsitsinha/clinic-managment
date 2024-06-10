import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useTable } from 'react-table';
import './App.css';
import SearchPage from './SearchPage'; // Make sure to import the SearchPage component
import Dashboard from './Dashboard';
import LockScreen from './LockScreen';

// Modal Component
const Modal = ({ show, onClose, patient, onSave, onDelete }) => {
  const [formData, setFormData] = useState(patient);

  useEffect(() => {
    setFormData(patient);
  }, [patient]); 

  if (!show) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    onDelete(formData.id);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Patient</h2>
        <div className="form-row">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
          <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" />
        </div>
        <div className="form-row">
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input id = "address-input" type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
        </div>
        <div className="form-row">
          <input type="text" name="referredBy" value={formData.referredBy} onChange={handleChange} placeholder="Referred By" />
        </div>
        <div className="form-row">
          <input type="date" name="date" value={formData.date} onChange={handleChange} />
          <input type="date" name="validityDate" value={formData.validityDate} onChange={handleChange} />
        </div>
        <div className="form-row">
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Amount (₹)" />
        </div>
        <div className="form-row">
          <button onClick={handleSave}>Save</button>
          <button id='edit-delete'onClick={handleDelete}>Delete</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    address: '',
    referredBy: '',
    date: new Date().toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMode: 'cash',
    amount: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState({});

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    setPatient((prevPatient) => ({
      ...prevPatient,
      validityDate: new Date(new Date(prevPatient.date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }));
  }, [patient.date]);

  const fetchPatients = async () => {
    try {
      const q = query(collection(db, 'patients'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const patientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(patientsList);
    } catch (error) {
      console.error("Error fetching patients: ", error);
    }
  };

  const formatDateString = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  const displayDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const addPatient = async () => {
    if (patient.name && patient.age && patient.gender && patient.address && patient.date && patient.validityDate && patient.paymentMode && patient.amount && patient.referredBy) {
      try {
        await addDoc(collection(db, 'patients'), {
          ...patient,
          date: formatDateString(patient.date),
          validityDate: formatDateString(patient.validityDate)
        });
        setPatient({
          name: '',
          age: '',
          gender: 'Male',
          address: '',
          referredBy: '',
          date: new Date().toISOString().split('T')[0],
          validityDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paymentMode: 'cash',
          amount: ''
        });
        fetchPatients();
      } catch (error) {
        console.error("Error adding patient: ", error);
      }
    } else {
      alert("Please fill out all fields.");
    }
  };

  const updatePatient = async (updatedPatient) => {
    try {
      const patientDoc = doc(db, 'patients', updatedPatient.id);
      await updateDoc(patientDoc, updatedPatient);
      fetchPatients();
    } catch (error) {
      console.error("Error updating patient: ", error);
    }
  };

  const deletePatient = async (patientId) => {
    try {
      await deleteDoc(doc(db, 'patients', patientId));
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient: ", error);
    }
  };

  const printPatientDetails = (patient) => {
    const printContents = `
      <div style="padding-top: 100px; position: relative;">
        <div style="position: absolute; left: 0; top: 100px;">
          <strong>Referred By</strong> ${patient.referredBy}
        </div>
        <div style="position: absolute; right: 0; top: 100px;">
          <strong>Date</strong> ${displayDate(patient.date)} <strong>Valid Until</strong> ${displayDate(patient.validityDate)}
        </div>
        <div style="position: absolute; left: 0; top: 140px;">
          <strong>Name</strong> ${patient.name}
        </div>
        <div style="position: absolute; left: 0; top: 160px;">
          <strong>Age</strong> ${patient.age}
        </div>
        <div style="position: absolute; left: 40%; transform: translateX(-50%); top: 160px;">
          <strong>Sex</strong> ${patient.gender}
        </div>
        <div style="position: absolute; left: 70%; top: 160px;">
          <strong>Address</strong> ${patient.address}
        </div>
      </div>
    `;
    const originalContents = document.body.innerHTML;
    const originalTitle = document.title;

    document.body.innerHTML = printContents;
    document.title = "Patient Details";
    window.print();

    document.body.innerHTML = originalContents;
    document.title = originalTitle;
    window.location.reload();
  };

  const printReceipt = (patient) => {
    const printContents = `
      <div style="padding-top: 50px; text-align: center;">
        <h2>Dr. Rajiv Sinha's Gastro Clinic (SAMAGAM)</h2>
        <p>Beside Durga Bari, Raja SN Road, Masakchak, Manik Sarkar Chowk<br>Bhagalpur, Bihar 812001</p>
        <h3>Receipt</h3>
        <div style="text-align: left; padding-left: 20px;">
          <p><strong>Patient Name:</strong> ${patient.name}</p>
          <p><strong>Date:</strong> ${displayDate(patient.date)}</p>
          <p><strong>Amount Paid:</strong> ₹${patient.amount}</p>
          <p><strong>Payment Mode:</strong> ${patient.paymentMode}</p>
          <p><strong>Referred By:</strong> ${patient.referredBy}</p>
        </div>
        <div style="text-align: left; padding-left: 20px; padding-top: 50px;">
          <p>___________________________</p>
          <p>Signature</p>
        </div>
      </div>
    `;
    const originalContents = document.body.innerHTML;
    const originalTitle = document.title;

    document.body.innerHTML = printContents;
    document.title = "Payment Receipt";
    window.print();

    document.body.innerHTML = originalContents;
    document.title = originalTitle;
    window.location.reload();
  };

  const printAllPatients = () => {
    const currentDate = formatDateString(new Date().toISOString().split('T')[0]);
    const patientsForToday = patients.filter(patient => patient.date === currentDate);

    let printContents = `
      <div>
        <h2>All Patients for ${currentDate}</h2>
        <table border="1" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Address</th>
              <th>Referred By</th>
              <th>Payment Mode</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
    `;

    patientsForToday.forEach(patient => {
      printContents += `
        <tr>
          <td>${patient.name}</td>
          <td>${patient.age}</td>
          <td>${patient.gender}</td>
          <td>${patient.address}</td>
          <td>${patient.referredBy}</td>
          <td>${patient.paymentMode}</td>
          <td>₹${patient.amount}</td>
        </tr>
      `;
    });

    printContents += `
          </tbody>
        </table>
      </div>
    `;

    const originalContents = document.body.innerHTML;
    const originalTitle = document.title;

    document.body.innerHTML = printContents;
    document.title = "All Patients for Today";
    window.print();

    document.body.innerHTML = originalContents;
    document.title = originalTitle;
    window.location.reload();
  };

  const handleEdit = (patient) => {
    setCurrentPatient(patient);
    setShowModal(true);
  };

  const handleSave = (updatedPatient) => {
    updatePatient(updatedPatient);
    setShowModal(false);
  };

  const columns = React.useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Age', accessor: 'age' },
      { Header: 'Gender', accessor: 'gender' },
      { Header: 'Address', accessor: 'address' },
      { Header: 'Referred By', accessor: 'referredBy' },
      { Header: 'Date', accessor: 'date', Cell: ({ value }) => displayDate(value) },
      { Header: 'Valid Until', accessor: 'validityDate', Cell: ({ value }) => displayDate(value) },
      { Header: 'Payment Mode', accessor: 'paymentMode' },
      { Header: 'Amount', accessor: 'amount' },
      
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <div>
            <button onClick={() => printPatientDetails(row.original)}>Print Report</button>
            <button onClick={() => printReceipt(row.original)}>Print Receipt</button>
            <button onClick={() => handleEdit(row.original)}>Edit</button>
          </div>
        )
      }
    ],
    []
  );

  const data = React.useMemo(() => patients, [patients]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search">Search Patients</Link></li>
            <li><Link to="/dashboard">Analytics Dashboard</Link></li>
            {/* <button id = "lock-button">
            <Link to="/lock">Lock</Link>
          </button> */}
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={
            <div>
              <h1>Clinic Management</h1>
              <div className="form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Name"
                    value={patient.name}
                    onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={patient.age}
                    onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <select
                    value={patient.gender}
                    onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Address"
                    value={patient.address}
                    onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Referred By"
                    value={patient.referredBy}
                    onChange={(e) => setPatient({ ...patient, referredBy: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="date"
                    value={patient.date}
                    onChange={(e) => setPatient({ ...patient, date: e.target.value })}
                  />
                  <input
                    type="date"
                    value={patient.validityDate}
                    onChange={(e) => setPatient({ ...patient, validityDate: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <select
                    value={patient.paymentMode}
                    onChange={(e) => setPatient({ ...patient, paymentMode: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={patient.amount}
                    onChange={(e) => setPatient({ ...patient, amount: e.target.value })}
                  />
                </div>
                <button onClick={addPatient}>Add Patient</button>
              </div>
              <div className="patient-list">
                <div className="patient-header">
                  <h2>All Patients</h2>
                  <br/>
                  <button id="print-all-button" onClick={printAllPatients}>Print All</button>
                </div>
                <div className="table-container" id="patientTable">
                  <table {...getTableProps()} className="table">
                    <thead>
                      {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                          {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                      {rows.map(row => {
                        prepareRow(row);
                        return (
                          <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                              <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                patient={currentPatient}
                onSave={handleSave}
                onDelete={deletePatient}
              />
            </div>
          } />
          <Route path="/search" element={<SearchPage patients={patients} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lock" element={<LockScreen />} />
          <Route path="/" element={<LockScreen />} /> {/* Redirect to lock screen initially */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
