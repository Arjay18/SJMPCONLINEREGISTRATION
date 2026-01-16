<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Member Registration</title>
    <style>
        body { font-family: sans-serif; background: #f8f8f8; }
        .container { max-width: 400px; margin: 2em auto; background: #fff; padding: 2em; border-radius: 10px; }
        input, button { width: 100%; font-size: 1.2em; margin: 1em 0; padding: 0.7em; }
        button { background: #007bff; color: #fff; border: none; }
    </style>
</head>
<body>
<div class="container">
    <h1>Member Registration</h1>
    <form id="regForm">
        <input type="text" name="full_name" id="full_name" placeholder="Full Name" required>
        <button type="submit">Search & Register</button>
    </form>
    <div id="msg"></div>
    <pre id="coupon" style="display:none"></pre>
    <button id="printBtn" style="display:none">Print Coupon</button>
    <button id="pdfBtn" style="display:none">Download PDF</button>
</div>
<script>
document.getElementById('regForm').onsubmit = async function(e) {
    e.preventDefault();
    let fullName = document.getElementById('full_name').value.trim();
    if (!fullName) return showMsg('Please enter full name');
    showMsg('Searching...');
    let res = await fetch('/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}'},
        body: JSON.stringify({full_name: fullName})
    });
    let data = await res.json();
    if (data.status === 'not_found') return showMsg('Member not found');
    if (data.status === 'already_registered') return showMsg('Already registered');
    if (data.status === 'registered') {
        showMsg('Registration successful!');
        showCoupon(fullName, data.registered_at, data.coupon_no);
    }
};

function showMsg(msg) {
    document.getElementById('msg').textContent = msg;
    document.getElementById('coupon').style.display = 'none';
    document.getElementById('printBtn').style.display = 'none';
    document.getElementById('pdfBtn').style.display = 'none';
}

function showCoupon(name, date, id) {
    let couponText = `\n--------------------------------\n  MEMBER REGISTRATION COUPON\n--------------------------------\n  Name: ${name}\n  Date: ${date}\n  Coupon No: ${id}\n--------------------------------\n  THANK YOU\n--------------------------------\n    `;
    document.getElementById('coupon').textContent = couponText;
    document.getElementById('coupon').style.display = '';
    document.getElementById('printBtn').style.display = '';
    document.getElementById('pdfBtn').style.display = '';
    // Optionally trigger Bluetooth print here
}
</script>
</body>
</html>
