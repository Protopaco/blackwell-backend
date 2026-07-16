import dotenv from 'dotenv';
import assertDevTestDataCommandAllowed from '../assertDevTestDataCommandAllowed.js';
import buildTestDataTemplates from '../buildTestDataTemplates.js';

dotenv.config();

assertDevTestDataCommandAllowed();

const result = await buildTestDataTemplates();
console.log(JSON.stringify(result, null, 2));
