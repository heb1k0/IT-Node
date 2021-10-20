//!                         Nivell 1
//? Crea una funció que imprimeixi recursivament un missatge per la consola amb demores d'un segon. 

const showMessage = async (LimitFor = 10) =>{
  for(let i=0; i <= LimitFor; i++){
    await new Promise(r => setTimeout(r, 1000));
    console.log("Mensaje numero", i); 
  }
}
// showMessage(10)

/* Crea una funció que, en executar-la, escrigui una frase en un fitxer. */
const fs = require('fs');

const writeDocument = (documentName,msg) =>{
    fs.writeFile(`${documentName}.txt`, msg, 'ascii', (err) => {
        if (err) throw err;
        console.log(`El archivo ${documentName}.txt ha sido guardado con el mensaje ${msg}`)
    });
}

// writeDocument("document","Mensaje")


//? Crea una altra funció que mostri per consola el contingut del fitxer de l'exercici anterior.

const readDocument = (documentName) =>{

  return new Promise((resolve, reject) => {
      fs.readFile(`${documentName}.txt`, 'utf8', function(err, result) {
          if (err) throw  reject(err);
          resolve(result)
      });
  }) 

}

// readDocument("document")
// .then(ok=>{console.log(ok)
// }).catch(err =>{
//   console.log(err)
// })


//!                   Nivell 2

//? Exercici 1  - Crea una funció que comprimeixi el fitxer del nivell 1.


const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const {
  createReadStream,
  createWriteStream
} = require('fs');


const compressGZIP = (documentName) =>{

    const gzip = createGzip();
    const source = createReadStream(`${documentName}.txt`);
    const destination = createWriteStream(`${documentName}.txt.gz`);

    pipeline(source, gzip, destination, (err) => {
    if (err) {
        console.error('An error occurred:', err);
        process.exitCode = 1;
    }else{
        console.log(`${documentName}.txt.gz creado`)
    }
    });


}
// compressGZIP("document");

//? Crea una funció que llisti per la consola el contingut del directori d'usuari de l'ordinador utilizant Node Child Processes. */

const { exec } = require('child_process');

const dir = () =>{
  exec('dir /q', (err, stdout, stderr) => {
  if (err) {
    console.error(`error :${err}`);
    return;
  }
  console.log(stdout)
    });  
}

// dir()

//!    Nivell 3

//? Crea una funció que creï dos fitxers codificats en hexadecimal i en base64 respectivament, a partir del fitxer del nivell 1.

const createDocument = async () =>{

  var cod = [
      "base64",
      "hex"
  ]
  var text = await readDocument("document");

  cod.forEach(cod =>{

        let TransformMsg = Buffer.from(text, 'utf8').toString(cod);
        writeDocument(`Document${cod}`,TransformMsg)

  })
}

// createDocument();

//? Crea una funció que guardi els fitxers del punt anterior, ara encriptats amb l'algorisme aes-192-cbc, i esborri els fitxers inicials.


const crypto = require('crypto');
const ENC_KEY = "bf3c199c2470cb477d907b1e0917c17b"; 
const IV = "5183666c72eec9e4313"; 

var encrypt = ((val) => {
  let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(val, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
});

var decrypt = ((encrypted) => {
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  return (decrypted + decipher.final('utf8'));
});


const DeleteDocument = (document) => {
  console.log(document);
  fs.unlink(`./${document}`, function (err) {
    if (err) return console.log(err);
    console.log("file deleted successfully");
  });
};


const readAndTransformAES = async () => {
    fs.readdir("./", async (err, files) => {
      files.forEach(async (file) => {
        if (file.includes(".txt") && !file.includes("aes")) {
          var filename = file.replace(".txt", "");
  
          fs.readFile(file, "utf8", async function (err, result) {
            await writeDocument(`aes-${filename}`, encrypt(result));
            await DeleteDocument(file);
          });
        }
      });
    });
};

//? Crea una altra funció que desencripti i descodifiqui els fitxers de l'apartat anterior tornant a generar una còpia de l'inicial.

const readAndTransformString = async () => {
  fs.readdir("./", async (err, files) => {
    files.forEach(async (file) => {
      if (file.includes(".txt") && file.includes("aes")) {
        var filename = file.replace(".txt", "");

        fs.readFile(file, "utf8", async function (err, result) {
          var cod = ["hex", "base64"];
          cod.forEach(async (cod) => {
            if (file.includes(cod)) {
              let newFilename = filename.replace(cod, "").replace("aes-", "");
              var textAEs = decrypt(result);
              var buff = new Buffer(textAEs, cod);
              var text = buff.toString("ascii");
              await writeDocument(`${cod}${newFilename}`, text);
              await writeDocument(`${newFilename}`, text);
              await DeleteDocument(file);
            }
          });
        });
      }
    });
  });
};

// readAndTransformString();