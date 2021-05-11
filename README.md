# project-5-xpress-publishing
 Cumulative API project

This project focuses on creating a persistent API that uses the CRUD (Create, Read, Update, Delete) paradigm.

Main Components:

	api.js holds the main API router in the root directory of the project /api

	migration.js creates the artist, series, and issues databases in sqlite3

	artist.js contains the CRUD operations for the artist routes (/api/artists)

	series.js contains the CRUD operations for the series routes (/api/series)

	issues.js contains the CRUD operations fro the issues routes (/api/series/:seriesId/issues) 
