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

	const [coverImage, setCoverImage] = useState("");
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

			setCoverImage(res.data.coverImage);

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
	}, [id, reFetch, editMode]);

	async function handleSaveProject() {
		const data = {
			title: titleRef.current.textContent,
			coverImage: coverImage,
			content: JSON.stringify(editor.document),
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
					setCoverImage(response.data);
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
			return response.data;
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
