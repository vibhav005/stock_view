import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Button, Card, CircularProgress, Grid, IconButton, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { addStock, fetchHistoricalData, fetchStocks, fetchStocksBySymbol, removeStock } from '../services/api';
import StockChart from './StockChart';

function StockList() {
    const [stocks, setStocks] = useState({});
    const [loading, setLoading] = useState(true);
    const [stockSymbols, setStockSymbols] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [historicalData, setHistoricalData] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const open = Boolean(anchorEl);
    const date = new Date();

    const handleClick = (event, stockSymbol) => {
        setAnchorEl(event.currentTarget);
        setSelectedStock(stockSymbol);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedStock(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchStocks();
                setStocks(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFormSubmit = async event => {
        event.preventDefault();
        setLoading(true);
        try {
            const data = await fetchStocksBySymbol(stockSymbols);
            setStocks(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleAddStock = async (event, symbol) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            const data = await addStock(symbol);
            alert(data.message);
            const newStocks = await fetchStocks();
            setStocks(newStocks);
        } catch (error) {
            console.error(error);
            alert('Failed to add stock.');
        }
    };

    const handleRemoveStock = async (event, symbol) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            const data = await removeStock(symbol);
            alert(data.message);
            const newStocks = await fetchStocks();
            setStocks(newStocks);
        } catch (error) {
            console.error(error);
            alert('Failed to remove stock.');
        }
    };

    const handleFetchHistoricalData = async (event, symbol) => {
        event.preventDefault();
        event.stopPropagation();
        setLoading(true);
        try {
            const data = await fetchHistoricalData(symbol, "2002-05-11", date.toLocaleDateString("en-CA"));
            setHistoricalData(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const requestSort = key => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedStocksArray = Object.entries(stocks).sort((a, b) => {
        if (sortConfig.direction === 'asc') {
            return a[1][sortConfig.key] - b[1][sortConfig.key];
        } else {
            return b[1][sortConfig.key] - a[1][sortConfig.key];
        }
    });

    return (
        <Card style={{ margin: '5px', padding: '10px' }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h1>Stock Quotes</h1>
                </Grid>
                <Grid item xs={12} md={5}>
                    <form onSubmit={handleFormSubmit}>
                        <label htmlFor="stock_symbol">Enter the stock symbol(s) (e.g., TCS, INFY): </label>
                        <input
                            type="text"
                            id="stock_symbol"
                            value={stockSymbols}
                            onChange={e => setStockSymbols(e.target.value)}
                            required
                        />
                        <Button type="submit">Get Quote</Button>
                    </form>
                    <hr />
                    {loading ? (
                        <CircularProgress color="inherit" />
                    ) : (
                        <TableContainer component={Paper} style={{ height: 400, overflow: 'auto' }}>
                            <Table sx={{ width: 400 }} aria-label="stock table">
                                <TableHead>
                                    <TableRow>
                                        {[
                                            'Stock Symbol',
                                            'CMP',
                                            'Previous Close',
                                            'Open',
                                            'Close',
                                            'LowerCP',
                                            'UpperCP',
                                            'Intraday(HMIN)',
                                            'Intraday(HMAX)',
                                            'Intraday(HVALUE)',
                                            'Actions',
                                        ].map((head) => (
                                            <TableCell key={head} onClick={() => requestSort(head)} style={{ cursor: 'pointer' }}>
                                                {head} {sortConfig.key === head && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedStocksArray.map(([stockSymbol, quoteData]) => (
                                        <TableRow key={stockSymbol}>
                                            <TableCell>{stockSymbol}</TableCell>
                                            <TableCell>{quoteData.CMP}</TableCell>
                                            <TableCell>{quoteData['Previous Close']}</TableCell>
                                            <TableCell>{quoteData.Open}</TableCell>
                                            <TableCell>{quoteData.Close}</TableCell>
                                            <TableCell>{quoteData['Lower Circuit Price']}</TableCell>
                                            <TableCell>{quoteData['Upper Circuit Price']}</TableCell>
                                            <TableCell>{quoteData['Intraday High/Low'].Min}</TableCell>
                                            <TableCell>{quoteData['Intraday High/Low'].Max}</TableCell>
                                            <TableCell>{quoteData['Intraday High/Low'].Value}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    aria-label="more"
                                                    aria-controls="long-menu"
                                                    aria-haspopup="true"
                                                    onClick={(event) => handleClick(event, stockSymbol)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                    id="long-menu"
                                                    anchorEl={anchorEl}
                                                    keepMounted
                                                    open={open}
                                                    onClose={handleClose}
                                                    PaperProps={{
                                                        style: {
                                                            maxHeight: 48 * 4.5,
                                                            width: '20ch',
                                                        },
                                                    }}
                                                >
                                                    <MenuItem onClick={(event) => handleAddStock(event, selectedStock)}>
                                                        <AddCircleOutlineIcon /> Add
                                                    </MenuItem>
                                                    <MenuItem onClick={(event) => handleRemoveStock(event, selectedStock)}>
                                                        <RemoveCircleOutlineIcon /> Remove
                                                    </MenuItem>
                                                    <MenuItem onClick={(event) => handleFetchHistoricalData(event, selectedStock)}>
                                                        <DataUsageIcon /> Fetch Data
                                                    </MenuItem>
                                                </Menu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Grid>
                <Grid item xs={12} md={7}>
                    {historicalData && <StockChart stockData={historicalData} />}
                </Grid>
            </Grid>
        </Card>
    );
}

export default StockList;
