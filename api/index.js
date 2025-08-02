const express = require("express");

const { neon } = require("@neondatabase/serverless");

const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const sharp = require("sharp");
//const { nanoid } = require("nanoid");
//import { nanoid } from "nanoid";

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const path = require("path");

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "guX9tK7rPGyALZq8";
const bucket = "portfolio-app-nigiri";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		credentials: true,
		origin: "http://localhost:5173",
	})
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log("backend log");

// Upload to S3 middleware
async function uploadToS3(path, originalFilename, mimetype) {
	const client = new S3Client({
		region: "eu-north-1",
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
		},
	});
	const parts = originalFilename.split(".");
	const ext = parts[parts.length - 1];
	const newFilename = Date.now() + "." + ext;

	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Body: fs.readFileSync(path),
			Key: newFilename,
			ContentType: mimetype,
			ACL: "public-read",
		})
	);

	return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

const upload = multer({ dest: "/tmp" });

/*
* OLD Function
async function generateUniqueProjectId(db) {
	return new Promise((resolve, reject) => {
		function tryId() {
			const id = nanoid(6);
			db.get("SELECT id FROM projects WHERE id = ?", [id], (err, row) => {
				if (err) return reject(err);
				if (row) {
					// id exists, try again
					tryId();
				} else {
					// id is unique, return it
					resolve(id);
				}
			});
		}
		tryId();
	});
}
*/

async function getRandomImageFromUnsplash(query) {
	const response = await fetch(
		`https://api.unsplash.com/photos/random?query=${encodeURIComponent(
			query
		)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
	);
	if (!response.ok) {
		throw new Error("Failed to fetch image");
	}

	const data = await response.json();
	return { regular: data.urls.regular, thumb: data.urls.thumb };
}

async function generateUniqueProjectId(sql) {
	const { nanoid } = await import("nanoid");
	while (true) {
		const id = nanoid(6);
		const result = await sql`SELECT id FROM projects WHERE id = ${id}`;
		if (result.length === 0) {
			// id is unique
			return id;
		}
	}
}

app.get("/api/test", (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);
		res.send("200 OK");
	} catch {
		res.send("400 Bad");
	}
});

app.post("/api/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		const sql = neon(process.env.DATABASE_URL);

		const users = await sql`SELECT * FROM users WHERE email = ${email}`;
		const user = users[0];

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!bcrypt.compareSync(password, user.password)) {
			return res.status(401).json({ message: "Invalid password" });
		}

		// User is authenticated
		jwt.sign({ email: user.email }, jwtSecret, {}, (err, token) => {
			if (err) return res.status(500).json({ message: "Internal error" });
			return res.cookie("token", token).json({ message: "Login successful" });
		});
	} catch (err) {
		console.error("DB error:", err);
		res.status(500).json({ message: "Server error" });
	}
});

app.get("/api/profile", async (req, res) => {
	const { token } = req.cookies;
	if (!token) {
		return res.json(null);
	}

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		try {
			const sql = neon(process.env.DATABASE_URL);

			const users =
				await sql`SELECT email FROM users WHERE email = ${userData.email}`;
			const user = users[0];

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			res.json(user);
		} catch (error) {
			console.error("DB query error:", error);
			res.status(500).json({ message: "Internal error" });
		}
	});
});

app.post("/api/logout", (req, res) => {
	res.cookie("token", "").json({ message: "Logged out" });
});

app.get("/api/homePageInfo", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);

		const rows = await sql`SELECT content FROM homePageInfo LIMIT 1`;
		const row = rows[0];

		if (!row) {
			return res.status(404).json({ content: "" });
		}

		res.json({ content: row.content });
	} catch (err) {
		console.error("DB error:", err);
		res.status(500).json({ error: "Database error" });
	}
});

app.get("/api/aboutPageInfo", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);

		const rows = await sql`SELECT content FROM aboutPageInfo LIMIT 1`;
		const row = rows[0];

		if (!row) {
			return res.status(404).json({ content: "" });
		}

		res.json({ content: row.content });
	} catch (err) {
		console.error("DB error:", err);
		res.status(500).json({ error: "Database error" });
	}
});

app.get("/api/contactPageInfo", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);
		const rows = await sql`SELECT * FROM contactPageInfo ORDER BY id`;
		res.json(rows);
	} catch (err) {
		console.error("DB error:", err);
		res.status(500).json({ error: "Database error" });
	}
});

app.get("/api/contactDetails", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);
		const rows = await sql`SELECT * FROM contactDetails`;
		res.json(rows);
	} catch (err) {
		console.error("DB error:", err);
		res.status(500).json({ error: "Database error" });
	}
});

app.post("/api/homePageInfo", async (req, res) => {
	const { token } = req.cookies;
	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		try {
			const sql = neon(process.env.DATABASE_URL);

			const initialContent = JSON.stringify(req.body);

			// Check if a row exists
			const existingRow = await sql`SELECT * FROM homePageInfo LIMIT 1`;

			if (existingRow.length === 0) {
				// Insert new row if none exists
				await sql`
          			INSERT INTO homePageInfo (content) VALUES (${initialContent})
        		`;
			} else {
				// Update existing row by id
				await sql`
         			UPDATE homePageInfo SET content = ${initialContent}
        		`;
			}

			res.status(200).json({ message: "Saved successfully" });
		} catch (error) {
			console.error("Database error:", error);
			res.status(500).json({ message: "Database error", error });
		}
	});
});

app.get("/api/homePageProfile", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);

		const rows = await sql`SELECT * FROM profilePicture LIMIT 1`;

		if (rows.length === 0) {
			return res.status(404).json({ message: "No profile data found." });
		}

		const row = rows[0];

		const profileTableContent = {
			filename: row.filename,
			lowresfilename: row.lowresfilename,
			blobPath: row.blobpath,
			crop: row.crop,
			zoom: row.zoom,
		};

		res.json(profileTableContent);
	} catch (err) {
		console.error("Error fetching homepage profile:", err.message);
		res.status(500).json({ message: "Internal server error." });
	}
});

/*
app.post("/api/homePageProfile", upload.single("image"), (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		try {
			if (!req.file) {
				return res.status(400).json({ error: "No file uploaded" });
			}

			const fileUrl = `/uploads/${req.file.filename}`; // This will be served from the static route

			const db = new sqlite3.Database("./database.db", (err) => {
				if (err) {
					console.log(err);
					res
						.status(500)
						.json({ message: "Database connection error : ", err });
				}
			});

			const initialContentProfileTable = {
				filename: fileUrl,
				blobPath: req.body.blobPath,
				crop: req.body.crop,
				zoom: req.body.zoom,
			};

			// Convert crop object to JSON string
			const cropString = JSON.stringify(initialContentProfileTable.crop);

			// Check if there's already an entry
			db.get("SELECT * FROM profilePicture LIMIT 1", (err, row) => {
				if (err) {
					console.error("Error selecting from profilePicture:", err);
					return;
				}

				if (row) {
					// If row exists, update it
					db.run(
						`
		  UPDATE profilePicture
		  SET filename = ?, blobPath = ?, crop = ?, zoom = ?
		  WHERE filename = ?
		  `,
						[
							initialContentProfileTable.filename,
							initialContentProfileTable.blobPath,
							cropString,
							initialContentProfileTable.zoom,
							row.filename,
						],
						function (updateErr) {
							if (updateErr) {
								console.error("Error updating profilePicture:", updateErr);
							} else {
								console.log("profilePicture updated.");
							}
						}
					);
				} else {
					// If no row, insert it
					db.run(
						`
		  INSERT INTO profilePicture (filename, blobPath, crop, zoom)
		  VALUES (?, ?, ?, ?)
		  `,
						[
							initialContentProfileTable.filename,
							initialContentProfileTable.blobPath,
							cropString,
							initialContentProfileTable.zoom,
						],
						function (insertErr) {
							if (insertErr) {
								console.error(
									"Error inserting into profilePicture:",
									insertErr
								);
							} else {
								console.log("profilePicture inserted.");
							}
						}
					);
				}
			});

			res.status(200).json({ fileUrl }); // Send this to your React app
		} catch (error) {
			console.error("Upload error:", error);
			res
				.status(500)
				.json({ error: "Something went wrong during file upload." });
		}
	});
});
*/

async function createLowResImage(inputPath, originalname, mimetype) {
	const ext = path.extname(originalname) || ".jpg";
	const format = mimetype.includes("png") ? "png" : "jpeg";
	const outputMimetype = format === "png" ? "image/png" : "image/jpeg";

	const outputName = `lowres-${Date.now()}${ext}`;
	const outputPath = path.join(path.dirname(inputPath), outputName);

	const meta = await sharp(inputPath).metadata();
	const targetWidth = Math.max(Math.round((meta.width || 1000) * 0.04), 10);
	const targetHeight = Math.max(Math.round((meta.height || 1000) * 0.04), 10);

	await sharp(inputPath)
		.resize(targetWidth, targetHeight, { fit: "fill" })
		.toFormat(format, { quality: 60 })
		.toFile(outputPath);

	const fileUrl = await uploadToS3(outputPath, outputName, outputMimetype);
	return fileUrl;
}

app.post("/api/homePageProfile", upload.single("image"), async (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		try {
			const sql = neon(process.env.DATABASE_URL);

			if (!req.file) {
				return res.status(400).json({ error: "No file uploaded" });
			}

			const { path, originalname, mimetype } = req.file;
			const fileUrl = await uploadToS3(path, originalname, mimetype);
			const lowresfilename = await createLowResImage(
				path,
				originalname,
				mimetype
			);

			const initialContentProfileTable = {
				filename: fileUrl,
				lowresfilename: lowresfilename,
				blobPath: req.body.blobPath,
				crop: req.body.crop,
				zoom: req.body.zoom,
			};

			const cropString =
				typeof initialContentProfileTable.crop === "string"
					? initialContentProfileTable.crop
					: JSON.stringify(initialContentProfileTable.crop);

			// Check if a profile picture entry already exists
			const existing = await sql`SELECT filename FROM profilePicture LIMIT 1`;

			if (existing.length > 0) {
				// Update existing row
				await sql`
					UPDATE profilePicture
					SET filename = ${initialContentProfileTable.filename},
						lowresfilename = ${initialContentProfileTable.lowresfilename},
						blobPath = ${initialContentProfileTable.blobPath},
						crop = ${cropString},
						zoom = ${initialContentProfileTable.zoom}
					WHERE filename = ${existing[0].filename}
				`;
				console.log("profilePicture updated.");
			} else {
				// Insert new row
				await sql`
					INSERT INTO profilePicture (filename, blobPath, crop, zoom,lowresfilename)
					VALUES (
						${initialContentProfileTable.filename},
						${initialContentProfileTable.blobPath},
						${cropString},
						${initialContentProfileTable.zoom},
						${initialContentProfileTable.lowresfilename}
					)
				`;
				console.log("profilePicture inserted.");
			}

			res.status(200).json({ fileUrl }); // Send image URL back to client
		} catch (error) {
			console.error("Upload error:", error);
			res
				.status(500)
				.json({ error: "Something went wrong during file upload." });
		}
	});
});

app.post("/api/aboutPageInfo", async (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const initialContent = JSON.stringify(req.body);

		try {
			const sql = neon(process.env.DATABASE_URL);

			const rows = await sql`SELECT * FROM aboutPageInfo LIMIT 1`;

			if (rows.length === 0) {
				// Insert new row
				await sql`INSERT INTO aboutPageInfo (content) VALUES (${initialContent})`;
				return res.status(200).json({ message: "Inserted successfully" });
			} else {
				await sql`UPDATE aboutPageInfo SET content = ${initialContent}`;
				return res.status(200).json({ message: "Updated successfully" });
			}
		} catch (error) {
			console.error("Database error:", error);
			return res.status(500).json({ message: "Database error", error });
		}
	});
});

app.post("/api/contactPageInfoAndDetails", async (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const { contactInfo, contactDetails } = req.body;

		try {
			const sql = neon(process.env.DATABASE_URL);
			// Fetch existing contactPageInfo rows
			const rows =
				await sql`SELECT id FROM contactPageInfo ORDER BY id LIMIT 2`;

			if (rows.length === 0) {
				// Table empty, insert both
				await sql`INSERT INTO contactPageInfo (content) VALUES (${JSON.stringify(
					contactInfo[0]
				)})`;
				await sql`INSERT INTO contactPageInfo (content) VALUES (${JSON.stringify(
					contactInfo[1]
				)})`;
				console.log("Inserted both contact page contents.");
			} else {
				// Update existing rows
				if (rows[0]) {
					await sql`UPDATE contactPageInfo SET content = ${JSON.stringify(
						contactInfo[0]
					)} WHERE id = ${rows[0].id}`;
					console.log("Updated first contact content.");
				}

				if (rows[1]) {
					await sql`UPDATE contactPageInfo SET content = ${JSON.stringify(
						contactInfo[1]
					)} WHERE id = ${rows[1].id}`;
					console.log("Updated second contact content.");
				} else {
					// Only one row exists, insert the second
					await sql`INSERT INTO contactPageInfo (content) VALUES (${JSON.stringify(
						contactInfo[1]
					)})`;
					console.log("Inserted second contact content as new row.");
				}
			}

			// Handle contactDetails
			const existingDetails = await sql`SELECT type FROM contactDetails`;
			const existingTypes = existingDetails.map((row) => row.type);

			for (const entry of contactDetails) {
				if (existingTypes.includes(entry.type)) {
					// Update existing entry
					await sql`UPDATE contactDetails SET content = ${entry.content} WHERE type = ${entry.type}`;
					console.log(`Updated ${entry.type}`);
				} else {
					// Insert new entry
					await sql`INSERT INTO contactDetails (type, content) VALUES (${entry.type}, ${entry.content})`;
					console.log(`Inserted ${entry.type}`);
				}
			}

			return res.status(200).json({ message: "success" });
		} catch (error) {
			console.error("Database error:", error);
			return res.status(500).json({ message: "Database error", error });
		}
	});
});

app.get("/api/projects", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);

		const result = await sql`
			SELECT id, title, coverimage AS "coverImage", published , lowrescoverimage
			FROM projects 
			WHERE published = TRUE
		`;

		res.status(200).json(result);
	} catch (err) {
		console.error("Error fetching projects:", err.message);
		res.status(500).json({ error: "Failed to fetch projects" });
	}
});

app.get("/api/projectsDraft", async (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		try {
			const sql = neon(process.env.DATABASE_URL);

			const rows =
				await sql`SELECT id, title, coverimage AS "coverImage", published,lowrescoverimage FROM projects WHERE published = FALSE`;

			res.status(200).json(rows);
		} catch (err) {
			console.error("Error fetching draft projects:", err);
			res.status(500).json({ error: "Failed to fetch draft projects" });
		}
	});
});

app.post("/api/projects", async (req, res) => {
	const { token } = req.cookies;
	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		try {
			const sql = neon(process.env.DATABASE_URL);

			const id = await generateUniqueProjectId(sql);

			const unsplashImage = await getRandomImageFromUnsplash("projects");
			const coverImage = unsplashImage.regular;
			const lowrescoverImage = unsplashImage.thumb;

			await sql`
				INSERT INTO projects (id, title, coverimage, content, published,lowrescoverimage)
				VALUES (
					${id},
					'title',
					${coverImage},
					${JSON.stringify([
						{
							id: "8e56525d-a0d7-4f37-a24e-d203d7eefa64",
							type: "paragraph",
							props: {
								textColor: "default",
								backgroundColor: "default",
								textAlignment: "left",
							},
							content: [],
							children: [],
						},
					])},
					false,
					${lowrescoverImage}
				)
			`;

			return res.status(200).json({ id });
		} catch (error) {
			console.error("Database error:", error);
			return res.status(500).json({ message: "Database error", error });
		}
	});
});

app.get("/api/projects/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const sql = neon(process.env.DATABASE_URL);

		const rows =
			await sql`SELECT id, title, coverimage AS "coverImage", content, published, lowrescoverimage FROM projects WHERE id = ${id}`;

		if (rows.length === 0) {
			return res.status(404).json({ error: "Project not found" });
		}

		const row = rows[0];
		row.content = JSON.parse(row.content);

		res.status(200).json(row);
	} catch (err) {
		console.error("Error fetching project:", err.message);
		res.status(500).json({ error: "Failed to fetch project" });
	}
});

app.put("/api/moveProject/:id", async (req, res) => {
	const { token } = req.cookies;
	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const { id } = req.params;
		const { published } = req.body;

		try {
			const sql = neon(process.env.DATABASE_URL);

			const result = await sql`
				UPDATE projects
				SET published = ${published}
				WHERE id = ${id}
			`;

			if (result.count === 0) {
				return res.status(404).json({ error: "Project not found" });
			}

			return res.status(200).json({ message: "Project updated successfully" });
		} catch (error) {
			console.error("Error updating project:", error);
			return res.status(500).json({ error: "Failed to update project" });
		}
	});
});

app.post("/api/upload", upload.single("image"), (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		if (!req.file) {
			return res.status(400).send("No file uploaded.");
		}

		//const fileUrl = `uploads/${req.file.filename}`;
		const { path, originalname, mimetype } = req.file;
		const fileUrl = await uploadToS3(path, originalname, mimetype);
		const lowresfilename = await createLowResImage(
			path,
			originalname,
			mimetype
		);

		return res.send({ fileUrl: fileUrl, lowResFileUrl: lowresfilename });
	});
});

app.post("/api/upload3d", upload.single("model"), (req, res) => {
	console.log("func 3d called");
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		if (!req.file) {
			return res.status(400).send("No 3D model uploaded.");
		}

		try {
			const { path, originalname, mimetype } = req.file;
			// You may want to validate mimetype here (e.g., for .glb, .gltf, etc.)
			const fileUrl = await uploadToS3(path, originalname, mimetype);
			return res.send(fileUrl);
		} catch (error) {
			console.error("3D file upload error:", error);
			return res.status(500).json({ message: "3D file upload failed." });
		}
	});
});

app.put("/api/projects/:id", async (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const { id } = req.params;
		const { title, coverImage, content, lowrescoverimage } = req.body;

		try {
			const sql = neon(process.env.DATABASE_URL);

			const result = await sql`
				UPDATE projects
				SET title = ${title}, coverimage = ${coverImage}, content = ${content},
				lowrescoverimage = ${lowrescoverimage}
				WHERE id = ${id}
			`;

			if (result.rowCount === 0) {
				return res.status(404).json({ error: "Project not found" });
			}

			res.status(200).json({ message: "Project updated successfully" });
		} catch (error) {
			console.error("Error updating project:", error.message);
			res.status(500).json({ error: "Failed to update project" });
		}
	});
});
/*
app.delete("/api/projects/:id", (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const { id } = req.params;

		const db = new sqlite3.Database("./database.db", (err) => {
			if (err) {
				console.log(err);
				return res
					.status(500)
					.json({ message: "Database connection error", err });
			}
		});

		const data = req.body;
		console.log("data : ", data);
		const query = `DELETE FROM projects WHERE id = ?`;

		db.run(query, [id], function (err) {
			if (err) {
				console.error("Error updating project:", err.message);
				return res.status(500).json({ error: "Failed to delete project" });
			}

			if (this.changes === 0) {
				return res.status(404).json({ error: "Project not found" });
			}

			res.status(200).json({ message: "Project deleted successfully" });
		});
	});
});
*/

app.delete("/api/projects/:id", async (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const { id } = req.params;

		try {
			const sql = neon(process.env.DATABASE_URL);

			const result = await sql`DELETE FROM projects WHERE id = ${id}`;

			if (result.rowCount === 0) {
				return res.status(404).json({ error: "Project not found" });
			}

			res.status(200).json({ message: "Project deleted successfully" });
		} catch (error) {
			console.error("Error deleting project:", error.message);
			res.status(500).json({ error: "Failed to delete project" });
		}
	});
});

app.put("/api/settings", async (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		try {
			const sql = neon(process.env.DATABASE_URL);
			const { email, password } = req.body;

			if (!email || !password) {
				return res
					.status(400)
					.json({ error: "Email and password are required." });
			}

			const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

			const users = await sql`SELECT email FROM users LIMIT 1`;

			if (users.length === 0) {
				return res.status(404).json({ error: "No user found to update." });
			}

			const userEmail = users[0].email;

			await sql`
			UPDATE users
			SET email = ${email}, password = ${hashedPassword}
			WHERE email = ${userEmail}
		`;

			return res.status(200).json({ message: "User updated successfully." });
		} catch (err) {
			console.error("Server error:", err);
			return res
				.status(500)
				.json({ message: "ServerError", error: err.message });
		}
	});
});

app.post("/api/track", async (req, res) => {
	const { token } = req.cookies;
	let isAdmin = false;

	if (token) {
		try {
			jwt.verify(token, jwtSecret);
			isAdmin = true;
		} catch {
			isAdmin = false;
		}
	}

	if (isAdmin) {
		return res.status(200);
	}

	try {
		const sql = neon(process.env.DATABASE_URL);
		const { deviceId, path, timestamp } = req.body;

		if (!deviceId || !path) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		await sql`
		INSERT INTO analytics (device_id, path, timestamp)
		VALUES (${deviceId}, ${path}, ${timestamp || new Date().toISOString()})
	  `;

		return res.status(201);
	} catch (err) {
		console.error("Server error:", err);
		return res.status(500).json({ message: "ServerError", error: err.message });
	}
});

/*
 *  DEVELOPMENT
 *
 */

app.post("/api/register", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);

		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ error: "Email and password are required." });
		}

		// Hash password
		const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

		// Check user count
		const countResult = await sql`SELECT COUNT(*) AS count FROM users`;
		const userCount = Number(countResult[0]?.count || 0);

		if (userCount >= 1) {
			return res
				.status(403)
				.json({ error: "A user already exists. Registration is closed." });
		}

		// Insert new user
		await sql`
      INSERT INTO users (email, password)
      VALUES (${email}, ${hashedPassword})
    `;

		return res.status(201).json({ message: "User registered successfully." });
	} catch (err) {
		console.error("Server error:", err);
		return res.status(500).json({ message: "ServerError", error: err.message });
	}
});

app.get("/api/users", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);

		const users = await sql`SELECT * FROM users`;
		res.json(users);
	} catch (err) {
		console.error("Error fetching users:", err);
		res.status(500).json({ error: "Failed to fetch users." });
	}
});

app.delete("/api/users", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);
		const result = await sql`DELETE FROM users`;
		// result.command is 'DELETE', result.rowCount is number of rows deleted
		res.json({ message: `Deleted ${result.rowCount} user(s) successfully.` });
	} catch (err) {
		console.error("Error deleting users:", err);
		res.status(500).json({ error: "Failed to delete users." });
	}
});

app.get("/api/usersCount", async (req, res) => {
	try {
		const sql = neon(process.env.DATABASE_URL);

		const result = await sql`SELECT COUNT(*) AS count FROM users`;
		// result is an array of rows, we take the first row's count
		const count = result[0]?.count ?? 0;
		res.json({ count: Number(count) });
	} catch (err) {
		console.error("Error fetching user count:", err);
		res.status(500).json({ error: "Failed to fetch user count." });
	}
});

app.listen(4000);
