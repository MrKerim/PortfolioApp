import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { ThreeDObjectBlock } from "../components/ThreeDObjectBlock";
import { CustomSlashMenu } from "../editor/CustomSlashMenu";
import axios from "axios";

async function uploadPhotoToEditor(file) {
	const formData = new FormData();
	formData.append("image", file);

	try {
		const response = await axios.post("/upload", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error uploading image:", error);
		throw error;
	}
}

const schema = BlockNoteSchema.create({
	blockSpecs: {
		...defaultBlockSpecs,
		threeDObject: ThreeDObjectBlock,
	},
});

export default function Test() {
	const editor = useCreateBlockNote({
		schema,
		uploadFile: uploadPhotoToEditor,
	});

	return (
		<BlockNoteView editor={editor} slashMenu={false}>
			<CustomSlashMenu editor={editor} />
		</BlockNoteView>
	);
}
