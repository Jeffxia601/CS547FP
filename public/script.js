document.addEventListener('DOMContentLoaded', function() {
  fetchDataAndLoadModule('/api/guess-you-like', 'guessYouLike');
  fetchDataAndLoadModule('/api/top-rated', 'topRated');

  document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          search();
      }
  });
});

function fetchDataAndLoadModule(apiEndpoint, moduleName) {
  fetch(apiEndpoint)
      .then(response => response.json())
      .then(data => {
          loadModule(moduleName, data);
      })
      .catch(error => console.error(`Error fetching data from ${apiEndpoint}:`, error));
}



function loadModule(moduleId, items) {
  const moduleElement = document.getElementById(moduleId);
  items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      itemDiv.style.display = 'flex';
      itemDiv.style.flexDirection = 'column';
      itemDiv.style.alignItems = 'center';
      itemDiv.style.marginBottom = '10px';

      // Create an image element and set its source to the book's image URL
      const img = document.createElement('img');
      img.src = item.imageUrl;
      // console.log(img.src)
      img.alt = `Cover of ${item.title}`;
      // console.log(img.alt)
      img.className = 'book-image'; // Add a class for styling
      img.style.width = '100%';
      img.style.maxWidth = '200px';
      img.style.marginBottom = '5px';

      // Append the image to the itemDiv
      itemDiv.appendChild(img);

      // Create a container for the text to keep it on a separate line
      const textContainer = document.createElement('div');
      textContainer.style.display = 'flex'; // Use flexbox layout
      textContainer.style.flexDirection = 'column'; // Stack children vertically
      textContainer.style.alignItems = 'center'; // Center-align items

      // // Adding the text information
      const titleLink = document.createElement('a');
      // titleLink.href = '/book/${item.id}';
      titleLink.href = `book.html?bookId=${item.id}`;
      titleLink.textContent = item.title;
      titleLink.className = 'title';
      titleLink.style.textAlign = 'center';
      itemDiv.appendChild(titleLink);

      itemDiv.appendChild(document.createTextNode(' by '));

      const authorLink = document.createElement('a');
      authorLink.href = `author.html?authorName=${item.author}`;
      // authorLink.href = `/author/${item.author}`;
      
      authorLink.textContent = item.author;
      authorLink.className = 'author';
      authorLink.style.textAlign = 'center';
      itemDiv.appendChild(authorLink);

      const ratingDiv = document.createElement('div');
      ratingDiv.textContent = `Rating: ${item.averageRating}`;
      ratingDiv.className = 'average-rating'; // Add a class for styling
      ratingDiv.style.textAlign = 'center';
      itemDiv.appendChild(ratingDiv);

      itemDiv.appendChild(textContainer);

      // itemDiv.onclick = () => window.location.href = `book.html?bookId=${item.id}`;
      moduleElement.appendChild(itemDiv);
  });
}
  
function search() {
  const query = document.getElementById('searchInput').value;
  window.location.href = `/search?query=${encodeURIComponent(query)}`;
  window.location.href = `result.html?query=${query}`;
}