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
            // Check if the restaurant already exists
            const restaurantExists = await Restaurants.findOne({ where: { camis: item.camis } });

            // Upsert Restaurant only if it doesn't exist
            if (!restaurantExists) {
                await Restaurants.create({
                    camis: item.camis,
                    dba: item.dba,
                    boro: item.boro,
                    building: item.building,
                    street: item.street,
                    zipcode: item.zipcode,
                    phone: item.phone,
                    cuisine_description: item.cuisine_description,
                });
                console.log(`Inserted new restaurant with CAMIS ${item.camis}`);
            } else {
                console.log(`Restaurant with CAMIS ${item.camis} already exists, skipping insertion.`);
            }

            // Check if there's an existing inspection for the restaurant
            const inspectionExists = await Inspections.findOne({
                where: { camis: item.camis, inspection_date: item.inspection_date, violation_code: item.violation_code } 
            });

            // Upsert Inspection only if it doesn't exist
            if (!inspectionExists) {
                await Inspections.create({
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
                console.log(`Inserted new inspection for CAMIS ${item.camis}`);
            } else {
                // If the inspection already exists, update it if the new data is more recent
                await Inspections.update({
                    action: item.action,
                    violation_code: item.violation_code,
                    violation_description: item.violation_description,
                    critical_flag: item.critical_flag,
                    score: item.score,
                    grade: item.grade,
                    grade_date: item.grade_date,
                    inspection_type: item.inspection_type,
                }, { where: { camis: item.camis, inspection_date: item.inspection_date, violation_code: item.violation_code } }); 
                console.log(`Updated inspection for CAMIS ${item.camis}`);
            }

            // Check if the location already exists
            const locationExists = await Locations.findOne({ where: { camis: item.camis } });

            // Upsert Location only if it doesn't exist
            if (!locationExists) {
                await Locations.create({
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
                console.log(`Inserted new location for CAMIS ${item.camis}`);
            } else {
                console.log(`Location for CAMIS ${item.camis} already exists, skipping insertion.`);
            }

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
