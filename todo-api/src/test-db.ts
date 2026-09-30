import { query } from "./pg";

 const testConnection = async () => {
    try{
        const users = await query("SELECT * FROM users");
        console.log("Connected to PostgreSQL!");
        console.log("users in database:",users);
    } catch ( error){
        console.error("Connection failed:", error);
    }
    };

    testConnection();

