const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const fs = require('fs').promises; // Using promises version of fs
const { parse } = require('csv-parse'); // csv-parse module

let books = [];
let authors = [];
const booksCsvPath = __dirname + '/src/data/books_c.csv';
// const booksCsvPath = __dirname + '/src/data/books_mini.csv';
// const booksCsvPath = 'books_mini.csv';
// Async function to read and parse the CSV file
async function readCsvFile(filePath) {
  try {
      const csvData = await fs.readFile(filePath, 'utf8');
      return parse(csvData, {
          columns: true,
          skip_empty_lines: true
      });
  } catch (error) {
      console.error('Error reading or parsing CSV file:', error);
      throw error;
  }
}

// Async function to process books data
async function processData() {
  try {
      const booksData = await readCsvFile(booksCsvPath);

      // Clear the books array before populating
      books.length = 0;

      // Populate the books array with additional data
      booksData.forEach(book => {
          books.push({
              id: book.ISBN,
              title: book['Book-Title'],
              author: book['Book-Author'],
              year: book['Year-Of-Publication'],
              publisher: book['Publisher'],
              imageUrl: book['Image-URL-L'],
              averageRating: parseFloat(book['Average-Rating']) || 0 // Convert to float
          });
      });

      // Generate authors data dynamically from books data, including average rating calculation
      const authorsMap = books.reduce((acc, book) => {
          const author = book.author;
          acc[author] = acc[author] || { name: author, books: [], totalRating: 0, numberOfRatings: 0 };
          
          acc[author].books.push({
              id: book.id,
              title: book.title
          });

          acc[author].totalRating += book.averageRating;
          acc[author].numberOfRatings++;

          return acc;
      }, {});

      // Calculate the average rating for each author
      for (const author in authorsMap) {
          if (authorsMap[author].numberOfRatings > 0) {
              authorsMap[author].averageRating = authorsMap[author].totalRating / authorsMap[author].numberOfRatings;
          } else {
              authorsMap[author].averageRating = 0;
          }
      }

      authors = Object.values(authorsMap).map(author => ({
          name: author.name,
          books: author.books,
          averageRating: author.averageRating.toFixed(2)
      }));

  } catch (error) {
      console.error('Error processing data:', error);
  }
}
processData();

// Serve static files from the 'public' directory
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Home page route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// API Endpoints
app.get('/api/books', async (req, res) => {
  if (books.length === 0) {
      await readBooksCsv();
  }
  res.json(books);
});

app.get('/api/authors', (req, res) => {
  res.json(authors);
});

app.get('/api/guess-you-like', (req, res) => {
  // Shuffle the array of books and take the first 10
  let SortedBooks = books.sort((a, b) => b.averageRating - a.averageRating);
  let top50kBooks = SortedBooks.slice(0, 50000);
  let shuffledBooks = top50kBooks.sort(() => 0.5 - Math.random());
  let guessYouLikeBooks = shuffledBooks.slice(0, 10);
  res.json(guessYouLikeBooks);
});

app.get('/api/top-rated', (req, res) => {
  // Sort the array of books by average rating in descending order and take the top 10
  let SortedBooks = books.sort((a, b) => b.averageRating - a.averageRating);
  let top1kBooks = SortedBooks.slice(0, 1000);
  let shuffledBooks = top1kBooks.sort(() => 0.5 - Math.random());
  let topRatedBooks = shuffledBooks.slice(0, 10);
  res.json(topRatedBooks.slice(0, 10));
});

// app.get('/search/:query', (req, res) => {
//   const query = req.params.query.toLowerCase();
  
//   // Find books and authors that match the query
//   const matchedBooks = books.filter(book => 
//     book.title.toLowerCase().includes(query)
//   );
//   const matchedAuthors = books.filter(book => 
//     book.author.toLowerCase().includes(query)
//   );

//   const response = {
//     query: query, authors: matchedAuthors, books: matchedBooks
//   };
//   console.log(response);

//   res.json(response);
// });

app.get('/search/:query', (req, res) => {
  const query = req.params.query.toLowerCase();

  const uniqueAuthors = new Set();
  const uniqueBooks = new Set();

  const matchedAuthors = books.filter(book => {
    const authorLower = book.author.toLowerCase();
    if (!uniqueAuthors.has(authorLower) && authorLower.includes(query)) {
      uniqueAuthors.add(authorLower);
      return true;
    }
    return false;
  });

  const matchedBooks = books.filter(book => {
    const titleLower = book.title.toLowerCase();
    if (!uniqueBooks.has(titleLower) && titleLower.includes(query)) {
      uniqueBooks.add(titleLower);
      return true;
    }
    return false;
  });

  const response = {
    query: query, authors: matchedAuthors, books: matchedBooks
  };

  res.json(response);
});


app.get('/book/:bookId', (req, res) => {
  const bookId = req.params.bookId;
  // console.log('Searching for book with ID:', bookId);

  // Debugging: Log the first few books to check their structure
  // console.log('Sample books:', books.slice(0, 3));

  const book = books.find(b => b.id === bookId);

  if (!book) {
    console.error('Book not found for ID:', bookId);
    res.status(404).send('Book not found');
    return;
  }

  // res.send(`<h1>${book.title}</h1><p>Author: ${book.author}</p>`);
  res.json(book);
});

// Author details route
app.get('/author/:authorName', (req, res) => {
  const authorName = req.params.authorName;
  const authorBooks = books.filter(book => book.author === authorName);
  // Send back a list of books by the author; in a real app, you would render a proper page
  // res.send(`<h1>Books by ${authorName}</h1>` + authorBooks.map(book => `<p>${book.title}</p>`).join(''));
  // Create a JSON object that includes both authorName and authorBooks
  const response = {
    authorName: authorName,
    books: authorBooks
  };

  // Send the JSON response
  res.json(response);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

