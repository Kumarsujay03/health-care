import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataManagement = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState('');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('http://localhost:8000/data');
      setData(response.data);
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    const filteredData = data.filter(item => item.fieldID.includes(query));
    setData(filteredData);
  };

  const handleSort = () => {
    const sortedData = [...data].sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1));
    setData(sortedData);
  };

  const handleFilter = () => {
    const filteredData = data.filter(item => item.fieldID === filterValue);
    setData(filteredData);
  };

  return (
    <div>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by Field ID" />
      <button onClick={handleSearch}>Search</button>

      <input type="text" value={sortField} onChange={(e) => setSortField(e.target.value)} placeholder="Sort by Field" />
      <button onClick={handleSort}>Sort</button>

      <input type="text" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} placeholder="Filter by Field ID" />
      <button onClick={handleFilter}>Filter</button>

      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.fieldID}: {item.dataField}</li>
        ))}
      </ul>
    </div>
  );
};

export default DataManagement;
