import fetch from 'node-fetch';
import { currentDBURL } from '../network_utilities/setDBUrl';

export const fetchData = async (endpoint) => {
    let url = currentDBURL + endpoint; // Use the current database URL
    
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === '200') {
        return { status: '200', data: data.data };
        } else {
        return { status: '202', data: data.data };
        }
    };