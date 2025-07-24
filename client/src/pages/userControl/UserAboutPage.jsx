import { useEffect, useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { toast } from "sonner";
import axios from "axios";

export default function UserAboutPage() {
	const editor = useCreateBlockNote();
	const [reFetch, setRefetch] = useState(false);
	const { editMode, setSaveAboutPageInfoHandler } = useOutletContext();

	useEffect(() => {
		setSaveAboutPageInfoHandler(handleSaveAboutPageInfo);
	}, []);

	useEffect(() => {
		if (editMode) return;

		axios.get("/aboutPageInfo").then((res) => {
			editor.replaceBlocks(editor.document, JSON.parse(res.data.content));
		});
	}, [editMode, reFetch]);

	async function handleSaveAboutPageInfo() {
		const data = JSON.stringify(editor.document);

		const promise = axios.post("/aboutPageInfo", data, {
			headers: { "Content-Type": "application/json" },
		});

		toast.promise(promise, {
			loading: "Kaydediliyor...",
			success: "Başarıyla kaydedildi!",
			error: (err) => {
				if (err.response?.data?.message) {
					return `Hata: ${err.response.data.message}`;
				}
				return "Kaydetme sırasında bir hata oluştu.";
			},
		});
		promise.then(() => {
			setRefetch((prev) => !prev);
		});
	}

	return (
		<div className="mt-14 w-full flex justify-center">
			<div className="mx-8 w-full md:w-3xl lg:w-5xl">
				<BlockNoteView editor={editor} theme={"light"} editable={editMode} />
			</div>
		</div>
	);
}
