import { useEffect, useState, useRef } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import axios from "axios";

import { ThreeDObjectBlock } from "../../components/ThreeDObjectBlock";
import { CustomSlashMenu } from "../../editor/CustomSlashMenu";

import { toast } from "sonner";

export default function UserProjectEditorPage() {
	const navigate = useNavigate();

	const [reFetch, setReFetch] = useState(false);
	const titleRef = useRef(null);

	const { id } = useParams();

	const [coverImage, setCoverImage] = useState(null);
	const [lowResCoverImage, setLowResCoverImage] = useState(null);

	const [likeCount, setLikeCount] = useState(0);

	const {
		editMode,
		setIsProjectPublished,
		setMoveToDraftHandler,
		setMoveToPublishedHandler,
		setSaveProjectHandler,
		setDeleteProjectHandler,
	} = useOutletContext();

	const schema = BlockNoteSchema.create({
		blockSpecs: {
			...defaultBlockSpecs,
			threeDObject: ThreeDObjectBlock,
		},
	});

	const editor = useCreateBlockNote({
		schema,
		uploadFile: uploadPhotoToEditor,
	});

	useEffect(() => {
		setSaveProjectHandler(handleSaveProject);
	}, [handleSaveProject]);

	useEffect(() => {
		setDeleteProjectHandler(deleteProjectHandler);
	}, [deleteProjectHandler]);

	useEffect(() => {
		axios.get(`/projects/${id}`).then((res) => {
			//setTitle(res.data.title);
			if (titleRef) titleRef.current.textContent = res.data.title;

			//setCoverImage(res.data.coverImage);
			setCoverImage(res.data.lowrescoverimage);
			setLowResCoverImage(res.data.lowrescoverimage);

			const img = new Image();
			img.src = res.data.coverImage;
			img.onload = () => {
				setCoverImage(res.data.coverImage);
			};

			editor.replaceBlocks(editor.document, res.data.content);
			setIsProjectPublished(res.data.published);

			async function moveToDraftHandler() {
				const promise = axios.put(`/moveProject/${id}`, { published: 0 });

				toast.promise(promise, {
					loading: "Proje taslaklara taşınıyor...",
					success: "Başarıyla taslaklara taşındı!",
					error: (err) => {
						if (err.response?.data?.message) {
							return `Hata: ${err.response.data.message}`;
						}
						return "Taşıma sırasında bir hata oluştu.";
					},
				});

				promise.then((res) => {
					setReFetch((prev) => !prev);
				});
			}

			setMoveToDraftHandler(moveToDraftHandler);

			async function moveToPublishedHandler() {
				const promise = axios.put(`/moveProject/${id}`, { published: 1 });

				toast.promise(promise, {
					loading: "Proje yayımlanıyor...",
					success: "Başarıyla yayımlandı!",
					error: (err) => {
						if (err.response?.data?.message) {
							return `Hata: ${err.response.data.message}`;
						}
						return "Yayımlama sırasında bir hata oluştu.";
					},
				});

				promise.then((res) => {
					setReFetch((prev) => !prev);
				});
			}

			setMoveToPublishedHandler(moveToPublishedHandler);
		});

		axios.get(`/projectlikes/${id}`).then((res) => {
			setLikeCount(res.data.length);
		});
	}, [id, reFetch, editMode]);

	const handleShare = () => {
		const shareData = {
			title: "Bu projeye bir göz atın!",
			text: titleRef.current.textContent,
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

	async function handleSaveProject() {
		const data = {
			title: titleRef.current.textContent,
			coverImage: coverImage,
			content: JSON.stringify(editor.document),
			lowrescoverimage: lowResCoverImage,
		};

		const promise = axios.put(`/projects/${id}`, data);

		toast.promise(promise, {
			loading: "Kaydediliyor...",
			success: "Başarıyla kaydedildi!",
			error: (err) => {
				if (err.response?.data?.message) {
					return `Hata: ${err.response.data.message}`;
				}
				return "Kaydedilirken bir hata oluştu.";
			},
		});

		promise.then((res) => {
			setReFetch((prev) => !prev);
		});
	}

	async function uploadPhoto(e) {
		const file = e.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("image", file);

		await toast.promise(
			axios
				.post("/upload", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
				.then((response) => {
					setCoverImage(response.data.lowResFileUrl);
					setLowResCoverImage(response.data.lowResFileUrl);

					const img = new Image();
					img.src = response.data.fileUrl;
					img.onload = () => {
						setCoverImage(response.data.fileUrl);
					};
				}),
			{
				loading: "Fotoğraf gönderiliyor...",
				success: "Başarıyla gönderildi",
				error: "Gönderme sırasında bir hata oluştu",
			}
		);
	}

	async function uploadPhotoToEditor(file) {
		const formData = new FormData();
		formData.append("image", file);

		try {
			const response = await axios.post("/upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data.fileUrl;
		} catch (error) {
			console.error("Error uploading image:", error);
			throw error;
		}
	}

	function deleteProjectHandler() {
		const deletePromise = axios.delete(`/projects/${id}`);

		toast.promise(deletePromise, {
			loading: "Proje siliniyor..",
			success: "Başarıyla silindi",
			error: "Silinirken bir hata ile karşılaşıldı",
		});

		deletePromise
			.then(() => {
				navigate("/projects");
			})
			.catch((err) => {
				console.error("Silme hatası:", err);
			});
	}

	return (
		<>
			<img
				className="absolute top-0 left-0 shadow-xl w-full h-80 object-cover"
				src={coverImage}
			/>

			<div className="mt-64 w-full flex justify-center">
				<div className="mx-8 w-full md:w-3xl lg:w-5xl">
					{editMode && (
						<label className="cursor-pointer hover:bg-gray-100 duration-200 ease-in flex w-fit items-center gap-2 ml-12 mb-6 border-2 shadow-2xl rounded-lg px-4 py-2 border-gray-300">
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={uploadPhoto}
							/>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								className="bi bi-cloud-upload"
								viewBox="0 0 16 16"
							>
								<path
									fillRule="evenodd"
									d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383"
								/>
								<path
									fillRule="evenodd"
									d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708z"
								/>
							</svg>
							Kapak Fotoğrafı
						</label>
					)}
					<h1
						ref={titleRef}
						contentEditable={editMode}
						className="ml-14 mb-4 lg:text-5xl text-4xl font-bold focus:outline-0 "
					></h1>

					<div className="border-y py-4 px-4 flex justify-between mx-14 border-gray-200 mb-8">
						<div className="flex gap-2 items-center">
							<svg
								title="Kendi projeni beğenemezsin"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								fill="currentColor"
								viewBox="0 0 16 16"
							>
								<path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
							</svg>

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

					<BlockNoteView
						editor={editor}
						theme={"light"}
						editable={editMode}
						slashMenu={false}
					>
						<CustomSlashMenu editor={editor} />
					</BlockNoteView>
				</div>
			</div>
		</>
	);
}
