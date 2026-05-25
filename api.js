const API = {
    // ⚠️ CORRECTED: Added (username, password) as arguments here
    login: async (username, password) => {
        try {
            const response = await fetch(window.BASE_URL + 'UserDetailes/login.php', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json();
        } catch (error) {
            console.error('API Login Error:', error);
            throw error;
        }
    },

    insertData: async (username, allDatas12, totalLoadCAmount, totalLoadCQty = 0, advancrDrawTime = "") => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/InsertData.php', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({
                    username,
                    all_datas12: allDatas12,
                    total_load_c_amount: totalLoadCAmount,
                    total_load_c_qty: totalLoadCQty,
                    advancr_draw_time: advancrDrawTime
                })
            });
            return await response.json();
        } catch (error) {
            console.error('API InsertData Error:', error);
            throw error;
        }
    },

    getPreviousBetHistory: async (username) => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/PreviousBetHistory.php?username=' + encodeURIComponent(username));
            return await response.json();
        } catch (error) {
            console.error('API getPreviousBetHistory Error:', error);
            throw error;
        }
    },

    getTimer: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/Timer.php');
            return await response.json();
        } catch (error) {
            console.error('API getTimer Error:', error);
            throw error;
        }
    },

    logout: async (id) => {
        try {
            const response = await fetch(window.BASE_URL + 'UserDetailes/logout.php', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ id })
            });
            return await response.json();
        } catch (error) {
            console.error('API Logout Error:', error);
            throw error;
        }
    },

    getResult: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/Result.php');
            return await response.json();
        } catch (error) {
            console.error('API getResult Error:', error);
            throw error;
        }
    },

    getResultLast6: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/ResultLast6.php');
            return await response.json();
        } catch (error) {
            console.error('API getResultLast6 Error:', error);
            throw error;
        }
    },

    getBalance: async (username) => {
        try {
            const response = await fetch(window.BASE_URL + 'UserDetailes/balance.php?username=' + encodeURIComponent(username));
            return await response.json();
        } catch (error) {
            console.error('API getBalance Error:', error);
            throw error;
        }
    },

    getBetHistory: async (username, recordDate) => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/BetHistory.php?username=' + encodeURIComponent(username) + '&record_date=' + encodeURIComponent(recordDate));
            return await response.json();
        } catch (error) {
            console.error('API getBetHistory Error:', error);
            throw error;
        }
    },

    getCurrentDrawHistory: async (username) => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/CurrentDrawBetHistory.php?username=' + encodeURIComponent(username));
            return await response.json();
        } catch (error) {
            console.error('API getCurrentDrawHistory Error:', error);
            throw error;
        }
    },

    cancelTicket: async (username, ticketId) => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/CancleTicket.php?username=' + encodeURIComponent(username) + '&id=' + encodeURIComponent(ticketId));
            return await response.json();
        } catch (error) {
            console.error('API cancelTicket Error:', error);
            throw error;
        }
    },

    getGameWiseReport: async (username, fromDate, toDate) => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/GameWiseReport.php?username=' + encodeURIComponent(username) + '&from_date=' + encodeURIComponent(fromDate) + '&to_date=' + encodeURIComponent(toDate));
            return await response.json();
        } catch (error) {
            console.error('API getGameWiseReport Error:', error);
            throw error;
        }
    },

    reprintTicket: async (username, barcodee) => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/PrintTickets.php?username=' + encodeURIComponent(username) + '&barcodee=' + encodeURIComponent(barcodee));
            return await response.json();
        } catch (error) {
            console.error('API reprintTicket Error:', error);
            throw error;
        }
    },
    

    claimTicket: async (username, barcodeNumber) => {
        try {
            const response = await fetch(window.BASE_URL + 'GwinMatka/GameApi/ClaimTickets.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, barcode_number: barcodeNumber })
            });
            return await response.json();
        } catch (error) {
            console.error('API claimTicket Error:', error);
            throw error;
        }
    }
};