import { useEffect, useState, useContext } from "react";
import { UserContext } from "../UserContext";

import UserAboutPage from "./userControl/UserAboutPage";
import AboutPageLoading from "./loadingPages/AboutPageLoading";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import axios from "axios";

export default function AboutPage() {
	const editor = useCreateBlockNote();
	const { ready, user, setUser } = useContext(UserContext);

	const [editorContentLoading, setEditorContentLoading] = useState(true);

	useEffect(() => {
		axios.get("/aboutPageInfo").then((res) => {
			editor.replaceBlocks(editor.document, JSON.parse(res.data.content));
			setEditorContentLoading(false);
		});
	}, []);

	if (!ready) {
		return <AboutPageLoading />;
	}

	if (user) {
		return <UserAboutPage />;
	}

	return (
		<div className="mt-14 w-full flex justify-center">
			<div className="mx-8 w-full md:w-3xl lg:w-5xl">
				{!editorContentLoading ? (
					<BlockNoteView editor={editor} theme={"light"} editable={false} />
				) : (
					<div>
						<div className="flex w-full gap-2 ">
							<div className="bg-gray-500 rounded-full h-8 w-1/3 animate-pulse"></div>
						</div>
						<div className="flex w-full mt-12">
							<div className="bg-gray-300 rounded-full h-8 w-full animate-pulse"></div>
						</div>
						<div className="flex w-full gap-2 mt-4">
							<div className="bg-gray-300 rounded-full h-8 w-3/4 animate-pulse"></div>
							<div className="bg-gray-300 rounded-full h-8 w-full animate-pulse"></div>
						</div>
						<div className="flex w-full gap-2 mt-4">
							<div className="bg-gray-300 rounded-full h-8 w-1/4 animate-pulse"></div>
							<div className="bg-gray-300 rounded-full h-8 w-full animate-pulse"></div>
						</div>
						<div className="flex w-full mt-4 gap-2">
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
						<div className="flex w-full mt-4 gap-2">
							<div className="bg-gray-300 rounded-full h-8 w-1/3 animate-pulse"></div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
