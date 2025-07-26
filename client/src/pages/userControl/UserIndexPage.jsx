import { useEffect, useState, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import axios from "axios";
import { toast } from "sonner";

import Cropper from "react-easy-crop";
import * as blobs2 from "blobs/v2";

export default function UserIndexPage() {
	const [reFetch, setRefetch] = useState(false);

	const editor = useCreateBlockNote();
	const { editMode, setSaveHomePageInfoHandler } = useOutletContext();

	//Cropper states
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);

	const [blobPath, setBlobPath] = useState(null);

	const [previewImg, setPreviewImg] = useState(null);
	const [srcImage, setSrcImage] = useState(null);

	useEffect(() => {
		setSaveHomePageInfoHandler(handleSaveHomePageInfo);
	}, [handleSaveHomePageInfo]);

	useEffect(() => {
		if (editMode) return;

		axios.get("/homePageInfo").then((res) => {
			editor.replaceBlocks(editor.document, JSON.parse(res.data.content));
		});

		axios.get("/homePageProfile").then((res) => {
			setPreviewImg(null);
			//setSrcImage("http://localhost:4000" + res.data.filename);
			setSrcImage(res.data.filename);

			setBlobPath(res.data.blobPath);
			setZoom(res.data.zoom);
			setCrop(JSON.parse(res.data.crop));

			fetch(res.data.filename)
				.then((response) => response.blob())
				.then((blob) => {
					const file = new File([blob], "profile", { type: blob.type });
					setPreviewImg(file);
				})
				.catch((err) => {
					console.error("Failed to fetch image as Blob:", err);
				});
		});
	}, [editMode, reFetch]);

	function handleBlobCreate() {
		const svgPath = blobs2.svgPath({
			seed: Math.random(),
			extraPoints: 8,
			randomness: 4,
			size: 256,
		});
		setBlobPath(svgPath);
	}

	function handlePreviewImageUpload(e) {
		const file = e.target.files[0];
		if (file && file.type.startsWith("image/")) {
			const img = new Image();
			const objectUrl = URL.createObjectURL(file);

			img.onload = () => {
				if (img.width > img.height) {
					toast.error(
						"Lütfen yüksekliği genişliğinden büyük olan veya kare bir resim yükleyin."
					);
					URL.revokeObjectURL(objectUrl);

					return;
				}

				setPreviewImg(file);
				setSrcImage(objectUrl);
			};

			img.src = objectUrl;
		}
	}

	async function handleSaveHomePageInfo() {
		const data = JSON.stringify(editor.document);

		const promise = Promise.all([
			axios.post("/homePageInfo", data, {
				headers: { "Content-Type": "application/json" },
			}),
			handleSaveHomePageProfile(),
		]);

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

	async function handleSaveHomePageProfile() {
		console.log("blobPath", blobPath);
		const formData = new FormData();
		formData.append("image", previewImg);
		formData.append("blobPath", blobPath);
		formData.append("crop", JSON.stringify(crop));
		formData.append("zoom", JSON.stringify(zoom));

		return axios.post("/homePageProfile", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	}

	//if (!ready) {
	//	return <AccountLoading />;
	//}
	return (
		<>
			<div className="w-full flex justify-center">
				<div className=" h-full max-w-4xl mt-12 w-full sm:flex justify-around">
					<div className="w-full max-h-44 sm:w-1/2 flex justify-center  rounded-2xl  py-6 ">
						<div className="w-sm ">
							<BlockNoteView
								editor={editor}
								editable={editMode}
								theme={"light"}
							/>
						</div>
					</div>

					<div className=" rounded-2xl p-2 mt-28 sm:mt-0 w-full flex justify-center sm:w-1/3">
						<div className=" w-4/5 sm:w-full ">
							<div className="w-80 h-80 relative overflow-hidden">
								<svg
									className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
									viewBox="0 0 250 250"
									xmlns="http://www.w3.org/2000/svg"
								>
									<defs>
										<mask id="blob-mask">
											{/* White area = visible, Black = hidden */}
											<rect width="100%" height="100%" fill="white" />
											<path
												fill="black"
												d={blobPath + "Z"}
												transform="translate(0 0)"
											/>
										</mask>
									</defs>

									{/* Semi-transparent white with blob-shaped cutout */}
									<rect
										width="100%"
										height="100%"
										fill="white"
										opacity={editMode ? "0.5" : "1"}
										mask="url(#blob-mask)"
									/>
								</svg>
								<Cropper
									image={srcImage}
									crop={crop}
									zoom={zoom}
									aspect={1}
									onCropChange={editMode ? setCrop : () => {}}
									onZoomChange={editMode ? setZoom : () => {}}
									showGrid={editMode}
									cropShape="rect"
									objectFit="horizontal-cover"
									className="w-full h-full px-96 absolute top-0 left-0"
									style={
										!editMode && {
											width: "100%",
											containerStyle: {
												width: "100%",
												height: "100%",
												cursor: "default",
											},
											cropAreaStyle: {
												visibility: "hidden",
											},
										}
									}
								/>
							</div>

							{editMode && (
								<>
									<div className=" flex w-full justify-center gap-4 ml-4 mt-4 z-10">
										<div
											title="Rastgele maske ekle"
											onClick={handleBlobCreate}
											className="cursor-pointer w-8 h-8 md:w-10 md:h-10 items-center  justify-center hidden sm:flex glass rounded-4xl d:text-md sm:text-sm text-xs font-bold duration-200 ease-in text-[#606060] hover:text-black"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												fill="currentColor"
												className="bi bi-shuffle"
												viewBox="0 0 16 16"
											>
												<path
													fillRule="evenodd"
													d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"
												/>
												<path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192" />
											</svg>
										</div>
										<div className="cursor-pointer w-8 h-8 md:w-10 md:h-10 items-center  justify-center hidden sm:flex glass rounded-4xl d:text-md sm:text-sm text-xs font-bold duration-200 ease-in text-[#606060] hover:text-black">
											<label
												title="Fotoğraf yükle"
												htmlFor="file-input"
												className="cursor-pointer w-8 h-8 md:w-10 md:h-10 items-center justify-center hidden sm:flex glass rounded-4xl d:text-md sm:text-sm text-xs font-bold duration-200 ease-in text-[#606060] hover:text-black"
											>
												<input
													type="file"
													accept="image/*"
													id="file-input"
													className="hidden"
													onChange={handlePreviewImageUpload}
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
											</label>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="mt-20  w-full flex justify-center">
				<div className="mx-8 sm:ml-30 md:w-xl lg:w-3xl ">
					<Link
						to={editMode ? "#" : "/contact"}
						className={
							"bg-black rounded-full px-12 py-3 w-fit font-bold text-white" +
							(editMode ? " cursor-not-allowed" : "")
						}
					>
						Bana Ulaşın
					</Link>
				</div>
			</div>
		</>
	);
}
