import React from 'react';
import { Box } from '@mui/material';

const TabPanel = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            hidden={value !== index}
            {...other}
            style={{ display: value !== index ? 'none' : 'block' }}
        >
            <Box sx={{ py: 2 }}>
                {children}
            </Box>
        </div>
    );
};

export default TabPanel;