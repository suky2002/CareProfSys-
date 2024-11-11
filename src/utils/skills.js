import Papa from 'papaparse';

export function fetchSkills(callback) {
  Papa.parse('/path/to/skills.csv', {
    download: true,
    header: true,
    complete: function(results) {
      callback(results.data);
    }
  });
}