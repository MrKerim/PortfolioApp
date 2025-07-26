require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
	await sql`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL
      );
      `;

	await sql`
      CREATE TABLE IF NOT EXISTS homePageInfo (
        content TEXT
      );
      `;

	await sql`
      CREATE TABLE IF NOT EXISTS aboutPageInfo (
        content TEXT
      );
      `;

	await sql`
      CREATE TABLE IF NOT EXISTS contactPageInfo (
        id SERIAL PRIMARY KEY,
        content TEXT
      );
      `;

	await sql`
      CREATE TABLE IF NOT EXISTS contactDetails (
        type TEXT PRIMARY KEY,
        content TEXT
      );
      `;

	await sql`
      CREATE TABLE IF NOT EXISTS profilePicture (
        filename TEXT PRIMARY KEY,
        blobPath TEXT,
        crop TEXT,
        zoom REAL
      );
      `;

	await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        coverImage TEXT,
        content TEXT,
        published BOOLEAN NOT NULL DEFAULT FALSE
      );
    `;

	console.log("Tables Created");
}

async function homePageInfoInit() {
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

	await sql`INSERT INTO homePageInfo (content) VALUES (${initialContent})`;

	console.log("Inserted inital values into homepageInfo");
}

async function aboutPageInfoInit() {
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

	await sql`INSERT INTO aboutPageInfo (content) VALUES (${initialContentAbout})`;

	console.log("Inserted inital values into aboutPageInfo");
}

async function contactPageInfoInit() {
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

	await sql`
    INSERT INTO contactPageInfo (content) 
    VALUES (${initialContentContact1}), (${initialContentContact2})
    `;

	console.log("Inserted inital values into contactPageInfo");
}

async function contactDetailsInit() {
	const contactEntries = [
		{ type: "linkedin", content: "linkedin.com/your-linked-in" },
		{ type: "email", content: "yourmail@mail.com" },
		{ type: "phone", content: "53X XXX XX XX" },
	];

	await sql`
    INSERT INTO contactDetails (type, content) 
    VALUES (${contactEntries[0].type},${contactEntries[0].content} ),
    (${contactEntries[1].type},${contactEntries[1].content} ),
    (${contactEntries[2].type},${contactEntries[2].content} );
    `;

	console.log("Inserted inital values into contactDetails");
}

async function profilePictureInit() {
	const initialContentProfileTable = {
		filename: "/uploads/temp1.jpg",
		blobPath:
			"M128,241.30090210267474C148.67094339889024,238.6480989784428,163.86225194726708,221.90806164742764,179.4910111402952,208.12157726951614C193.0354195462756,196.1737461851137,202.17611861120156,181.37781202086975,212.62822674156558,166.64841616358547C225.73823075888856,148.17344092861228,247.31476600955864,133.26638052123596,248.65608087409157,110.6522745318036C250.03604057046618,87.38663000632762,234.83309438473773,66.26738557723712,219.6299237763639,48.60221907923582C204.39227263058066,30.89698827820404,184.88100922329235,17.193915633513882,162.49117284209825,10.533852797342547C140.0529390494013,3.859393705824382,114.65787826097726,0.7359792444611912,93.68657656044596,11.139211669307358C73.55963847178342,21.12358068592119,67.01321860276667,45.622909564201265,54.34818465224505,64.18033871041945C43.32554359337655,80.3312532088147,30.55572683080905,94.5990411877701,24.124513326697894,113.06495973821502C16.54163181268895,134.8376582073068,5.53604950044663,158.61727382119682,13.987521906247181,180.06775411548116C22.482731085702866,201.6292416705573,46.8355239848639,211.56060895070746,67.25198273286749,222.52575996569482C86.30984105629277,232.76124189318756,106.54342542590844,244.0545291126796,128,241.30090210267474Z",
		crop: JSON.stringify({
			x: 0,
			y: 77,
		}),
		zoom: 1,
	};

	await sql`
    INSERT INTO profilePicture (filename, blobPath,crop,zoom) 
    VALUES (${initialContentProfileTable.filename},
    ${initialContentProfileTable.blobPath},
    ${initialContentProfileTable.crop},
    ${initialContentProfileTable.zoom} );
    `;

	console.log("Inserted inital values into profilePicture");
}

async function projectsInit() {
	const initialContentProjects = [
		{
			id: "test1",
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
			id: "test2",
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
			id: "test3",
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

	for (const entry of initialContentProjects) {
		await sql`
          INSERT INTO projects (id, title, coverImage, content, published)
          VALUES (${entry.id},
          ${entry.title},
          ${entry.coverImage},
          ${entry.content},
          ${entry.published})
        `;
	}

	console.log("Inserted inital values into projects");
}

async function init() {
	//createTables().catch(console.error);
	//homePageInfoInit().catch(console.error);
	//aboutPageInfoInit().catch(console.error);
	//contactPageInfoInit().catch(console.error);
	//contactDetailsInit().catch(console.error);
	//profilePictureInit().catch(console.error);
	//projectsInit().catch(console.error);
}

init();
