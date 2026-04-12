import fs from 'fs';

const data = fs.readFileSync('./sources/vinted.json', 'utf-8');
const json = JSON.parse(data);

console.log('Sets in vinted.json:', Object.keys(json).length);
console.log('77255 items:', json['77255']?.length || 0);

const sorted = Object.entries(json)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20);

console.log('\nTop 20 sets by item count:');
sorted.forEach(([setId, items]) => {
  console.log(`${setId}: ${items.length} items`);
});

// Check if 77255 exists
if (json['77255']) {
  console.log('\n77255 found! Sample items:');
  json['77255'].slice(0, 3).forEach(item => {
    console.log(`  - ${item.title}`);
  });
} else {
  console.log('\n77255 NOT found in vinted.json');
}
