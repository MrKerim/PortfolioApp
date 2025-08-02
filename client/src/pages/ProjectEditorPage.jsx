import { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../UserContext";

import UserProjectEditorPage from "./userControl/UserProjectEditorPage";
import ProjectEditorLoading from "./loadingPages/ProjectEditorLoading";

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
	const [coverImage, setCoverImage] = useState(null);

	const [contentLoading, setContentLoading] = useState(true);

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
			//setCoverImage(res.data.coverImage);
			setCoverImage(res.data.lowrescoverimage);

			const img = new Image();
			img.src = res.data.coverImage;
			img.onload = () => {
				setCoverImage(res.data.coverImage);
			};

			editor.replaceBlocks(editor.document, res.data.content);
			setContentLoading(false);
		});
	}, [id]);

	if (!ready) {
		return <ProjectEditorLoading />;
	}

	if (user) {
		return <UserProjectEditorPage />;
	}

	return (
		<>
			{!contentLoading ? (
				<img
					className="shadow-xl absolute top-0 left-0 w-full h-80 object-cover"
					src={coverImage}
				/>
			) : (
				<div className="shadow-xl absolute top-0 left-0 w-full h-80 bg-gray-300 animate-pulse"></div>
			)}
			<div className="mt-64 w-full flex justify-center">
				<div className="mx-8 w-full md:w-3xl lg:w-5xl">
					{!contentLoading ? (
						<>
							<h1 className="ml-14 mb-4 lg:text-5xl text-4xl font-bold  ">
								{title}
							</h1>
							<BlockNoteView editor={editor} theme={"light"} editable={false} />
						</>
					) : (
						<div>
							<div className="flex w-full gap-2 ">
								<div className="bg-gray-400 rounded-full h-10 w-1/4 animate-pulse"></div>
							</div>

							<div className="flex w-full mt-12">
								<div className="bg-gray-300 rounded-full h-8 w-full animate-pulse"></div>
							</div>
							<div className="flex w-full gap-2 mt-4">
								<div className="bg-gray-300 rounded-full h-8 w-1/4 animate-pulse"></div>
								<div className="bg-gray-300 rounded-full h-8 w-full animate-pulse"></div>
							</div>
							<div className="flex w-full gap-2 mt-4">
								<div className="bg-gray-300 rounded-full h-8 w-1/4 animate-pulse"></div>
								<div className="bg-gray-300 rounded-full h-8 w-1/3 animate-pulse"></div>
							</div>
							<div className="flex w-full gap-2 mt-4">
								<div className="bg-gray-400 rounded-full h-8 w-1/2 animate-pulse"></div>
							</div>
							<div className="flex w-full mt-4 gap-2">
								<div className="bg-gray-300 rounded-full h-8 w-1/3 animate-pulse"></div>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
