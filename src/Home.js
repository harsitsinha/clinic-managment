// Home.js
import React from 'react';

const Home = () => {
  return (
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
  );
};

export default Home;
