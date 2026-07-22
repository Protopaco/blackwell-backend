import dotenv from 'dotenv';
import assertDevTestDataCommandAllowed from '../assertDevTestDataCommandAllowed.js';
import resetDevTestData from '../resetDevTestData.js';

dotenv.config();

assertDevTestDataCommandAllowed();

const result = await resetDevTestData();
console.log(JSON.stringify(result, null, 2));
