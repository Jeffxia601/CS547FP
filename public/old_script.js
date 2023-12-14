document.addEventListener('DOMContentLoaded', function() {
  fetchDataAndLoadModules();

  document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      search();
    }
  });
});

function fetchDataAndLoadModules() {
  fetch('/api/books')
    .then(response => response.json())
    .then(books => {
      console.log('Books:', books);
      loadModule('guessYouLike', books.slice(0, 10));
      loadModule('topRated', [...books].sort((a, b) => b.rating - a.rating).slice(0, 10));
    })
    .catch(error => console.error('Error fetching books:', error));

  fetch('/api/authors')
    .then(response => response.json())
    .then(authors => {
      loadModule('popularAuthors', authors.slice(0, 10));
    })
    .catch(error => console.error('Error fetching authors:', error));
}

function loadModule(moduleId, items) {
  const moduleElement = document.getElementById(moduleId);
  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    if (moduleId === 'popularAuthors') {
      itemDiv.textContent = item.name;
      itemDiv.onclick = () => window.location.href = `/author/${encodeURIComponent(item.name)}`;
    } else {
      itemDiv.textContent = `${item.title} by ${item.author}`;
      itemDiv.onclick = () => window.location.href = `/book/${item.id}`;
    }
    moduleElement.appendChild(itemDiv);
  });
}

function search() {
  const query = document.getElementById('searchInput').value;
  window.location.href = `/search?query=${encodeURIComponent(query)}`;
}
