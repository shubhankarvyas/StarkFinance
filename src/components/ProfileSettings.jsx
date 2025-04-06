import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    Alert,
    Stack,
    useTheme,
    CircularProgress,
    Divider,
    Switch,
    FormControlLabel
} from '@mui/material';
import { useUserProfile } from '../contexts/userprofilecontext';
import { useAuth } from '../contexts/AuthContext';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const ProfileSettings = ({ onClose }) => {
    const theme = useTheme();
    const { userProfile, updateProfile } = useUserProfile();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        photoURL: userProfile.photoURL || '',
        emailNotifications: userProfile.emailNotifications || false,
        marketAlerts: userProfile.marketAlerts || false,
        newsDigest: userProfile.newsDigest || false
    });

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'checkbox' ? checked : value
        }));
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setLoading(true);
                // Here you would typically upload the file to your storage service
                // and get back a URL. For now, we'll use a placeholder URL
                const photoURL = URL.createObjectURL(file);
                setFormData(prev => ({ ...prev, photoURL }));
            } catch (err) {
                setError('Failed to update profile picture');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateProfile({
                ...userProfile,
                ...formData
            });
            setSuccess('Profile updated successfully!');
            if (onClose) onClose();
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                width: '100%',
                maxWidth: 600,
                mx: 'auto',
                mt: 2,
                borderRadius: 2,
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
            }}
        >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Profile Settings
            </Typography>

            <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={formData.photoURL}
                            alt={formData.displayName}
                            sx={{ width: 80, height: 80 }}
                        >
                            {formData.displayName?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="photo-upload"
                                type="file"
                                onChange={handlePhotoChange}
                            />
                            <label htmlFor="photo-upload">
                                <IconButton
                                    color="primary"
                                    component="span"
                                    disabled={loading}
                                >
                                    <PhotoCamera />
                                </IconButton>
                            </label>
                            <Typography variant="body2" color="text.secondary">
                                Change profile picture
                            </Typography>
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        label="Display Name"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={true}
                        helperText="Email cannot be changed"
                    />

                    <Divider sx={{ my: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Notification Preferences
                        </Typography>
                    </Divider>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.emailNotifications}
                                onChange={handleChange}
                                name="emailNotifications"
                                color="primary"
                            />
                        }
                        label="Email Notifications"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.marketAlerts}
                                onChange={handleChange}
                                name="marketAlerts"
                                color="primary"
                            />
                        }
                        label="Market Alerts"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.newsDigest}
                                onChange={handleChange}
                                name="newsDigest"
                                color="primary"
                            />
                        }
                        label="Daily News Digest"
                    />

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                        {onClose && (
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={20} />}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Stack>
            </form>
        </Paper>
    );
};

export default ProfileSettings;