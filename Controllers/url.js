import { Url } from "../Models/Url.js";
import shortid from "shortid";
import dotenv from 'dotenv';

dotenv.config();

// Retrieve the base URL from environment variables or use a default
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

export const urlShort = async (req, res) => {
  const longUrl = req.body.longUrl;
  const shortCode = shortid.generate();

  // Validate the long URL (basic validation)
  try {
    new URL(longUrl); // This throws an error if the URL is invalid
  } catch (_) {
    return res.status(400).send("Invalid URL");
  }

  // Generate short URL using the application’s base domain
  const shortUrl = `${BASE_URL}/${shortCode}`;

  try {
    // Save to db
    const newUrl = new Url({ shortCode, longUrl });
    await newUrl.save();
    console.log("URL shortened successfully:", newUrl);

    // Render the short URL
    res.render("server.ejs", { shortUrl });
  } catch (error) {
    console.error('Error saving URL to database:', error);
    res.status(500).send("Internal Server Error");
  }
};

export const getOriginalUrl = async (req, res) => {
    const shortCode = req.params.shortCode;
  
    try {
      // Find in db
      const urlRecord = await Url.findOne({ shortCode });
  
      if (urlRecord) {
        // Log the found URL and redirect
        console.log('Redirecting to:', urlRecord.longUrl);
        res.redirect(urlRecord.longUrl);
      } else {
        console.log('URL not found for shortCode:', shortCode);
        res.status(404).send("URL not found");
      }
    } catch (error) {
      console.error('Error retrieving URL from database:', error);
      res.status(500).send("Internal Server Error");
    }
  };
  