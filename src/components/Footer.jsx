import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, useTheme } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                py: { xs: 4, sm: 5, md: 6 },
                mt: 'auto',
                px: { xs: 2, sm: 3, md: 0 }
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            About Us
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            We are dedicated to empowering individuals with financial knowledge
                            and tools to make informed investment decisions and achieve their
                            financial goals.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Contact Us
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email: info@financialapp.com
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Phone: +91 1234567890
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Address: Lashkar , Gwalior (47400x)
                            <br />
                            Madhya Pradesh, India
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Quick Links
                        </Typography>
                        <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Terms of Service
                        </Link>
                        <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Privacy Policy
                        </Link>
                        <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            FAQ
                        </Link>
                        <Link href="#" color="text.secondary" display="block">
                            Blog
                        </Link>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Follow Us
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                            <IconButton
                                aria-label="LinkedIn"
                                color="primary"
                                sx={{ mr: 1 }}
                            >
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton
                                aria-label="Twitter"
                                color="primary"
                                sx={{ mr: 1 }}
                            >
                                <TwitterIcon />
                            </IconButton>
                            <IconButton
                                aria-label="Facebook"
                                color="primary"
                                sx={{ mr: 1 }}
                            >
                                <FacebookIcon />
                            </IconButton>
                            <IconButton
                                aria-label="Instagram"
                                color="primary"
                            >
                                <InstagramIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
                <Box mt={5}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} StockSense. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;