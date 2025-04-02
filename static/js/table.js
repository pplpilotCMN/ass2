// Load the CSV file and create a table with sorting functionality for each column header
// The table is appended to the div with the ID 'page-wrap' in the HTML file
// The CSV file is expected to have column headers in the first row
// The table rows are sorted based on the selected column when the header is clicked
// The sorting indicator is updated on the header to show the current sorting direction

const csvFilePath = "/static/data/Kaggle_TwitterUSAirlineSentiment.csv";

async function loadData() {
  try {
    console.log("Loading CSV file...");
    const data = await d3.csv(csvFilePath);

    // Check for data after loading
    if (!data || data.length === 0) {
      console.error("CSV file loaded but contains no data.");
      return;
    }

    // // debug Check the loaded data
    // console.log("Loaded Data:", data);

    // check the CSV has column headers
    let firstRow = data[0];
    console.log("First Row:", firstRow);

    if (!firstRow) {
      console.error("File is missing column headers.");
      return;
    }

    let columnNames = Object.keys(firstRow);
    console.log("Column Names:", columnNames);

    if (!columnNames || columnNames.length === 0) {
      console.error("CSV file is missing column headers.");
      return;
    }

    let sortAscending = true;
    let tableElement = d3.select('#page-wrap').append('table').attr('class', 'sortable-table');
    let headerNames, tableBody, tableRows;

    // sorting function for table rows based on the selected column
    function sortTable(columnName) {
      console.log(`Sorting by column: ${columnName}, ascending: ${sortAscending}`);

      tableRows.sort(function (rowA, rowB) {
        let columnValueA = rowA[columnName] || "";
        let columnValueB = rowB[columnName] || "";

        // convert column values to numbers if possible for proper sorting
        if (!isNaN(columnValueA) && !isNaN(columnValueB)) {
          columnValueA = +columnValueA;
          columnValueB = +columnValueB;
        }
        // sort based on the ascending/descending order flag
        if (sortAscending) {
          return d3.ascending(columnValueA, columnValueB);
        } else {
          return d3.descending(columnValueA, columnValueB);
        }
      });

      // toggle the sorting direction for subsequent clicks
      sortAscending = !sortAscending;

      // show sorting indicator on the column header
      headerNames.text(function(d) {
        return d === columnName ? `${d} ${sortAscending ? '▲' : '▼'}` : d;
      });

      // reorder rows based on the sorted data and handle missing values
      tableBody.selectAll('tr')
        .sort(function (a, b) {
          let columnValueA = a[columnName] || "";
          let columnValueB = b[columnName] || "";

          // convert column values to numbers if possible for proper sorting
          if (!isNaN(columnValueA) && !isNaN(columnValueB)) {
            columnValueA = +columnValueA;
            columnValueB = +columnValueB;
          }
          // sort based on the ascending/descending order flag
          if (sortAscending) {
            return d3.ascending(columnValueA, columnValueB);
          } else {
            return d3.descending(columnValueA, columnValueB);
          }
        });
    }

    // create table header and attach sorting functionality
    headerNames = tableElement.append('thead')
      .append('tr')
      .selectAll('th')
      .data(columnNames)
      .enter()
      .append('th')
      .text(function (columnName) { return columnName; })
      .on('click', function (event, columnName) {
        sortTable(columnName);
      });

    // create table body and rows for each data entry
    tableBody = tableElement.append('tbody');
    tableRows = tableBody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr')
      .each(function (rowData) {
        d3.select(this).selectAll('td')
          .data(columnNames.map(function (columnName) {
            return {
              value: rowData[columnName] ?? "N/A",
              name: columnName
            };
          }))
          .enter()
          .append('td')
          .attr('data-th', function (column) { return column.name; })
          .text(function (column) { return column.value; });
      });

    //console.log("Table created with", data.length, "rows.");// debug should be 200
  } catch (error) {
    console.error("Error reading CSV file.", error);
  }
}

// call the loadData function to load the CSV and render the table
loadData();
