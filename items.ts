// Import the required modules
import http from 'http';
import fs from 'fs';
import path from 'path';

// Define the path to the JSON file
const storePath = path.join(__dirname, 'store.json');

// Define a helper function to read data from the JSON file
const readStore = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(storePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

// Define a helper function to write data to the JSON file
const writeStore = (data: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(storePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Create a server instance
const server = http.createServer(async (req, res) => {
  // Get the request method and url
  const method = req.method;
  const url = req.url;

  // Set the response headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle the preflight request
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle the GET request
  if (method === 'GET' && url === '/items') {
    try {
      // Read the data from the JSON file
      const data = await readStore();
      // Send the data as the response
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      // Handle any errors
      res.statusCode = 500;
      res.end(JSON.stringify({ message: err.message }));
    }
    return;
  }

  // Handle the POST request
  if (method === 'POST' && url === '/items') {
    try {
      // Get the request body
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        // Parse the request body as JSON
        const item = JSON.parse(body);
        // Read the data from the JSON file
        const data = await readStore();
        // Generate a random id for the new item
        const id = Math.floor(Math.random() * 1000000);
        // Add the new item to the data
        data.items.push({ id, ...item });
        // Write the data to the JSON file
        await writeStore(data);
        // Send the new item as the response
        res.statusCode = 201;
        res.end(JSON.stringify({ id, ...item }));
      });
    } catch (err) {
      // Handle any errors
      res.statusCode = 500;
      res.end(JSON.stringify({ message: err.message }));
    }
    return;
  }

  // Handle the PUT request
  if (method === 'PUT' && url.startsWith('/items/')) {
    try {
      // Get the request body
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        // Parse the request body as JSON
        const item = JSON.parse(body);
        // Get the id from the url
        const id = parseInt(url.split('/')[2]);
        // Read the data from the JSON file
        const data = await readStore();
        // Find the index of the item to update
        const index = data.items.findIndex((i: any) => i.id === id);
        // Update the item if found
        if (index !== -1) {
          data.items[index] = { id, ...item };
          // Write the data to the JSON file
          await writeStore(data);
          // Send the updated item as the response
          res.statusCode = 200;
          res.end(JSON.stringify({ id, ...item }));
        } else {
          // Send a not found error
          res.statusCode = 404;
          res.end(JSON.stringify({ message: 'Item not found' }));
        }
      });
    } catch (err) {
      // Handle any errors
      res.statusCode = 500;
      res.end(JSON.stringify({ message: err.message }));
    }
    return;
  }

  // Handle the DELETE request
  if (method === 'DELETE' && url.startsWith('/items/')) {
    try {
      // Get the id from the url
      const id = parseInt(url.split('/')[2]);
      // Read the data from the JSON file
      const data = await readStore();
      // Find the index of the item to delete
      const index = data.items.findIndex((i: any) => i.id === id);
      // Delete the item if found
      if (index !== -1) {
        const item = data.items[index];
        data.items.splice(index, 1);
        // Write the data to the JSON file
        await writeStore(data);
        // Send the deleted item as the response
        res.statusCode = 200;
        res.end(JSON.stringify(item));
      } else {
        // Send a not found error
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Item not found' }));
      }
    } catch (err) {
      // Handle any errors
      res.statusCode = 500;
      res.end(JSON.stringify({ message: err.message }));
    }
    return;
  }

  // Handle any other requests
  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Not found' }));
});

// Start the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
