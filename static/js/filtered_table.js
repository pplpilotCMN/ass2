// Load the CSV file and create a table with 5 columns and the 1st 40 rows
// The table is appended to the div with the ID 'page-wrap' in the HTML file
// The CSV file is expected to have 5 column headers in the first row
// The table rows are sorted based on the 'airline_sentiment_confidence' column in ascending order

async function loadData() {
  try {
    const csvFilePath = "/static/data/Kaggle_TwitterUSAirlineSentiment.csv";
    const requiredColumns = ["id", "airline_sentiment", "airline_sentiment_confidence", "airline", "text"];
    var limitedData = []; // Store the first 40 rows of data

    // Load the CSV file asynchronously
    const data = await d3.csv(csvFilePath);

    // Check if data exists
    if (!data || data.length === 0) {
      console.error("CSV file loaded, contains no data.");
      return;
    }

    // Check if all required columns exist in the CSV
    const csvColumns = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(function(col) {
      return csvColumns.indexOf(col) === -1;
    });

    if (missingColumns.length > 0) {
      console.error("Error: Missing expected columns:", missingColumns);
      return;
    }

    // Process Data (limit, convert, and sort)
    limitedData = data.slice(0, 40); // Keep only the first 40 rows

    limitedData.forEach(function(d) {
      var confidence = parseFloat(d.airline_sentiment_confidence);
      d.airline_sentiment_confidence = isNaN(confidence) ? 0 : confidence;
    });

    // Sort by 'airline_sentiment_confidence' in ascending order
    limitedData.sort(function(a, b) {
      return a.airline_sentiment_confidence - b.airline_sentiment_confidence;
    });

    // Create table
    createTable(limitedData, requiredColumns);

    console.log("Table created with", limitedData.length, "rows.");
  } catch (error) {
    console.error("Error loading CSV data.", error);
  }
}

// Function to create and populate the table
function createTable(data, columns) {
  var tableElement = d3.select('#page-wrap').append('table');

  // Create table header row
  var headerRow = tableElement.append('thead').append('tr');
  headerRow.selectAll('th')
    .data(columns)
    .enter()
    .append('th')
    .text(function(columnName) {
      return columnName.replace(/_/g, " ").toUpperCase();
    });

  var tableBody = tableElement.append('tbody');

  // Create table rows
  tableBody.selectAll('tr')
    .data(data)
    .enter()
    .append('tr')
    .each(function(rowData) {
      d3.select(this).selectAll('td')
        .data(columns.map(function(columnName) {
          return {
            value: rowData[columnName] !== undefined ? rowData[columnName] : "N/A", // Handle missing values
            name: columnName
          };
        }))
        .enter()
        .append('td')
        .attr('data-th', function(column) {
          return column.name;
        })
        .text(function(column) {
          return column.value;
        });
    });
}

// Call the loadData function to load the CSV and render the table
loadData();