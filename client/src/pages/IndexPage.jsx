import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import UserIndexPage from "./userControl/UserIndexPage";
import IndexPageLoading from "./loadingPages/IndexPageLoading";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import axios from "axios";

import Cropper from "react-easy-crop";

export default function IndexPage() {
	const { ready, user, setUser } = useContext(UserContext);

	const [editorContentLoading, setEditorContentLoading] = useState(true);
	const [profileImageLoading, setProfileImageLoading] = useState(true);

	const editor = useCreateBlockNote();

	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);

	const [blobPath, setBlobPath] = useState(null);

	const [srcImage, setSrcImage] = useState(null);

	const [srcImageOriginal, setSrcImageOriginal] = useState(null);

	useEffect(() => {
		if (!srcImageOriginal) return;

		const img = new Image();
		img.src = srcImageOriginal;

		if (img.complete) {
			console.log("compleated");
			setSrcImage(srcImageOriginal);
		}

		img.onload = () => {
			console.log("image is laoded");
			setSrcImage(srcImageOriginal);
		};
	}, [srcImageOriginal]);

	useEffect(() => {
		axios.get("/homePageInfo").then((res) => {
			editor.replaceBlocks(editor.document, JSON.parse(res.data.content));
			setEditorContentLoading(false);
		});

		axios.get("/homePageProfile").then((res) => {
			setSrcImage((prev) => prev || res.data.lowresfilename);
			//setSrcImage(res.data.lowresfilename);
			setSrcImageOriginal(res.data.filename);

			setBlobPath(res.data.blobPath);
			setZoom(res.data.zoom);
			setCrop(JSON.parse(res.data.crop));
			setProfileImageLoading(false);
		});
	}, []);

	if (!ready) {
		return <IndexPageLoading />;
	}

	if (user) {
		return <UserIndexPage />;
	}

	return (
		<>
			<div className="w-full flex justify-center">
				<div className=" h-full max-w-4xl mt-12 w-full sm:flex justify-around">
					<div className="w-full max-h-44 sm:w-1/2 flex justify-center  rounded-2xl  py-6 ">
						<div className="w-sm">
							{!editorContentLoading ? (
								<BlockNoteView
									editor={editor}
									editable={false}
									theme={"light"}
								/>
							) : (
								<div>
									<div className="flex w-full">
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

					<div className=" rounded-2xl p-2 mt-28 sm:mt-0 w-full flex justify-center sm:w-1/3">
						<div className="w-4/5 sm:w-full">
							<div className="w-80 h-80 relative overflow-hidden">
								{!profileImageLoading ? (
									<>
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
												opacity={"1"}
												mask="url(#blob-mask)"
											/>
										</svg>
										<Cropper
											image={srcImage}
											crop={crop}
											zoom={zoom}
											aspect={1}
											onCropChange={() => {}}
											onZoomChange={() => {}}
											showGrid={false}
											cropShape="rect"
											objectFit="horizontal-cover"
											className="w-full h-full absolute top-0 left-0"
											style={{
												containerStyle: {
													width: "100%",
													height: "100%",
													cursor: "default",
												},
												cropAreaStyle: {
													visibility: "hidden",
												},
											}}
										/>
									</>
								) : (
									<div className="w-full h-full bg-gray-200 animate-pulse rounded-2xl"></div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="mt-20  w-full flex justify-center">
				<div className="mx-8 sm:ml-30 md:w-xl lg:w-3xl ">
					<Link
						to={"/contact"}
						className="bg-black rounded-full px-12 py-3 w-fit font-bold text-white"
					>
						Bana Ulaşın
					</Link>
				</div>
			</div>
		</>
	);
}
