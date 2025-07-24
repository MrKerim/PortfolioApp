import { useEffect, useState, useContext, useRef } from "react";

import { useOutletContext } from "react-router-dom";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { toast } from "sonner";
import axios from "axios";

export default function UserContactPage() {
	const linkedInRef = useRef(null);
	const mailRef = useRef(null);
	const phoneRef = useRef(null);

	const editor = useCreateBlockNote();
	const editor2 = useCreateBlockNote();

	const { editMode, setSaveContactPageInfoAndDetailsHandler } =
		useOutletContext();

	const [reFetch, setRefetch] = useState(false);

	const [linkedIn, setLinkedIn] = useState(null);
	const [mail, setMail] = useState(null);
	const [phone, setPhone] = useState(null);

	useEffect(() => {
		setSaveContactPageInfoAndDetailsHandler(
			handleSaveContactPageInfoAndDetails
		);
	}, []);

	useEffect(() => {
		if (editMode) return;
		axios.get("/contactPageInfo").then((res) => {
			const contentArray = res.data;
			editor.replaceBlocks(
				editor.document,
				JSON.parse(contentArray[0].content)
			);
			editor2.replaceBlocks(
				editor2.document,
				JSON.parse(contentArray[1].content)
			);
		});

		axios.get("/contactDetails").then((res) => {
			const contactDetailsArray = res.data;

			setLinkedIn(
				contactDetailsArray.find((item) => item.type === "linkedin")?.content ||
					""
			);

			if (linkedInRef.current)
				linkedInRef.current.textContent =
					contactDetailsArray.find((item) => item.type === "linkedin")
						?.content || "";

			setMail(
				contactDetailsArray.find((item) => item.type === "email")?.content || ""
			);

			if (mailRef.current)
				mailRef.current.textContent =
					contactDetailsArray.find((item) => item.type === "email")?.content ||
					"";

			setPhone(
				contactDetailsArray.find((item) => item.type === "phone")?.content || ""
			);

			if (phoneRef.current)
				phoneRef.current.textContent =
					contactDetailsArray.find((item) => item.type === "phone")?.content ||
					"";
		});
	}, [editMode, reFetch]);

	async function handleSaveContactPageInfoAndDetails() {
		console.log("funcion is called");
		const editorDataArray = [editor.document, editor2.document];

		const linkedInRefContent = linkedInRef.current.textContent;
		const mailRefContent = mailRef.current.textContent;
		const phoneRefContent = phoneRef.current.textContent;
		const refContentArray = [
			{ type: "linkedin", content: linkedInRefContent },
			{ type: "email", content: mailRefContent },
			{ type: "phone", content: phoneRefContent },
		];

		const data = {
			contactInfo: editorDataArray,
			contactDetails: refContentArray,
		};

		const promise = axios.post("/contactPageInfoAndDetails", data, {
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
		<>
			<div className="mt-14 w-full flex justify-center">
				<div className="mx-8 w-full md:w-xl lg:w-3xl sm:flex sm:justify-between">
					<BlockNoteView
						className="sm:w-1/2"
						editor={editor}
						theme={"light"}
						editable={editMode}
					/>
					<BlockNoteView
						className="sm:w-full"
						theme={"light"}
						editor={editor2}
						editable={editMode}
					/>
				</div>
			</div>
			<div className="mt-14  w-full flex justify-center">
				<div className="mx-8 sm:ml-30 md:w-xl lg:w-3xl ">
					<div className="flex gap-2 items-center">
						<svg
							width="24"
							height="24"
							viewBox="0 0 48 48"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M32 16C35.1826 16 38.2348 17.2643 40.4853 19.5147C42.7357 21.7652 44 24.8174 44 28V42H36V28C36 26.9391 35.5786 25.9217 34.8284 25.1716C34.0783 24.4214 33.0609 24 32 24C30.9391 24 29.9217 24.4214 29.1716 25.1716C28.4214 25.9217 28 26.9391 28 28V42H20V28C20 24.8174 21.2643 21.7652 23.5147 19.5147C25.7652 17.2643 28.8174 16 32 16Z"
								stroke="#757575"
								strokeWidth="4"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M12 18H4V42H12V18Z"
								stroke="#757575"
								strokeWidth="4"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z"
								stroke="#757575"
								strokeWidth="4"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<a
							ref={linkedInRef}
							contentEditable={editMode}
							href={
								linkedIn?.startsWith("http") ? linkedIn : "https://" + linkedIn
							}
							target="_blank"
							rel="noopener noreferrer"
							className={
								"focus:outline-0 underline  w-full " +
								(editMode ? "cursor-text" : "cursor-pointer")
							}
						>
							{linkedIn}
						</a>
					</div>
					<div className="mt-3 flex gap-2 items-center">
						<svg
							width="24"
							height="24"
							viewBox="0 0 48 48"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M44 12C44 9.8 42.2 8 40 8H8C5.8 8 4 9.8 4 12M44 12V36C44 38.2 42.2 40 40 40H8C5.8 40 4 38.2 4 36V12M44 12L24 26L4 12"
								stroke="#757575"
								strokeWidth="4"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<a
							ref={mailRef}
							contentEditable={editMode}
							href={"mailto:" + mail}
							className={
								"focus:outline-0 underline " +
								(editMode ? "cursor-text" : "cursor-pointer")
							}
						>
							{mail}
						</a>
					</div>
					<div className="mt-3 flex gap-2 items-center">
						<svg
							width="24"
							height="24"
							viewBox="0 0 48 48"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M43.9999 33.84V39.84C44.0021 40.397 43.888 40.9483 43.6649 41.4586C43.4417 41.969 43.1145 42.4271 42.704 42.8037C42.2936 43.1802 41.809 43.4669 41.2814 43.6454C40.7537 43.8238 40.1946 43.8901 39.6399 43.84C33.4855 43.1712 27.5739 41.0682 22.3799 37.7C17.5475 34.6293 13.4505 30.5323 10.3799 25.7C6.99982 20.4824 4.89635 14.5419 4.23987 8.35995C4.18989 7.80688 4.25562 7.24947 4.43287 6.7232C4.61012 6.19693 4.89501 5.71333 5.2694 5.30319C5.64379 4.89306 6.09948 4.56537 6.60745 4.34099C7.11542 4.11662 7.66455 4.00047 8.21987 3.99995H14.2199C15.1905 3.9904 16.1314 4.33411 16.8674 4.96702C17.6033 5.59992 18.084 6.47884 18.2199 7.43995C18.4731 9.36008 18.9428 11.2454 19.6199 13.0599C19.889 13.7758 19.9472 14.5538 19.7877 15.3017C19.6282 16.0496 19.2576 16.7362 18.7199 17.28L16.1799 19.8199C19.027 24.827 23.1728 28.9728 28.1799 31.82L30.7199 29.28C31.2636 28.7422 31.9502 28.3716 32.6981 28.2121C33.446 28.0526 34.224 28.1109 34.9399 28.3799C36.7544 29.0571 38.6397 29.5267 40.5599 29.78C41.5314 29.917 42.4187 30.4064 43.0529 31.1549C43.6872 31.9035 44.0242 32.8591 43.9999 33.84Z"
								stroke="#757575"
								strokeWidth="4"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<h1
							href={"tel:+90" + phone}
							className={
								"focus:outline-0 underline " +
								(editMode ? "cursor-text" : "cursor-pointer")
							}
							contentEditable={editMode}
							ref={phoneRef}
						>
							{phone}
						</h1>
					</div>
				</div>
			</div>
		</>
	);
}
