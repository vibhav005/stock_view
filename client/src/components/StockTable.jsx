import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { IconButton, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';

const StockTable = ({
    stocks,
    sortedStocksArray,
    sortConfig,
    requestSort,
    anchorEl,
    open,
    handleClick,
    handleClose,
    handleAddStock,
    handleRemoveStock,
    handleFetchHistoricalData,
    selectedStock,
    fetchData,
    refreshInterval = 10000,
}) => {
    const [tableData, setTableData] = useState(sortedStocksArray);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchData().then(newData => {
                setTableData(newData);
            });
        }, refreshInterval);

        return () => clearInterval(intervalId);
    }, [fetchData, refreshInterval]);

    return (
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
                    {tableData.map(([stockSymbol, quoteData]) => (
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
    );
};

export default StockTable;
