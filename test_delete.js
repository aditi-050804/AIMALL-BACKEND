// Test script to call the delete endpoint
const axios = require('axios');

const chatId = '6969d297dc3962d372499593';
const token = 'YOUR_TOKEN_HERE'; // Replace with actual token from localStorage

axios.delete(`http://localhost:8080/api/support-chat/${chatId}/messages`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
    .then(response => {
        console.log('✅ Success:', response.data);
    })
    .catch(error => {
        console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
    });
