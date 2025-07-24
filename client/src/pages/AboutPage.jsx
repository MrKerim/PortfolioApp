import { useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

import UserAboutPage from "./userControl/UserAboutPage";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import axios from "axios";

export default function AboutPage() {
	const editor = useCreateBlockNote();
	const { ready, user, setUser } = useContext(UserContext);

	useEffect(() => {
		axios.get("/aboutPageInfo").then((res) => {
			editor.replaceBlocks(editor.document, JSON.parse(res.data.content));
		});
	}, []);

	if (user) {
		return <UserAboutPage />;
	}

	return (
		<div className="mt-14 w-full flex justify-center">
			<div className="mx-8 w-full md:w-3xl lg:w-5xl">
				<BlockNoteView editor={editor} theme={"light"} editable={false} />
			</div>
		</div>
	);
}
