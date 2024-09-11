import React, { useState, useEffect, useCallback  } from 'react';
import ReactJson from 'react-json-view';
import './Dashboard.css'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Dashboard = () => {
    const [databases, setDatabases] = useState([]);
    const [selectedDatabase, setSelectedDatabase] = useState('');
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState('');
    const [fields, setFields] = useState([]);
    const [csvFile, setCsvFile] = useState(null);
    const [collectionName, setCollectionName] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('');
    const [filterField, setFilterField] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [limit] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDatabases();
    }, []);

    useEffect(() => {
        if (selectedCollection) {
            fetchFields();
        }
    }, [selectedCollection]);

    useEffect(() => {
        if (page > 0) {
            fetchData(page);
        }
    }, [page]);

    const fetchDatabases = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/databases`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDatabases(data);
        } catch (error) {
            console.error('Error fetching databases:', error);
            setError('Failed to fetch databases. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCollections = async (database) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/collections?database=${database}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCollections(data);
            setSelectedCollection('');
            setFields([]);
        } catch (error) {
            console.error('Error fetching collections:', error);
            setError('Failed to fetch collections. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFields = async () => {
        if (selectedCollection) {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/fields?database=${selectedDatabase}&collection_name=${selectedCollection}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setFields(data);
            } catch (error) {
                console.error('Error fetching fields:', error);
                setError('Failed to fetch fields. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const fetchData = useCallback(async (page) => {
    setIsLoading(true);
    setError(null);
    try {
        const skip = page * limit;
        const response = await fetch(`${API_URL}/sort?database=${selectedDatabase}&collection_name=${selectedCollection}&field=${sortField}&order=${sortOrder}&skip=${skip}&limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        const newData = result.data || result; 
        
        if (!Array.isArray(newData)) {
            throw new Error('Invalid data format received from the server.');
        }

        setData(prevData => [...prevData, ...newData]);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
    } finally {
        setIsLoading(false);
    }
}, [API_URL, selectedDatabase, selectedCollection, sortField, sortOrder, limit]);

    const handleLoadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handleDatabaseChange = (event) => {
        const db = event.target.value;
        setSelectedDatabase(db);
        fetchCollections(db);
    };

    const handleCollectionChange = (event) => {
        setSelectedCollection(event.target.value);
    };

    const handleFileUpload = async () => {
        if (!csvFile || !collectionName || !selectedDatabase) {
            setError("Please select a file, database, and enter a collection name.");
            return;
        }

        const formData = new FormData();
        formData.append('file', csvFile);
        formData.append('database', selectedDatabase);
        formData.append('collection_name', collectionName);

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/upload-csv`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("File uploaded successfully:", data);
            alert("File uploaded successfully!");
        } catch (error) {
            console.error('Error uploading file:', error);
            setError('Failed to upload file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/search?database=${selectedDatabase}&collection_name=${selectedCollection}&field=${searchField}&value=${searchValue}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error('Error searching data:', error);
            setError('Failed to search data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilter = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/filter?database=${selectedDatabase}&collection_name=${selectedCollection}&field=${filterField}&value=${filterValue}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error('Error filtering data:', error);
            setError('Failed to filter data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = async () => {
        setPage(0);
        setData([]); // Clear existing data
        fetchData(0);
    };

    return (
        <div className="dashboard">
            <h2 className="title">MongoDB Dashboard</h2>

            <div className="upload-section">
                <h3>Upload CSV</h3>
                <div className="form-group">
                    <select value={selectedDatabase} onChange={handleDatabaseChange}>
                        <option value="">-- Select Database --</option>
                        {databases.map((db) => (
                            <option key={db} value={db}>{db}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Collection Name"
                        value={collectionName}
                        onChange={(e) => setCollectionName(e.target.value)}
                    />

                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                    />

                    <button onClick={handleFileUpload}>Upload</button>
                </div>
            </div>

            <div className="filter-sort-section">
                <h3>Filter and Sort</h3>
                <div className="form-group">
                    <select value={selectedCollection} onChange={handleCollectionChange}>
                        <option value="">-- Select Collection --</option>
                        {collections.map((coll) => (
                            <option key={coll} value={coll}>{coll}</option>
                        ))}
                    </select>

                    <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                        <option value="">-- Select Sort Field --</option>
                        {fields.map((field) => (
                            <option key={field} value={field}>{field}</option>
                        ))}
                    </select>

                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>

                    <button onClick={handleSort}>Sort</button>

                    <input
                        type="text"
                        placeholder="Search Value"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
                        <option value="">-- Select Search Field --</option>
                        {fields.map((field) => (
                            <option key={field} value={field}>{field}</option>
                        ))}
                    </select>

                    <button onClick={handleSearch}>Search</button>

                    <input
                        type="text"
                        placeholder="Filter Value"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                    />
                    <select value={filterField} onChange={(e) => setFilterField(e.target.value)}>
                        <option value="">-- Select Filter Field --</option>
                        {fields.map((field) => (
                            <option key={field} value={field}>{field}</option>
                        ))}
                    </select>

                    <button onClick={handleFilter}>Filter</button>
                </div>
            </div>

            <div className="data-section">
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <ReactJson src={data} />
                )}

                {data.length > 0 && (
                    <button onClick={handleLoadMore} className="load-more-button">Load More</button>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
