import React, { useState } from 'react';
import { useTable } from 'react-table';

const SearchPage = ({ patients }) => {
  const [filters, setFilters] = useState({
    name: '',
    date: '',
    referredBy: '',
    amount: '',
    paymentMode: '',
    gender: '',
    age: '',
    address: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredPatients = patients.filter((patient) => {
    return (
      (!filters.name || patient.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.date || patient.date === filters.date) &&
      (!filters.referredBy || patient.referredBy.toLowerCase().includes(filters.referredBy.toLowerCase())) &&
      (!filters.amount || patient.amount.toString() === filters.amount) &&
      (!filters.paymentMode || patient.paymentMode.toLowerCase().includes(filters.paymentMode.toLowerCase())) &&
      (!filters.gender || patient.gender.toLowerCase().includes(filters.gender.toLowerCase())) &&
      (!filters.age || patient.age.toString() === filters.age) &&
      (!filters.address || patient.address.toLowerCase().includes(filters.address.toLowerCase()))
    );
  });

  const columns = React.useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Age', accessor: 'age' },
      { Header: 'Gender', accessor: 'gender' },
      { Header: 'Address', accessor: 'address' },
      { Header: 'Referred By', accessor: 'referredBy' },
      { Header: 'Date', accessor: 'date' },
      { Header: 'Valid Until', accessor: 'validityDate' },
      { Header: 'Payment Mode', accessor: 'paymentMode' },
      { Header: 'Amount', accessor: 'amount' }
    ],
    []
  );

  const data = React.useMemo(() => filteredPatients, [filteredPatients]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <div className="search-container">
      <h1>Search Patients</h1>
      <form className="search-form">
        <input
          type="text"
          name="name"
          placeholder="Search by Name"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="date"
          placeholder="dd/mm/yyyy"
          value={filters.date}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="referredBy"
          placeholder="Search by Referred By"
          value={filters.referredBy}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="amount"
          placeholder="Search by Amount"
          value={filters.amount}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="paymentMode"
          placeholder="Search by Amount Type"
          value={filters.paymentMode}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="gender"
          placeholder="Search by Sex"
          value={filters.gender}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="age"
          placeholder="Search by Age"
          value={filters.age}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Search by Address"
          value={filters.address}
          onChange={handleFilterChange}
        />
      </form>
      <div className="search-results">
        <div className="table-container">
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
    </div>
  );
};

export default SearchPage;
