# songpos
When you query for a song in format "Firehouse - When I Look Into Your Eyes" you will get its Weekly Chart table and and Year End table (such as this table https://en.wikipedia.org/wiki/When_I_Look_Into_Your_Eyes) in the form 

[ { type: 'Weekly Chart',
    heading: [ 'Chart (1992-93)', 'Peak position' ],
    data: [ [Object], [Object], [Object] ] },
  { type: 'Weekly Chart',
    heading: [ 'Chart (1992)', 'Position' ],
    data: [ [Object] ] } ]
    
    
We also utilise server.js (source code available from https://github.com/nerdlikeme/getsongname) to extract song and artist name from the title "Firehouse - When I Look Into Your Eyes" which will extract "Firehouse" as artist name and "When I Look Into Your Eyes" as song name and return it to app.js (source code in https://github.com/nerdlikeme/songpos) from where it is called. Therefore, we must first start the server.js and then run the app.js to get the table from wikipedia.   
    
    
