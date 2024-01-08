import { Router } from "express";
import database from "./database";
import "dotenv-safe/config";

//const jwt = new require('jsonwebtoken');
const routes = new Router();
var aQuery = "";

routes.get("/", (req, res) => {
  /*
 #swagger.description = 'Apresentanção da API.'
*/
  return res.json({ message: "API Leitura XML SOPASTA V1" });
});

routes.post("/getxml", (req, res) => {
  /*
     #swagger.description = 'Busca informação da NCM atráves da chave da nota e o seu XML'
   
     #swagger.parameters['chvnel'] = {
      description: 'Chave da nota fiscal.',
      type: 'string',
      required: true,
      in: 'body',
      example: '32220705570714000825550010146745721007838418',
     }
   
   */

  var aChvNel = "";
  var aRetData = "";
  var aArrDat = [];
  var aJson = "";
  var data;
  var nRetErr = 0;
  aChvNel = req.body.chvnel;

  try {
    aQuery =
      "SELECT B.BinArq                                                        \
                    FROM SAPIENSNFE.N130NFE A, SAPIENSNFE.N100XML B, SAPIENSNFE.N130XML C \
                   WHERE A.IdeNfe = '" +
      aChvNel +
      "'                                         \
                     AND C.SeqNf3 = A.SeqNfe                                              \
                     AND B.SeqXml = C.SeqXml                                              \
                     AND C.TipArq = 1";

    fExecQuery(aQuery).then((response) => {
      data = response[0];
      nRetErr = response[1];
      aRetData = "";

      if (nRetErr == 1) {
        return res.json({
          message: data,
          error: nRetErr,
        });
      } else {
        aRetData = data[0].BINARQ.toString("utf8"); //converte utf8 padrão
        const iconvlite = require("iconv-lite");
        const content = iconvlite.decode(aRetData, "UTF-16"); //converte uft8 para UTF 16 necessário para converter XML para json

        const xml2js = require("xml2js");

        xml2js.parseString(content, (err, result) => { //converte a string do XML em JSON
          if (err) {
            nRetErr = 1;
          } else {
            aJson = JSON.stringify(result);                                    
            aJson = JSON.parse(aJson);            
          }
        });        
                
        aJson = aJson.nfeProc.NFe;

        //console.log(aJson[0].infNFe[0].det[0].prod[0].NCM);        
        aJson.forEach(infNFe => {          
          //console.log(infNFe.infNFe);
          infNFe.infNFe.forEach(det => {
            //console.log(det);
            det.det.forEach(prod =>{
              //console.log(prod);
              prod.prod.forEach (produto =>{
                aArrDat.push(produto.NCM);                
              })
            });
          });          
        });
        aRetData = aArrDat;    

        if (nRetErr == 0) {
          if (aRetData == null || aRetData == undefined || !aRetData) {
            nRetErr = 1;
            return res.json({
              message: "Nf não encontrada verifique!",
              error: nRetErr,
            });
          } else {
            nRetErr = 0;
            return res.json({
              message: aRetData,
              error: nRetErr,
            });
          }
        }
      }
    });
  } catch (error) {}
});

async function fExecQuery(aQuery) {
  var RetQue;
  var RetErr = 0;
  try {
    RetQue = await database.raw(aQuery);
  } catch (error) {
    RetQue = error;
    RetErr = 1;
  }
  return [RetQue, RetErr];
}

export default routes;
