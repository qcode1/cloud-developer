import express from 'express';
import {Request, Response} from 'express';
import bodyParser from 'body-parser';
require('dotenv').config();
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  const jwt = require("jsonwebtoken")

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  app.get("/filteredimage", async (req: Request, res: Response) => {

    if (req.headers.authorization) {

      // get image url param from request queries
      let { image_url } :{image_url:string} = req.query

      // validate the image_url query
      if (!image_url) {
        res.status(400).send("Image Url not passed!")
      }

      const authenHeader = req.headers.authorization
      const token = authenHeader.split(" ")[1]
      // console.log(token)

      const accessToken = jwt.sign(image_url, process.env.BEARER_TOKEN)
      // console.log(accessToken)

      try {

        const validateHeader = await jwt.verify(accessToken, token)

        if (validateHeader) {
          // filter image from URL provided
          let filteredImageURL = await filterImageFromURL(image_url).then(result => result);
  
          // send file as response for resulting filtered image
          res.status(200).sendFile(filteredImageURL);
  
          // delete locally saved file after 8 seconds
          setTimeout(() => {
            deleteLocalFiles([filteredImageURL])
          }, 8000);
        } else {
          res.status(400).send("Invalid Auth Token!");
        }

      } catch(err) {
        res.status(400).send(`Error - ${err}`);
      }


    } else {
      res.status(400).send("You are not authorized to access this resource!");
    }

  });

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();