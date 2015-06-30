);

// try {
//     console.log(parse.run(usage, input));
// } catch(e) {
//     console.log(e.message);
//     console.log(e.stack);
// }
var input = fs
    .readFileSync('./tests/fixtures/0.txt')
    .toString('utf-8');

