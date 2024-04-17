const express = require('express')
const cors = require('cors')
const pool = require('./db')

const app = express()
app.use(cors())
app.use(express.json())


app.get('/getSeats', (req, res)=>{
    pool.query(
        `select * from seat`,
        [],
        (err, results)=>{
            if(err){
                console.log("err:",err)
            }
            res.json(results)
        }
    )
})

app.post('/bookSeat', (req, res) => {
    const { id, isBooked, lockType } = req.body;
    
    // Begin transaction
    if(lockType === 'row'){
    pool.query('START TRANSACTION', (err) => {
        if (err) {
            console.log("Error starting transaction:", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }

        // Lock the row for update
        pool.query('SELECT * FROM seat WHERE id = ? FOR UPDATE', [id], (err, results) => {
            if (err) {
                console.log("Error selecting seat:", err);
                pool.query('ROLLBACK', (rollbackErr) => {
                    if (rollbackErr) {
                        console.log("Error rolling back transaction:", rollbackErr);
                    }
                    res.status(500).json({ error: "Internal server error" });
                });
                return;
            }

            if(results){
                if(results[0].isBooked){
                    pool.query('ROLLBACK', (rollbackErr) => {
                        if (rollbackErr) {
                            console.log("Error rolling back transaction:", rollbackErr);
                            res.status(500).json({ error: "Internal server error" });
                        }
                    });
                    res.json({ message: "Ticket is Already Booked" });
                    return;
                }
            }


            // Update the seat status
            pool.query('UPDATE seat SET isBooked = ? WHERE id = ?', [isBooked, id], (err, results) => {
                if (err) {
                    console.log("Error updating seat status:", err);
                    pool.query('ROLLBACK', (rollbackErr) => {
                        if (rollbackErr) {
                            console.log("Error rolling back transaction:", rollbackErr);
                        }
                        res.status(500).json({ error: "Internal server error" });
                    });
                    return;
                }

                // Commit the transaction
                pool.query('COMMIT', (err) => {
                    if (err) {
                        console.log("Error committing transaction:", err);
                        res.status(500).json({ error: "Internal server error" });
                        return;
                    }

                    res.json({ message: "Seat booking successful" });
                });
            });
        });
    });
    }
    else if(lockType === 'table'){
        pool.query('START TRANSACTION', (err) => {
            if (err) {
                console.log("Error starting transaction:", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
    
            // Lock the seat table for writing
            pool.query('LOCK TABLES seat WRITE', (err) => {
                if (err) {
                    console.log("Error locking seat table:", err);
                    pool.query('ROLLBACK', (rollbackErr) => {
                        if (rollbackErr) {
                            console.log("Error rolling back transaction:", rollbackErr);
                        }
                        res.status(500).json({ error: "Internal server error" });
                    });
                    return;
                }
    
                pool.query('SELECT * FROM seat WHERE id = ?',[id], (err, results)=>{
                    if (err) {
                        console.log("Error selecting seat:", err);
                        pool.query('ROLLBACK', (rollbackErr) => {
                            if (rollbackErr) {
                                console.log("Error rolling back transaction:", rollbackErr);
                            }
                            res.status(500).json({ error: "Internal server error" });
                        });
                        return;
                    }
                    if(results){
                        if(results[0].isBooked){
                            // Unlock the tables
                            pool.query('UNLOCK TABLES', (err) => {
                                if (err) {
                                    console.log("Error unlocking tables:", err);
                                }
                            });
                            // Rollback
                            pool.query('ROLLBACK', (rollbackErr) => {
                                if (rollbackErr) {
                                    console.log("Error rolling back transaction:", rollbackErr);
                                }
                            });
                            res.json({ message: "Ticket is Already Booked" });
                            return;
                        }
                    }
        
                // Update the seat status
                pool.query('UPDATE seat SET isBooked = ? WHERE id = ?', [isBooked, id], (err, results) => {
                    if (err) {
                        console.log("Error updating seat status:", err);
                        pool.query('ROLLBACK', (rollbackErr) => {
                            if (rollbackErr) {
                                console.log("Error rolling back transaction:", rollbackErr);
                            }
                            res.status(500).json({ error: "Internal server error" });
                        });
                        return;
                    }
    
                    // Unlock the tables
                    pool.query('UNLOCK TABLES', (err) => {
                        if (err) {
                            console.log("Error unlocking tables:", err);
                        }
    
                        // Commit the transaction
                        pool.query('COMMIT', (err) => {
                            if (err) {
                                console.log("Error committing transaction:", err);
                                res.status(500).json({ error: "Internal server error" });
                                return;
                            }
                            res.json({ message: "Seat booking successful" });
                        });
                    });
                });
            });
        });
        });
    }
});



app.listen(9000, '100.0.253.29',()=>{
    console.log("App is running on PORT: 9000")
})