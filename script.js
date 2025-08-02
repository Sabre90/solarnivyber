document.getElementById('calcForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const location = document.getElementById('location').value;
    const houseType = document.getElementById('houseType').value;
    const consumption = document.getElementById('consumption').value;
    const battery = document.getElementById('battery').value;
    const heatPump = document.getElementById('heatPump').value;
    const email = document.getElementById('email').value;
  
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').innerHTML = '';
  
    const payload = {
      location,
      houseType,
      consumption,
      battery,
      heatPump,
      email
    };
  
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  
    const data = await response.json();
    document.getElementById('loading').style.display = 'none';
  
    if (data.error) {
      document.getElementById('result').innerHTML = `<p style="color:red;">Chyba: ${data.error}</p>`;
      return;
    }
  
    document.getElementById('result').innerHTML = `<pre>${data.result}</pre>`;
  });