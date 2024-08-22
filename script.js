document.getElementById("search-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const topic = document.getElementById("search-input").value;
  
    if (!topic) {
      alert("Please enter a search topic");
      return;
    }
  
    try {
      const response = await fetch('/api/meme-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
  
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
  
      document.getElementById("meme-image").src = url;
      document.getElementById("result").style.display = 'block';
    } catch (error) {
      console.error('Error generating meme:', error);
    }
  });