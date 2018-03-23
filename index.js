var elasticsearch = require('elasticsearch');
const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');
//var jsonfile = require('jsonfile');


var client = new elasticsearch.Client({  // default is fine for me, change as you see fit
    host: '192.168.99.100:9200',//'localhost:9200',
    log: 'trace'
});


async function getAllModels() {
    // Initializing a variable to save the records :
    var all_models = [];

    // Getting all brands :
    const brands = await getBrands();

    // For each brand, we get all the associated models :
    for (var i = 0; i < brands.length; i++ ) {
        console.log("GETTING MODEL : " + i);
        var models = await getModels(brands[i]);
        models.forEach(function(model) {
            all_models.push(model);
        });
    }

    //console.log("SAVING IN JSON FILE");
    //var file = './tmp/data.json';
    //jsonfile.writeFileSync(file, all_models);

    return all_models;
}

async function saveAllRecords() {
    var all_models = await getAllModels();

    var body = [];
    for (var i = 0; i < all_models.length; i++ ) {
        console.log("INDEXING MODEL : " + i);
        var config = { index:  { _index: 'web', _type: 'model', _id: i } };
        body.push(config);
        body.push(all_models[i]);
    }

    console.log("SAVING RECORDS INTO ELASTICSEARCH DATABASE");
    client.bulk({
        body: body
    }, function (error, response) {
        if (error) {
            console.error(error);
            return;
        }
        else {
            console.log(response);  //  I don't recommend this but I like having my console flooded with stuff.  It looks cool.  Like I'm compiling a kernel really fast.
        }
    });
}


saveAllRecords();

