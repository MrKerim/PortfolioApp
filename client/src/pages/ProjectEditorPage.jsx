import { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../UserContext";

import UserProjectEditorPage from "./userControl/UserProjectEditorPage";
import ProjectEditorLoading from "./loadingPages/ProjectEditorLoading";

import { ThreeDObjectBlock } from "../components/ThreeDObjectBlock";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import axios from "axios";

import { toast } from "sonner";

export default function ProjectEditorPage() {
	const { id } = useParams();
	const { ready, user, setUser } = useContext(UserContext);
	const [title, setTitle] = useState("");
	const [coverImage, setCoverImage] = useState(null);
	const [likeCount, setLikeCount] = useState(0);
	const [isLiked, setIsLiked] = useState(false);

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

		axios.get(`/projectlikes/${id}`).then((res) => {
			setLikeCount(res.data.length);

			const deviceId = localStorage.getItem("deviceId");

			const liked = res.data.some((item) => item.device_id === deviceId);
			setIsLiked(liked);
		});
	}, [id]);

	async function toggleProjectLike() {
		const deviceId = localStorage.getItem("deviceId");

		if (!deviceId) {
			toast.error("Device ID not found.");
			return;
		}

		const promise = axios.put(`/projectlikes/${id}`, {
			device_id: deviceId,
		});

		toast.promise(promise, {
			loading: isLiked ? "Beğeni geri alınıyor.." : "Beğeniliyor..",
			success: (res) => {
				setLikeCount(res.data.length);

				const liked = res.data.some((item) => item.device_id === deviceId);
				setIsLiked(liked);

				return isLiked ? "Beğeni geri alındı" : "Beğenildi";
			},
			error: "Bir sorun oluştu",
		});
	}

	const handleShare = () => {
		const shareData = {
			title: "Bu projeye bir göz atın!",
			text: title,
			url: window.location.href,
		};

		if (navigator.share) {
			navigator
				.share(shareData)
				.then(() => toast.success("Paylaşıldı"))
				.catch((err) => console.log("Share canceled", err));
		} else {
			navigator.clipboard.writeText(window.location.href).then(() => {
				toast.success("Link panoya kopyalandı");
			});
		}
	};

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
							<h1 className="ml-14 mb-6 lg:text-5xl text-4xl font-bold  ">
								{title}
							</h1>
							<div className="border-y py-4 px-4 flex justify-between mx-14 border-gray-200 mb-8">
								<div className="flex gap-2 items-center">
									{!isLiked ? (
										<svg
											onClick={toggleProjectLike}
											title="Beğen"
											className="cursor-pointer"
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											fill="currentColor"
											viewBox="0 0 16 16"
										>
											<path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
										</svg>
									) : (
										<svg
											onClick={toggleProjectLike}
											title="Beğenmekten çık"
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											fill="currentColor"
											className="cursor-pointer"
											viewBox="0 0 16 16"
										>
											<path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
										</svg>
									)}
									<h1 className="">{likeCount}</h1>
								</div>
								<svg
									title="Paylaş"
									className="cursor-pointer"
									onClick={handleShare}
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									fill="currentColor"
									viewBox="0 0 16 16"
								>
									<path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5" />
								</svg>
							</div>
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
