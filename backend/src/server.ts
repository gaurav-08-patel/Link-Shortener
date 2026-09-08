import express from 'express';
import dotenv from 'dotenv';

dotenv.config({quiet: true});


let app = express();




app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
