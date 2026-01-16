function doGet(e) {
  return HtmlService.createHtmlOutput(`
    <html>
      <head>
        <title>Member Registration</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
          body { font-family: sans-serif; background: #f8f8f8; margin: 0; padding: 0; }
          .container { max-width: 400px; margin: 2em auto; background: #fff; padding: 2em; border-radius: 10px; box-shadow: 0 2px 8px #ccc; }
          h1 { font-size: 1.5em; text-align: center; }
          input, button { width: 100%; font-size: 1.2em; margin: 1em 0; padding: 0.7em; border-radius: 5px; border: 1px solid #ccc; }
          button { background: #007bff; color: #fff; border: none; font-weight: bold; }
          .msg { text-align: center; font-size: 1.1em; margin: 1em 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Member Registration</h1>
          <form id="regForm">
            <input type="text" id="fullName" name="fullName" placeholder="Full Name" required>
            <button type="submit">Search & Register</button>
          </form>
          <div class="msg" id="msg"></div>
        </div>
        <script>
          document.getElementById('regForm').onsubmit = async function(e) {
            e.preventDefault();
            var fullName = document.getElementById('fullName').value.trim();
            if (!fullName) {
              document.getElementById('msg').textContent = 'Please enter full name';
              return;
            }
            document.getElementById('msg').textContent = 'Searching...';
            var res = await fetch(window.location.href, {
              method: 'POST',
              body: JSON.stringify({action: 'search', full_name: fullName})
            });
            var data = await res.json();
            if (!data.found) {
              document.getElementById('msg').textContent = 'Member not found';
              return;
            }
            if (data.registered === 'YES') {
              document.getElementById('msg').textContent = 'Already registered';
              return;
            }
            document.getElementById('msg').textContent = 'Registering...';
            var regRes = await fetch(window.location.href, {
              method: 'POST',
              body: JSON.stringify({action: 'register', full_name: fullName})
            });
            var regData = await regRes.json();
            if (!regData.success) {
              document.getElementById('msg').textContent = regData.message || 'Registration failed';
              return;
            }
            document.getElementById('msg').textContent = 'Registration successful!';
          };
        </script>
      </body>
    </html>
  
  `);
}
