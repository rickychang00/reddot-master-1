
const crypto = require('crypto');

const SECRET_KEY = "xoHTw73DvlC5KBemyL34lucmqdCipCZjHzt6LTI55BV8K17SmvII8OUdoyfAN6QJzXBJBIzMRsaXJvhGLBGTgDzqiZVMV6ifDfl6YSayE9k5R9SDubtvkdmwbDaRmI3N";

const data = {
    transaction_id: "VERIFY_TEST_" + Date.now(),
    response_code: "0",
    amount: "50",
    payer_name: "John Doe",
    payer_id: "P123456789_SUCCESS_TEST",
    recurring_mod: "2",
    order_id: "123"
};

const sortedKeys = Object.keys(data)
    .filter(key => data[key] !== undefined && data[key] !== null && String(data[key]) !== "")
    .sort();

let signString = "";
for (const key of sortedKeys) {
    signString += String(data[key]);
}

const stringToHash = signString + SECRET_KEY;
const signature = crypto.createHash("sha512").update(stringToHash).digest("hex").toLowerCase();
data.signature = signature;

fetch('http://localhost:9002/api/payment/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
    .then(res => res.json())
    .then(json => console.log("Response:", JSON.stringify(json, null, 2)))
    .catch(err => console.error("Error:", err));
