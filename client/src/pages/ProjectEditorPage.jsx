import { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../UserContext";

import UserProjectEditorPage from "./userControl/UserProjectEditorPage";

import { ThreeDObjectBlock } from "../components/ThreeDObjectBlock";

import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import axios from "axios";

export default function ProjectEditorPage() {
	const { id } = useParams();
	const { ready, user, setUser } = useContext(UserContext);
	const [title, setTitle] = useState("");
	const [coverImage, setCoverImage] = useState("");

	const schema = BlockNoteSchema.create({
		blockSpecs: {
			...defaultBlockSpecs,
			threeDObject: ThreeDObjectBlock,
		},
	});

	const editor = useCreateBlockNote({
		schema,
	});

	useEffect(() => {
		axios.get(`/projects/${id}`).then((res) => {
			setTitle(res.data.title);
			setCoverImage(res.data.coverImage);
			editor.replaceBlocks(editor.document, res.data.content);
		});
	}, [id]);

	if (user) {
		return <UserProjectEditorPage />;
	}

	return (
		<>
			<img
				className="shadow-xl absolute top-0 left-0 w-full h-80 object-cover"
				src={coverImage}
			/>
			<div className="mt-64 w-full flex justify-center">
				<div className="mx-8 w-full md:w-3xl lg:w-5xl">
					<h1 className="ml-14 mb-4 lg:text-5xl text-4xl font-bold  ">
						{title}
					</h1>
					<BlockNoteView editor={editor} theme={"light"} editable={false} />
				</div>
			</div>
		</>
	);
}
