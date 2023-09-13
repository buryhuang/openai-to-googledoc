import axios from 'axios';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const googleRefreshToken = process.env.REACT_APP_GOOGLE_REFRESH_TOKEN;

const refreshToken = async () => {
    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', null, {
            params: {
                client_id: googleClientId,
                client_secret: googleClientSecret,
                refresh_token: googleRefreshToken,
                grant_type: 'refresh_token',
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error refreshing token', error);
    }
};

export const createGoogleDoc = async (text) => {
    try {
        let accessToken = process.env.REACT_APP_GOOGLE_ACCESS_TOKEN;

        const response = await axios.post('https://docs.googleapis.com/v1/documents',
            text,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

        return response.data;
    } catch (error) {
        if (error.response.status === 401) {
            // Token expired, refresh it
            const accessToken = await refreshToken();
            const response = await axios.post('https://docs.googleapis.com/v1/documents',
                text,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
            return createGoogleDoc(text);
        }
        console.error('Error creating Google Doc', error);
    }
};
