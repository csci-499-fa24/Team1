const axios = require('axios');
const { Restaurants, Inspections, Locations } = require('../models'); // Import models
const cron = require('node-cron');

async function fetchNYCData() {
    const url = 'https://data.cityofnewyork.us/resource/43nn-pn8j.json'; 
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching NYC data', error);
        return [];
    }
}


async function upsertRestaurantData(data) {
    for (const item of data) {
        try {
            // Upsert Restaurant
            await Restaurants.upsert({
                camis: item.camis,
                dba: item.dba,
                boro: item.boro,
                building: item.building,
                street: item.street,
                zipcode: item.zipcode,
                phone: item.phone,
                cuisine_description: item.cuisine_description,
            });

            // Upsert Inspection
            await Inspections.upsert({
                camis: item.camis,
                inspection_date: item.inspection_date,
                action: item.action,
                violation_code: item.violation_code,
                violation_description: item.violation_description,
                critical_flag: item.critical_flag,
                score: item.score,
                grade: item.grade,
                grade_date: item.grade_date,
                inspection_type: item.inspection_type,
            });

            // Upsert Location
            await Locations.upsert({
                camis: item.camis,
                latitude: item.latitude,
                longitude: item.longitude,
                community_board: item.community_board,
                council_district: item.council_district,
                census_tract: item.census_tract,
                bin: item.bin,
                bbl: item.bbl,
                nta: item.nta,
                location_point1: `${item.latitude},${item.longitude}`,
            });

        } catch (error) {
            console.error('Error upserting data', error);
        }
    }
}



cron.schedule('* * * * *', async () => { // Runs every minute
    console.log('Cron job running every minute...');
    const data = await fetchNYCData();
    if (data.length > 0) {
        await upsertRestaurantData(data);
        console.log('Data upsert completed');
    } else {
        console.log('No new data');
    }
});
