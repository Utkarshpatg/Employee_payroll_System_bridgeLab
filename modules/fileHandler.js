const fs = require('fs').promises;
const path = require('path');

const FILE_PATH = path.join(__dirname, '../employees.json');

async function readEmployees() {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file doesn't exist, return empty array
            return [];
        }
        console.error('Error reading employees file:', error);
        throw error;
    }
}

async function writeEmployees(employees) {
    try {
        await fs.writeFile(FILE_PATH, JSON.stringify(employees, null, 2));
    } catch (error) {
        console.error('Error writing employees file:', error);
        throw error;
    }
}

module.exports = {
    readEmployees,
    writeEmployees
};
