const { json } = require("express");

let s = {
    filename: 'sunset.png',
    createdate: 'Thu Aug 05 2021',
    lastmodified: 'Thu Aug 05 2021',
    lastmodified: 'Thu Aug 05 2021',
    filesize: 0.006782,
    type: 'image/png'
}
console.log(s)

s = JSON.stringify(s)
console.log(s);

s = JSON.parse(s);
console.log(s);

