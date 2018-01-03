const fileSystem = require('fs');
const cheerio = require('cheerio');
const Regex = require("regex");
var path = require('path');

/**----Configuration start----**/
var startPath = "locale/"; // Directory where we'll save output file.
var htmlDirectory ="./app"  // Parent directory of the project where HTML located.
var fileFilterExtension = '.html';  // extension of file in to search tag.
//List of the different files or use for different languages english,german etc.
const _langArray = [{lan:'english'},{lan:'german'},{lan:'french'},{lan:'file4'},{lan:'file5'},{lan:'file6'}];
const _fileSuffix = "Data_";
const _fileExtension = ".json"; // Extesnion of the file
const _fileJsonObjectName = "language"; // Parent object key name
const _attribute = "mytag"; //attribute of the html 
/**----Configuration end----**/

// Check Json file for the language if exists delete and create new. If not exists create new one
/*
@Params
@filename: filename is the langauge json file name
@data : Data that we have to write in file.
*/
function checkForFile(fileName,data,callback){
     console.log("Check file system",startPath + fileName );
     let _path = startPath +fileName;
    fileSystem.exists(startPath + fileName, function (exists) {
       console.log("exists: ",exists);
        if(exists)
        {
            fileSystem.unlink(_path,function(done){
              fileSystem.writeFileSync(_path, data);
                
            });

            
        }else
        {
            fileSystem.writeFileSync(_path, data)
        }
    });
};

//Function to check file exists or not if exists then read the file and find the key and enter in into the jsonfile
/*
@Params
@data: data that we have to write in the file
*/
function createJsonFile(data) {
     var _tempData = {"language" : []}
        _tempData.language.push(data);
 
    for(var i = 0;i<_langArray.length;i++){
       checkForFile(_fileSuffix+_langArray[i].lan +_fileExtension,JSON.stringify(data));
    }
 
};

//Generic function to check particular file in a directory
/*
@Params
@_startPath : Directoery where we have to search file
@filter : type of file (html, jpeg)
 */
function readFile(_startPath,filter,callback){

    //console.log('Starting from dir '+startPath+'/');

    if (!fileSystem.existsSync(_startPath)){
        console.log("no dir ",_startPath);
        return;
    }

    var files=fileSystem.readdirSync(_startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(_startPath,files[i]);
        var stat = fileSystem.lstatSync(filename);
        if (stat.isDirectory()){
            readFile(filename,filter,function(r){}); //recurse
        }
        else 
            if (filename.indexOf(filter)>=0) {
            console.log('-- found: ',filename);
            callback(null,filename);
           
        };
    };
};
 
// function to read HTML file and it'll return it's object
/*
@Params

 */
function loadFiles(filePath,_return){
 const $ = cheerio.load(fileSystem.readFileSync(filePath));
 _return($);
};

//Search in array whether key is available or not
function searchKey(array, key){
    for (var i=0; i < array.length; i++) {
        console.log("--key--" + key,array[i][key]);
        if (array[i][key] != undefined) {
            return true;
        }
    }
    return false;
};

// function to check tag in the different files
function checkTag() {
    let _tempTags = [];
    // let _fileName = "test.html";

// call function to read files
readFile(htmlDirectory,fileFilterExtension,function(err,_fileName){

  console.log("--file--name--",_fileName)

    loadFiles(_fileName,function(file){
    file('['+_attribute+']').each(function (obj, index) {
          //  console.log("************** Reading HTML Contents*********************************");
        let _k = cheerio.load(index)('['+_attribute+']').html().trim() ;
            
        if(!searchKey(_tempTags,_k)){
            let _d = {};
            _d[_k]= _k;
            _tempTags.push(_d);
        }
 
        });
    });
 });
    createJsonFile(_tempTags);
};

checkTag();