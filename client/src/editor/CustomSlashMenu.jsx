import { insertOrUpdateBlock, filterSuggestionItems } from "@blocknote/core";
import {
	getDefaultReactSlashMenuItems,
	SuggestionMenuController,
} from "@blocknote/react";
import { HiCube } from "react-icons/hi";

import axios from "axios";

import { toast } from "sonner";

async function upload3dfiletoAWS(file) {
	const formData = new FormData();
	formData.append("model", file);

	const uploadPromise = axios.post("/upload3d", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	// Show toast but don't return toast.promise directly
	toast.promise(uploadPromise, {
		loading: "3D file is loading...",
		success: "3D file loaded successfully!",
		error: "Error loading 3D file.",
	});

	// Return the raw axios promise result for BlockNote
	const response = await uploadPromise;
	return response.data;
}

const insert3DObjectItem = (editor) => ({
	title: "Insert 3D Object",
	subtext: "Upload and render a 3D model",
	icon: <HiCube size={18} />,
	onItemClick: async () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".glb,.gltf,.obj,.fbx,.stl";
		input.click();

		input.onchange = async () => {
			if (input.files?.[0]) {
				const file = input.files[0];
				const url = await upload3dfiletoAWS(file);
				insertOrUpdateBlock(editor, {
					type: "threeDObject",
					props: { url: url, uid: crypto.randomUUID() }, // ensures new instance
				});
			}
		};
	},
	aliases: ["3d", "model"],
});

const getCustomSlashMenuItems = (editor) => [
	...getDefaultReactSlashMenuItems(editor),
	insert3DObjectItem(editor),
];

export function CustomSlashMenu({ editor }) {
	return (
		<SuggestionMenuController
			triggerCharacter="/"
			getItems={async (query) =>
				filterSuggestionItems(getCustomSlashMenuItems(editor), query)
			}
		/>
	);
}
