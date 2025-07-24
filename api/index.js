const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { nanoid } = require("nanoid");

const path = require("path");

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "guX9tK7rPGyALZq8";

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

app.get("/api/test", (req, res) => {
	try {
		const db = new sqlite3.Database("./database.db");
		res.send("200 OK");
	} catch {
		res.send("400 Bad");
	}
});

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/"); // change to your upload path
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname); // e.g., ".png"
		const uniqueName = Date.now() + ext; // e.g., "1721648412345.png"
		cb(null, uniqueName);
	},
});

const upload = multer({ storage });

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

app.post("/api/login", async (req, res) => {
	const db = new sqlite3.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Database connection error : ", err });
		}
	});

	const { email, password } = req.body;

	const query = `SELECT * FROM users WHERE email = ?`;

	db.get(query, [email], (err, user) => {
		if (err) {
			console.error("DB error:", err.message);
			return res.status(500).json({ message: "Server error" });
		}

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!bcrypt.compareSync(password, user.password)) {
			res.status(401).json({ message: "Invalid password" });
			return;
		}

		// User is authenticated
		jwt.sign({ email: user.email }, jwtSecret, {}, (err, token) => {
			if (err) return res.status(500).json({ message: "Internal error" });
			return res.cookie("token", token).json({ message: "Login succesfull" });
		});
	});
});

app.get("/api/profile", async (req, res) => {
	const db = new sqlite3.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Database connection error : ", err });
		}
	});

	const { token } = req.cookies;
	if (token) {
		jwt.verify(token, jwtSecret, {}, async (err, userData) => {
			if (err) return res.status(500).json({ message: "Internal error" });

			const query = "SELECT email FROM users WHERE email = ?";

			db.get(query, [userData.email], (err, user) => {
				if (err) {
					console.error("DB query error:", err.message);
					return res.status(500).json({ message: "Internal error" });
				}

				if (!user) {
					return res.status(404).json({ message: "User not found" });
				}

				res.json(user);
			});
		});
	} else {
		res.json(null);
	}
});

app.post("/api/logout", (req, res) => {
	res.cookie("token", "").json({ message: "Logged out" });
});

app.get("/api/homePageInfo", (req, res) => {
	const db = new sqlite3.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Database connection error : ", err });
		}
	});

	db.get("SELECT content FROM homePageInfo LIMIT 1", (err, row) => {
		if (err) {
			console.error("DB error:", err.message);
			return res.status(500).json({ error: "Database error" });
		}

		if (!row) {
			return res.status(404).json({ content: "" });
		}

		res.json({ content: row.content });
	});
});

app.get("/api/aboutPageInfo", (req, res) => {
	const db = new sqlite3.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Database connection error : ", err });
		}
	});

	db.get("SELECT content FROM aboutPageInfo LIMIT 1", (err, row) => {
		if (err) {
			console.error("DB error:", err.message);
			return res.status(500).json({ error: "Database error" });
		}

		if (!row) {
			return res.status(404).json({ content: "" });
		}

		res.json({ content: row.content });
	});
});

app.get("/api/contactPageInfo", (req, res) => {
	const db = new sqlite3.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Database connection error : ", err });
		}
	});

	db.all("SELECT * FROM contactPageInfo ORDER BY id", (err, rows) => {
		if (err) {
			console.error("DB error:", err.message);
			return res.status(500).json({ error: "Database error" });
		}
		// Return rows as JSON
		res.json(rows);
	});
});

app.get("/api/contactDetails", (req, res) => {
	const db = new sqlite3.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Database connection error : ", err });
		}
	});

	db.all("SELECT * FROM contactDetails", (err, rows) => {
		if (err) {
			console.error("DB error:", err.message);
			return res.status(500).json({ error: "Database error" });
		}
		// Return rows as JSON
		res.json(rows);
	});
});

app.post("/api/homePageInfo", (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const initialContent = JSON.stringify(req.body);

		const db = new sqlite3.Database("./database.db", (err) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: "Database connection error : ", err });
			}
		});

		db.get("SELECT rowid FROM homePageInfo LIMIT 1", (err, row) => {
			if (err) {
				return res.status(500).json({ message: "Database error : ", err });
			}

			if (!row) {
				// Table is empty — insert
				db.run(
					"INSERT INTO homePageInfo (content) VALUES (?)",
					[initialContent],
					(err) => {
						if (err)
							return res
								.status(500)
								.json({ message: "Database error : ", err });
						else return res.status(200);
					}
				);
			} else {
				// Table has a row — update it using rowid
				db.run(
					"UPDATE homePageInfo SET content = ? WHERE rowid = ?",
					[initialContent, row.rowid],
					(err) => {
						if (err)
							return res
								.status(500)
								.json({ message: "Database error : ", err });
						else res.status(200).json({ message: "Inserted successfully" });
					}
				);
			}
		});
	});
});

app.get("/api/homePageProfile", async (req, res) => {
	const db = new sqlite3.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Database connection error : ", err });
		}
	});

	try {
		const query = `SELECT * FROM profilePicture LIMIT 1`;
		db.get(query, (err, row) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ message: "Internal server error." });
			}

			if (!row) {
				return res.status(404).json({ message: "No profile data found." });
			}

			console.log("filename: ", row.filename);

			const profileTableContent = {
				filename: row.filename,
				blobPath: row.blobPath,
				crop: JSON.parse(row.crop),
				zoom: row.zoom,
			};

			res.json(profileTableContent);
		});
	} catch (err) {
		console.error("Error fetching homepage profile:", err.message);
		res.status(500).json({ message: "Internal server error." });
	}
});

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

app.post("/api/aboutPageInfo", (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const initialContent = JSON.stringify(req.body);
		console.log("initialContent : ", initialContent);
		const db = new sqlite3.Database("./database.db", (err) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: "Database connection error : ", err });
			}
		});

		db.get("SELECT rowid FROM aboutPageInfo LIMIT 1", (err, row) => {
			if (err) {
				return res.status(500).json({ message: "Database error : ", err });
			}

			if (!row) {
				// Table is empty — insert
				db.run(
					"INSERT INTO aboutPageInfo (content) VALUES (?)",
					[initialContent],
					(err) => {
						if (err)
							return res
								.status(500)
								.json({ message: "Database error : ", err });
						else return res.status(200);
					}
				);
			} else {
				// Table has a row — update it using rowid
				db.run(
					"UPDATE aboutPageInfo SET content = ? WHERE rowid = ?",
					[initialContent, row.rowid],
					(err) => {
						if (err)
							return res
								.status(500)
								.json({ message: "Database error : ", err });
						else res.status(200).json({ message: "Inserted successfully" });
					}
				);
			}
		});
	});
});

app.post("/api/contactPageInfoAndDetails", (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const db = new sqlite3.Database("./database.db", (err) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: "Database connection error : ", err });
			}
		});

		const { contactInfo, contactDetails } = req.body;

		db.all(
			"SELECT id FROM contactPageInfo ORDER BY id LIMIT 2",
			(err, rows) => {
				if (err) {
					console.error("Failed to read contactPageInfo table:", err.message);
					return;
				}

				if (rows.length === 0) {
					// Table empty, insert both
					db.run(
						"INSERT INTO contactPageInfo (content) VALUES (?)",
						[JSON.stringify(contactInfo[0])],
						function (err) {
							if (err) return console.error("Insert failed:", err.message);

							db.run(
								"INSERT INTO contactPageInfo (content) VALUES (?)",
								[JSON.stringify(contactInfo[1])],
								function (err) {
									if (err) return console.error("Insert failed:", err.message);

									console.log("Inserted both contact page contents.");
								}
							);
						}
					);
				} else {
					// Table has some rows, update the first two rows

					// Update first row (if exists)
					if (rows[0]) {
						db.run(
							"UPDATE contactPageInfo SET content = ? WHERE id = ?",
							[JSON.stringify(contactInfo[0]), rows[0].id],
							(err) => {
								if (err) console.error("Update failed:", err.message);
								else console.log("Updated first contact content.");
							}
						);
					}

					// Update second row (if exists)
					if (rows[1]) {
						db.run(
							"UPDATE contactPageInfo SET content = ? WHERE id = ?",
							[JSON.stringify(contactInfo[1]), rows[1].id],
							(err) => {
								if (err) console.error("Update failed:", err.message);
								else console.log("Updated second contact content.");
							}
						);
					}

					// If only 1 row exists, insert the second
					if (rows.length === 1) {
						db.run(
							"INSERT INTO contactPageInfo (content) VALUES (?)",
							[JSON.stringify(contactInfo[1])],
							(err) => {
								if (err) return console.error("Insert failed:", err.message);
								console.log("Inserted second contact content as new row.");
							}
						);
					}
				}
			}
		);

		db.all("SELECT type FROM contactDetails", (err, rows) => {
			if (err) {
				console.error("Failed to read contactDetails table:", err.message);
				return;
			}

			const existingTypes = rows.map((row) => row.type);

			contactDetails.forEach((entry) => {
				if (existingTypes.includes(entry.type)) {
					// Update existing entry
					db.run(
						"UPDATE contactDetails SET content = ? WHERE type = ?",
						[entry.content, entry.type],
						(err) => {
							if (err) {
								console.error(`Failed to update ${entry.type}:`, err.message);
							} else {
								console.log(`Updated ${entry.type}`);
							}
						}
					);
				} else {
					// Insert new entry
					db.run(
						"INSERT INTO contactDetails (type, content) VALUES (?, ?)",
						[entry.type, entry.content],
						(err) => {
							if (err) {
								console.error(`Failed to insert ${entry.type}:`, err.message);
							} else {
								console.log(`Inserted ${entry.type}`);
							}
						}
					);
				}
			});
		});
	});

	return res.status(200).json({ message: "succes" });
});

app.get("/api/projects", (req, res) => {
	const db = new sqlite3.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Database connection error : ", err });
		}
	});

	const query = `SELECT id, title, coverImage, published FROM projects WHERE published = 1`;

	db.all(query, [], (err, rows) => {
		if (err) {
			console.error("Error fetching projects:", err.message);
			return res.status(500).json({ error: "Failed to fetch projects" });
		}

		const parsedRows = rows.map((row) => {
			return {
				...row,
				published: Boolean(row.published),
			};
		});

		res.status(200).json(parsedRows);
	});
});

app.get("/api/projectsDraft", (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const db = new sqlite3.Database("./database.db", (err) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: "Database connection error : ", err });
			}
		});

		const query = `SELECT id, title, coverImage, published FROM projects WHERE published = 0`;

		db.all(query, [], (err, rows) => {
			if (err) {
				console.error("Error fetching projects:", err.message);
				return res.status(500).json({ error: "Failed to fetch projects" });
			}

			const parsedRows = rows.map((row) => {
				return {
					...row,
					published: Boolean(row.published),
				};
			});

			res.status(200).json(parsedRows);
		});
	});
});

app.post("/api/projects", (req, res) => {
	const { token } = req.cookies;

	if (!token) return res.json(null);

	jwt.verify(token, jwtSecret, {}, async (err, userData) => {
		if (err) return res.status(500).json({ message: "Internal error" });

		const db = new sqlite3.Database("./database.db", (err) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: "Database connection error : ", err });
			}
		});

		const id = await generateUniqueProjectId(db);

		db.run(
			`INSERT INTO projects (id, title, coverImage, content, published) VALUES (?, ?, ?, ?, ?)`,
			[
				id,
				"title",
				"uploads/temp.avif",
				`[
				{
					"id": "8e56525d-a0d7-4f37-a24e-d203d7eefa64",
					"type": "paragraph",
					"props": {
						"textColor": "default",
						"backgroundColor": "default",
						"textAlignment": "left"
					},
					"content": [],
					"children": []
				}
				]`,
				0,
			],
			(err) => {
				if (err) {
					return res
						.status(500)
						.json({ message: "Database connection error", error: err });
				}

				return res.status(200).json({ id });
			}
		);
	});
});

app.get("/api/projects/:id", (req, res) => {
	const { id } = req.params;

	const db = new sqlite3.Database("./database.db", (err) => {
		if (err) {
			console.log(err);
			return res
				.status(500)
				.json({ message: "Database connection error", err });
		}
	});

	const query = `SELECT * FROM projects WHERE id = ?`;

	db.get(query, [id], (err, row) => {
		if (err) {
			console.error("Error fetching project:", err.message);
			return res.status(500).json({ error: "Failed to fetch project" });
		}

		if (!row) {
			return res.status(404).json({ error: "Project not found" });
		}

		row.published = Boolean(row.published);
		row.content = JSON.parse(row.content);

		res.status(200).json(row);
	});
});

app.put("/api/moveProject/:id", (req, res) => {
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

		const published = req.body.published;

		const query = `UPDATE projects SET published = ? WHERE id = ?`;

		db.run(query, [published, id], function (err) {
			if (err) {
				console.error("Error updating project:", err.message);
				return res.status(500).json({ error: "Failed to update project" });
			}

			if (this.changes === 0) {
				return res.status(404).json({ error: "Project not found" });
			}

			res.status(200).json({ message: "Project updated successfully" });
		});
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

		const fileUrl = `uploads/${req.file.filename}`;

		return res.send(fileUrl);
	});
});

app.put("/api/projects/:id", (req, res) => {
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
		const query = `UPDATE projects SET title = ?, coverImage = ?, content = ? WHERE id = ?`;

		db.run(
			query,
			[data.title, data.coverImage, data.content, id],
			function (err) {
				if (err) {
					console.error("Error updating project:", err.message);
					return res.status(500).json({ error: "Failed to update project" });
				}

				if (this.changes === 0) {
					return res.status(404).json({ error: "Project not found" });
				}

				res.status(200).json({ message: "Project updated successfully" });
			}
		);
	});
});

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

/*
 *  DEVELOPMENT
 *
 */

function createTables() {
	const db = new sqlite3.Database("./database.db");
	try {
		db.run(
			`
    	CREATE TABLE IF NOT EXISTS users (
      	email TEXT PRIMARY KEY,
      	password TEXT NOT NULL
    	)
 		`
		);

		db.run(
			`
    	CREATE TABLE IF NOT EXISTS homePageInfo (
  		content TEXT
		)
  		`
		);

		db.run(
			`
    	CREATE TABLE IF NOT EXISTS aboutPageInfo (
  		content TEXT
		)
  		`
		);

		db.run(
			`
    	CREATE TABLE IF NOT EXISTS contactPageInfo (
  		id INTEGER PRIMARY KEY AUTOINCREMENT,
  		content TEXT
		)
  		`
		);

		db.run(
			`
		CREATE TABLE IF NOT EXISTS contactDetails (
		type TEXT PRIMARY KEY,
		content TEXT
		)	
		`
		);

		db.run(
			`
		CREATE TABLE IF NOT EXISTS profilePicture (
  		filename TEXT PRIMARY KEY,
  		blobPath TEXT,
  		crop TEXT,
  		zoom REAL
		)
		`
		);

		db.run(
			`
		CREATE TABLE IF NOT EXISTS projects (
		  id TEXT PRIMARY KEY,
		  title TEXT NOT NULL,
		  coverImage TEXT,
		  content TEXT,
		published BOOLEAN NOT NULL DEFAULT 0
		)
		`
		);

		//db.run(`DROP TABLE IF EXISTS projects`);

		const initialContent = `[
    {
        "id": "7162deb9-8e18-4723-bfc9-b4e97fddee60",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Yunus Emre SAĞLAM",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "a5f5499d-9806-4132-82d7-8a6570bf1bda",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 1,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Mesleki Rolünüz",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "73f93e0e-b971-4bc3-beb2-aa40394a72b2",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Genel hatlarıyla ne yaptığınızdan kısaca bahsedin",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "d6519ab1-5eec-48fa-a534-68a28e9fed94",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    }
]`;

		db.get("SELECT rowid FROM homePageInfo LIMIT 1", (err, row) => {
			if (err) {
				console.error("Failed to read table:", err.message);
				return;
			}

			if (!row) {
				// Table is empty — insert
				db.run(
					"INSERT INTO homePageInfo (content) VALUES (?)",
					[initialContent],
					(err) => {
						if (err) console.error("Insert failed:", err.message);
						else console.log("Inserted new homepage content.");
					}
				);
			} else {
				// Table has a row — update it using rowid
				db.run(
					"UPDATE homePageInfo SET content = ? WHERE rowid = ?",
					[initialContent, row.rowid],
					(err) => {
						if (err) console.error("Update failed:", err.message);
						else console.log("Updated existing homepage content.");
					}
				);
			}
		});

		const initialContentAbout = `[
    {
        "id": "44f1f90c-d4da-43af-85c9-c384d63e5f5b",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 1,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Çekici bir başlık ekleyin",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "feba26e7-8cc0-4bf0-8053-171e0ab11291",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "d8bf9dda-6897-4b25-8ec5-7383d24f8c81",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Bu alanda kendinizden bahsedin, istediğiniz kadar anlatabilirsiniz. Kariyerinizi bulundğunuz şirketleri ekleyebilirsiniz. Uzun tutmaya özen gösterin ama aralara da boşluklar ekleyin. İstediğiniz gibi şekillendirin.",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "6813fb1a-0e04-46f6-ac18-0c572c0851e9",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": [
            {
                "id": "78886eeb-e8d6-4490-b3fb-c408c2f314b8",
                "type": "paragraph",
                "props": {
                    "textColor": "default",
                    "backgroundColor": "default",
                    "textAlignment": "left"
                },
                "content": [
                    {
                        "type": "text",
                        "text": "Bazı alıntılar yapın",
                        "styles": {}
                    }
                ],
                "children": []
            },
            {
                "id": "8ab303df-fb6d-4d55-8ff4-26fe94f9cb6d",
                "type": "paragraph",
                "props": {
                    "textColor": "default",
                    "backgroundColor": "default",
                    "textAlignment": "left"
                },
                "content": [
                    {
                        "type": "text",
                        "text": "Yada bölümler ekleyin",
                        "styles": {}
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "id": "93f39ae2-5613-49f3-ac3c-744fd1e6fcb8",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "32dc002b-abdc-4c49-9215-1e31ec2560d4",
        "type": "bulletListItem",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Sıralama yapın",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "4c89cd1a-b570-4424-95dd-e17fae81b06e",
        "type": "bulletListItem",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Yada yapmayın",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "58747be2-ab9a-4830-b7d6-74070ba2e8dc",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "d18c2b95-0b7f-4c14-8017-f71e3f0a9009",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 2,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Küçük Başlık",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "3c4aa825-7585-470f-86e5-0b5d42b960f0",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 3,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Daha Küçük Başlık",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "ed4f8b60-2375-4a17-a8fb-6ce434daf014",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Kendinizi istediğiniz gibi anlatabilirsiniz!",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "fd08f289-41cc-43fd-8487-32091dde3dc2",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    }
]`;

		db.get("SELECT rowid FROM aboutPageInfo LIMIT 1", (err, row) => {
			if (err) {
				console.error("Failed to read table:", err.message);
				return;
			}

			if (!row) {
				// Table is empty — insert
				db.run(
					"INSERT INTO aboutPageInfo (content) VALUES (?)",
					[initialContentAbout],
					(err) => {
						if (err) console.error("Insert failed:", err.message);
						else console.log("Inserted new homepage content.");
					}
				);
			} else {
				// Table has a row — update it using rowid
				db.run(
					"UPDATE aboutPageInfo SET content = ? WHERE rowid = ?",
					[initialContentAbout, row.rowid],
					(err) => {
						if (err) console.error("Update failed:", err.message);
						else console.log("Updated existing homepage content.");
					}
				);
			}
		});

		const initialContentContact1 = `[
    {
        "id": "95a95f33-5871-4bb5-8698-5607cd30b3d3",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 1,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "BANA ULAŞIN",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "52dcddc9-af29-4b9f-8dd4-a73c2170a035",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    }
]`;

		const initialContentContact2 = `[
    {
        "id": "ced3aeb1-4497-46cd-bbaa-2e498eb1f68a",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Bu alana ne için iletişime geçileceğinden bahsedin, ne satıyorsunuz? Kısa tutun detayları sonra sorabilirler.",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "c6dd0f06-ae42-458e-8d20-a78c59190eb4",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    }
]`;

		db.all(
			"SELECT id FROM contactPageInfo ORDER BY id LIMIT 2",
			(err, rows) => {
				if (err) {
					console.error("Failed to read contactPageInfo table:", err.message);
					return;
				}

				if (rows.length === 0) {
					// Table empty, insert both
					db.run(
						"INSERT INTO contactPageInfo (content) VALUES (?)",
						[initialContentContact1],
						function (err) {
							if (err) return console.error("Insert failed:", err.message);

							db.run(
								"INSERT INTO contactPageInfo (content) VALUES (?)",
								[initialContentContact2],
								function (err) {
									if (err) return console.error("Insert failed:", err.message);

									console.log("Inserted both contact page contents.");
								}
							);
						}
					);
				} else {
					// Table has some rows, update the first two rows

					// Update first row (if exists)
					if (rows[0]) {
						db.run(
							"UPDATE contactPageInfo SET content = ? WHERE id = ?",
							[initialContentContact1, rows[0].id],
							(err) => {
								if (err) console.error("Update failed:", err.message);
								else console.log("Updated first contact content.");
							}
						);
					}

					// Update second row (if exists)
					if (rows[1]) {
						db.run(
							"UPDATE contactPageInfo SET content = ? WHERE id = ?",
							[initialContentContact2, rows[1].id],
							(err) => {
								if (err) console.error("Update failed:", err.message);
								else console.log("Updated second contact content.");
							}
						);
					}

					// If only 1 row exists, insert the second
					if (rows.length === 1) {
						db.run(
							"INSERT INTO contactPageInfo (content) VALUES (?)",
							[initialContentContact2],
							(err) => {
								if (err) return console.error("Insert failed:", err.message);
								console.log("Inserted second contact content as new row.");
							}
						);
					}
				}
			}
		);

		const contactEntries = [
			{ type: "linkedin", content: "linkedin.com/your-linked-in" },
			{ type: "email", content: "yourmail@mail.com" },
			{ type: "phone", content: "53X XXX XX XX" },
		];

		db.all("SELECT type FROM contactDetails", (err, rows) => {
			if (err) {
				console.error("Failed to read contactDetails table:", err.message);
				return;
			}

			const existingTypes = rows.map((row) => row.type);

			contactEntries.forEach((entry) => {
				if (existingTypes.includes(entry.type)) {
					// Update existing entry
					db.run(
						"UPDATE contactDetails SET content = ? WHERE type = ?",
						[entry.content, entry.type],
						(err) => {
							if (err) {
								console.error(`Failed to update ${entry.type}:`, err.message);
							} else {
								console.log(`Updated ${entry.type}`);
							}
						}
					);
				} else {
					// Insert new entry
					db.run(
						"INSERT INTO contactDetails (type, content) VALUES (?, ?)",
						[entry.type, entry.content],
						(err) => {
							if (err) {
								console.error(`Failed to insert ${entry.type}:`, err.message);
							} else {
								console.log(`Inserted ${entry.type}`);
							}
						}
					);
				}
			});
		});

		/*
		 *	TODO
		 *	There is a problem when the tabels resetted we need to manuelly upload and change
		 * 	the profile image do not know what is it about however its not that important
		 *
		 */
		const initialContentProfileTable = {
			filename: "/uploads/temp1.jpg",
			blobPath:
				"M128,241.30090210267474C148.67094339889024,238.6480989784428,163.86225194726708,221.90806164742764,179.4910111402952,208.12157726951614C193.0354195462756,196.1737461851137,202.17611861120156,181.37781202086975,212.62822674156558,166.64841616358547C225.73823075888856,148.17344092861228,247.31476600955864,133.26638052123596,248.65608087409157,110.6522745318036C250.03604057046618,87.38663000632762,234.83309438473773,66.26738557723712,219.6299237763639,48.60221907923582C204.39227263058066,30.89698827820404,184.88100922329235,17.193915633513882,162.49117284209825,10.533852797342547C140.0529390494013,3.859393705824382,114.65787826097726,0.7359792444611912,93.68657656044596,11.139211669307358C73.55963847178342,21.12358068592119,67.01321860276667,45.622909564201265,54.34818465224505,64.18033871041945C43.32554359337655,80.3312532088147,30.55572683080905,94.5990411877701,24.124513326697894,113.06495973821502C16.54163181268895,134.8376582073068,5.53604950044663,158.61727382119682,13.987521906247181,180.06775411548116C22.482731085702866,201.6292416705573,46.8355239848639,211.56060895070746,67.25198273286749,222.52575996569482C86.30984105629277,232.76124189318756,106.54342542590844,244.0545291126796,128,241.30090210267474Z",
			crop: {
				x: 0,
				y: 77,
			},
			zoom: 1,
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
							console.error("Error inserting into profilePicture:", insertErr);
						} else {
							console.log("profilePicture inserted.");
						}
					}
				);
			}
		});

		const initialContentProjects = [
			{
				title: "test project",
				coverImage: "uploads/temp.avif",
				content: `[
    {
        "id": "44f1f90c-d4da-43af-85c9-c384d63e5f5b",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 1,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Çekici bir başlık ekleyin",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "feba26e7-8cc0-4bf0-8053-171e0ab11291",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "d8bf9dda-6897-4b25-8ec5-7383d24f8c81",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Bu alanda kendinizden bahsedin, istediğiniz kadar anlatabilirsiniz. Kariyerinizi bulundğunuz şirketleri ekleyebilirsiniz. Uzun tutmaya özen gösterin ama aralara da boşluklar ekleyin. İstediğiniz gibi şekillendirin.",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "6813fb1a-0e04-46f6-ac18-0c572c0851e9",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": [
            {
                "id": "78886eeb-e8d6-4490-b3fb-c408c2f314b8",
                "type": "paragraph",
                "props": {
                    "textColor": "default",
                    "backgroundColor": "default",
                    "textAlignment": "left"
                },
                "content": [
                    {
                        "type": "text",
                        "text": "Bazı alıntılar yapın",
                        "styles": {}
                    }
                ],
                "children": []
            },
            {
                "id": "8ab303df-fb6d-4d55-8ff4-26fe94f9cb6d",
                "type": "paragraph",
                "props": {
                    "textColor": "default",
                    "backgroundColor": "default",
                    "textAlignment": "left"
                },
                "content": [
                    {
                        "type": "text",
                        "text": "Yada bölümler ekleyin",
                        "styles": {}
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "id": "93f39ae2-5613-49f3-ac3c-744fd1e6fcb8",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "32dc002b-abdc-4c49-9215-1e31ec2560d4",
        "type": "bulletListItem",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Sıralama yapın",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "4c89cd1a-b570-4424-95dd-e17fae81b06e",
        "type": "bulletListItem",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Yada yapmayın",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "58747be2-ab9a-4830-b7d6-74070ba2e8dc",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "d18c2b95-0b7f-4c14-8017-f71e3f0a9009",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 2,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Küçük Başlık",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "3c4aa825-7585-470f-86e5-0b5d42b960f0",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 3,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Daha Küçük Başlık",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "ed4f8b60-2375-4a17-a8fb-6ce434daf014",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Kendinizi istediğiniz gibi anlatabilirsiniz!",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "fd08f289-41cc-43fd-8487-32091dde3dc2",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    }
]`,
				published: 1,
			},
			{
				title: "test project 2",
				coverImage: "uploads/temp.avif",
				content: `[
    {
        "id": "44f1f90c-d4da-43af-85c9-c384d63e5f5b",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 1,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Çekici bir başlık ekleyin",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "feba26e7-8cc0-4bf0-8053-171e0ab11291",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "d8bf9dda-6897-4b25-8ec5-7383d24f8c81",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Bu alanda kendinizden bahsedin, istediğiniz kadar anlatabilirsiniz. Kariyerinizi bulundğunuz şirketleri ekleyebilirsiniz. Uzun tutmaya özen gösterin ama aralara da boşluklar ekleyin. İstediğiniz gibi şekillendirin.",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "6813fb1a-0e04-46f6-ac18-0c572c0851e9",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": [
            {
                "id": "78886eeb-e8d6-4490-b3fb-c408c2f314b8",
                "type": "paragraph",
                "props": {
                    "textColor": "default",
                    "backgroundColor": "default",
                    "textAlignment": "left"
                },
                "content": [
                    {
                        "type": "text",
                        "text": "Bazı alıntılar yapın",
                        "styles": {}
                    }
                ],
                "children": []
            },
            {
                "id": "8ab303df-fb6d-4d55-8ff4-26fe94f9cb6d",
                "type": "paragraph",
                "props": {
                    "textColor": "default",
                    "backgroundColor": "default",
                    "textAlignment": "left"
                },
                "content": [
                    {
                        "type": "text",
                        "text": "Yada bölümler ekleyin",
                        "styles": {}
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "id": "93f39ae2-5613-49f3-ac3c-744fd1e6fcb8",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "32dc002b-abdc-4c49-9215-1e31ec2560d4",
        "type": "bulletListItem",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Sıralama yapın",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "4c89cd1a-b570-4424-95dd-e17fae81b06e",
        "type": "bulletListItem",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Yada yapmayın",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "58747be2-ab9a-4830-b7d6-74070ba2e8dc",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "d18c2b95-0b7f-4c14-8017-f71e3f0a9009",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 2,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Küçük Başlık",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "3c4aa825-7585-470f-86e5-0b5d42b960f0",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 3,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Daha Küçük Başlık",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "ed4f8b60-2375-4a17-a8fb-6ce434daf014",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Kendinizi istediğiniz gibi anlatabilirsiniz!",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "fd08f289-41cc-43fd-8487-32091dde3dc2",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    }
]`,
				published: 1,
			},

			{
				title: "test project 3",
				coverImage: "uploads/temp.avif",
				content: `[
    {
        "id": "44f1f90c-d4da-43af-85c9-c384d63e5f5b",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 1,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Çekici bir başlık ekleyin",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "feba26e7-8cc0-4bf0-8053-171e0ab11291",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "d8bf9dda-6897-4b25-8ec5-7383d24f8c81",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Bu alanda kendinizden bahsedin, istediğiniz kadar anlatabilirsiniz. Kariyerinizi bulundğunuz şirketleri ekleyebilirsiniz. Uzun tutmaya özen gösterin ama aralara da boşluklar ekleyin. İstediğiniz gibi şekillendirin.",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "6813fb1a-0e04-46f6-ac18-0c572c0851e9",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": [
            {
                "id": "78886eeb-e8d6-4490-b3fb-c408c2f314b8",
                "type": "paragraph",
                "props": {
                    "textColor": "default",
                    "backgroundColor": "default",
                    "textAlignment": "left"
                },
                "content": [
                    {
                        "type": "text",
                        "text": "Bazı alıntılar yapın",
                        "styles": {}
                    }
                ],
                "children": []
            },
            {
                "id": "8ab303df-fb6d-4d55-8ff4-26fe94f9cb6d",
                "type": "paragraph",
                "props": {
                    "textColor": "default",
                    "backgroundColor": "default",
                    "textAlignment": "left"
                },
                "content": [
                    {
                        "type": "text",
                        "text": "Yada bölümler ekleyin",
                        "styles": {}
                    }
                ],
                "children": []
            }
        ]
    },
    {
        "id": "93f39ae2-5613-49f3-ac3c-744fd1e6fcb8",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "32dc002b-abdc-4c49-9215-1e31ec2560d4",
        "type": "bulletListItem",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Sıralama yapın",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "4c89cd1a-b570-4424-95dd-e17fae81b06e",
        "type": "bulletListItem",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Yada yapmayın",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "58747be2-ab9a-4830-b7d6-74070ba2e8dc",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    },
    {
        "id": "d18c2b95-0b7f-4c14-8017-f71e3f0a9009",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 2,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Küçük Başlık",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "3c4aa825-7585-470f-86e5-0b5d42b960f0",
        "type": "heading",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left",
            "level": 3,
            "isToggleable": false
        },
        "content": [
            {
                "type": "text",
                "text": "Daha Küçük Başlık",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "ed4f8b60-2375-4a17-a8fb-6ce434daf014",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "Kendinizi istediğiniz gibi anlatabilirsiniz!",
                "styles": {}
            }
        ],
        "children": []
    },
    {
        "id": "fd08f289-41cc-43fd-8487-32091dde3dc2",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [],
        "children": []
    }
]`,
				published: 0,
			},
		];

		async function resetAndInsertProjects(db, projects) {
			// Wait for delete to finish
			await new Promise((resolve, reject) => {
				db.run("DELETE FROM projects", (err) => {
					if (err) reject(err);
					else resolve();
				});
			});

			// Insert projects one by one
			for (const project of projects) {
				const id = await generateUniqueProjectId(db);
				await new Promise((resolve, reject) => {
					db.run(
						`INSERT INTO projects (id, title, coverImage, content, published) VALUES (?, ?, ?, ?, ?)`,
						[
							id,
							project.title,
							project.coverImage,
							project.content,
							project.published,
						],
						(err) => {
							if (err) reject(err);
							else resolve();
						}
					);
				});
			}
		}

		resetAndInsertProjects(db, initialContentProjects).then(() => {
			db.all("SELECT * FROM projects", [], (err, rows) => {
				if (err)
					return console.error("Error fetching projects content:", err.message);
				console.log("projects:");
				console.log(rows);
			});
		});

		// Query users table
		db.all("SELECT * FROM users", [], (err, rows) => {
			if (err) return console.error("Error fetching users:", err.message);
			console.log("Users:");
			console.log(rows);
		});

		// Query homePageInfo table
		db.all("SELECT * FROM homePageInfo", [], (err, rows) => {
			if (err)
				return console.error("Error fetching homepage content:", err.message);
			console.log("Home Page Info:");
			console.log(rows);
		});

		db.all("SELECT * FROM aboutPageInfo", [], (err, rows) => {
			if (err)
				return console.error("Error fetching aboutpage content:", err.message);
			console.log("About Page Info:");
			console.log(rows);
		});

		db.all("SELECT * FROM contactPageInfo", [], (err, rows) => {
			if (err)
				return console.error("Error fetching contact content:", err.message);
			console.log("Contact Page Info:");
			console.log(rows);
		});

		db.all("SELECT * FROM contactDetails", [], (err, rows) => {
			if (err)
				return console.error("Error fetching contact details:", err.message);
			console.log("Contact Details Info:");
			console.log(rows);
		});

		db.all("SELECT * FROM profilePicture", [], (err, rows) => {
			if (err)
				return console.error(
					"Error fetching profile picture content:",
					err.message
				);
			console.log("Profile Picture:");
			console.log(rows);
		});
	} catch {
		console.log("error");
	}
}

//For starting only
//createTables();

app.post("/api/register", (req, res) => {
	try {
		const db = new sqlite3.Database("./database.db");
		let { email, password } = req.body;
		password = bcrypt.hashSync(password, bcryptSalt);

		if (!email || !password) {
			return res
				.status(400)
				.json({ error: "Email and password are required." });
		}

		const countQuery = "SELECT COUNT(*) AS count FROM users";
		db.get(countQuery, [], (err, row) => {
			if (err) {
				console.error("DB error:", err.message);
				return res
					.status(500)
					.json({ error: "Database error checking user count." });
			}

			if (row.count >= 1) {
				return res
					.status(403)
					.json({ error: "A user already exists. Registration is closed." });
			}

			const insertQuery = "INSERT INTO users (email, password) VALUES (?, ?)";
			db.run(insertQuery, [email, password], function (err) {
				if (err) {
					console.error("DB insert error:", err.message);
					return res.status(500).json({ error: "Failed to register user." });
				}

				return res
					.status(201)
					.json({ message: "User registered successfully." });
			});
		});
	} catch {
		console.log(err);
		res.status(500).json({ message: "ServerError: ", err });
	}
});

app.get("/api/users", (req, res) => {
	const db = new sqlite3.Database("./database.db");
	const query = "SELECT * FROM users";

	db.all(query, [], (err, rows) => {
		if (err) {
			console.error("Error fetching users:", err.message);
			return res.status(500).json({ error: "Failed to fetch users." });
		}
		res.json(rows);
	});
});
app.delete("/api/users", (req, res) => {
	const db = new sqlite3.Database("./database.db");
	db.run("DELETE FROM users", function (err) {
		if (err) {
			console.error("Error deleting users:", err.message);
			return res.status(500).json({ error: "Failed to delete users." });
		}
		res.json({ message: `Deleted ${this.changes} user(s) successfully.` });
	});
});
app.get("/api/usersCount", (req, res) => {
	const db = new sqlite3.Database("./database.db");
	const query = "SELECT COUNT(*) AS count FROM users";

	db.get(query, [], (err, row) => {
		if (err) {
			console.error("Error fetching user count:", err.message);
			return res.status(500).json({ error: "Failed to fetch user count." });
		}
		res.json({ count: row.count });
	});
});

app.listen(4000);
